# Formula 1 Race Data Archive

This dataset contains data from 1950 all the way through the current season, and consists of tables describing constructors, race drivers, lap times, pit stops and more.

Automated repository for downloading and archiving Formula 1 race datasets from Kaggle.

## 🏎️ Overview

This repository automatically downloads and maintains up-to-date Formula 1 race data from Kaggle datasets released under License CC0: Public Domain:
- [Formula 1 Race Data](https://www.kaggle.com/datasets/jtrotman/formula-1-race-data)
- [Formula 1 Race Events](https://www.kaggle.com/datasets/jtrotman/formula-1-race-events)

**Automated Updates**: within 3 hours of the end of the race via GitHub Actions

Latest .zip file at https://github.com/TracingInsights/RaceData/releases/latest/download/data.zip

Also available on HuggingFace Datasets at https://huggingface.co/datasets/tracinginsights/RaceData

## 📦 What's Included

- **data/**: All dataset files from Kaggle
- **data.zip**: Consolidated archive of all data files




## 📊 About the Data

These datasets contain Formula 1 data from 1950 through the current season, including:
- Race results and standings
- Constructor information
- Driver details
- Lap times
- Pit stops
- And more...

## 📂 Data Dictionary

### `circuits.csv`

This file contains information about each circuit where a Formula 1 race has been held.

| Column | Description |
|---|---|
| `circuitId` | Unique identifier for each circuit |
| `circuitRef` | A short reference name for the circuit |
| `name` | The official name of the circuit |
| `location` | The city where the circuit is located |
| `country` | The country where the circuit is located |
| `lat` | Latitude of the circuit |
| `lng` | Longitude of the circuit |
| `alt` | Altitude of the circuit in meters |
| `url` | URL for the circuit's Wikipedia page |

### `constructor_results.csv`

This file contains the results for each constructor in each race.

| Column | Description |
|---|---|
| `constructorResultsId` | Unique identifier for each constructor result |
| `raceId` | Foreign key to `races.csv` |
| `constructorId` | Foreign key to `constructors.csv` |
| `points` | Points scored by the constructor in the race |
| `status` | Status of the constructor in the race |

### `constructor_standings.csv`

This file contains the constructor standings after each race.

| Column | Description |
|---|---|
| `constructorStandingsId` | Unique identifier for each constructor standing |
| `raceId` | Foreign key to `races.csv` |
| `constructorId` | Foreign key to `constructors.csv` |
| `points` | Total points for the constructor after the race |
| `position` | Constructor's position in the standings |
| `positionText` | Text representation of the constructor's position |
| `wins` | Number of wins for the constructor in the season |

### `constructors.csv`

This file contains information about each constructor.

| Column | Description |
|---|---|
| `constructorId` | Unique identifier for each constructor |
| `constructorRef` | A short reference name for the constructor |
| `name` | The full name of the constructor |
| `nationality` | The nationality of the constructor |
| `url` | URL for the constructor's Wikipedia page |

### `driver_standings.csv`

This file contains the driver standings after each race.

| Column | Description |
|---|---|
| `driverStandingsId` | Unique identifier for each driver standing |
| `raceId` | Foreign key to `races.csv` |
| `driverId` | Foreign key to `drivers.csv` |
| `points` | Total points for the driver after the race |
| `position` | Driver's position in the standings |
| `positionText` | Text representation of the driver's position |
| `wins` | Number of wins for the driver in the season |

### `drivers.csv`

This file contains information about each driver.

| Column | Description |
|---|---|
| `driverId` | Unique identifier for each driver |
| `driverRef` | A short reference name for the driver |
| `number` | The driver's car number |
| `code` | A three-letter code for the driver |
| `forename` | The driver's first name |
| `surname` | The driver's last name |
| `dob` | The driver's date of birth |
| `nationality` | The driver's nationality |
| `url` | URL for the driver's Wikipedia page |

### `fatal_accidents_drivers.csv`

This file contains information about fatal accidents involving drivers.

| Column | Description |
|---|---|
| `Driver` | The name of the driver |
| `Age` | The age of the driver at the time of the accident |
| `Date Of Accident` | The date of the accident |
| `Event` | The event where the accident occurred |
| `Car` | The car the driver was in |
| `Session` | The session in which the accident occurred (e.g., Practice, Race) |

### `fatal_accidents_marshalls.csv`

This file contains information about fatal accidents involving race marshalls.

| Column | Description |
|---|---|
| `Name` | The name of the marshall |
| `Age` | The age of the marshall at the time of the accident |
| `Date Of Accident` | The date of the accident |
| `Event` | The event where the accident occurred |

### `lap_times.csv`

This file contains the lap times for each driver in each race.

| Column | Description |
|---|---|
| `raceId` | Foreign key to `races.csv` |
| `driverId` | Foreign key to `drivers.csv` |
| `lap` | The lap number |
| `position` | The driver's position at the end of the lap |
| `time` | The lap time in "minutes:seconds.milliseconds" format |
| `milliseconds` | The lap time in milliseconds |

### `pit_stops.csv`

This file contains information about each pit stop.

| Column | Description |
|---|---|
| `raceId` | Foreign key to `races.csv` |
| `driverId` | Foreign key to `drivers.csv` |
| `stop` | The pit stop number for the driver in the race |
| `lap` | The lap number when the pit stop occurred |
| `time` | The time of day when the pit stop occurred |
| `duration` | The duration of the pit stop in seconds |
| `milliseconds` | The duration of the pit stop in milliseconds |

### `qualifying.csv`

This file contains the qualifying results for each race.

| Column | Description |
|---|---|
| `qualifyId` | Unique identifier for each qualifying result |
| `raceId` | Foreign key to `races.csv` |
| `driverId` | Foreign key to `drivers.csv` |
| `constructorId` | Foreign key to `constructors.csv` |
| `number` | The driver's car number |
| `position` | The driver's qualifying position |
| `q1` | The driver's Q1 time |
| `q2` | The driver's Q2 time |
| `q3` | The driver's Q3 time |

### `races.csv`

This file contains information about each race.

| Column | Description |
|---|---|
| `raceId` | Unique identifier for each race |
| `year` | The year of the race |
| `round` | The round number of the race in the season |
| `circuitId` | Foreign key to `circuits.csv` |
| `name` | The name of the Grand Prix |
| `date` | The date of the race |
| `time` | The time of the race |
| `url` | URL for the race's Wikipedia page |
| `fp1_date` | Date of Free Practice 1 |
| `fp1_time` | Time of Free Practice 1 |
| `fp2_date` | Date of Free Practice 2 |
| `fp2_time` | Time of Free Practice 2 |
| `fp3_date` | Date of Free Practice 3 |
| `fp3_time` | Time of Free Practice 3 |
| `quali_date` | Date of Qualifying |
| `quali_time` | Time of Qualifying |
| `sprint_date` | Date of Sprint Race |
| `sprint_time` | Time of Sprint Race |

### `red_flags.csv`

This file contains information about red flags during races.

| Column | Description |
|---|---|
| `Race` | The name of the race |
| `Lap` | The lap number when the red flag was shown |
| `Resumed` | Whether the race was resumed (Y/N/R/S) |
| `Incident` | A description of the incident that caused the red flag |
| `Excluded` | A list of drivers excluded from the race |

### `results.csv`

This file contains the results for each driver in each race.

| Column | Description |
|---|---|
| `resultId` | Unique identifier for each result |
| `raceId` | Foreign key to `races.csv` |
| `driverId` | Foreign key to `drivers.csv` |
| `constructorId` | Foreign key to `constructors.csv` |
| `number` | The driver's car number |
| `grid` | The driver's starting grid position |
| `position` | The driver's finishing position |
| `positionText` | Text representation of the driver's finishing position |
| `positionOrder` | The driver's finishing position in order |
| `points` | Points scored by the driver in the race |
| `laps` | Number of laps completed by the driver |
| `time` | The driver's total race time |
| `milliseconds` | The driver's total race time in milliseconds |
| `fastestLap` | The lap number of the driver's fastest lap |
| `rank` | The rank of the driver's fastest lap |
| `fastestLapTime` | The driver's fastest lap time |
| `fastestLapSpeed` | The speed of the driver's fastest lap |
| `statusId` | Foreign key to `status.csv` |

### `safety_cars.csv`

This file contains information about safety car periods during races.

| Column | Description |
|---|---|
| `Race` | The name of the race |
| `Cause` | The reason for the safety car deployment |
| `Deployed` | The lap number when the safety car was deployed |
| `Retreated` | The lap number when the safety car retreated |
| `FullLaps` | The number of full laps the safety car was on track |

### `seasons.csv`

This file contains information about each Formula 1 season.

| Column | Description |
|---|---|
| `year` | The year of the season |
| `url` | URL for the season's Wikipedia page |

### `sprint_results.csv`

This file contains the results for each driver in each sprint race.

| Column | Description |
|---|---|
| `resultId` | Unique identifier for each result |
| `raceId` | Foreign key to `races.csv` |
| `driverId` | Foreign key to `drivers.csv` |
| `constructorId` | Foreign key to `constructors.csv` |
| `number` | The driver's car number |
| `grid` | The driver's starting grid position |
| `position` | The driver's finishing position |
| `positionText` | Text representation of the driver's finishing position |
| `positionOrder` | The driver's finishing position in order |
| `points` | Points scored by the driver in the sprint race |
| `laps` | Number of laps completed by the driver |
| `time` | The driver's total sprint race time |
| `milliseconds` | The driver's total sprint race time in milliseconds |
| `fastestLap` | The lap number of the driver's fastest lap |
| `fastestLapTime` | The driver's fastest lap time |
| `statusId` | Foreign key to `status.csv` |
| `rank` | The rank of the driver's fastest lap |

### `status.csv`

This file contains information about the finishing status of a driver in a race.

| Column | Description |
|---|---|
| `statusId` | Unique identifier for each status |
| `status` | A description of the finishing status |

### `virtual_safety_car_estimates.json`

This file contains estimates of virtual safety car periods in races. The keys are the race names and the values are a list of lap numbers where a virtual safety car was active.
