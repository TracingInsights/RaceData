import pandas as pd
import os

# Define paths for WSL environment
data_dir = "/home/devcontainers/uGithub/RaceData/data"
f1db_dir = "/home/devcontainers/uGithub/RaceData/f1db-csv (2)"

print("Loading Ergast data...")
ergast_drivers = pd.read_csv(os.path.join(data_dir, "drivers.csv"))
ergast_races = pd.read_csv(os.path.join(data_dir, "races.csv"))

print("Loading F1DB data...")
f1db_drivers = pd.read_csv(os.path.join(f1db_dir, "f1db-drivers.csv"))
f1db_races = pd.read_csv(os.path.join(f1db_dir, "f1db-races.csv"))
f1db_results = pd.read_csv(os.path.join(f1db_dir, "f1db-races-race-results.csv"))

print(f"Ergast drivers: {len(ergast_drivers)}, F1DB drivers: {len(f1db_drivers)}")
print(f"Ergast races: {len(ergast_races)}, F1DB races: {len(f1db_races)}")

# Try matching races by (year, round)
print("\nMatching races...")
ergast_races_key = ergast_races[['raceId', 'year', 'round']]
f1db_races_key = f1db_races[['id', 'year', 'round']].rename(columns={'id': 'f1db_raceId'})

races_merged = pd.merge(ergast_races_key, f1db_races_key, on=['year', 'round'], how='outer')
matched_races = races_merged.dropna(subset=['raceId', 'f1db_raceId'])
print(f"Total matched races by (year, round): {len(matched_races)}")
print(f"Unmatched Ergast races: {len(races_merged[races_merged['f1db_raceId'].isna()])}")
print(f"Unmatched F1DB races: {len(races_merged[races_merged['raceId'].isna()])}")

# Try matching drivers by DOB
print("\nMatching drivers...")
# Format DoB to string to ensure matching
ergast_drivers['dob_str'] = pd.to_datetime(ergast_drivers['dob'], errors='coerce').dt.strftime('%Y-%m-%d')
f1db_drivers['dob_str'] = pd.to_datetime(f1db_drivers['dateOfBirth'], errors='coerce').dt.strftime('%Y-%m-%d')

# Match by DoB first
drivers_dob_merged = pd.merge(
    ergast_drivers, 
    f1db_drivers, 
    on='dob_str', 
    how='inner'
)
print(f"Matched drivers by DOB: {len(drivers_dob_merged)}")

# Let's inspect unmatched drivers
matched_dob_ergast_ids = set(drivers_dob_merged['driverId'])
unmatched_ergast_drivers = ergast_drivers[~ergast_drivers['driverId'].isin(matched_dob_ergast_ids)]
print(f"Unmatched Ergast drivers by DOB count: {len(unmatched_ergast_drivers)}")

if len(unmatched_ergast_drivers) > 0:
    print("Sample unmatched Ergast drivers:")
    print(unmatched_ergast_drivers[['driverId', 'driverRef', 'forename', 'surname', 'dob']].head(10))
