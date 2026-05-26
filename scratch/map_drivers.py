import pandas as pd
import os

f1db_dir = "/home/devcontainers/uGithub/RaceData/f1db-csv (2)"
f1db_results = pd.read_csv(os.path.join(f1db_dir, "f1db-races-race-results.csv"))

print(f1db_results[f1db_results['raceId'] == 550][['driverId', 'positionDisplayOrder', 'positionNumber', 'positionText']])
