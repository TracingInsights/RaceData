#!/usr/bin/env python3
"""Diagnostic: show exactly which cells update_from_jolpica.py would change."""
import csv
import requests

BASE = "https://api.jolpi.ca/ergast/f1"
s = requests.Session()
s.headers["User-Agent"] = "RaceData diff-diagnostic"

# ── load our tables ──
def load(name):
    with open(f"data/{name}.csv", encoding="utf-8", newline="") as fh:
        return list(csv.DictReader(fh))

races = load("races")
results = load("results")
drivers = {r["driverRef"]: r for r in load("drivers")}
constructors = {r["constructorRef"]: r for r in load("constructors")}
status = {r["status"]: r["statusId"] for r in load("status")}
circuits = {r["circuitRef"]: r for r in load("circuits")}

NULL = r"\N"

def V(v):
    if v is None:
        return NULL
    v = str(v).strip()
    if v.endswith("Z"):
        v = v[:-1]
    return v or NULL

def NUM(v):
    t = V(v)
    if t == NULL:
        return t
    try:
        n = float(t)
    except ValueError:
        return t
    return str(int(n)) if n == int(n) else str(n)

def time_to_ms(text):
    if not text or ":" not in str(text):
        return None
    try:
        parts = [float(p) for p in str(text).split(":")]
    except ValueError:
        return None
    if len(parts) == 2:
        return int(round(parts[0]*60000 + parts[1]*1000))
    if len(parts) == 3:
        return int(round(parts[0]*3600000 + parts[1]*60000 + parts[2]*1000))
    return None

def gap_to_ms(text):
    if text is None:
        return None
    t = str(text).strip()
    if t.startswith("+"):
        t = t[1:]
    elif t.startswith("-"):
        return None
    try:
        return int(round(float(t)*1000))
    except ValueError:
        return None

# ── 1. which race rows changed? ──
print("=" * 70)
print("RACES diff (2025, 2026):")
for season in (2025, 2026):
    r = s.get(f"{BASE}/{season}/races.json", params={"limit": 100})
    api_races = r.json()["MRData"]["RaceTable"]["Races"]
    for race in api_races:
        key = (race["season"], race["round"])
        ours = next((x for x in races if (x["year"], x["round"]) == key), None)
        if ours is None:
            print(f"  MISSING: {key} {race['raceName']}")
            continue
        circuit = race.get("Circuit") or {}
        sessions = {
            "FirstPractice": ("fp1_date", "fp1_time"),
            "SecondPractice": ("fp2_date", "fp2_time"),
            "ThirdPractice": ("fp3_date", "fp3_time"),
            "Qualifying": ("quali_date", "quali_time"),
        }
        cells = {
            "circuitId": next((c["circuitId"] for c in circuits.values()
                               if c["circuitRef"] == circuit.get("circuitId")), "?"),
            "name": V(race.get("raceName")),
            "date": V(race.get("date")),
            "time": V(race.get("time")),
            "url": V(race.get("url")),
        }
        for k, (dc, tc) in sessions.items():
            sess = race.get(k) or {}
            cells[dc] = V(sess.get("date"))
            cells[tc] = V(sess.get("time"))
        sprint = race.get("Sprint") or race.get("SprintQualifying") or {}
        cells["sprint_date"] = V(sprint.get("date"))
        cells["sprint_time"] = V(sprint.get("time"))
        diffs = {c: (ours.get(c), v) for c, v in cells.items() if ours.get(c) != v}
        if diffs:
            print(f"  {key} {race['raceName']}:")
            for c, (old, new) in diffs.items():
                print(f"    {c}: {old!r} -> {new!r}")

# ── 2. which result cells changed for 2026 round 16? ──
print("=" * 70)
print("RESULTS diff (2026 round 16):")
race_id = next(r["raceId"] for r in races if r["year"] == "2026" and r["round"] == "16")
ours = {r["driverId"]: r for r in results if r["raceId"] == race_id}

r = s.get(f"{BASE}/2026/16/results.json", params={"limit": 100})
api_results = r.json()["MRData"]["RaceTable"]["Races"][0]["Results"]

t0 = api_results[0].get("Time") or {}
try:
    leader_ms = int(t0.get("millis"))
except (TypeError, ValueError):
    leader_ms = time_to_ms(t0.get("time"))

def millis(item):
    t = item.get("Time") or {}
    m = t.get("millis")
    if m is not None:
        try:
            return int(m)
        except (TypeError, ValueError):
            pass
    g = gap_to_ms(t.get("time"))
    if g is not None and leader_ms is not None:
        return leader_ms + g
    return time_to_ms(t.get("time"))

n_diff = 0
for i, res in enumerate(api_results):
    dref = res["Driver"]["driverId"]
    drow = drivers.get(dref)
    if drow is None:
        print(f"  UNKNOWN DRIVER REF: {dref}")
        continue
    did = drow["driverId"]
    o = ours.get(did)
    if o is None:
        print(f"  MISSING RESULT ROW: {dref}")
        continue
    cells = {
        "driverId": did,
        "constructorId": constructors[res["Constructor"]["constructorId"]]["constructorId"],
        "number": V(res.get("number")),
        "grid": V(res.get("grid")),
        "position": V(res.get("position")),
        "positionText": V(res.get("positionText")),
        "positionOrder": str(i + 1),
        "points": NUM(res.get("points")),
        "laps": V(res.get("laps")),
        "time": V((res.get("Time") or {}).get("time")),
        "milliseconds": V(millis(res)),
        "fastestLap": V((res.get("FastestLap") or {}).get("lap")),
        "rank": V((res.get("FastestLap") or {}).get("rank")),
        "fastestLapTime": V(((res.get("FastestLap") or {}).get("Time") or {}).get("time")),
        "statusId": status.get(res.get("status", ""), "?"),
    }
    diffs = {c: (o.get(c), v) for c, v in cells.items() if o.get(c) != v}
    if diffs:
        n_diff += 1
        name = f"{drow['forename']} {drow['surname']}"
        print(f"  [{dref}] {name}:")
        for c, (old, new) in diffs.items():
            print(f"    {c}: {old!r} -> {new!r}")
print(f"  ({n_diff} of {len(api_results)} rows differ)")

# also check for stale rows in ours not in API
api_dids = {drivers[x["Driver"]["driverId"]]["driverId"] for x in api_results if x["Driver"]["driverId"] in drivers}
stale = set(ours) - api_dids
if stale:
    print(f"  STALE ROWS (in ours, not in API): {stale}")
