import pandas as pd
import os
import re
import unicodedata

data_dir = "/home/devcontainers/uGithub/RaceData/data"
f1db_dir = "/home/devcontainers/uGithub/RaceData/f1db-csv (2)"
output_dirs = [
    "/home/devcontainers/uGithub/RaceData/f1db-csv",
    "/home/devcontainers/uGithub/RaceData/f1db-csv (2)"
]

print("1. Loading races data...")
ergast_races = pd.read_csv(os.path.join(data_dir, "races.csv"))
f1db_races = pd.read_csv(os.path.join(f1db_dir, "f1db-races.csv"))

print("2. Mapping races by (year, round)...")
ergast_races_key = ergast_races[['raceId', 'year', 'round']].copy()
f1db_races_key = f1db_races[['id', 'year', 'round']].rename(columns={'id': 'f1db_raceId'}).copy()
race_map = pd.merge(ergast_races_key, f1db_races_key, on=['year', 'round'], how='inner')
print(f"Mapped {len(race_map)} races successfully.")

print("\n3. Loading drivers data...")
ergast_drivers = pd.read_csv(os.path.join(data_dir, "drivers.csv"))
f1db_drivers = pd.read_csv(os.path.join(f1db_dir, "f1db-drivers.csv"))

print("4. Normalizing and building driver mapping...")
def clean_string(s):
    if pd.isna(s):
        return ""
    s = unicodedata.normalize('NFKD', str(s)).encode('ASCII', 'ignore').decode('ASCII')
    return re.sub(r'[^a-zA-Z0-9]', '', s).lower()

ergast_drivers['dob_clean'] = pd.to_datetime(ergast_drivers['dob'], errors='coerce').dt.strftime('%Y-%m-%d')
ergast_drivers['clean_surname'] = ergast_drivers['surname'].apply(clean_string)
ergast_drivers['clean_forename'] = ergast_drivers['forename'].apply(clean_string)
ergast_drivers['clean_ref'] = ergast_drivers['driverRef'].apply(clean_string)

f1db_drivers['dob_clean'] = pd.to_datetime(f1db_drivers['dateOfBirth'], errors='coerce').dt.strftime('%Y-%m-%d')
f1db_drivers['clean_lastName'] = f1db_drivers['lastName'].apply(clean_string)
f1db_drivers['clean_firstName'] = f1db_drivers['firstName'].apply(clean_string)
f1db_drivers['clean_id'] = f1db_drivers['id'].apply(clean_string)
f1db_drivers['clean_name'] = f1db_drivers['name'].apply(clean_string)

mapping = {}

# Step 1: Match by exact DOB and clean lastName/surname/id/name
merged1 = pd.merge(ergast_drivers, f1db_drivers, on='dob_clean', how='inner')
exact_matches = merged1[
    (merged1['clean_surname'] == merged1['clean_lastName']) |
    (merged1['clean_surname'] == merged1['clean_id']) |
    (merged1['clean_surname'] == merged1['clean_name'])
]
for _, row in exact_matches.iterrows():
    mapping[row['driverId']] = row['id']

# Step 2: Fallbacks for unmatched
unmatched1 = ergast_drivers[~ergast_drivers['driverId'].isin(mapping.keys())]
for _, row in unmatched1.iterrows():
    dob = row['dob_clean']
    if pd.notna(dob):
        f1db_candidates = f1db_drivers[f1db_drivers['dob_clean'] == dob]
        if len(f1db_candidates) == 1:
            cand = f1db_candidates.iloc[0]
            if (row['clean_surname'] in cand['clean_id'] or 
                cand['clean_lastName'] in row['clean_ref'] or
                row['clean_ref'] in cand['clean_id'] or
                cand['clean_id'].startswith(row['clean_surname'][:4])):
                mapping[row['driverId']] = cand['id']
        elif len(f1db_candidates) > 1:
            matches = []
            for _, cand in f1db_candidates.iterrows():
                if row['clean_surname'] in cand['clean_id'] or cand['clean_lastName'] in row['clean_ref']:
                    matches.append(cand['id'])
            if len(matches) == 1:
                mapping[row['driverId']] = matches[0]

unmatched2 = ergast_drivers[~ergast_drivers['driverId'].isin(mapping.keys())]
for _, row in unmatched2.iterrows():
    ref = row['clean_ref']
    surname = row['clean_surname']
    candidates = f1db_drivers[
        f1db_drivers['clean_id'].str.contains(ref) | 
        f1db_drivers['clean_id'].str.contains(surname) |
        f1db_drivers['clean_lastName'].str.contains(surname) |
        f1db_drivers['clean_lastName'].str.contains(ref)
    ]
    if len(candidates) == 1:
        if ref != 'vos':
            mapping[row['driverId']] = candidates.iloc[0]['id']
    elif len(candidates) > 1:
        sub_candidates = candidates[
            candidates['clean_firstName'].str.contains(row['clean_forename']) |
            candidates['clean_id'].str.contains(row['clean_forename'])
        ]
        if len(sub_candidates) == 1:
            mapping[row['driverId']] = sub_candidates.iloc[0]['id']

print(f"Total mapped drivers: {len(mapping)}")

print("\n5. Loading F1DB results to map driver metadata (constructor, engine, tyre, number)...")
f1db_results = pd.read_csv(os.path.join(f1db_dir, "f1db-races-race-results.csv"))

# Build results lookup
results_lookup = f1db_results[[
    'raceId', 'driverId', 'constructorId', 'engineManufacturerId', 'tyreManufacturerId', 'driverNumber'
]].copy()
results_lookup = results_lookup.rename(columns={'raceId': 'f1db_raceId', 'driverId': 'f1db_driverId'})

print("\n6. Loading lap times...")
lap_times = pd.read_csv(os.path.join(data_dir, "lap_times.csv"))
print(f"Total lap times rows: {len(lap_times)}")

print("\n7. Mapping races and drivers in lap times...")
lap_times = pd.merge(lap_times, race_map, on='raceId', how='inner')

# Map driverId using our mapping dictionary
lap_times['f1db_driverId'] = lap_times['driverId'].map(mapping)

# Check if any rows are unmapped
unmapped_rows = lap_times[lap_times['f1db_driverId'].isna()]
if len(unmapped_rows) > 0:
    print(f"Warning: {len(unmapped_rows)} lap times rows have unmapped driverId. Dropping them.")
    lap_times = lap_times.dropna(subset=['f1db_driverId'])

print("\n8. Merging with results lookup to get team/tyre metadata...")
lap_times = pd.merge(
    lap_times, 
    results_lookup, 
    on=['f1db_raceId', 'f1db_driverId'], 
    how='left'
)

# Drop original Ergast raceId and driverId to avoid duplicate column names after rename
lap_times = lap_times.drop(columns=['raceId', 'driverId'])

# Rename and format
lap_times = lap_times.rename(columns={
    'f1db_raceId': 'raceId',
    'f1db_driverId': 'driverId',
    'milliseconds': 'timeMillis'
})

# Columns to export
final_cols = [
    "raceId", "year", "round", "driverId", "driverNumber", 
    "constructorId", "engineManufacturerId", "tyreManufacturerId", 
    "lap", "position", "time", "timeMillis"
]

# Ensure we have all columns, fill missing if any
for col in final_cols:
    if col not in lap_times.columns:
        lap_times[col] = None

# Format timeMillis to integer
lap_times['timeMillis'] = pd.to_numeric(lap_times['timeMillis'], errors='coerce').fillna(0).astype(int)

# Select and sort
lap_times_final = lap_times[final_cols].copy()
lap_times_final = lap_times_final.sort_values(by=["raceId", "lap", "position"])

# Let's save output to both directories
for od in output_dirs:
    os.makedirs(od, exist_ok=True)
    out_file = os.path.join(od, "f1db-races-lap-times.csv")
    print(f"\n9. Saving final lap times to {out_file}...")
    lap_times_final.to_csv(out_file, index=False, quotechar='"')
    print("✓ Successfully saved!")
