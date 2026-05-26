# F1 Dataset (`/data` Folder) - Schema and Data Dictionary

This document provides a comprehensive reference of the data structures, column schemas, and metadata for every dataset inside the `/data` directory. These files often match the structure of Ergast F1 databases or supplementary scraped details (e.g. fatal accidents, safety cars, and virtual safety cars).

## Table of Contents

1. [Data Folder Overview](#data-folder-overview)
2. [Dataset Summary Table](#dataset-summary-table)
3. [Detailed File Schemas](#detailed-file-schemas)
   - [circuits.csv](#circuits_csv)
   - [constructor_results.csv](#constructor_results_csv)
   - [constructor_standings.csv](#constructor_standings_csv)
   - [constructors.csv](#constructors_csv)
   - [driver_standings.csv](#driver_standings_csv)
   - [drivers.csv](#drivers_csv)
   - [fatal_accidents_drivers.csv](#fatal_accidents_drivers_csv)
   - [fatal_accidents_marshalls.csv](#fatal_accidents_marshalls_csv)
   - [lap_times.csv](#lap_times_csv)
   - [pit_stops.csv](#pit_stops_csv)
   - [qualifying.csv](#qualifying_csv)
   - [races.csv](#races_csv)
   - [red_flags.csv](#red_flags_csv)
   - [results.csv](#results_csv)
   - [safety_cars.csv](#safety_cars_csv)
   - [seasons.csv](#seasons_csv)
   - [sprint_results.csv](#sprint_results_csv)
   - [status.csv](#status_csv)
   - [virtual_safety_car_estimates.json](#virtual_safety_car_estimates_json)

---

## Data Folder Overview

- **Total Files**: 19 (18 CSV files, 1 JSON file)
- **Total Records Across All Files**: 997,521
- **Primary Domain**: F1 Ergast relational tables & customized F1 event tracks (Safety Cars, Red Flags, Fatal Accidents, VSC estimations).

## Dataset Summary Table

| Filename | Format | Total Rows | Columns / Keys | Size (Bytes) | Primary Key Candidate(s) |
| :--- | :---: | :---: | :---: | :---: | :--- |
| [circuits.csv](#circuits_csv) | CSV | 78 | 9 cols | 10,285 | `circuitId`, `circuitRef`, `name`, `lat`, `lng`, `url` |
| [constructor_results.csv](#constructor_results_csv) | CSV | 12,920 | 5 cols | 238,011 | _None_ |
| [constructor_standings.csv](#constructor_standings_csv) | CSV | 13,686 | 7 cols | 311,058 | _None_ |
| [constructors.csv](#constructors_csv) | CSV | 214 | 5 cols | 17,863 | `constructorId`, `constructorRef`, `name` |
| [driver_standings.csv](#driver_standings_csv) | CSV | 35,471 | 7 cols | 864,582 | _None_ |
| [drivers.csv](#drivers_csv) | CSV | 865 | 9 cols | 95,706 | `driverId`, `driverRef`, `url` |
| [fatal_accidents_drivers.csv](#fatal_accidents_drivers_csv) | CSV | 51 | 6 cols | 3,316 | `﻿Driver` |
| [fatal_accidents_marshalls.csv](#fatal_accidents_marshalls_csv) | CSV | 5 | 4 cols | 307 | `﻿Name`, `Date Of Accident`, `Event` |
| [lap_times.csv](#lap_times_csv) | CSV | 871,076 | 6 cols | 25,306,282 | _None_ |
| [pit_stops.csv](#pit_stops_csv) | CSV | 22,249 | 7 cols | 785,803 | _None_ |
| [qualifying.csv](#qualifying_csv) | CSV | 11,080 | 9 cols | 463,403 | _None_ |
| [races.csv](#races_csv) | CSV | 1,171 | 18 cols | 174,296 | _None_ |
| [red_flags.csv](#red_flags_csv) | CSV | 98 | 5 cols | 14,969 | _None_ |
| [results.csv](#results_csv) | CSV | 27,348 | 18 cols | 1,684,211 | _None_ |
| [safety_cars.csv](#safety_cars_csv) | CSV | 368 | 5 cols | 16,934 | _None_ |
| [seasons.csv](#seasons_csv) | CSV | 77 | 2 cols | 4,818 | `year`, `url` |
| [sprint_results.csv](#sprint_results_csv) | CSV | 546 | 17 cols | 36,334 | `resultId` |
| [status.csv](#status_csv) | CSV | 140 | 2 cols | 2,293 | `statusId`, `status` |
| [virtual_safety_car_estimates.json](#virtual_safety_car_estimates_json) | JSON | 78 | Keys: `2015 Belgian Grand Prix`, `2015 British Grand Prix`, `2015 Hungarian Grand Prix`, `2015 Monaco Grand Prix`, `2015 Singapore Grand Prix`, `2016 British Grand Prix`, `2016 Malaysian Grand Prix`, `2016 Monaco Grand Prix`, `2016 United States Grand Prix`, `2017 Canadian Grand Prix`, `2017 Japanese Grand Prix`, `2017 Mexican Grand Prix`, `2017 Spanish Grand Prix`, `2018 Australian Grand Prix`, `2018 Austrian Grand Prix`... | 6,429 | _N/A_ |

---

## Detailed File Schemas

### <a id='circuits_csv'></a> circuits.csv

- **File Format**: CSV
- **Total Records**: 78
- **Total Columns**: 9

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `circuitId` | `int` | ✅ Yes | 0 | 0.0% | Range: `1` to `81` | `1`, `2`, `3`, `4`, `5` |
| `circuitRef` | `string` | ✅ Yes | 0 | 0.0% | 78 unique values | `albert_park`, `sepang`, `bahrain`, `catalunya`, `istanbul` |
| `name` | `string` | ✅ Yes | 0 | 0.0% | 78 unique values | `Albert Park Grand Prix Circuit`, `Sepang International Circuit`, `Bahrain International Circuit`, `Circuit de Barcelona-Catalunya`, `Istanbul Park` |
| `location` | `string` | No | 0 | 0.0% | 75 unique values | `Melbourne`, `Kuala Lumpur`, `Sakhir`, `Montmeló`, `Istanbul` |
| `country` | `string` | No | 0 | 0.0% | 35 unique values | `Australia`, `Malaysia`, `Bahrain`, `Spain`, `Turkey` |
| `lat` | `float` | ✅ Yes | 0 | 0.0% | Range: `-37.8497` to `57.2653` | `-37.8497`, `2.76083`, `26.0325`, `41.57`, `40.9517` |
| `lng` | `float` | ✅ Yes | 0 | 0.0% | Range: `-118.189` to `144.968` | `144.968`, `101.738`, `50.5106`, `2.26111`, `29.405` |
| `alt` | `int` | No | 0 | 0.0% | Range: `-7` to `2227` | `10`, `18`, `7`, `109`, `130` |
| `url` | `string` | ✅ Yes | 0 | 0.0% | 78 unique values | `http://en.wikipedia.org/wiki/Melbourne_Grand_Prix_Circuit`, `http://en.wikipedia.org/wiki/Sepang_International_Circuit`, `http://en.wikipedia.org/wiki/Bahrain_International_Circuit`, `http://en.wikipedia.org/wiki/Circuit_de_Barcelona-Catalunya`, `http://en.wikipedia.org/wiki/Istanbul_Park` |

---

### <a id='constructor_results_csv'></a> constructor_results.csv

- **File Format**: CSV
- **Total Records**: 12,920
- **Total Columns**: 5

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `constructorResultsId` | `int` | No | 0 | 0.0% | Range: `1` to `17424` | `1`, `2`, `3`, `4`, `5` |
| `raceId` | `int` | No | 0 | 0.0% | Range: `1` to `1173` | `18`, `19`, `20`, `21`, `22` |
| `constructorId` | `int` | No | 0 | 0.0% | Range: `1` to `217` | `1`, `2`, `3`, `4`, `5` |
| `points` | `int` | No | 0 | 0.0% | Range: `0` to `66` | `14`, `8`, `9`, `5`, `2` |
| `status` | `string` | No | 12,903 | 99.87% | 'D' | `D` |

---

### <a id='constructor_standings_csv'></a> constructor_standings.csv

- **File Format**: CSV
- **Total Records**: 13,686
- **Total Columns**: 7

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `constructorStandingsId` | `int` | No | 0 | 0.0% | Range: `1` to `29277` | `1`, `2`, `3`, `4`, `5` |
| `raceId` | `int` | No | 0 | 0.0% | Range: `1` to `1173` | `18`, `19`, `20`, `21`, `22` |
| `constructorId` | `int` | No | 0 | 0.0% | Range: `1` to `217` | `1`, `2`, `3`, `4`, `5` |
| `points` | `int` | No | 0 | 0.0% | Range: `0` to `860` | `14`, `8`, `9`, `5`, `2` |
| `position` | `int` | No | 1 | 0.01% | Range: `1` to `22` | `1`, `3`, `2`, `4`, `5` |
| `positionText` | `int` | No | 0 | 0.0% | Range: `1` to `22` | `1`, `3`, `2`, `4`, `5` |
| `wins` | `int` | No | 0 | 0.0% | Range: `0` to `21` | `1`, `0`, `2`, `3`, `4` |

---

### <a id='constructors_csv'></a> constructors.csv

- **File Format**: CSV
- **Total Records**: 214
- **Total Columns**: 5

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `constructorId` | `int` | ✅ Yes | 0 | 0.0% | Range: `1` to `217` | `1`, `2`, `3`, `4`, `5` |
| `constructorRef` | `string` | ✅ Yes | 0 | 0.0% | 214 unique values | `mclaren`, `bmw_sauber`, `williams`, `renault`, `toro_rosso` |
| `name` | `string` | ✅ Yes | 0 | 0.0% | 214 unique values | `McLaren`, `BMW Sauber`, `Williams`, `Renault`, `Toro Rosso` |
| `nationality` | `string` | No | 0 | 0.0% | 24 unique values | `British`, `German`, `French`, `Italian`, `Japanese` |
| `url` | `string` | No | 0 | 0.0% | 177 unique values | `http://en.wikipedia.org/wiki/McLaren`, `http://en.wikipedia.org/wiki/BMW_Sauber`, `http://en.wikipedia.org/wiki/Williams_Grand_Prix_Engineering`, `http://en.wikipedia.org/wiki/Renault_in_Formula_One`, `http://en.wikipedia.org/wiki/Scuderia_Toro_Rosso` |

---

### <a id='driver_standings_csv'></a> driver_standings.csv

- **File Format**: CSV
- **Total Records**: 35,471
- **Total Columns**: 7

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `driverStandingsId` | `int` | No | 0 | 0.0% | Range: `1` to `73878` | `1`, `2`, `3`, `4`, `5` |
| `raceId` | `int` | No | 0 | 0.0% | Range: `1` to `1173` | `18`, `19`, `20`, `21`, `22` |
| `driverId` | `int` | No | 0 | 0.0% | Range: `1` to `866` | `1`, `2`, `3`, `4`, `5` |
| `points` | `int` | No | 0 | 0.0% | Range: `0` to `575` | `10`, `8`, `6`, `5`, `4` |
| `position` | `int` | No | 13 | 0.04% | Range: `1` to `108` | `1`, `2`, `3`, `4`, `5` |
| `positionText` | `int` | No | 0 | 0.0% | Range: `1` to `108` | `1`, `2`, `3`, `4`, `5` |
| `wins` | `int` | No | 0 | 0.0% | Range: `0` to `19` | `1`, `0`, `2`, `3`, `4` |

---

### <a id='drivers_csv'></a> drivers.csv

- **File Format**: CSV
- **Total Records**: 865
- **Total Columns**: 9

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `driverId` | `int` | ✅ Yes | 0 | 0.0% | Range: `1` to `866` | `1`, `2`, `3`, `4`, `5` |
| `driverRef` | `string` | ✅ Yes | 0 | 0.0% | 865 unique values | `hamilton`, `heidfeld`, `rosberg`, `alonso`, `kovalainen` |
| `number` | `int` | No | 802 | 92.72% | Range: `2` to `99` | `44`, `6`, `14`, `7`, `88` |
| `code` | `string` | No | 757 | 87.51% | 101 unique values | `HAM`, `HEI`, `ROS`, `ALO`, `KOV` |
| `forename` | `string` | No | 0 | 0.0% | 482 unique values | `Lewis`, `Nick`, `Nico`, `Fernando`, `Heikki` |
| `surname` | `string` | No | 0 | 0.0% | 806 unique values | `Hamilton`, `Heidfeld`, `Rosberg`, `Alonso`, `Kovalainen` |
| `dob` | `date` | No | 0 | 0.0% | 847 unique values | `1985-01-07`, `1977-05-10`, `1985-06-27`, `1981-07-29`, `1981-10-19` |
| `nationality` | `string` | No | 0 | 0.0% | 43 unique values | `British`, `German`, `Spanish`, `Finnish`, `Japanese` |
| `url` | `string` | ✅ Yes | 0 | 0.0% | 865 unique values | `http://en.wikipedia.org/wiki/Lewis_Hamilton`, `http://en.wikipedia.org/wiki/Nick_Heidfeld`, `http://en.wikipedia.org/wiki/Nico_Rosberg`, `http://en.wikipedia.org/wiki/Fernando_Alonso`, `http://en.wikipedia.org/wiki/Heikki_Kovalainen` |

---

### <a id='fatal_accidents_drivers_csv'></a> fatal_accidents_drivers.csv

- **File Format**: CSV
- **Total Records**: 51
- **Total Columns**: 6

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `﻿Driver` | `string` | ✅ Yes | 0 | 0.0% | 51 unique values | `Cameron Earl`, `Chet Miller`, `Charles de Tornaco`, `Onofre Marimón`, `Mario Alborghetti` |
| `Age` | `int` | No | 1 | 1.96% | Range: `20` to `59` | `29`, `50`, `26`, `30`, `33` |
| `Date Of Accident` | `string` | No | 0 | 0.0% | 50 unique values | `6/18/52`, `5/15/53`, `9/18/53`, `7/31/54`, `4/11/55` |
| `Event` | `string` | No | 0 | 0.0% | 41 unique values | `N/A`, `1953 Indianapolis 500`, `1953 Modena Grand Prix`, `1954 German Grand Prix`, `1955 Pau Grand Prix` |
| `Car` | `string` | No | 0 | 0.0% | 27 unique values | `ERA`, `Kurtis Kraft`, `Ferrari`, `Maserati`, `Kuzma` |
| `Session` | `string` | No | 0 | 0.0% | 'Demonstration', 'Practice', 'Pre-race test', 'Qualifying', 'Race', 'Test' | `Test`, `Practice`, `Race`, `Pre-race test`, `Qualifying` |

---

### <a id='fatal_accidents_marshalls_csv'></a> fatal_accidents_marshalls.csv

- **File Format**: CSV
- **Total Records**: 5
- **Total Columns**: 4

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `﻿Name` | `string` | ✅ Yes | 0 | 0.0% | 'Graham Beveridge', 'Günther Schneider', 'Jansen van Vuuren', 'Mark Robinson', 'Paolo Gislimberti' | `Günther Schneider`, `Jansen van Vuuren`, `Paolo Gislimberti`, `Graham Beveridge`, `Mark Robinson` |
| `Age` | `int` | No | 0 | 0.0% | Range: `19` to `52` | `19`, `33`, `52`, `38` |
| `Date Of Accident` | `string` | ✅ Yes | 0 | 0.0% | '3/4/01', '3/5/77', '6/9/13', '8/4/63', '9/10/00' | `8/4/63`, `3/5/77`, `9/10/00`, `3/4/01`, `6/9/13` |
| `Event` | `string` | ✅ Yes | 0 | 0.0% | '1963 German Grand Prix', '1977 South African Grand Prix', '2000 Italian Grand Prix', '2001 Australian Grand Prix', '2013 Canadian Grand Prix' | `1963 German Grand Prix`, `1977 South African Grand Prix`, `2000 Italian Grand Prix`, `2001 Australian Grand Prix`, `2013 Canadian Grand Prix` |

---

### <a id='lap_times_csv'></a> lap_times.csv

- **File Format**: CSV
- **Total Records**: 871,076
- **Total Columns**: 6

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `raceId` | `int` | No | 0 | 0.0% | Range: `1` to `1173` | `479`, `471`, `468`, `476`, `482` |
| `driverId` | `int` | No | 0 | 0.0% | Range: `1` to `866` | `137`, `119`, `105`, `205`, `177` |
| `lap` | `int` | No | 0 | 0.0% | Range: `1` to `87` | `1`, `2`, `3`, `4`, `5` |
| `position` | `int` | No | 0 | 0.0% | Range: `1` to `27` | `1`, `2`, `4`, `3`, `8` |
| `time` | `string` | No | 0 | 0.0% | 1000 unique values | `1:42.085`, `1:36.287`, `1:34.627`, `1:34.041`, `1:33.699` |
| `milliseconds` | `int` | No | 0 | 0.0% | Range: `55404` to `7507547` | `102085`, `96287`, `94627`, `94041`, `93699` |

---

### <a id='pit_stops_csv'></a> pit_stops.csv

- **File Format**: CSV
- **Total Records**: 22,249
- **Total Columns**: 7

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `raceId` | `int` | No | 0 | 0.0% | Range: `1` to `1173` | `258`, `259`, `261`, `262`, `263` |
| `driverId` | `int` | No | 0 | 0.0% | Range: `1` to `866` | `100`, `79`, `57`, `71`, `105` |
| `stop` | `int` | No | 0 | 0.0% | Range: `1` to `7` | `1`, `2`, `3`, `4`, `5` |
| `lap` | `int` | No | 0 | 0.0% | Range: `1` to `78` | `1`, `17`, `18`, `19`, `22` |
| `time` | `string` | No | 0 | 0.0% | 1000 unique values | `14:01:34`, `14:20:46`, `14:22:35`, `14:23:00`, `14:24:39` |
| `duration` | `float` | No | 3 | 0.01% | Range: `8.757` to `59.885` | `49.111`, `28.482`, `43.745`, `21.992`, `27.693` |
| `milliseconds` | `int` | No | 3 | 0.01% | Range: `8757` to `3069017` | `49111`, `28482`, `43745`, `21992`, `27693` |

---

### <a id='qualifying_csv'></a> qualifying.csv

- **File Format**: CSV
- **Total Records**: 11,080
- **Total Columns**: 9

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `qualifyId` | `int` | No | 0 | 0.0% | Range: `1` to `11137` | `1`, `2`, `3`, `4`, `5` |
| `raceId` | `int` | No | 0 | 0.0% | Range: `1` to `1173` | `18`, `19`, `20`, `21`, `22` |
| `driverId` | `int` | No | 0 | 0.0% | Range: `1` to `866` | `1`, `9`, `5`, `13`, `2` |
| `constructorId` | `int` | No | 0 | 0.0% | Range: `1` to `217` | `1`, `2`, `6`, `7`, `3` |
| `number` | `int` | No | 0 | 0.0% | Range: `0` to `99` | `22`, `4`, `23`, `2`, `3` |
| `position` | `int` | No | 0 | 0.0% | Range: `1` to `28` | `1`, `2`, `3`, `4`, `5` |
| `q1` | `string` | No | 164 | 1.48% | 1000 unique values | `1:26.572`, `1:26.103`, `1:25.664`, `1:25.994`, `1:25.960` |
| `q2` | `string` | No | 4,799 | 43.31% | 1000 unique values | `1:25.187`, `1:25.315`, `1:25.452`, `1:25.691`, `1:25.518` |
| `q3` | `string` | No | 7,167 | 64.68% | 1000 unique values | `1:26.714`, `1:26.869`, `1:27.079`, `1:27.178`, `1:27.236` |

---

### <a id='races_csv'></a> races.csv

- **File Format**: CSV
- **Total Records**: 1,171
- **Total Columns**: 18

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `raceId` | `int` | No | 0 | 0.0% | Range: `1` to `1190` | `1`, `2`, `3`, `4`, `5` |
| `year` | `int` | No | 0 | 0.0% | Range: `1950` to `2026` | `2009`, `2008`, `2007`, `2006`, `2005` |
| `round` | `int` | No | 0 | 0.0% | Range: `1` to `24` | `1`, `2`, `3`, `4`, `5` |
| `circuitId` | `int` | No | 0 | 0.0% | Range: `1` to `81` | `1`, `2`, `17`, `3`, `4` |
| `name` | `string` | No | 0 | 0.0% | 55 unique values | `Australian Grand Prix`, `Malaysian Grand Prix`, `Chinese Grand Prix`, `Bahrain Grand Prix`, `Spanish Grand Prix` |
| `date` | `date` | No | 0 | 0.0% | 1000 unique values | `2009-03-29`, `2009-04-05`, `2009-04-19`, `2009-04-26`, `2009-05-10` |
| `time` | `string` | No | 731 | 62.43% | 34 unique values | `06:00:00`, `09:00:00`, `07:00:00`, `12:00:00`, `05:00:00` |
| `url` | `string` | No | 0 | 0.0% | 1000 unique values | `http://en.wikipedia.org/wiki/2009_Australian_Grand_Prix`, `http://en.wikipedia.org/wiki/2009_Malaysian_Grand_Prix`, `http://en.wikipedia.org/wiki/2009_Chinese_Grand_Prix`, `http://en.wikipedia.org/wiki/2009_Bahrain_Grand_Prix`, `http://en.wikipedia.org/wiki/2009_Spanish_Grand_Prix` |
| `fp1_date` | `date` | No | 1,035 | 88.39% | 136 unique values | `2021-04-16`, `2022-03-18`, `2021-03-26`, `2021-11-19`, `2021-04-30` |
| `fp1_time` | `string` | No | 1,057 | 90.26% | 22 unique values | `12:00:00`, `14:00:00`, `03:00:00`, `11:30:00`, `18:30:00` |
| `fp2_date` | `date` | No | 1,053 | 89.92% | 118 unique values | `2021-04-16`, `2022-03-18`, `2021-03-26`, `2021-11-19`, `2021-04-30` |
| `fp2_time` | `string` | No | 1,075 | 91.8% | 18 unique values | `15:00:00`, `17:00:00`, `06:00:00`, `10:30:00`, `21:30:00` |
| `fp3_date` | `date` | No | 1,065 | 90.95% | 106 unique values | `2021-04-17`, `2022-03-19`, `2021-03-27`, `2021-11-20`, `2021-05-01` |
| `fp3_time` | `string` | No | 1,084 | 92.57% | 20 unique values | `12:00:00`, `14:00:00`, `03:00:00`, `17:00:00`, `11:00:00` |
| `quali_date` | `date` | No | 1,035 | 88.39% | 136 unique values | `2021-04-17`, `2022-03-19`, `2021-03-27`, `2021-11-20`, `2021-05-01` |
| `quali_time` | `string` | No | 1,057 | 90.26% | 16 unique values | `15:00:00`, `17:00:00`, `06:00:00`, `20:00:00`, `14:00:00` |
| `sprint_date` | `date` | No | 1,141 | 97.44% | 30 unique values | `2021-07-17`, `2021-09-11`, `2021-11-13`, `2022-04-23`, `2022-07-09` |
| `sprint_time` | `string` | No | 1,144 | 97.69% | '03:00:00', '09:00:00', '10:00:00', '11:00:00', '13:30:00', '14:00:00', '14:30:00', '16:00:00', '17:00:00', '17:30:00', '18:00:00', '18:30:00', '19:30:00', '22:00:00' | `14:30:00`, `19:30:00`, `13:30:00`, `17:30:00`, `22:00:00` |

---

### <a id='red_flags_csv'></a> red_flags.csv

- **File Format**: CSV
- **Total Records**: 98
- **Total Columns**: 5

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `Race` | `string` | No | 0 | 0.0% | 89 unique values | `1950 Indianapolis 500`, `1971 Canadian Grand Prix`, `1973 British Grand Prix`, `1974 Brazilian Grand Prix`, `1975 Spanish Grand Prix` |
| `Lap` | `int` | No | 0 | 0.0% | Range: `1` to `138` | `138`, `64`, `2`, `32`, `29` |
| `Resumed` | `string` | No | 0 | 0.0% | 'N', 'R', 'S', 'Y' | `N`, `Y`, `R`, `S` |
| `Incident` | `string` | No | 0 | 0.0% | 85 unique values | `Rain.`, `Mist.`, `Crash involving Jody Scheckter, Jean-Pierre Beltoise, George Follmer, Mike Hailwood, Carlos Pace, Jochen Mass, Jackie Oliver, Roger Williamson and Andrea de Adamich.`, `Crash of Rolf Stommelen which killed five spectators. Half points were awarded.`, `Rain and crashes involving Wilson Fittipaldi, Jochen Mass, John Watson, Carlos Pace, Jody Scheckter, James Hunt and Mark Donohue.` |
| `Excluded` | `string` | No | 37 | 37.76% | 58 unique values | `Jody Scheckter, Jean-Pierre Beltoise, George Follmer, Mike Hailwood, Carlos Pace, Jochen Mass, Jackie Oliver, Roger Williamson and Andrea de Adamich (crash) Graham McRae (throttle) and David Purley (spun off).`, `None, although Clay Regazzoni and Jacques Laffite illegally used their spare cars at the restart, and were subsequently disqualified.`, `Niki Lauda (crashed, injured), Brett Lunger and Harald Ertl (crashed), Chris Amon (withdrawn), Hans-Joachim Stuck (clutch) and Jacques Laffite (gearbox)`, `Mario Andretti, Jody Scheckter, Nelson Piquet, Héctor Rebaque, Harald Ertl, Riccardo Patrese, Alan Jones and James Hunt.`, `Ronnie Peterson (fatal crash), Vittorio Brambilla (injured), Hans-Joachim Stuck, Didier Pironi and Brett Lunger.` |

---

### <a id='results_csv'></a> results.csv

- **File Format**: CSV
- **Total Records**: 27,348
- **Total Columns**: 18

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `resultId` | `int` | No | 0 | 0.0% | Range: `1` to `27353` | `1`, `2`, `3`, `4`, `5` |
| `raceId` | `int` | No | 0 | 0.0% | Range: `1` to `1173` | `18`, `19`, `20`, `21`, `22` |
| `driverId` | `int` | No | 0 | 0.0% | Range: `1` to `866` | `1`, `2`, `3`, `4`, `5` |
| `constructorId` | `int` | No | 0 | 0.0% | Range: `1` to `217` | `1`, `2`, `3`, `4`, `5` |
| `number` | `int` | No | 6 | 0.02% | Range: `0` to `208` | `22`, `3`, `7`, `5`, `23` |
| `grid` | `int` | No | 20 | 0.07% | Range: `0` to `34` | `1`, `5`, `7`, `11`, `3` |
| `position` | `int` | No | 10,953 | 40.05% | Range: `1` to `33` | `1`, `2`, `3`, `4`, `5` |
| `positionText` | `int` | No | 0 | 0.0% | Range: `1` to `33` | `1`, `2`, `3`, `4`, `5` |
| `positionOrder` | `int` | No | 0 | 0.0% | Range: `1` to `39` | `1`, `2`, `3`, `4`, `5` |
| `points` | `int` | No | 0 | 0.0% | Range: `0` to `50` | `10`, `8`, `6`, `5`, `4` |
| `laps` | `int` | No | 0 | 0.0% | Range: `0` to `200` | `58`, `57`, `55`, `53`, `47` |
| `time` | `float` | No | 19,282 | 70.51% | Range: `0.01` to `163.925` | `1:34:50.616`, `+5.478`, `+8.163`, `+17.181`, `+18.014` |
| `milliseconds` | `int` | No | 19,282 | 70.51% | Range: `207071` to `15090540` | `5690616`, `5696094`, `5698779`, `5707797`, `5708630` |
| `fastestLap` | `int` | No | 18,536 | 67.78% | Range: `1` to `85` | `39`, `41`, `58`, `43`, `50` |
| `rank` | `int` | No | 18,278 | 66.83% | Range: `0` to `24` | `2`, `3`, `5`, `7`, `1` |
| `fastestLapTime` | `string` | No | 18,536 | 67.78% | 1000 unique values | `1:27.452`, `1:27.739`, `1:28.090`, `1:28.603`, `1:27.418` |
| `fastestLapSpeed` | `float` | No | 19,096 | 69.83% | Range: `89.54` to `257.32` | `218.3`, `217.586`, `216.719`, `215.464`, `218.385` |
| `statusId` | `int` | No | 0 | 0.0% | Range: `1` to `142` | `1`, `11`, `5`, `4`, `3` |

---

### <a id='safety_cars_csv'></a> safety_cars.csv

- **File Format**: CSV
- **Total Records**: 368
- **Total Columns**: 5

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `Race` | `string` | No | 0 | 0.0% | 259 unique values | `1973 Canadian Grand Prix`, `1993 Brazilian Grand Prix`, `1993 British Grand Prix`, `1994 Japanese Grand Prix`, `1994 San Marino Grand Prix` |
| `Cause` | `string` | No | 0 | 0.0% | 17 unique values | `Accident`, `Accident/Rain`, `Stranded car`, `Rain`, `Debris` |
| `Deployed` | `int` | No | 0 | 0.0% | Range: `0` to `75` | `33`, `29`, `38`, `4`, `1` |
| `Retreated` | `float` | No | 14 | 3.8% | Range: `2.0` to `73.0` | `39.0`, `38.0`, `40.0`, `11`, `6.0` |
| `FullLaps` | `int` | No | 0 | 0.0% | Range: `1` to `19` | `5`, `8`, `1`, `4`, `3` |

---

### <a id='seasons_csv'></a> seasons.csv

- **File Format**: CSV
- **Total Records**: 77
- **Total Columns**: 2

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `year` | `int` | ✅ Yes | 0 | 0.0% | Range: `1950` to `2026` | `2009`, `2008`, `2007`, `2006`, `2005` |
| `url` | `string` | ✅ Yes | 0 | 0.0% | 77 unique values | `http://en.wikipedia.org/wiki/2009_Formula_One_season`, `http://en.wikipedia.org/wiki/2008_Formula_One_season`, `http://en.wikipedia.org/wiki/2007_Formula_One_season`, `http://en.wikipedia.org/wiki/2006_Formula_One_season`, `http://en.wikipedia.org/wiki/2005_Formula_One_season` |

---

### <a id='sprint_results_csv'></a> sprint_results.csv

- **File Format**: CSV
- **Total Records**: 546
- **Total Columns**: 17

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `resultId` | `int` | ✅ Yes | 0 | 0.0% | Range: `1` to `546` | `1`, `2`, `3`, `4`, `5` |
| `raceId` | `int` | No | 0 | 0.0% | Range: `1061` to `1173` | `1061`, `1065`, `1071`, `1077`, `1084` |
| `driverId` | `int` | No | 0 | 0.0% | Range: `1` to `866` | `830`, `1`, `822`, `844`, `846` |
| `constructorId` | `int` | No | 0 | 0.0% | Range: `1` to `217` | `9`, `131`, `6`, `1`, `214` |
| `number` | `int` | No | 0 | 0.0% | Range: `1` to `99` | `33`, `44`, `77`, `16`, `4` |
| `grid` | `int` | No | 0 | 0.0% | Range: `0` to `22` | `2`, `1`, `3`, `4`, `6` |
| `position` | `int` | No | 15 | 2.75% | Range: `1` to `22` | `1`, `2`, `3`, `4`, `5` |
| `positionText` | `int` | No | 0 | 0.0% | Range: `1` to `21` | `1`, `2`, `3`, `4`, `5` |
| `positionOrder` | `int` | No | 0 | 0.0% | Range: `1` to `22` | `1`, `2`, `3`, `4`, `5` |
| `points` | `int` | No | 0 | 0.0% | Range: `0` to `8` | `3`, `2`, `1`, `0`, `8` |
| `laps` | `int` | No | 0 | 0.0% | Range: `0` to `24` | `17`, `16`, `18`, `0`, `24` |
| `time` | `float` | No | 38 | 6.96% | Range: `0.136` to `59.409` | `25:38.426`, `+1.430`, `+7.502`, `+11.278`, `+24.111` |
| `milliseconds` | `int` | No | 38 | 6.96% | Range: `1498433` to `3261384` | `1538426`, `1539856`, `1545928`, `1549704`, `1562537` |
| `fastestLap` | `int` | No | 16 | 2.93% | Range: `2` to `24` | `14`, `17`, `16`, `10`, `12` |
| `fastestLapTime` | `string` | No | 16 | 2.93% | 525 unique values | `1:30.013`, `1:29.937`, `1:29.958`, `1:30.163`, `1:30.566` |
| `statusId` | `int` | No | 2 | 0.37% | Range: `1` to `130` | `1`, `76`, `3`, `31`, `130` |
| `rank` | `int` | No | 367 | 67.22% | Range: `1` to `22` | `1`, `4`, `2`, `5`, `6` |

---

### <a id='status_csv'></a> status.csv

- **File Format**: CSV
- **Total Records**: 140
- **Total Columns**: 2

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `statusId` | `int` | ✅ Yes | 0 | 0.0% | Range: `1` to `142` | `1`, `2`, `3`, `4`, `5` |
| `status` | `string` | ✅ Yes | 0 | 0.0% | 140 unique values | `Finished`, `Disqualified`, `Accident`, `Collision`, `Engine` |

---

### <a id='virtual_safety_car_estimates_json'></a> virtual_safety_car_estimates.json

- **File Format**: JSON
- **Total Records**: 78
- **Structure**: Key-value dictionary
- **Root Object Keys**: `2015 Belgian Grand Prix`, `2015 British Grand Prix`, `2015 Hungarian Grand Prix`, `2015 Monaco Grand Prix`, `2015 Singapore Grand Prix`, `2016 British Grand Prix`, `2016 Malaysian Grand Prix`, `2016 Monaco Grand Prix`, `2016 United States Grand Prix`, `2017 Canadian Grand Prix`, `2017 Japanese Grand Prix`, `2017 Mexican Grand Prix`, `2017 Spanish Grand Prix`, `2018 Australian Grand Prix`, `2018 Austrian Grand Prix`...

#### Sample Preview
```json
{
  "2015 Belgian Grand Prix": [
    20,
    21
  ],
  "2015 British Grand Prix": [
    32,
    33,
    34
  ],
  "2015 Hungarian Grand Prix": [
    41,
    42
  ]
}
```

---
