#!/usr/bin/env python3
"""Convert virtual_safety_car_estimates.json to a CSV similar to safety_cars.csv.

The JSON file maps race names to a list of lap numbers during which a Virtual
Safety Car (VSC) was active. This script groups consecutive laps into distinct
VSC periods and writes a CSV with the following columns:

    Race, Deployed, Retreated, FullLaps

* Deployed  - first lap of the VSC period
* Retreated - last lap of the VSC period
* FullLaps  - number of laps in the period
"""

from __future__ import annotations

import csv
import json
from itertools import groupby
from pathlib import Path


def load_vsc_laps(path: Path) -> dict[str, list[int]]:
    """Load the virtual safety car estimates JSON file."""
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    return {str(k): [int(v) for v in laps] for k, laps in data.items()}


def group_consecutive_laps(laps: list[int]) -> list[list[int]]:
    """Group a list of lap numbers into consecutive runs."""
    sorted_laps = sorted(set(laps))
    groups: list[list[int]] = []
    for _, group in groupby(enumerate(sorted_laps), key=lambda item: item[1] - item[0]):
        groups.append([lap for _, lap in group])
    return groups


def convert_vsc_json_to_csv(json_path: Path, csv_path: Path) -> None:
    """Convert the VSC JSON file to a CSV file."""
    vsc_data = load_vsc_laps(json_path)

    rows: list[dict[str, object]] = []
    for race in sorted(vsc_data.keys()):
        laps = vsc_data[race]
        if not laps:
            continue
        for period in group_consecutive_laps(laps):
            rows.append(
                {
                    "Race": race,
                    "Deployed": period[0],
                    "Retreated": period[-1],
                    "FullLaps": len(period),
                }
            )

    csv_path.parent.mkdir(parents=True, exist_ok=True)
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["Race", "Deployed", "Retreated", "FullLaps"])
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    """Entry point for the conversion."""
    project_root = Path(__file__).parent
    json_path = project_root / "data" / "virtual_safety_car_estimates.json"
    csv_path = project_root / "data" / "virtual_safety_cars.csv"

    convert_vsc_json_to_csv(json_path, csv_path)
    print(f"Converted {json_path} -> {csv_path} ({len(list(csv_path.open().readlines())) - 1} periods)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
