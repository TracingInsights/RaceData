#!/usr/bin/env python3
"""
Update Formula 1 CSV data with fresh results from the Jolpica API.

The Kaggle datasets (see download_datasets.py) are the primary source for
this repository but are published with a delay. The Jolpica API
(https://jolpi.ca — the community successor of the Ergast F1 API) is
updated shortly after each session, so this script tops up the CSVs in
data/ with new races, results, qualifying, sprint results, lap times,
pit stops and standings.

How it works
------------
* Reference tables (drivers, constructors, circuits, status, seasons) are
  synced from Jolpica in full; new records are appended with numeric ids
  continuing the existing (Ergast-derived) numbering.
* Calendars for the target seasons are upserted into races.csv keyed by
  (year, round), so rescheduled races update in place and newly announced
  races are appended.
* Completed races that are missing from results.csv — or that finished
  within the last --refresh-days days (default 7, to catch corrections) —
  are fetched in full and their rows in results / qualifying /
  sprint_results / lap_times / pit_stops / driver_standings /
  constructor_standings are upserted row by row (new rows appended,
  changed rows updated in place, stale rows removed).
* constructor_results.csv rows are derived from the difference between
  consecutive rounds' constructor standings.

Notes
-----
* Jolpica's Ergast-compatible endpoints identify entities by string refs
  (e.g. driverId "piastri"); these are matched against the driverRef /
  constructorRef / circuitRef columns of the existing CSVs to resolve the
  numeric surrogate ids used in this dataset.
* fastestLapSpeed is not exposed by Jolpica's Ergast-compatible endpoints,
  so new rows carry \\N for that column while existing values are kept.
* The API rate limits unauthenticated clients (4 req/s burst, 500/hour
  sustained); this script throttles and retries with back-off.

Usage
-----
    python update_from_jolpica.py [--dry-run] [--seasons 2026,2027]
                                  [--refresh-days 7]

Environment variables (used by the GitHub Actions workflows):
    JOLPICA_SEASONS      comma-separated seasons to refresh
    JOLPICA_REFRESH_DAYS re-fetch races that finished within this many days
"""

from __future__ import annotations

import argparse
import csv
import os
import re
import time
import zipfile
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import requests

BASE_URL = "https://api.jolpi.ca/ergast/f1"
NULL = r"\N"
PAGE_LIMIT = 100  # Jolpica caps ?limit= at 100
REQUEST_INTERVAL = 0.3  # stay under the 4 req/sec burst limit
MAX_RETRIES = 7
HTTP_TIMEOUT = 30

PROJECT_ROOT = Path(__file__).parent
DATA_DIR = PROJECT_ROOT / "data"
ZIP_FILE = PROJECT_ROOT / "data.zip"

TABLE_NAMES = [
    "circuits", "constructors", "drivers", "status", "seasons", "races",
    "results", "qualifying", "sprint_results", "lap_times", "pit_stops",
    "driver_standings", "constructor_standings", "constructor_results",
]

# Cells matching this are written unquoted (matches the style of the
# existing CSVs); everything else is quoted.
_BARE_RE = re.compile(
    r"^(?:[+-]?\d+(?:\.\d+)?|\d{4}-\d{2}-\d{2}|\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?)$"
)

_session = requests.Session()
_session.headers["User-Agent"] = "RaceData jolpica-updater"
_last_request = 0.0


# ── HTTP / API helpers ────────────────────────────────────────────────


def api_get(path: str, params: dict | None = None) -> dict:
    """GET a Jolpica ergast endpoint. Returns parsed JSON ({} on 404)."""
    global _last_request
    url = f"{BASE_URL}/{path.lstrip('/')}"
    backoff = 2.0
    for attempt in range(1, MAX_RETRIES + 1):
        wait = REQUEST_INTERVAL - (time.monotonic() - _last_request)
        if wait > 0:
            time.sleep(wait)
        _last_request = time.monotonic()
        try:
            resp = _session.get(url, params=params, timeout=HTTP_TIMEOUT)
        except requests.RequestException as exc:
            if attempt == MAX_RETRIES:
                raise
            print(f"  ⚠ network error on {url} ({exc}); retrying in {backoff:.0f}s")
            time.sleep(backoff)
            backoff *= 2
            continue
        if resp.status_code == 404:
            return {}
        if resp.status_code == 429 or 500 <= resp.status_code < 600:
            retry_after = float(resp.headers.get("Retry-After", backoff))
            retry_after = min(max(retry_after, 1.0), 60.0)
            print(f"  ⚠ HTTP {resp.status_code} on {url}; retrying in {retry_after:.0f}s")
            time.sleep(retry_after)
            backoff *= 2
            continue
        resp.raise_for_status()
        return resp.json()
    return {}


def _records(mrdata: dict) -> list:
    """Return the single record list nested in an MRData payload."""
    for value in mrdata.values():
        if isinstance(value, dict):
            for inner in value.values():
                if isinstance(inner, list):
                    return inner
    return []


def api_get_all(path: str, params: dict | None = None) -> list:
    """Paginate through a flat-list endpoint and return all records."""
    params = dict(params or {})
    params["limit"] = PAGE_LIMIT
    records: list = []
    offset = 0
    while True:
        params["offset"] = offset
        data = api_get(path, params)
        mrdata = data.get("MRData", {})
        batch = _records(mrdata)
        records.extend(batch)
        total = int(mrdata.get("total") or 0)
        offset += PAGE_LIMIT
        if not batch or offset >= total:
            return records


_RESULT_KEYS = {
    "results": "Results",
    "qualifying": "QualifyingResults",
    "sprint": "SprintResults",
    "pitstops": "PitStops",
}


def api_get_race_records(season: int, round_: int, kind: str) -> list:
    """Fetch all records of `kind` for one race (empty list if none)."""
    path = f"{season}/{round_}/{kind}.json"
    key = _RESULT_KEYS[kind]
    data = api_get(path, {"limit": PAGE_LIMIT, "offset": 0})
    mrdata = data.get("MRData", {})
    total = int(mrdata.get("total") or 0)
    races = mrdata.get("RaceTable", {}).get("Races", [])
    records = races[0].get(key, []) if races else []
    offset = PAGE_LIMIT
    while records and len(records) < total:
        data = api_get(path, {"limit": PAGE_LIMIT, "offset": offset})
        races = data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
        if not races:
            break
        records.extend(races[0].get(key, []))
        offset += PAGE_LIMIT
    return records


def api_get_laps(season: int, round_: int) -> list[dict]:
    """Fetch all lap timings for a race, merging pages by lap number.

    Jolpica paginates /laps by individual timing records, so a single
    lap's timings can be split across two pages.
    """
    path = f"{season}/{round_}/laps.json"
    by_lap: dict[int, dict] = {}
    collected = 0
    offset = 0
    while True:
        data = api_get(path, {"limit": PAGE_LIMIT, "offset": offset})
        mrdata = data.get("MRData", {})
        total = int(mrdata.get("total") or 0)
        races = mrdata.get("RaceTable", {}).get("Races", [])
        laps = races[0].get("Laps", []) if races else []
        if not laps:
            break
        for lap in laps:
            entry = by_lap.setdefault(
                int(lap["number"]), {"number": lap["number"], "Timings": []}
            )
            entry["Timings"].extend(lap.get("Timings", []))
            collected += len(lap.get("Timings", []))
        if collected >= total:
            break
        offset += PAGE_LIMIT
    return [by_lap[n] for n in sorted(by_lap)]


def api_get_standings(season: int, round_: int, kind: str) -> dict | None:
    """Fetch the standings list after a round (kind: 'driver' or 'constructor')."""
    data = api_get(f"{season}/{round_}/{kind}standings.json", {"limit": PAGE_LIMIT})
    lists_ = data.get("MRData", {}).get("StandingsTable", {}).get("StandingsLists", [])
    return lists_[0] if lists_ else None


# ── value formatting ──────────────────────────────────────────────────


def V(value) -> str:
    """Format an API value as a CSV cell; None/'' become \\N, 'Z' stripped."""
    if value is None:
        return NULL
    value = str(value).strip()
    if not value:
        return NULL
    if value.endswith("Z"):
        value = value[:-1]
    return value


def NUM(value) -> str:
    """Format a numeric value, rendering integral values without '.0'."""
    text = V(value)
    if text == NULL:
        return text
    try:
        number = float(text)
    except ValueError:
        return text
    if number == int(number):
        return str(int(number))
    return str(number)


def time_to_ms(text) -> int | None:
    """Convert an absolute time like '1:21:06.758' or '1:32.228' to ms."""
    if not text:
        return None
    text = str(text).strip()
    if ":" not in text:
        return None
    try:
        parts = [float(p) for p in text.split(":")]
    except ValueError:
        return None
    if len(parts) == 2:
        return int(round(parts[0] * 60000 + parts[1] * 1000))
    if len(parts) == 3:
        return int(round(parts[0] * 3600000 + parts[1] * 60000 + parts[2] * 1000))
    return None


def gap_to_ms(text) -> int | None:
    """Convert a gap like '+5.478' to milliseconds."""
    if not text:
        return None
    text = str(text).strip()
    if text.startswith("+"):
        text = text[1:]
    elif text.startswith("-"):
        return None  # should not happen, but never fabricate
    try:
        return int(round(float(text) * 1000))
    except ValueError:
        return None


def duration_to_ms(text) -> int | None:
    """Convert a pit-stop duration ('49.111' or '1:08.615') to ms."""
    if not text:
        return None
    text = str(text).strip()
    if ":" in text:
        return time_to_ms(text)
    try:
        return int(round(float(text) * 1000))
    except ValueError:
        return None


def _render(cell: str) -> str:
    if cell == NULL or _BARE_RE.match(cell):
        return cell
    return '"' + cell.replace('"', '""') + '"'


# ── CSV table with byte-stable formatting ─────────────────────────────


class Table:
    """A CSV table.

    Rows already present in the file are rewritten byte-identically unless
    they change; only new/changed rows are re-rendered, keeping git diffs
    minimal.
    """

    def __init__(self, name: str):
        self.name = name
        self.path = DATA_DIR / f"{name}.csv"
        self.header: list[str] = []
        self._header_raw = ""
        self.rows: list[dict] = []
        self._raw: list[str | None] = []  # original line, None → re-render
        self.dirty = False
        self.appended = 0
        self.updated = 0
        self.removed = 0
        self._load()

    def _load(self) -> None:
        if not self.path.exists():
            raise FileNotFoundError(f"Required table missing: {self.path}")
        with open(self.path, encoding="utf-8", newline="") as fh:
            lines = fh.read().splitlines()
        if not lines:
            raise ValueError(f"Empty table: {self.path}")
        self._header_raw = lines[0]
        self.header = next(csv.reader([lines[0]]))
        for line in lines[1:]:
            values = next(csv.reader([line]))
            if len(values) != len(self.header):
                print(f"  ⚠ {self.path.name}: skipping malformed row")
                continue
            self.rows.append(dict(zip(self.header, values)))
            self._raw.append(line)

    def append(self, **cells) -> None:
        row = dict.fromkeys(self.header, NULL)
        row.update(cells)
        self.rows.append(row)
        self._raw.append(None)
        self.dirty = True
        self.appended += 1

    def update_cell_values(self, index: int, cells: dict) -> bool:
        """Update specific cells of a row; returns True if anything changed."""
        row = self.rows[index]
        changed = False
        for col, val in cells.items():
            if row.get(col) != val:
                row[col] = val
                changed = True
        if changed:
            self._raw[index] = None
            self.dirty = True
            self.updated += 1
        return changed

    def remove_row(self, index: int) -> None:
        del self.rows[index]
        del self._raw[index]
        self.dirty = True
        self.removed += 1

    def rows_for_race(self, race_id) -> list[dict]:
        race_id = str(race_id)
        return [row for row in self.rows if row["raceId"] == race_id]

    def race_ids(self) -> set[str]:
        return {row["raceId"] for row in self.rows if "raceId" in row}

    def save(self) -> None:
        with open(self.path, "w", encoding="utf-8", newline="") as fh:
            fh.write(self._header_raw + "\n")
            for row, raw in zip(self.rows, self._raw):
                if raw is not None:
                    fh.write(raw + "\n")
                else:
                    fh.write(",".join(_render(row.get(col, NULL)) for col in self.header) + "\n")


def id_counter(table: Table, column: str):
    """Return a next_id() closure continuing a table's surrogate numbering."""
    current = 0
    for row in table.rows:
        try:
            current = max(current, int(row[column]))
        except (KeyError, ValueError):
            continue

    def next_id() -> str:
        nonlocal current
        current += 1
        return str(current)

    return next_id


# ── updater ───────────────────────────────────────────────────────────


class Updater:
    def __init__(self, refresh_days: int):
        self.refresh_days = refresh_days
        self.today = datetime.now(timezone.utc).date()
        self.tables = {name: Table(name) for name in TABLE_NAMES}

        self.driver_ids = {r["driverRef"]: r["driverId"] for r in self.tables["drivers"].rows}
        self.constructor_ids = {r["constructorRef"]: r["constructorId"] for r in self.tables["constructors"].rows}
        self.circuit_ids = {r["circuitRef"]: r["circuitId"] for r in self.tables["circuits"].rows}
        self.status_ids = {r["status"]: r["statusId"] for r in self.tables["status"].rows}
        self.season_years = {r["year"] for r in self.tables["seasons"].rows}
        self.race_index = {
            (int(r["year"]), int(r["round"])): i
            for i, r in enumerate(self.tables["races"].rows)
        }
        self.results_race_ids = self.tables["results"].race_ids()

        t = self.tables
        self.next_driver_id = id_counter(t["drivers"], "driverId")
        self.next_constructor_id = id_counter(t["constructors"], "constructorId")
        self.next_circuit_id = id_counter(t["circuits"], "circuitId")
        self.next_status_id = id_counter(t["status"], "statusId")
        self.next_race_id = id_counter(t["races"], "raceId")
        self.next_result_id = id_counter(t["results"], "resultId")
        self.next_qualify_id = id_counter(t["qualifying"], "qualifyId")
        self.next_sprint_id = id_counter(t["sprint_results"], "resultId")
        self.next_ds_id = id_counter(t["driver_standings"], "driverStandingsId")
        self.next_cs_id = id_counter(t["constructor_standings"], "constructorStandingsId")
        self.next_cr_id = id_counter(t["constructor_results"], "constructorResultsId")

    # ── id resolution (auto-registers unseen entities) ──

    def _driver(self, ref: str, obj: dict | None = None) -> str:
        driver_id = self.driver_ids.get(ref)
        if driver_id is not None:
            return driver_id
        obj = obj or {}
        driver_id = self.next_driver_id()
        self.driver_ids[ref] = driver_id
        self.tables["drivers"].append(
            driverId=driver_id, driverRef=ref,
            number=V(obj.get("permanentNumber")), code=V(obj.get("code")),
            forename=V(obj.get("givenName")), surname=V(obj.get("familyName")),
            dob=V(obj.get("dateOfBirth")), nationality=V(obj.get("nationality")),
            url=V(obj.get("url")),
        )
        print(f"  + new driver: {obj.get('givenName')} {obj.get('familyName')} (driverId {driver_id})")
        return driver_id

    def _constructor(self, ref: str, obj: dict | None = None) -> str:
        constructor_id = self.constructor_ids.get(ref)
        if constructor_id is not None:
            return constructor_id
        obj = obj or {}
        constructor_id = self.next_constructor_id()
        self.constructor_ids[ref] = constructor_id
        self.tables["constructors"].append(
            constructorId=constructor_id, constructorRef=ref,
            name=V(obj.get("name")), nationality=V(obj.get("nationality")),
            url=V(obj.get("url")),
        )
        print(f"  + new constructor: {obj.get('name')} (constructorId {constructor_id})")
        return constructor_id

    def _circuit(self, ref: str, obj: dict | None = None) -> str:
        circuit_id = self.circuit_ids.get(ref)
        if circuit_id is not None:
            return circuit_id
        obj = obj or {}
        loc = obj.get("Location") or {}
        circuit_id = self.next_circuit_id()
        self.circuit_ids[ref] = circuit_id
        self.tables["circuits"].append(
            circuitId=circuit_id, circuitRef=ref,
            name=V(obj.get("circuitName")), location=V(loc.get("locality")),
            country=V(loc.get("country")), lat=V(loc.get("lat")),
            lng=V(loc.get("long")), alt=NULL, url=V(obj.get("url")),
        )
        print(f"  + new circuit: {obj.get('circuitName')} (circuitId {circuit_id})")
        return circuit_id

    def _status(self, text: str) -> str:
        status_id = self.status_ids.get(text)
        if status_id is not None:
            return status_id
        status_id = self.next_status_id()
        self.status_ids[text] = status_id
        self.tables["status"].append(statusId=status_id, status=text)
        print(f"  + new status: {text!r} (statusId {status_id})")
        return status_id

    # ── reference tables ──

    def sync_reference_tables(self) -> None:
        print("\nSyncing reference tables (drivers, constructors, circuits, status, seasons)...")
        added = 0
        for drv in api_get_all("drivers.json"):
            ref = drv.get("driverId")
            if not ref or ref in self.driver_ids:
                continue
            self._driver(ref, drv)
            added += 1
        for con in api_get_all("constructors.json"):
            ref = con.get("constructorId")
            if not ref or ref in self.constructor_ids:
                continue
            self._constructor(ref, con)
            added += 1
        for cir in api_get_all("circuits.json"):
            ref = cir.get("circuitId")
            if not ref or ref in self.circuit_ids:
                continue
            self._circuit(ref, cir)
            added += 1
        for st in api_get_all("status.json"):
            text = st.get("status")
            if not text or text in self.status_ids:
                continue
            self._status(text)
            added += 1
        for se in api_get_all("seasons.json"):
            year = V(se.get("season"))
            if year == NULL or year in self.season_years:
                continue
            self.season_years.add(year)
            self.tables["seasons"].append(year=year, url=V(se.get("url")))
            added += 1
        print(f"✓ Reference sync complete: {added} new record(s)")

    # ── calendar ──

    def upsert_calendar(self, season: int) -> None:
        api_races = api_get_all(f"{season}/races.json")
        if not api_races:
            print(f"  ⚠ {season}: no calendar data on Jolpica, skipping")
            return
        new_races = 0
        for race in api_races:
            key = (int(race["season"]), int(race["round"]))
            cells = self._race_cells(race)
            idx = self.race_index.get(key)
            if idx is None:
                race_id = self.next_race_id()
                row = dict.fromkeys(self.tables["races"].header, NULL)
                row.update(cells)
                row["raceId"] = race_id
                self.tables["races"].rows.append(row)
                self.tables["races"]._raw.append(None)
                self.tables["races"].dirty = True
                self.tables["races"].appended += 1
                self.race_index[key] = len(self.tables["races"].rows) - 1
                new_races += 1
            else:
                self.tables["races"].update_cell_values(idx, cells)
        print(f"✓ {season}: {len(api_races)} races in calendar ({new_races} new)")

    def _race_cells(self, race: dict) -> dict:
        sessions = {
            "FirstPractice": ("fp1_date", "fp1_time"),
            "SecondPractice": ("fp2_date", "fp2_time"),
            "ThirdPractice": ("fp3_date", "fp3_time"),
            "Qualifying": ("quali_date", "quali_time"),
        }
        circuit = race.get("Circuit") or {}
        cells = {
            "year": V(race.get("season")),
            "round": V(race.get("round")),
            "circuitId": self._circuit(circuit.get("circuitId", ""), circuit),
            "name": V(race.get("raceName")),
            "date": V(race.get("date")),
            "time": V(race.get("time")),
            "url": V(race.get("url")),
        }
        for key, (date_col, time_col) in sessions.items():
            sess = race.get(key) or {}
            cells[date_col] = V(sess.get("date"))
            cells[time_col] = V(sess.get("time"))
        # the sprint race column; fall back to sprint qualifying if that's
        # all that exists (jtrotman maps the Sprint session here)
        sprint = race.get("Sprint") or race.get("SprintQualifying") or {}
        cells["sprint_date"] = V(sprint.get("date"))
        cells["sprint_time"] = V(sprint.get("time"))
        return cells

    # ── per-race updates ──

    def process_season(self, season: int) -> None:
        entries = sorted(
            ((key, idx) for key, idx in self.race_index.items() if key[0] == season),
            key=lambda kv: kv[0][1],
        )
        for (year, round_), idx in entries:
            row = self.tables["races"].rows[idx]
            if row.get("date", NULL) == NULL:
                continue
            race_date = date.fromisoformat(row["date"])
            if race_date > self.today + timedelta(days=1):
                continue  # not raced yet
            race_id = row["raceId"]
            if race_date <= self.today:
                has_results = race_id in self.results_race_ids
                days = (self.today - race_date).days
                if has_results and days > self.refresh_days:
                    continue
                print(f"\n→ {year} round {round_} ({row['name']})")
                self._full_update(year, round_, race_id)
            else:
                # race is at most tomorrow: refresh sessions already held
                print(f"\n→ {year} round {round_} ({row['name']}) — sessions only")
                self._sessions_update(year, round_, race_id)

    def _upsert_rows(self, table: Table, race_id, id_col, key_cols, records, make_cells):
        """Upsert per-race rows keyed by key_cols.

        make_cells(record) returns a cell dict WITHOUT the surrogate id
        column; it is assigned when appending. Rows still present are
        updated in place; rows no longer in the API data are removed.
        """
        race_id = str(race_id)
        existing = {}
        for i, row in enumerate(table.rows):
            if row["raceId"] == race_id:
                existing[tuple(row[c] for c in key_cols)] = i
        appended = updated = removed = 0
        for rec in records:
            cells = make_cells(rec)
            key = tuple(cells[c] for c in key_cols)
            idx = existing.pop(key, None)
            if idx is None:
                if id_col:
                    cells[id_col] = self._next_id_for(table, id_col)
                cells["raceId"] = race_id
                table.append(**cells)
                appended += 1
            elif table.update_cell_values(idx, cells):
                updated += 1
        for idx in sorted(existing.values(), reverse=True):
            table.remove_row(idx)
            removed += 1
        return appended, updated, removed

    def _next_id_for(self, table: Table, id_col: str) -> str:
        mapping = {
            ("results", "resultId"): self.next_result_id,
            ("qualifying", "qualifyId"): self.next_qualify_id,
            ("sprint_results", "resultId"): self.next_sprint_id,
            ("driver_standings", "driverStandingsId"): self.next_ds_id,
            ("constructor_standings", "constructorStandingsId"): self.next_cs_id,
            ("constructor_results", "constructorResultsId"): self.next_cr_id,
        }
        return mapping[(table.name, id_col)]()

    # result helpers shared by results and sprint results

    @staticmethod
    def _millis(item: dict, leader_ms: int | None) -> int | None:
        t = item.get("Time") or {}
        millis = t.get("millis")
        if millis is not None:
            try:
                return int(millis)
            except (TypeError, ValueError):
                pass
        gap = gap_to_ms(t.get("time"))
        if gap is not None and leader_ms is not None:
            return leader_ms + gap
        return time_to_ms(t.get("time"))

    def _full_update(self, season: int, round_: int, race_id: str) -> None:
        results = api_get_race_records(season, round_, "results")
        if not results:
            print("  · no race results on Jolpica yet — refreshing sessions only")
            self._sessions_update(season, round_, race_id)
            return

        leader_ms = None
        t0 = results[0].get("Time") or {}
        try:
            leader_ms = int(t0.get("millis"))
        except (TypeError, ValueError):
            leader_ms = time_to_ms(t0.get("time"))

        res = self.tables["results"]
        stats = self._upsert_rows(
            res, race_id, "resultId", ["driverId"],
            list(enumerate(results)),
            lambda pair: {
                "driverId": self._driver(pair[1]["Driver"]["driverId"], pair[1]["Driver"]),
                "constructorId": self._constructor(pair[1]["Constructor"]["constructorId"], pair[1]["Constructor"]),
                "number": V(pair[1].get("number")),
                "grid": V(pair[1].get("grid")),
                "position": V(pair[1].get("position")),
                "positionText": V(pair[1].get("positionText")),
                "positionOrder": str(pair[0] + 1),
                "points": NUM(pair[1].get("points")),
                "laps": V(pair[1].get("laps")),
                "time": V((pair[1].get("Time") or {}).get("time")),
                "milliseconds": V(self._millis(pair[1], leader_ms)),
                "fastestLap": V((pair[1].get("FastestLap") or {}).get("lap")),
                "rank": V((pair[1].get("FastestLap") or {}).get("rank")),
                "fastestLapTime": V(((pair[1].get("FastestLap") or {}).get("Time") or {}).get("time")),
                # fastestLapSpeed intentionally omitted: not available from
                # Jolpica's Ergast-compatible endpoints — existing values are
                # preserved on update, new rows get \N
                "statusId": self._status(pair[1].get("status", "")),
            },
        )
        print(f"  · results:      {stats[0]} added, {stats[1]} updated, {stats[2]} removed")

        self._write_qualifying(season, round_, race_id)
        self._write_sprint(season, round_, race_id)
        self._write_lap_times(season, round_, race_id)
        self._write_pit_stops(season, round_, race_id)

        # standings after this round
        cons_now = {}
        ds = api_get_standings(season, round_, "driver")
        if ds:
            stats = self._upsert_rows(
                self.tables["driver_standings"], race_id, "driverStandingsId", ["driverId"],
                ds.get("DriverStandings", []),
                lambda e: {
                    "driverId": self._driver(e["Driver"]["driverId"], e["Driver"]),
                    "points": NUM(e.get("points")),
                    "position": V(e.get("position")),
                    "positionText": V(e.get("positionText")),
                    "wins": NUM(e.get("wins")),
                },
            )
            print(f"  · driver standings:   {stats[0]} added, {stats[1]} updated, {stats[2]} removed")
        else:
            print("  ⚠ no driver standings available yet")

        cs = api_get_standings(season, round_, "constructor")
        if cs:
            stats = self._upsert_rows(
                self.tables["constructor_standings"], race_id, "constructorStandingsId", ["constructorId"],
                cs.get("ConstructorStandings", []),
                lambda e: {
                    "constructorId": self._constructor(e["Constructor"]["constructorId"], e["Constructor"]),
                    "points": NUM(e.get("points")),
                    "position": V(e.get("position")),
                    "positionText": V(e.get("positionText")),
                    "wins": NUM(e.get("wins")),
                },
            )
            print(f"  · constructor standings: {stats[0]} added, {stats[1]} updated, {stats[2]} removed")
            cons_now = {
                self._constructor(e["Constructor"]["constructorId"], e["Constructor"]): float(e.get("points") or 0)
                for e in cs.get("ConstructorStandings", [])
            }
        else:
            print("  ⚠ no constructor standings available yet")

        if cons_now:
            self._derive_constructor_results(season, round_, race_id, cons_now)

        self.results_race_ids.add(race_id)

    def _sessions_update(self, season: int, round_: int, race_id: str) -> None:
        """Refresh qualifying / sprint data for a race weekend in progress."""
        self._write_qualifying(season, round_, race_id)
        self._write_sprint(season, round_, race_id)

    def _write_qualifying(self, season, round_, race_id) -> None:
        records = api_get_race_records(season, round_, "qualifying")
        if not records:
            return
        stats = self._upsert_rows(
            self.tables["qualifying"], race_id, "qualifyId", ["driverId"],
            records,
            lambda q: {
                "driverId": self._driver(q["Driver"]["driverId"], q["Driver"]),
                "constructorId": self._constructor(q["Constructor"]["constructorId"], q["Constructor"]),
                "number": V(q.get("number")),
                "position": V(q.get("position")),
                "q1": V(q.get("Q1")),
                "q2": V(q.get("Q2")),
                "q3": V(q.get("Q3")),
            },
        )
        print(f"  · qualifying:   {stats[0]} added, {stats[1]} updated, {stats[2]} removed")

    def _write_sprint(self, season, round_, race_id) -> None:
        records = api_get_race_records(season, round_, "sprint")
        if not records:
            return
        t0 = records[0].get("Time") or {}
        try:
            leader_ms = int(t0.get("millis"))
        except (TypeError, ValueError):
            leader_ms = time_to_ms(t0.get("time"))
        stats = self._upsert_rows(
            self.tables["sprint_results"], race_id, "resultId", ["driverId"],
            list(enumerate(records)),
            lambda pair: {
                "driverId": self._driver(pair[1]["Driver"]["driverId"], pair[1]["Driver"]),
                "constructorId": self._constructor(pair[1]["Constructor"]["constructorId"], pair[1]["Constructor"]),
                "number": V(pair[1].get("number")),
                "grid": V(pair[1].get("grid")),
                "position": V(pair[1].get("position")),
                "positionText": V(pair[1].get("positionText")),
                "positionOrder": str(pair[0] + 1),
                "points": NUM(pair[1].get("points")),
                "laps": V(pair[1].get("laps")),
                "time": V((pair[1].get("Time") or {}).get("time")),
                "milliseconds": V(self._millis(pair[1], leader_ms)),
                "fastestLap": V((pair[1].get("FastestLap") or {}).get("lap")),
                "fastestLapTime": V(((pair[1].get("FastestLap") or {}).get("Time") or {}).get("time")),
                "statusId": self._status(pair[1].get("status", "")),
                "rank": V((pair[1].get("FastestLap") or {}).get("rank")),
            },
        )
        print(f"  · sprint results: {stats[0]} added, {stats[1]} updated, {stats[2]} removed")

    def _write_lap_times(self, season, round_, race_id) -> None:
        laps = api_get_laps(season, round_)
        if not laps:
            return
        records = [
            (lap, timing)
            for lap in laps
            for timing in lap.get("Timings", [])
        ]
        stats = self._upsert_rows(
            self.tables["lap_times"], race_id, None, ["driverId", "lap"],
            records,
            lambda pair: {
                "driverId": self._driver(pair[1]["driverId"]),
                "lap": V(pair[0].get("number")),
                "position": V(pair[1].get("position")),
                "time": V(pair[1].get("time")),
                "milliseconds": V(time_to_ms(pair[1].get("time"))),
            },
        )
        print(f"  · lap times:    {stats[0]} added, {stats[1]} updated, {stats[2]} removed")

    def _write_pit_stops(self, season, round_, race_id) -> None:
        stops = api_get_race_records(season, round_, "pitstops")
        if not stops:
            return
        stats = self._upsert_rows(
            self.tables["pit_stops"], race_id, None, ["driverId", "stop"],
            stops,
            lambda s: {
                "driverId": self._driver(s["driverId"]),
                "stop": V(s.get("stop")),
                "lap": V(s.get("lap")),
                "time": V(s.get("time")),
                "duration": V(s.get("duration")),
                "milliseconds": V(duration_to_ms(s.get("duration"))),
            },
        )
        print(f"  · pit stops:    {stats[0]} added, {stats[1]} updated, {stats[2]} removed")

    def _derive_constructor_results(self, season, round_, race_id, cons_now: dict) -> None:
        """Points earned per constructor in this race = difference between
        this round's and the previous round's constructor standings."""
        cons_in_race: list[str] = []
        for row in self.tables["results"].rows_for_race(race_id):
            if row["constructorId"] not in cons_in_race:
                cons_in_race.append(row["constructorId"])

        prev_points: dict[str, float] = {}
        if round_ > 1:
            prev_idx = self.race_index.get((season, round_ - 1))
            if prev_idx is not None:
                prev_race_id = self.tables["races"].rows[prev_idx]["raceId"]
                for row in self.tables["constructor_standings"].rows_for_race(prev_race_id):
                    try:
                        prev_points[row["constructorId"]] = float(row["points"])
                    except ValueError:
                        continue
            if not prev_points:
                prev = api_get_standings(season, round_ - 1, "constructor")
                if not prev:
                    print("  ⚠ cannot derive constructor results (no standings for previous round)")
                    return
                prev_points = {
                    self._constructor(e["Constructor"]["constructorId"], e["Constructor"]): float(e.get("points") or 0)
                    for e in prev.get("ConstructorStandings", [])
                }

        stats = self._upsert_rows(
            self.tables["constructor_results"], race_id, "constructorResultsId", ["constructorId"],
            cons_in_race,
            lambda cid: {
                "constructorId": cid,
                "points": NUM(cons_now.get(cid, 0.0) - prev_points.get(cid, 0.0)),
                # 'status' column (e.g. 'D' for disqualified) omitted:
                # cannot be derived — existing values are preserved
            },
        )
        print(f"  · constructor results: {stats[0]} added, {stats[1]} updated, {stats[2]} removed")

    # ── persistence ──

    def save_all(self) -> None:
        for table in self.tables.values():
            if table.dirty:
                table.save()
                print(f"  ✓ wrote {table.path.name} "
                      f"({table.appended} added, {table.updated} updated, {table.removed} removed)")


def rebuild_zip() -> None:
    print("\nRebuilding data.zip ...")
    with zipfile.ZipFile(ZIP_FILE, "w", zipfile.ZIP_DEFLATED) as zf:
        count = 0
        for path in sorted(DATA_DIR.rglob("*")):
            if path.is_file():
                zf.write(path, path.relative_to(DATA_DIR))
                count += 1
    size_mb = ZIP_FILE.stat().st_size / (1024 * 1024)
    print(f"✓ data.zip rebuilt with {count} file(s) ({size_mb:.2f} MB)")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Update F1 CSV data from the Jolpica API (https://jolpi.ca)."
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="fetch data and report what would change, but do not write files",
    )
    parser.add_argument(
        "--seasons",
        default=os.environ.get("JOLPICA_SEASONS"),
        help="comma-separated seasons to refresh (default: last year, this year, "
             "and any future seasons already in races.csv)",
    )
    parser.add_argument(
        "--refresh-days", type=int,
        default=int(os.environ.get("JOLPICA_REFRESH_DAYS", "7")),
        help="re-fetch races that finished within this many days (default: 7)",
    )
    args = parser.parse_args()

    if not DATA_DIR.is_dir():
        print(f"✗ Data directory not found: {DATA_DIR}")
        return 1

    print("Formula 1 Jolpica Update Script")
    print("=" * 60)
    print(f"Today (UTC): {datetime.now(timezone.utc).date()}")

    updater = Updater(args.refresh_days)

    if args.seasons:
        seasons = sorted({int(s.strip()) for s in args.seasons.split(",") if s.strip()})
    else:
        existing_years = {int(r["year"]) for r in updater.tables["races"].rows}
        seasons = sorted(
            {updater.today.year - 1, updater.today.year}
            | {y for y in existing_years if y >= updater.today.year}
        )
    print(f"Target seasons: {', '.join(map(str, seasons))}")

    updater.sync_reference_tables()
    for season in seasons:
        updater.upsert_calendar(season)
    for season in seasons:
        updater.process_season(season)

    changed = [t for t in updater.tables.values() if t.dirty]
    print("\n" + "=" * 60)
    if not changed:
        print("✓ No changes — data already up to date.")
        return 0

    print(f"{len(changed)} table(s) modified:")
    for table in changed:
        print(f"  · {table.name}: {table.appended} added, "
              f"{table.updated} updated, {table.removed} removed")

    if args.dry_run:
        print("\nDry run — no files written.")
        return 0

    updater.save_all()
    rebuild_zip()
    print("\n" + "=" * 60)
    print("✓ Jolpica update completed successfully!")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
