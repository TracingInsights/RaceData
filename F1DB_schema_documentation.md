# Formula 1 Database (F1DB) - Schema and Data Dictionary

This document provides a comprehensive, detailed reference of the data structures, column schemas, and metadata for every CSV dataset inside the `/f1db-csv` directory. This acts as a data dictionary to facilitate analysis, database schema creation, and integration.

## Table of Contents

1. [Database Overview](#database-overview)
2. [Dataset Summary Table](#dataset-summary-table)
3. [Detailed File Schemas](#detailed-file-schemas)
   - [f1db-chassis.csv](#f1db-chassis)
   - [f1db-circuits-layouts.csv](#f1db-circuits-layouts)
   - [f1db-circuits.csv](#f1db-circuits)
   - [f1db-constructors-chronology.csv](#f1db-constructors-chronology)
   - [f1db-constructors.csv](#f1db-constructors)
   - [f1db-continents.csv](#f1db-continents)
   - [f1db-countries.csv](#f1db-countries)
   - [f1db-drivers-family-relationships.csv](#f1db-drivers-family-relationships)
   - [f1db-drivers.csv](#f1db-drivers)
   - [f1db-engine-manufacturers.csv](#f1db-engine-manufacturers)
   - [f1db-engines.csv](#f1db-engines)
   - [f1db-entrants.csv](#f1db-entrants)
   - [f1db-grands-prix.csv](#f1db-grands-prix)
   - [f1db-races-constructor-standings.csv](#f1db-races-constructor-standings)
   - [f1db-races-driver-of-the-day-results.csv](#f1db-races-driver-of-the-day-results)
   - [f1db-races-driver-standings.csv](#f1db-races-driver-standings)
   - [f1db-races-fastest-laps.csv](#f1db-races-fastest-laps)
   - [f1db-races-free-practice-1-results.csv](#f1db-races-free-practice-1-results)
   - [f1db-races-free-practice-2-results.csv](#f1db-races-free-practice-2-results)
   - [f1db-races-free-practice-3-results.csv](#f1db-races-free-practice-3-results)
   - [f1db-races-free-practice-4-results.csv](#f1db-races-free-practice-4-results)
   - [f1db-races-pit-stops.csv](#f1db-races-pit-stops)
   - [f1db-races-pre-qualifying-results.csv](#f1db-races-pre-qualifying-results)
   - [f1db-races-qualifying-1-results.csv](#f1db-races-qualifying-1-results)
   - [f1db-races-qualifying-2-results.csv](#f1db-races-qualifying-2-results)
   - [f1db-races-qualifying-results.csv](#f1db-races-qualifying-results)
   - [f1db-races-race-results.csv](#f1db-races-race-results)
   - [f1db-races-sprint-qualifying-results.csv](#f1db-races-sprint-qualifying-results)
   - [f1db-races-sprint-race-results.csv](#f1db-races-sprint-race-results)
   - [f1db-races-sprint-starting-grid-positions.csv](#f1db-races-sprint-starting-grid-positions)
   - [f1db-races-starting-grid-positions.csv](#f1db-races-starting-grid-positions)
   - [f1db-races-warming-up-results.csv](#f1db-races-warming-up-results)
   - [f1db-races.csv](#f1db-races)
   - [f1db-seasons-constructor-standings.csv](#f1db-seasons-constructor-standings)
   - [f1db-seasons-constructors.csv](#f1db-seasons-constructors)
   - [f1db-seasons-driver-standings.csv](#f1db-seasons-driver-standings)
   - [f1db-seasons-drivers.csv](#f1db-seasons-drivers)
   - [f1db-seasons-engine-manufacturers.csv](#f1db-seasons-engine-manufacturers)
   - [f1db-seasons-entrants-chassis.csv](#f1db-seasons-entrants-chassis)
   - [f1db-seasons-entrants-constructors.csv](#f1db-seasons-entrants-constructors)
   - [f1db-seasons-entrants-drivers.csv](#f1db-seasons-entrants-drivers)
   - [f1db-seasons-entrants-engines.csv](#f1db-seasons-entrants-engines)
   - [f1db-seasons-entrants-tyre-manufacturers.csv](#f1db-seasons-entrants-tyre-manufacturers)
   - [f1db-seasons-entrants.csv](#f1db-seasons-entrants)
   - [f1db-seasons-tyre-manufacturers.csv](#f1db-seasons-tyre-manufacturers)
   - [f1db-seasons.csv](#f1db-seasons)
   - [f1db-tyre-manufacturers.csv](#f1db-tyre-manufacturers)

---

## Database Overview

- **Total CSV Files**: 47
- **Total Rows Across All Files**: 244,763
- **Primary Domain**: Formula 1 racing historical records (seasons, races, circuits, constructors, engine manufacturers, tyre manufacturers, drivers, entrants, and results).

## Dataset Summary Table

| Filename | Total Rows | Columns Count | Size (Bytes) | Primary Key Candidate(s) |
| :--- | :---: | :---: | :---: | :--- |
| [f1db-chassis.csv](#f1db-chassis) | 1,153 | 4 | 54,155 | _None_ |
| [f1db-circuits-layouts.csv](#f1db-circuits-layouts) | 160 | 5 | 6,403 | `id` |
| [f1db-circuits.csv](#f1db-circuits) | 78 | 13 | 10,485 | `id`, `name`, `fullName`, `latitude`, `longitude` |
| [f1db-constructors-chronology.csv](#f1db-constructors-chronology) | 217 | 5 | 7,420 | _None_ |
| [f1db-constructors.csv](#f1db-constructors) | 187 | 22 | 17,842 | `id` |
| [f1db-continents.csv](#f1db-continents) | 7 | 4 | 318 | `id`, `code`, `name`, `demonym` |
| [f1db-countries.csv](#f1db-countries) | 249 | 7 | 16,224 | `id`, `alpha2Code`, `alpha3Code`, `name` |
| [f1db-drivers-family-relationships.csv](#f1db-drivers-family-relationships) | 86 | 4 | 4,360 | _None_ |
| [f1db-drivers.csv](#f1db-drivers) | 915 | 32 | 171,797 | `id`, `name`, `fullName` |
| [f1db-engine-manufacturers.csv](#f1db-engine-manufacturers) | 78 | 20 | 6,103 | `id`, `name` |
| [f1db-engines.csv](#f1db-engines) | 424 | 7 | 40,062 | `id`, `fullName` |
| [f1db-entrants.csv](#f1db-entrants) | 830 | 2 | 34,763 | `id`, `name` |
| [f1db-grands-prix.csv](#f1db-grands-prix) | 54 | 7 | 4,460 | `id`, `name`, `fullName`, `shortName` |
| [f1db-races-constructor-standings.csv](#f1db-races-constructor-standings) | 10,544 | 11 | 529,167 | _None_ |
| [f1db-races-driver-of-the-day-results.csv](#f1db-races-driver-of-the-day-results) | 842 | 12 | 65,502 | _None_ |
| [f1db-races-driver-standings.csv](#f1db-races-driver-standings) | 21,317 | 10 | 1,040,734 | _None_ |
| [f1db-races-fastest-laps.csv](#f1db-races-fastest-laps) | 16,956 | 18 | 2,023,350 | _None_ |
| [f1db-races-free-practice-1-results.csv](#f1db-races-free-practice-1-results) | 15,945 | 18 | 1,896,345 | _None_ |
| [f1db-races-free-practice-2-results.csv](#f1db-races-free-practice-2-results) | 15,400 | 18 | 1,839,895 | _None_ |
| [f1db-races-free-practice-3-results.csv](#f1db-races-free-practice-3-results) | 8,713 | 18 | 1,041,640 | _None_ |
| [f1db-races-free-practice-4-results.csv](#f1db-races-free-practice-4-results) | 706 | 18 | 84,524 | _None_ |
| [f1db-races-pit-stops.csv](#f1db-races-pit-stops) | 22,218 | 15 | 2,124,796 | _None_ |
| [f1db-races-pre-qualifying-results.csv](#f1db-races-pre-qualifying-results) | 647 | 24 | 76,429 | _None_ |
| [f1db-races-qualifying-1-results.csv](#f1db-races-qualifying-1-results) | 7,707 | 24 | 946,840 | _None_ |
| [f1db-races-qualifying-2-results.csv](#f1db-races-qualifying-2-results) | 7,541 | 24 | 923,866 | _None_ |
| [f1db-races-qualifying-results.csv](#f1db-races-qualifying-results) | 26,822 | 24 | 3,364,745 | _None_ |
| [f1db-races-race-results.csv](#f1db-races-race-results) | 27,401 | 34 | 4,087,162 | _None_ |
| [f1db-races-sprint-qualifying-results.csv](#f1db-races-sprint-qualifying-results) | 422 | 24 | 56,333 | _None_ |
| [f1db-races-sprint-race-results.csv](#f1db-races-sprint-race-results) | 546 | 34 | 97,221 | _None_ |
| [f1db-races-sprint-starting-grid-positions.csv](#f1db-races-sprint-starting-grid-positions) | 545 | 17 | 55,159 | _None_ |
| [f1db-races-starting-grid-positions.csv](#f1db-races-starting-grid-positions) | 25,638 | 17 | 2,547,590 | _None_ |
| [f1db-races-warming-up-results.csv](#f1db-races-warming-up-results) | 7,683 | 18 | 907,803 | _None_ |
| [f1db-races.csv](#f1db-races) | 1,171 | 43 | 230,250 | _None_ |
| [f1db-seasons-constructor-standings.csv](#f1db-seasons-constructor-standings) | 721 | 8 | 29,894 | _None_ |
| [f1db-seasons-constructors.csv](#f1db-seasons-constructors) | 1,079 | 19 | 58,381 | _None_ |
| [f1db-seasons-driver-standings.csv](#f1db-seasons-driver-standings) | 1,680 | 7 | 67,531 | _None_ |
| [f1db-seasons-drivers.csv](#f1db-seasons-drivers) | 3,407 | 19 | 198,403 | _None_ |
| [f1db-seasons-engine-manufacturers.csv](#f1db-seasons-engine-manufacturers) | 560 | 18 | 29,516 | _None_ |
| [f1db-seasons-entrants-chassis.csv](#f1db-seasons-entrants-chassis) | 2,292 | 5 | 140,011 | _None_ |
| [f1db-seasons-entrants-constructors.csv](#f1db-seasons-entrants-constructors) | 1,925 | 4 | 88,263 | _None_ |
| [f1db-seasons-entrants-drivers.csv](#f1db-seasons-entrants-drivers) | 3,870 | 8 | 363,284 | _None_ |
| [f1db-seasons-entrants-engines.csv](#f1db-seasons-entrants-engines) | 2,027 | 5 | 137,880 | _None_ |
| [f1db-seasons-entrants-tyre-manufacturers.csv](#f1db-seasons-entrants-tyre-manufacturers) | 1,955 | 5 | 110,645 | _None_ |
| [f1db-seasons-entrants.csv](#f1db-seasons-entrants) | 1,799 | 3 | 75,577 | _None_ |
| [f1db-seasons-tyre-manufacturers.csv](#f1db-seasons-tyre-manufacturers) | 160 | 15 | 7,874 | _None_ |
| [f1db-seasons.csv](#f1db-seasons) | 77 | 1 | 392 | `year` |
| [f1db-tyre-manufacturers.csv](#f1db-tyre-manufacturers) | 9 | 16 | 970 | `id`, `name`, `totalRaceEntries`, `totalRaceStarts`, `totalRaceWins`, `totalRaceLaps`, `totalPodiums`, `totalPodiumRaces`, `totalPolePositions`, `totalFastestLaps` |

---

## Detailed File Schemas

### <a id='f1db-chassis'></a> f1db-chassis.csv

- **Description**: Core entity reference table for F1: `chassis` details.
- **Total Records (Rows)**: 1,153
- **Total Columns**: 4

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `id` | `string` | No | 0 | 0.0% | 1000 unique values | `adams`, `afm-6`, `afm-8`, `ags-jh21c`, `ags-jh22` |
| `constructorId` | `string` | No | 0 | 0.0% | 187 unique values | `adams`, `afm`, `ags`, `alfa-romeo`, `alfa-special` |
| `name` | `string` | No | 0 | 0.0% | 1000 unique values | `Adams`, `6`, `8`, `JH21C`, `JH22` |
| `fullName` | `string` | No | 0 | 0.0% | 1000 unique values | `Adams`, `AFM 6`, `AFM 8`, `AGS JH21C`, `AGS JH22` |

---

### <a id='f1db-circuits-layouts'></a> f1db-circuits-layouts.csv

- **Description**: Core entity reference table for F1: `circuits layouts` details.
- **Total Records (Rows)**: 160
- **Total Columns**: 5

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `id` | `string` | ✅ Yes | 0 | 0.0% | 160 unique values | `adelaide-1`, `aida-1`, `ain-diab-1`, `aintree-1`, `anderstorp-1` |
| `circuitId` | `string` | No | 0 | 0.0% | 78 unique values | `adelaide`, `aida`, `ain-diab`, `aintree`, `anderstorp` |
| `effective` | `string` | No | 0 | 0.0% | 'false', 'true' | `true`, `false` |
| `length` | `float` | No | 0 | 0.0% | Range: `3.145` to `25.579` | `3.780`, `3.703`, `7.618`, `4.828`, `4.031` |
| `turns` | `int` | No | 0 | 0.0% | Range: `4` to `160` | `16`, `13`, `18`, `8`, `20` |

---

### <a id='f1db-circuits'></a> f1db-circuits.csv

- **Description**: Core entity reference table for F1: `circuits` details.
- **Total Records (Rows)**: 78
- **Total Columns**: 13

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `id` | `string` | ✅ Yes | 0 | 0.0% | 78 unique values | `adelaide`, `aida`, `ain-diab`, `aintree`, `anderstorp` |
| `name` | `string` | ✅ Yes | 0 | 0.0% | 78 unique values | `Adelaide`, `Aida`, `Ain-Diab`, `Aintree`, `Anderstorp Raceway` |
| `fullName` | `string` | ✅ Yes | 0 | 0.0% | 78 unique values | `Adelaide Street Circuit`, `Okayama International Circuit`, `Ain-Diab Circuit`, `Aintree Motor Racing Circuit`, `Anderstorp Raceway` |
| `previousNames` | `string` | No | 62 | 79.49% | 16 unique values | `TI Circuit Aida`, `Scandinavian Raceway`, `Autódromo 17 de Octubre;Autódromo Municipal Ciudad de Buenos Aires;Autódromo Municipal del Parque Almirante Brown de la Ciudad de Buenos Aires;Autódromo Oscar Alfredo Gálvez`, `Circuit de Catalunya`, `Autodromo Dino Ferrari` |
| `type` | `string` | No | 0 | 0.0% | 'RACE', 'ROAD', 'STREET' | `STREET`, `RACE`, `ROAD` |
| `direction` | `string` | No | 0 | 0.0% | 'ANTI_CLOCKWISE', 'CLOCKWISE' | `CLOCKWISE`, `ANTI_CLOCKWISE` |
| `placeName` | `string` | No | 0 | 0.0% | 75 unique values | `Adelaide`, `Aida`, `Casablanca`, `Aintree`, `Anderstorp` |
| `countryId` | `string` | No | 0 | 0.0% | 34 unique values | `australia`, `japan`, `morocco`, `united-kingdom`, `sweden` |
| `latitude` | `float` | ✅ Yes | 0 | 0.0% | Range: `-37.849722` to `57.264167` | `-34.927222`, `34.915`, `33.578611`, `53.476944`, `57.264167` |
| `longitude` | `float` | ✅ Yes | 0 | 0.0% | Range: `-118.192778` to `144.968333` | `138.617222`, `134.221111`, `-7.6875`, `-2.940556`, `13.601389` |
| `length` | `float` | No | 0 | 0.0% | Range: `3.186` to `25.579` | `3.780`, `3.703`, `7.618`, `4.828`, `4.031` |
| `turns` | `int` | No | 0 | 0.0% | Range: `4` to `48` | `16`, `13`, `18`, `8`, `20` |
| `totalRacesHeld` | `int` | No | 0 | 0.0% | Range: `0` to `75` | `11`, `2`, `1`, `5`, `6` |

---

### <a id='f1db-constructors-chronology'></a> f1db-constructors-chronology.csv

- **Description**: Core entity reference table for F1: `constructors chronology` details.
- **Total Records (Rows)**: 217
- **Total Columns**: 5

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `parentConstructorId` | `string` | No | 0 | 0.0% | 49 unique values | `alfa-romeo`, `alphatauri`, `alpine`, `andrea-moda`, `arrows` |
| `positionDisplayOrder` | `int` | No | 0 | 0.0% | Range: `1` to `6` | `1`, `2`, `3`, `4`, `5` |
| `constructorId` | `string` | No | 0 | 0.0% | 49 unique values | `sauber`, `bmw-sauber`, `alfa-romeo`, `kick-sauber`, `audi` |
| `yearFrom` | `int` | No | 0 | 0.0% | Range: `1970` to `2026` | `1993`, `2006`, `2011`, `2019`, `2024` |
| `yearTo` | `int` | No | 29 | 13.36% | Range: `1972` to `2025` | `2005`, `2010`, `2018`, `2023`, `2025` |

---

### <a id='f1db-constructors'></a> f1db-constructors.csv

- **Description**: Core entity reference table for F1: `constructors` details.
- **Total Records (Rows)**: 187
- **Total Columns**: 22

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `id` | `string` | ✅ Yes | 0 | 0.0% | 187 unique values | `adams`, `afm`, `ags`, `alfa-romeo`, `alfa-special` |
| `name` | `string` | No | 0 | 0.0% | 185 unique values | `Adams`, `AFM`, `AGS`, `Alfa Romeo`, `Alfa Special` |
| `fullName` | `string` | No | 0 | 0.0% | 186 unique values | `Adams`, `Alex von Falkenhausen Motorenbau`, `Automobiles Gonfaronnaises Sportives`, `Alfa Romeo Racing`, `Alfa Special` |
| `countryId` | `string` | No | 0 | 0.0% | 22 unique values | `united-states-of-america`, `germany`, `france`, `italy`, `south-africa` |
| `bestChampionshipPosition` | `int` | No | 108 | 57.75% | Range: `1` to `12` | `11`, `6`, `4`, `5`, `2` |
| `bestStartingGridPosition` | `int` | No | 11 | 5.88% | Range: `1` to `33` | `17`, `9`, `10`, `1`, `16` |
| `bestRaceResult` | `int` | No | 31 | 16.58% | Range: `1` to `32` | `27`, `9`, `6`, `1`, `10` |
| `bestSprintRaceResult` | `int` | No | 172 | 91.98% | Range: `1` to `14` | `7`, `6`, `3`, `4`, `12` |
| `totalChampionshipWins` | `int` | No | 0 | 0.0% | Range: `0` to `16` | `0`, `1`, `2`, `16`, `7` |
| `totalRaceEntries` | `int` | No | 0 | 0.0% | Range: `0` to `1129` | `1`, `4`, `80`, `214`, `2` |
| `totalRaceStarts` | `int` | No | 0 | 0.0% | Range: `0` to `1127` | `1`, `4`, `48`, `214`, `2` |
| `totalRaceWins` | `int` | No | 0 | 0.0% | Range: `0` to `248` | `0`, `10`, `1`, `27`, `35` |
| `total1And2Finishes` | `int` | No | 0 | 0.0% | Range: `0` to `87` | `0`, `4`, `2`, `1`, `8` |
| `totalRaceLaps` | `int` | No | 0 | 0.0% | Range: `0` to `127288` | `108`, `98`, `2031`, `20608`, `132` |
| `totalPodiums` | `int` | No | 0 | 0.0% | Range: `0` to `840` | `0`, `26`, `2`, `6`, `8` |
| `totalPodiumRaces` | `int` | No | 0 | 0.0% | Range: `0` to `643` | `0`, `18`, `2`, `5`, `8` |
| `totalPoints` | `int` | No | 0 | 0.0% | Range: `0` to `11178.0` | `0`, `2`, `199`, `309`, `570` |
| `totalChampionshipPoints` | `int` | No | 0 | 0.0% | Range: `0` to `10822.0` | `0`, `2`, `199`, `309`, `570` |
| `totalPolePositions` | `int` | No | 0 | 0.0% | Range: `0` to `254` | `0`, `12`, `1`, `2`, `15` |
| `totalFastestLaps` | `int` | No | 0 | 0.0% | Range: `0` to `267` | `0`, `16`, `2`, `1`, `3` |
| `totalSprintRaceStarts` | `int` | No | 0 | 0.0% | Range: `0` to `27` | `0`, `12`, `27`, `3`, `9` |
| `totalSprintRaceWins` | `int` | No | 0 | 0.0% | Range: `0` to `14` | `0`, `1`, `7`, `5`, `14` |

---

### <a id='f1db-continents'></a> f1db-continents.csv

- **Description**: Core entity reference table for F1: `continents` details.
- **Total Records (Rows)**: 7
- **Total Columns**: 4

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `id` | `string` | ✅ Yes | 0 | 0.0% | 'africa', 'antarctica', 'asia', 'australia', 'europe', 'north-america', 'south-america' | `africa`, `antarctica`, `asia`, `australia`, `europe` |
| `code` | `string` | ✅ Yes | 0 | 0.0% | 'AF', 'AN', 'AS', 'EU', 'NA', 'OC', 'SA' | `AF`, `AN`, `AS`, `OC`, `EU` |
| `name` | `string` | ✅ Yes | 0 | 0.0% | 'Africa', 'Antarctica', 'Asia', 'Australia', 'Europe', 'North America', 'South America' | `Africa`, `Antarctica`, `Asia`, `Australia`, `Europe` |
| `demonym` | `string` | ✅ Yes | 0 | 0.0% | 'African', 'Antarctican', 'Asian', 'Australian', 'European', 'North American', 'South American' | `African`, `Antarctican`, `Asian`, `Australian`, `European` |

---

### <a id='f1db-countries'></a> f1db-countries.csv

- **Description**: Core entity reference table for F1: `countries` details.
- **Total Records (Rows)**: 249
- **Total Columns**: 7

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `id` | `string` | ✅ Yes | 0 | 0.0% | 249 unique values | `afghanistan`, `aland-islands`, `albania`, `algeria`, `american-samoa` |
| `alpha2Code` | `string` | ✅ Yes | 0 | 0.0% | 249 unique values | `AF`, `AX`, `AL`, `DZ`, `AS` |
| `alpha3Code` | `string` | ✅ Yes | 0 | 0.0% | 249 unique values | `AFG`, `ALA`, `ALB`, `DZA`, `ASM` |
| `iocCode` | `string` | No | 42 | 16.87% | 206 unique values | `AFG`, `ALB`, `ALG`, `ASA`, `AND` |
| `name` | `string` | ✅ Yes | 0 | 0.0% | 249 unique values | `Afghanistan`, `Åland Islands`, `Albania`, `Algeria`, `American Samoa` |
| `demonym` | `string` | No | 9 | 3.61% | 233 unique values | `Afghan`, `Ålandic`, `Albanian`, `Algerian`, `Samoan` |
| `continentId` | `string` | No | 0 | 0.0% | 'africa', 'antarctica', 'asia', 'australia', 'europe', 'north-america', 'south-america' | `asia`, `europe`, `africa`, `australia`, `north-america` |

---

### <a id='f1db-drivers-family-relationships'></a> f1db-drivers-family-relationships.csv

- **Description**: Core entity reference table for F1: `drivers family relationships` details.
- **Total Records (Rows)**: 86
- **Total Columns**: 4

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `parentDriverId` | `string` | No | 0 | 0.0% | 64 unique values | `andre-pilette`, `ayrton-senna`, `bruno-senna`, `chanoch-nissany`, `christian-fittipaldi` |
| `positionDisplayOrder` | `int` | No | 0 | 0.0% | Range: `1` to `4` | `1`, `2`, `3`, `4` |
| `driverId` | `string` | No | 0 | 0.0% | 63 unique values | `teddy-pilette`, `bruno-senna`, `ayrton-senna`, `roy-nissany`, `wilson-fittipaldi` |
| `type` | `string` | No | 0 | 0.0% | 'CHILD', 'CHILD_IN_LAW', 'GRANDCHILD', 'GRANDPARENT', 'GRANDPARENTS_SIBLING', 'HALF_SIBLING', 'PARENT', 'PARENTS_SIBLING', 'PARENTS_SIBLINGS_CHILD', 'PARENT_IN_LAW', 'SIBLING', 'SIBLINGS_CHILD', 'SIBLINGS_CHILD_IN_LAW', 'SIBLINGS_GRANDCHILD', 'SIBLING_IN_LAW' | `CHILD`, `SIBLINGS_CHILD`, `PARENTS_SIBLING`, `PARENT`, `PARENTS_SIBLINGS_CHILD` |

---

### <a id='f1db-drivers'></a> f1db-drivers.csv

- **Description**: Core entity reference table for F1: `drivers` details.
- **Total Records (Rows)**: 915
- **Total Columns**: 32

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `id` | `string` | ✅ Yes | 0 | 0.0% | 915 unique values | `adderly-fong`, `adolf-brudes`, `adolfo-schwelm-cruz`, `adrian-campos`, `adrian-sutil` |
| `name` | `string` | ✅ Yes | 0 | 0.0% | 915 unique values | `Adderly Fong`, `Adolf Brudes`, `Adolfo Schwelm Cruz`, `Adrián Campos`, `Adrian Sutil` |
| `firstName` | `string` | No | 0 | 0.0% | 524 unique values | `Adderly`, `Adolf`, `Adolfo`, `Adrián`, `Adrian` |
| `lastName` | `string` | No | 0 | 0.0% | 852 unique values | `Fong`, `Brudes`, `Schwelm Cruz`, `Campos`, `Sutil` |
| `fullName` | `string` | ✅ Yes | 0 | 0.0% | 915 unique values | `Adderly Fong Cheun-yue`, `Adolf Brudes von Breslau`, `Adolfo Julio Carlos Schwelm Cruz`, `Adrián Campos Suñer`, `Adrian Sutil` |
| `abbreviation` | `string` | No | 1 | 0.11% | 549 unique values | `FON`, `BRU`, `SCH`, `CAM`, `SUT` |
| `permanentNumber` | `int` | No | 887 | 96.94% | Range: `2` to `87` | `23`, `41`, `55`, `16`, `31` |
| `gender` | `string` | No | 0 | 0.0% | 'FEMALE', 'MALE' | `MALE`, `FEMALE` |
| `dateOfBirth` | `date` | No | 0 | 0.0% | 899 unique values | `1990-03-02`, `1899-10-15`, `1923-06-28`, `1960-06-17`, `1983-01-11` |
| `dateOfDeath` | `date` | No | 409 | 44.7% | 494 unique values | `1986-11-05`, `2012-02-10`, `2021-01-27`, `1960-06-18`, `1961-11-19` |
| `placeOfBirth` | `string` | No | 0 | 0.0% | 646 unique values | `Vancouver`, `Groß Kottulin`, `Buenos Aires`, `Alzira`, `Starnberg` |
| `countryOfBirthCountryId` | `string` | No | 0 | 0.0% | 50 unique values | `canada`, `germany`, `argentina`, `spain`, `japan` |
| `nationalityCountryId` | `string` | No | 0 | 0.0% | 43 unique values | `hong-kong`, `germany`, `argentina`, `spain`, `japan` |
| `secondNationalityCountryId` | `string` | No | 908 | 99.23% | 'belgium', 'bosnia-and-herzegovina', 'ireland', 'israel', 'italy', 'mauritania', 'switzerland' | `italy`, `belgium`, `ireland`, `bosnia-and-herzegovina`, `mauritania` |
| `bestChampionshipPosition` | `int` | No | 528 | 57.7% | Range: `1` to `27` | `9`, `12`, `1`, `16`, `6` |
| `bestStartingGridPosition` | `int` | No | 123 | 13.44% | Range: `1` to `34` | `19`, `13`, `16`, `2`, `6` |
| `bestRaceResult` | `int` | No | 236 | 25.79% | Range: `1` to `33` | `14`, `4`, `3`, `7`, `11` |
| `bestSprintRaceResult` | `int` | No | 879 | 96.07% | Range: `1` to `18` | `6`, `8`, `2`, `3`, `5` |
| `totalChampionshipWins` | `int` | No | 0 | 0.0% | Range: `0` to `7` | `0`, `4`, `1`, `2`, `3` |
| `totalRaceEntries` | `int` | No | 0 | 0.0% | Range: `0` to `433` | `0`, `1`, `21`, `128`, `88` |
| `totalRaceStarts` | `int` | No | 0 | 0.0% | Range: `0` to `431` | `0`, `1`, `17`, `128`, `65` |
| `totalRaceWins` | `int` | No | 0 | 0.0% | Range: `0` to `105` | `0`, `51`, `12`, `13`, `1` |
| `totalRaceLaps` | `int` | No | 0 | 0.0% | Range: `0` to `23268` | `0`, `5`, `20`, `433`, `6022` |
| `totalPodiums` | `int` | No | 0 | 0.0% | Range: `0` to `204` | `0`, `1`, `106`, `24`, `17` |
| `totalPoints` | `int` | No | 0 | 0.0% | Range: `0` to `5090.5` | `0`, `124`, `8`, `798.5`, `2` |
| `totalChampionshipPoints` | `int` | No | 0 | 0.0% | Range: `0` to `5090.5` | `0`, `124`, `8`, `768.5`, `2` |
| `totalPolePositions` | `int` | No | 0 | 0.0% | Range: `0` to `104` | `0`, `33`, `6`, `14`, `1` |
| `totalFastestLaps` | `int` | No | 0 | 0.0% | Range: `0` to `77` | `0`, `1`, `41`, `13`, `2` |
| `totalSprintRaceStarts` | `int` | No | 0 | 0.0% | Range: `0` to `27` | `0`, `24`, `3`, `2`, `27` |
| `totalSprintRaceWins` | `int` | No | 0 | 0.0% | Range: `0` to `13` | `0`, `3`, `4`, `1`, `13` |
| `totalDriverOfTheDay` | `int` | No | 0 | 0.0% | Range: `0` to `50` | `0`, `4`, `8`, `19`, `11` |
| `totalGrandSlams` | `int` | No | 0 | 0.0% | Range: `0` to `8` | `0`, `5`, `4`, `1`, `2` |

---

### <a id='f1db-engine-manufacturers'></a> f1db-engine-manufacturers.csv

- **Description**: Core entity reference table for F1: `engine manufacturers` details.
- **Total Records (Rows)**: 78
- **Total Columns**: 20

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `id` | `string` | ✅ Yes | 0 | 0.0% | 78 unique values | `acer`, `alfa-romeo`, `alta`, `arrows`, `asiatech` |
| `name` | `string` | ✅ Yes | 0 | 0.0% | 78 unique values | `Acer`, `Alfa Romeo`, `Alta`, `Arrows`, `Asiatech` |
| `countryId` | `string` | No | 0 | 0.0% | 'australia', 'austria', 'france', 'germany', 'italy', 'japan', 'luxembourg', 'malaysia', 'netherlands', 'switzerland', 'taiwan', 'united-kingdom', 'united-states-of-america' | `taiwan`, `italy`, `united-kingdom`, `france`, `germany` |
| `bestChampionshipPosition` | `int` | No | 33 | 42.31% | Range: `1` to `11` | `9`, `3`, `7`, `2`, `1` |
| `bestStartingGridPosition` | `int` | No | 4 | 5.13% | Range: `1` to `25` | `4`, `1`, `6`, `13`, `2` |
| `bestRaceResult` | `int` | No | 11 | 14.1% | Range: `1` to `27` | `5`, `1`, `3`, `4`, `6` |
| `bestSprintRaceResult` | `int` | No | 70 | 89.74% | Range: `1` to `12` | `12`, `1`, `5`, `3` |
| `totalChampionshipWins` | `int` | No | 0 | 0.0% | Range: `0` to `16` | `0`, `1`, `4`, `16`, `10` |
| `totalRaceEntries` | `int` | No | 0 | 0.0% | Range: `1` to `1131` | `17`, `225`, `29`, `32`, `34` |
| `totalRaceStarts` | `int` | No | 0 | 0.0% | Range: `0` to `1129` | `17`, `215`, `26`, `32`, `33` |
| `totalRaceWins` | `int` | No | 0 | 0.0% | Range: `0` to `249` | `0`, `12`, `20`, `18`, `1` |
| `totalRaceLaps` | `int` | No | 0 | 0.0% | Range: `0` to `248791` | `1707`, `17979`, `2610`, `2254`, `2826` |
| `totalPodiums` | `int` | No | 0 | 0.0% | Range: `0` to `847` | `0`, `40`, `1`, `86`, `65` |
| `totalPodiumRaces` | `int` | No | 0 | 0.0% | Range: `0` to `647` | `0`, `30`, `1`, `76`, `55` |
| `totalPoints` | `int` | No | 0 | 0.0% | Range: `0` to `17062.5` | `4`, `166`, `0`, `7`, `3` |
| `totalChampionshipPoints` | `int` | No | 0 | 0.0% | Range: `0` to `16775.5` | `4`, `148`, `0`, `7`, `3` |
| `totalPolePositions` | `int` | No | 0 | 0.0% | Range: `0` to `256` | `0`, `15`, `33`, `11`, `1` |
| `totalFastestLaps` | `int` | No | 0 | 0.0% | Range: `0` to `276` | `0`, `20`, `33`, `14`, `45` |
| `totalSprintRaceStarts` | `int` | No | 0 | 0.0% | Range: `0` to `27` | `0`, `3`, `27`, `18`, `6` |
| `totalSprintRaceWins` | `int` | No | 0 | 0.0% | Range: `0` to `12` | `0`, `1`, `11`, `12`, `2` |

---

### <a id='f1db-engines'></a> f1db-engines.csv

- **Description**: Core entity reference table for F1: `engines` details.
- **Total Records (Rows)**: 424
- **Total Columns**: 7

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `id` | `string` | ✅ Yes | 0 | 0.0% | 424 unique values | `acer-01a-30-v10`, `alfa-romeo-115-12-30-f12`, `alfa-romeo-1260-30-v12`, `alfa-romeo-158-15-l8-s`, `alfa-romeo-890t-15-v8-t` |
| `engineManufacturerId` | `string` | No | 0 | 0.0% | 78 unique values | `acer`, `alfa-romeo`, `alta`, `arrows`, `asiatech` |
| `name` | `string` | No | 0 | 0.0% | 396 unique values | `01A`, `115-12`, `1260`, `158`, `890T` |
| `fullName` | `string` | ✅ Yes | 0 | 0.0% | 424 unique values | `Acer 01A 3.0 V10`, `Alfa Romeo 115-12 3.0 F12`, `Alfa Romeo 1260 3.0 V12`, `Alfa Romeo 158 1.5 L8 S`, `Alfa Romeo 890T 1.5 V8 T` |
| `capacity` | `float` | No | 1 | 0.24% | Range: `1.0` to `4.5` | `3.0`, `1.5`, `2.0`, `2.5`, `2.7` |
| `configuration` | `string` | No | 1 | 0.24% | 'F12', 'F4', 'F8', 'H16', 'L4', 'L6', 'L8', 'V10', 'V12', 'V16', 'V2', 'V6', 'V8', 'W12' | `V10`, `F12`, `V12`, `L8`, `V8` |
| `aspiration` | `string` | No | 1 | 0.24% | 'NATURALLY_ASPIRATED', 'SUPERCHARGED', 'TURBOCHARGED', 'TURBOCHARGED_HYBRID' | `NATURALLY_ASPIRATED`, `SUPERCHARGED`, `TURBOCHARGED`, `TURBOCHARGED_HYBRID` |

---

### <a id='f1db-entrants'></a> f1db-entrants.csv

- **Description**: Core entity reference table for F1: `entrants` details.
- **Total Records (Rows)**: 830
- **Total Columns**: 2

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `id` | `string` | ✅ Yes | 0 | 0.0% | 830 unique values | `3-l-racing-team`, `aaw-racing-team`, `ace-garage-rotherham`, `adolf-brudes`, `advance-muffler` |
| `name` | `string` | ✅ Yes | 0 | 0.0% | 830 unique values | `3-L Racing Team`, `AAW Racing Team`, `Ace Garage Rotherham`, `Adolf Brudes`, `Advance Muffler` |

---

### <a id='f1db-grands-prix'></a> f1db-grands-prix.csv

- **Description**: Core entity reference table for F1: `grands prix` details.
- **Total Records (Rows)**: 54
- **Total Columns**: 7

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `id` | `string` | ✅ Yes | 0 | 0.0% | 54 unique values | `70th-anniversary`, `abu-dhabi`, `argentina`, `australia`, `austria` |
| `name` | `string` | ✅ Yes | 0 | 0.0% | 54 unique values | `70th Anniversary`, `Abu Dhabi`, `Argentina`, `Australia`, `Austria` |
| `fullName` | `string` | ✅ Yes | 0 | 0.0% | 54 unique values | `70th Anniversary Grand Prix`, `Abu Dhabi Grand Prix`, `Argentine Grand Prix`, `Australian Grand Prix`, `Austrian Grand Prix` |
| `shortName` | `string` | ✅ Yes | 0 | 0.0% | 54 unique values | `70th Anniversary GP`, `Abu Dhabi GP`, `Argentine GP`, `Australian GP`, `Austrian GP` |
| `abbreviation` | `string` | No | 0 | 0.0% | 52 unique values | `70A`, `ABD`, `ARG`, `AUS`, `AUT` |
| `countryId` | `string` | No | 2 | 3.7% | 36 unique values | `united-kingdom`, `united-arab-emirates`, `argentina`, `australia`, `austria` |
| `totalRacesHeld` | `int` | No | 0 | 0.0% | Range: `0` to `76` | `1`, `17`, `20`, `40`, `38` |

---

### <a id='f1db-races-constructor-standings'></a> f1db-races-constructor-standings.csv

- **Description**: Contains race-specific historical statistics and results for F1. Specifically: `constructor standings` details.
- **Total Records (Rows)**: 10,544
- **Total Columns**: 11

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `raceId` | `int` | No | 0 | 0.0% | Range: `65` to `1154` | `65`, `66`, `67`, `68`, `69` |
| `year` | `int` | No | 0 | 0.0% | Range: `1958` to `2026` | `1958`, `1959`, `1960`, `1961`, `1962` |
| `round` | `int` | No | 0 | 0.0% | Range: `1` to `24` | `1`, `2`, `3`, `4`, `5` |
| `positionDisplayOrder` | `int` | No | 0 | 0.0% | Range: `1` to `16` | `1`, `2`, `3`, `4`, `5` |
| `positionNumber` | `int` | No | 17 | 0.16% | Range: `1` to `15` | `1`, `2`, `3`, `4`, `5` |
| `positionText` | `int` | No | 0 | 0.0% | Range: `1` to `15` | `1`, `2`, `3`, `4`, `5` |
| `constructorId` | `string` | No | 0 | 0.0% | 81 unique values | `cooper`, `ferrari`, `maserati`, `brm`, `vanwall` |
| `engineManufacturerId` | `string` | No | 0 | 0.0% | 47 unique values | `climax`, `ferrari`, `maserati`, `brm`, `vanwall` |
| `points` | `int` | No | 0 | 0.0% | Range: `0` to `860` | `8`, `6`, `3`, `16`, `12` |
| `positionsGained` | `int` | No | 455 | 4.32% | Range: `-4` to `7` | `0`, `2`, `-2`, `1`, `-1` |
| `championshipWon` | `string` | No | 0 | 0.0% | 'false', 'true' | `false`, `true` |

---

### <a id='f1db-races-driver-of-the-day-results'></a> f1db-races-driver-of-the-day-results.csv

- **Description**: Contains race-specific historical statistics and results for F1. Specifically: `driver of the day results` details.
- **Total Records (Rows)**: 842
- **Total Columns**: 12

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `raceId` | `int` | No | 0 | 0.0% | Range: `936` to `1154` | `936`, `937`, `938`, `939`, `940` |
| `year` | `int` | No | 0 | 0.0% | Range: `2016` to `2026` | `2016`, `2017`, `2018`, `2019`, `2020` |
| `round` | `int` | No | 0 | 0.0% | Range: `1` to `24` | `1`, `2`, `3`, `4`, `5` |
| `positionDisplayOrder` | `int` | No | 0 | 0.0% | Range: `1` to `5` | `1`, `2`, `3`, `4`, `5` |
| `positionNumber` | `int` | No | 0 | 0.0% | Range: `1` to `5` | `1`, `2`, `3`, `4`, `5` |
| `positionText` | `int` | No | 0 | 0.0% | Range: `1` to `5` | `1`, `2`, `3`, `4`, `5` |
| `driverNumber` | `int` | No | 0 | 0.0% | Range: `1` to `88` | `8`, `26`, `20`, `33`, `11` |
| `driverId` | `string` | No | 0 | 0.0% | 37 unique values | `romain-grosjean`, `daniil-kvyat`, `kevin-magnussen`, `max-verstappen`, `sergio-perez` |
| `constructorId` | `string` | No | 0 | 0.0% | 18 unique values | `haas`, `red-bull`, `renault`, `force-india`, `ferrari` |
| `engineManufacturerId` | `string` | No | 0 | 0.0% | 'bwt-mercedes', 'ferrari', 'honda', 'honda-rbpt', 'mercedes', 'rbpt', 'red-bull-ford', 'renault', 'tag-heuer' | `ferrari`, `tag-heuer`, `renault`, `mercedes`, `honda` |
| `tyreManufacturerId` | `string` | No | 0 | 0.0% | 'pirelli' | `pirelli` |
| `percentage` | `float` | No | 67 | 7.96% | Range: `2` to `74` | `28.5`, `22.9`, `7.5`, `6`, `5.2` |

---

### <a id='f1db-races-driver-standings'></a> f1db-races-driver-standings.csv

- **Description**: Contains race-specific historical statistics and results for F1. Specifically: `driver standings` details.
- **Total Records (Rows)**: 21,317
- **Total Columns**: 10

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `raceId` | `int` | No | 0 | 0.0% | Range: `1` to `1154` | `1`, `2`, `3`, `4`, `5` |
| `year` | `int` | No | 0 | 0.0% | Range: `1950` to `2026` | `1950`, `1951`, `1952`, `1953`, `1954` |
| `round` | `int` | No | 0 | 0.0% | Range: `1` to `24` | `1`, `2`, `3`, `4`, `5` |
| `positionDisplayOrder` | `int` | No | 0 | 0.0% | Range: `1` to `29` | `1`, `2`, `3`, `4`, `5` |
| `positionNumber` | `int` | No | 1 | 0.0% | Range: `1` to `67` | `1`, `2`, `3`, `4`, `5` |
| `positionText` | `int` | No | 0 | 0.0% | Range: `1` to `67` | `1`, `2`, `3`, `4`, `5` |
| `driverId` | `string` | No | 0 | 0.0% | 388 unique values | `nino-farina`, `luigi-fagioli`, `reg-parnell`, `yves-giraud-cabantous`, `louis-rosier` |
| `points` | `int` | No | 0 | 0.0% | Range: `0` to `575` | `9`, `6`, `4`, `3`, `2` |
| `positionsGained` | `int` | No | 700 | 3.28% | Range: `-60` to `60` | `0`, `5`, `-1`, `3`, `-2` |
| `championshipWon` | `string` | No | 0 | 0.0% | 'false', 'true' | `false`, `true` |

---

### <a id='f1db-races-fastest-laps'></a> f1db-races-fastest-laps.csv

- **Description**: Contains race-specific historical statistics and results for F1. Specifically: `fastest laps` details.
- **Total Records (Rows)**: 16,956
- **Total Columns**: 18

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `raceId` | `int` | No | 0 | 0.0% | Range: `1` to `1154` | `1`, `2`, `3`, `4`, `5` |
| `year` | `int` | No | 0 | 0.0% | Range: `1950` to `2026` | `1950`, `1951`, `1952`, `1953`, `1954` |
| `round` | `int` | No | 0 | 0.0% | Range: `1` to `24` | `1`, `2`, `3`, `4`, `5` |
| `positionDisplayOrder` | `int` | No | 0 | 0.0% | Range: `1` to `27` | `1`, `2`, `3`, `4`, `5` |
| `positionNumber` | `int` | No | 0 | 0.0% | Range: `1` to `31` | `1`, `2`, `3`, `4`, `5` |
| `positionText` | `int` | No | 0 | 0.0% | Range: `1` to `31` | `1`, `2`, `3`, `4`, `5` |
| `driverNumber` | `int` | No | 0 | 0.0% | Range: `0` to `101` | `2`, `34`, `1`, `16`, `8` |
| `driverId` | `string` | No | 0 | 0.0% | 307 unique values | `nino-farina`, `juan-manuel-fangio`, `johnnie-parsons`, `lee-wallard`, `piero-taruffi` |
| `constructorId` | `string` | No | 0 | 0.0% | 89 unique values | `alfa-romeo`, `kurtis-kraft`, `ferrari`, `maserati`, `mercedes` |
| `engineManufacturerId` | `string` | No | 0 | 0.0% | 50 unique values | `alfa-romeo`, `offenhauser`, `ferrari`, `maserati`, `mercedes` |
| `tyreManufacturerId` | `string` | No | 0 | 0.0% | 'bridgestone', 'continental', 'dunlop', 'englebert', 'firestone', 'goodyear', 'michelin', 'pirelli' | `pirelli`, `firestone`, `continental`, `englebert`, `dunlop` |
| `lap` | `int` | No | 30 | 0.18% | Range: `1` to `197` | `2`, `8`, `18`, `52`, `7` |
| `time` | `string` | No | 0 | 0.0% | 1000 unique values | `1:50.600`, `1:51.000`, `1:09.770`, `2:41.600`, `4:34.100` |
| `timeMillis` | `int` | No | 0 | 0.0% | Range: `55404` to `737162` | `110600`, `111000`, `69770`, `161600`, `274100` |
| `gap` | `float` | No | 1,154 | 6.81% | Range: `0.0` to `59.856` | `+0.000`, `+0.683`, `+0.694`, `+1.334`, `+1.718` |
| `gapMillis` | `int` | No | 1,154 | 6.81% | Range: `0` to `651034` | `0`, `683`, `694`, `1334`, `1718` |
| `interval` | `float` | No | 1,154 | 6.81% | Range: `0.0` to `59.929` | `+0.000`, `+0.683`, `+0.011`, `+0.640`, `+0.384` |
| `intervalMillis` | `int` | No | 1,154 | 6.81% | Range: `0` to `634281` | `0`, `683`, `11`, `640`, `384` |

---

### <a id='f1db-races-free-practice-1-results'></a> f1db-races-free-practice-1-results.csv

- **Description**: Contains race-specific historical statistics and results for F1. Specifically: `free practice 1 results` details.
- **Total Records (Rows)**: 15,945
- **Total Columns**: 18

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `raceId` | `int` | No | 0 | 0.0% | Range: `435` to `1154` | `435`, `436`, `453`, `454`, `455` |
| `year` | `int` | No | 0 | 0.0% | Range: `1986` to `2026` | `1986`, `1988`, `1989`, `1990`, `1991` |
| `round` | `int` | No | 0 | 0.0% | Range: `1` to `24` | `15`, `16`, `1`, `2`, `3` |
| `positionDisplayOrder` | `int` | No | 0 | 0.0% | Range: `1` to `31` | `1`, `2`, `3`, `4`, `5` |
| `positionNumber` | `int` | No | 0 | 0.0% | Range: `1` to `31` | `1`, `2`, `3`, `4`, `5` |
| `positionText` | `int` | No | 0 | 0.0% | Range: `1` to `31` | `1`, `2`, `3`, `4`, `5` |
| `driverNumber` | `int` | No | 0 | 0.0% | Range: `0` to `99` | `6`, `12`, `20`, `2`, `5` |
| `driverId` | `string` | No | 0 | 0.0% | 279 unique values | `nelson-piquet`, `ayrton-senna`, `gerhard-berger`, `keke-rosberg`, `nigel-mansell` |
| `constructorId` | `string` | No | 0 | 0.0% | 66 unique values | `williams`, `lotus`, `benetton`, `mclaren`, `lola` |
| `engineManufacturerId` | `string` | No | 0 | 0.0% | 39 unique values | `honda`, `renault`, `bmw`, `tag`, `ford` |
| `tyreManufacturerId` | `string` | No | 0 | 0.0% | 'bridgestone', 'goodyear', 'michelin', 'pirelli' | `goodyear`, `pirelli`, `bridgestone`, `michelin` |
| `time` | `string` | No | 407 | 2.55% | 1000 unique values | `1:18.601`, `1:18.779`, `1:19.004`, `1:19.099`, `1:19.588` |
| `timeMillis` | `int` | No | 407 | 2.55% | Range: `54546` to `3023716` | `78601`, `78779`, `79004`, `79099`, `79588` |
| `gap` | `float` | No | 1,110 | 6.96% | Range: `0.001` to `53.567` | `+0.178`, `+0.403`, `+0.498`, `+0.987`, `+1.250` |
| `gapMillis` | `int` | No | 1,110 | 6.96% | Range: `1` to `2887726` | `178`, `403`, `498`, `987`, `1250` |
| `interval` | `float` | No | 1,110 | 6.96% | Range: `0.0` to `57.298` | `+0.178`, `+0.225`, `+0.095`, `+0.489`, `+0.263` |
| `intervalMillis` | `int` | No | 1,110 | 6.96% | Range: `0` to `2844842` | `178`, `225`, `95`, `489`, `263` |
| `laps` | `int` | No | 2,846 | 17.85% | Range: `1` to `66` | `22`, `17`, `23`, `19`, `15` |

---

### <a id='f1db-races-free-practice-2-results'></a> f1db-races-free-practice-2-results.csv

- **Description**: Contains race-specific historical statistics and results for F1. Specifically: `free practice 2 results` details.
- **Total Records (Rows)**: 15,400
- **Total Columns**: 18

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `raceId` | `int` | No | 0 | 0.0% | Range: `435` to `1152` | `435`, `436`, `453`, `454`, `455` |
| `year` | `int` | No | 0 | 0.0% | Range: `1986` to `2026` | `1986`, `1988`, `1989`, `1990`, `1991` |
| `round` | `int` | No | 0 | 0.0% | Range: `1` to `24` | `15`, `16`, `1`, `2`, `3` |
| `positionDisplayOrder` | `int` | No | 0 | 0.0% | Range: `1` to `30` | `1`, `2`, `3`, `4`, `5` |
| `positionNumber` | `int` | No | 0 | 0.0% | Range: `1` to `30` | `1`, `2`, `3`, `4`, `5` |
| `positionText` | `int` | No | 0 | 0.0% | Range: `1` to `30` | `1`, `2`, `3`, `4`, `5` |
| `driverNumber` | `int` | No | 0 | 0.0% | Range: `0` to `99` | `12`, `20`, `19`, `6`, `5` |
| `driverId` | `string` | No | 0 | 0.0% | 235 unique values | `ayrton-senna`, `gerhard-berger`, `teo-fabi`, `nelson-piquet`, `nigel-mansell` |
| `constructorId` | `string` | No | 0 | 0.0% | 66 unique values | `lotus`, `benetton`, `williams`, `mclaren`, `lola` |
| `engineManufacturerId` | `string` | No | 0 | 0.0% | 39 unique values | `renault`, `bmw`, `honda`, `tag`, `ford` |
| `tyreManufacturerId` | `string` | No | 0 | 0.0% | 'bridgestone', 'goodyear', 'michelin', 'pirelli' | `goodyear`, `pirelli`, `bridgestone`, `michelin` |
| `time` | `string` | No | 112 | 0.73% | 1000 unique values | `1:17.977`, `1:18.088`, `1:18.154`, `1:18.353`, `1:18.785` |
| `timeMillis` | `int` | No | 112 | 0.73% | Range: `54713` to `1842109` | `77977`, `78088`, `78154`, `78353`, `78785` |
| `gap` | `float` | No | 790 | 5.13% | Range: `0.0` to `51.813` | `+0.111`, `+0.177`, `+0.376`, `+0.808`, `+1.183` |
| `gapMillis` | `int` | No | 790 | 5.13% | Range: `0` to `1730170` | `111`, `177`, `376`, `808`, `1183` |
| `interval` | `float` | No | 790 | 5.13% | Range: `0.0` to `57.269` | `+0.111`, `+0.066`, `+0.199`, `+0.432`, `+0.375` |
| `intervalMillis` | `int` | No | 790 | 5.13% | Range: `0` to `1165209` | `111`, `66`, `199`, `432`, `375` |
| `laps` | `int` | No | 2,800 | 18.18% | Range: `1` to `58` | `21`, `20`, `19`, `23`, `16` |

---

### <a id='f1db-races-free-practice-3-results'></a> f1db-races-free-practice-3-results.csv

- **Description**: Contains race-specific historical statistics and results for F1. Specifically: `free practice 3 results` details.
- **Total Records (Rows)**: 8,713
- **Total Columns**: 18

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `raceId` | `int` | No | 0 | 0.0% | Range: `706` to `1152` | `706`, `707`, `708`, `709`, `710` |
| `year` | `int` | No | 0 | 0.0% | Range: `2003` to `2026` | `2003`, `2004`, `2005`, `2006`, `2007` |
| `round` | `int` | No | 0 | 0.0% | Range: `1` to `24` | `9`, `10`, `11`, `12`, `13` |
| `positionDisplayOrder` | `int` | No | 0 | 0.0% | Range: `1` to `24` | `1`, `2`, `3`, `4`, `5` |
| `positionNumber` | `int` | No | 0 | 0.0% | Range: `1` to `24` | `1`, `2`, `3`, `4`, `5` |
| `positionText` | `int` | No | 0 | 0.0% | Range: `1` to `24` | `1`, `2`, `3`, `4`, `5` |
| `driverNumber` | `int` | No | 0 | 0.0% | Range: `1` to `99` | `4`, `3`, `20`, `5`, `6` |
| `driverId` | `string` | No | 0 | 0.0% | 117 unique values | `ralf-schumacher`, `juan-pablo-montoya`, `olivier-panis`, `david-coulthard`, `kimi-raikkonen` |
| `constructorId` | `string` | No | 0 | 0.0% | 38 unique values | `williams`, `toyota`, `mclaren`, `renault`, `ferrari` |
| `engineManufacturerId` | `string` | No | 0 | 0.0% | 16 unique values | `bmw`, `toyota`, `mercedes`, `renault`, `ferrari` |
| `tyreManufacturerId` | `string` | No | 0 | 0.0% | 'bridgestone', 'michelin', 'pirelli' | `michelin`, `bridgestone`, `pirelli` |
| `time` | `string` | No | 214 | 2.46% | 1000 unique values | `1:31.305`, `1:31.366`, `1:31.490`, `1:31.608`, `1:32.021` |
| `timeMillis` | `int` | No | 214 | 2.46% | Range: `54064` to `142454` | `91305`, `91366`, `91490`, `91608`, `92021` |
| `gap` | `float` | No | 630 | 7.23% | Range: `0.001` to `30.427` | `+0.061`, `+0.185`, `+0.303`, `+0.716`, `+0.752` |
| `gapMillis` | `int` | No | 630 | 7.23% | Range: `1` to `30427` | `61`, `185`, `303`, `716`, `752` |
| `interval` | `float` | No | 630 | 7.23% | Range: `0.0` to `26.785` | `+0.061`, `+0.124`, `+0.118`, `+0.413`, `+0.036` |
| `intervalMillis` | `int` | No | 630 | 7.23% | Range: `0` to `26785` | `61`, `124`, `118`, `413`, `36` |
| `laps` | `int` | No | 0 | 0.0% | Range: `1` to `39` | `11`, `15`, `18`, `16`, `13` |

---

### <a id='f1db-races-free-practice-4-results'></a> f1db-races-free-practice-4-results.csv

- **Description**: Contains race-specific historical statistics and results for F1. Specifically: `free practice 4 results` details.
- **Total Records (Rows)**: 706
- **Total Columns**: 18

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `raceId` | `int` | No | 0 | 0.0% | Range: `714` to `750` | `714`, `715`, `716`, `717`, `718` |
| `year` | `int` | No | 0 | 0.0% | Range: `2004` to `2005` | `2004`, `2005` |
| `round` | `int` | No | 0 | 0.0% | Range: `1` to `19` | `1`, `2`, `3`, `4`, `5` |
| `positionDisplayOrder` | `int` | No | 0 | 0.0% | Range: `1` to `20` | `1`, `2`, `3`, `4`, `5` |
| `positionNumber` | `int` | No | 0 | 0.0% | Range: `1` to `20` | `1`, `2`, `3`, `4`, `5` |
| `positionText` | `int` | No | 0 | 0.0% | Range: `1` to `20` | `1`, `2`, `3`, `4`, `5` |
| `driverNumber` | `int` | No | 0 | 0.0% | Range: `1` to `21` | `1`, `3`, `4`, `2`, `8` |
| `driverId` | `string` | No | 0 | 0.0% | 34 unique values | `michael-schumacher`, `juan-pablo-montoya`, `ralf-schumacher`, `rubens-barrichello`, `fernando-alonso` |
| `constructorId` | `string` | No | 0 | 0.0% | 'bar', 'ferrari', 'jaguar', 'jordan', 'mclaren', 'minardi', 'red-bull', 'renault', 'sauber', 'toyota', 'williams' | `ferrari`, `williams`, `renault`, `toyota`, `jaguar` |
| `engineManufacturerId` | `string` | No | 0 | 0.0% | 'bmw', 'cosworth', 'ferrari', 'ford', 'honda', 'mercedes', 'petronas', 'renault', 'toyota' | `ferrari`, `bmw`, `renault`, `toyota`, `cosworth` |
| `tyreManufacturerId` | `string` | No | 0 | 0.0% | 'bridgestone', 'michelin' | `bridgestone`, `michelin` |
| `time` | `string` | No | 6 | 0.85% | 689 unique values | `1:25.093`, `1:25.255`, `1:25.628`, `1:25.649`, `1:25.908` |
| `timeMillis` | `int` | No | 6 | 0.85% | Range: `70056` to `129428` | `85093`, `85255`, `85628`, `85649`, `85908` |
| `gap` | `float` | No | 42 | 5.95% | Range: `0.002` to `13.525` | `+0.162`, `+0.535`, `+0.556`, `+0.815`, `+0.823` |
| `gapMillis` | `int` | No | 42 | 5.95% | Range: `2` to `13525` | `162`, `535`, `556`, `815`, `823` |
| `interval` | `float` | No | 42 | 5.95% | Range: `0.0` to `6.768` | `+0.162`, `+0.373`, `+0.021`, `+0.259`, `+0.008` |
| `intervalMillis` | `int` | No | 42 | 5.95% | Range: `0` to `6768` | `162`, `373`, `21`, `259`, `8` |
| `laps` | `int` | No | 0 | 0.0% | Range: `2` to `113` | `13`, `9`, `12`, `11`, `14` |

---

### <a id='f1db-races-pit-stops'></a> f1db-races-pit-stops.csv

- **Description**: Contains race-specific historical statistics and results for F1. Specifically: `pit stops` details.
- **Total Records (Rows)**: 22,218
- **Total Columns**: 15

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `raceId` | `int` | No | 0 | 0.0% | Range: `550` to `1154` | `550`, `551`, `553`, `554`, `555` |
| `year` | `int` | No | 0 | 0.0% | Range: `1994` to `2026` | `1994`, `1995`, `1996`, `1997`, `1998` |
| `round` | `int` | No | 0 | 0.0% | Range: `1` to `24` | `2`, `3`, `5`, `6`, `7` |
| `positionDisplayOrder` | `int` | No | 0 | 0.0% | Range: `1` to `101` | `1`, `2`, `3`, `4`, `5` |
| `positionNumber` | `int` | No | 0 | 0.0% | Range: `1` to `101` | `1`, `2`, `3`, `4`, `5` |
| `positionText` | `int` | No | 0 | 0.0% | Range: `1` to `101` | `1`, `2`, `3`, `4`, `5` |
| `driverNumber` | `int` | No | 0 | 0.0% | Range: `0` to `99` | `20`, `3`, `7`, `0`, `24` |
| `driverId` | `string` | No | 0 | 0.0% | 171 unique values | `erik-comas`, `ukyo-katayama`, `mika-hakkinen`, `damon-hill`, `michele-alboreto` |
| `constructorId` | `string` | No | 0 | 0.0% | 50 unique values | `larrousse`, `tyrrell`, `mclaren`, `williams`, `minardi` |
| `engineManufacturerId` | `string` | No | 0 | 0.0% | 29 unique values | `ford`, `yamaha`, `peugeot`, `renault`, `mercedes` |
| `tyreManufacturerId` | `string` | No | 0 | 0.0% | 'bridgestone', 'goodyear', 'michelin', 'pirelli' | `goodyear`, `bridgestone`, `michelin`, `pirelli` |
| `stop` | `int` | No | 0 | 0.0% | Range: `1` to `7` | `1`, `2`, `3`, `4`, `5` |
| `lap` | `int` | No | 0 | 0.0% | Range: `1` to `78` | `1`, `17`, `18`, `19`, `22` |
| `time` | `float` | No | 1 | 0.0% | Range: `8.757` to `59.885` | `49.111`, `28.482`, `43.745`, `21.992`, `27.693` |
| `timeMillis` | `int` | No | 1 | 0.0% | Range: `8757` to `3707606` | `49111`, `28482`, `43745`, `21992`, `27693` |

---

### <a id='f1db-races-pre-qualifying-results'></a> f1db-races-pre-qualifying-results.csv

- **Description**: Contains race-specific historical statistics and results for F1. Specifically: `pre qualifying results` details.
- **Total Records (Rows)**: 647
- **Total Columns**: 24

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `raceId` | `int` | No | 0 | 0.0% | Range: `290` to `527` | `290`, `301`, `302`, `303`, `304` |
| `year` | `int` | No | 0 | 0.0% | Range: `1977` to `1992` | `1977`, `1978`, `1979`, `1981`, `1982` |
| `round` | `int` | No | 0 | 0.0% | Range: `1` to `16` | `10`, `4`, `5`, `6`, `7` |
| `positionDisplayOrder` | `int` | No | 0 | 0.0% | Range: `1` to `14` | `1`, `2`, `3`, `4`, `5` |
| `positionNumber` | `int` | No | 2 | 0.31% | Range: `1` to `14` | `1`, `2`, `3`, `4`, `5` |
| `positionText` | `int` | No | 0 | 0.0% | Range: `1` to `14` | `1`, `2`, `3`, `4`, `5` |
| `driverNumber` | `int` | No | 0 | 0.0% | Range: `7` to `45` | `40`, `23`, `34`, `30`, `38` |
| `driverId` | `string` | No | 0 | 0.0% | 74 unique values | `gilles-villeneuve`, `patrick-tambay`, `jean-pierre-jarier`, `brett-lunger`, `brian-henton` |
| `constructorId` | `string` | No | 0 | 0.0% | 38 unique values | `mclaren`, `ensign`, `penske`, `march`, `lec` |
| `engineManufacturerId` | `string` | No | 0 | 0.0% | 'brm', 'ford', 'hart', 'judd', 'lamborghini', 'life', 'mugen-honda', 'osella', 'subaru', 'yamaha' | `ford`, `brm`, `hart`, `osella`, `judd` |
| `tyreManufacturerId` | `string` | No | 0 | 0.0% | 'avon', 'goodyear', 'michelin', 'pirelli' | `goodyear`, `michelin`, `pirelli`, `avon` |
| `time` | `string` | No | 11 | 1.7% | 624 unique values | `1:19.480`, `1:19.550`, `1:19.630`, `1:19.720`, `1:19.820` |
| `timeMillis` | `int` | No | 11 | 1.7% | Range: `65165` to `436212` | `79480`, `79550`, `79630`, `79720`, `79820` |
| `q1` | `string` | No | 647 | 100.0% |  | _None_ |
| `q1Millis` | `string` | No | 647 | 100.0% |  | _None_ |
| `q2` | `string` | No | 647 | 100.0% |  | _None_ |
| `q2Millis` | `string` | No | 647 | 100.0% |  | _None_ |
| `q3` | `string` | No | 647 | 100.0% |  | _None_ |
| `q3Millis` | `string` | No | 647 | 100.0% |  | _None_ |
| `gap` | `float` | No | 90 | 13.91% | Range: `0.049` to `36.295` | `+0.070`, `+0.150`, `+0.240`, `+0.340`, `+0.380` |
| `gapMillis` | `int` | No | 90 | 13.91% | Range: `49` to `349737` | `70`, `150`, `240`, `340`, `380` |
| `interval` | `float` | No | 92 | 14.22% | Range: `0.0` to `29.748` | `+0.070`, `+0.080`, `+0.090`, `+0.100`, `+0.040` |
| `intervalMillis` | `int` | No | 92 | 14.22% | Range: `0` to `341940` | `70`, `80`, `90`, `100`, `40` |
| `laps` | `string` | No | 647 | 100.0% |  | _None_ |

---

### <a id='f1db-races-qualifying-1-results'></a> f1db-races-qualifying-1-results.csv

- **Description**: Contains race-specific historical statistics and results for F1. Specifically: `qualifying 1 results` details.
- **Total Records (Rows)**: 7,707
- **Total Columns**: 24

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `raceId` | `int` | No | 0 | 0.0% | Range: `329` to `737` | `329`, `330`, `331`, `332`, `333` |
| `year` | `int` | No | 0 | 0.0% | Range: `1980` to `2005` | `1980`, `1981`, `1982`, `1983`, `1984` |
| `round` | `int` | No | 0 | 0.0% | Range: `1` to `18` | `1`, `2`, `3`, `4`, `5` |
| `positionDisplayOrder` | `int` | No | 0 | 0.0% | Range: `1` to `31` | `1`, `2`, `3`, `4`, `5` |
| `positionNumber` | `int` | No | 0 | 0.0% | Range: `1` to `31` | `1`, `2`, `3`, `4`, `5` |
| `positionText` | `int` | No | 0 | 0.0% | Range: `1` to `31` | `1`, `2`, `3`, `4`, `5` |
| `driverNumber` | `int` | No | 0 | 0.0% | Range: `0` to `51` | `27`, `26`, `25`, `11`, `29` |
| `driverId` | `string` | No | 0 | 0.0% | 190 unique values | `alan-jones`, `jacques-laffite`, `didier-pironi`, `mario-andretti`, `riccardo-patrese` |
| `constructorId` | `string` | No | 0 | 0.0% | 46 unique values | `williams`, `ligier`, `lotus`, `arrows`, `brabham` |
| `engineManufacturerId` | `string` | No | 0 | 0.0% | 25 unique values | `ford`, `renault`, `ferrari`, `alfa-romeo`, `matra` |
| `tyreManufacturerId` | `string` | No | 0 | 0.0% | 'avon', 'bridgestone', 'goodyear', 'michelin', 'pirelli' | `goodyear`, `michelin`, `avon`, `pirelli`, `bridgestone` |
| `time` | `string` | No | 43 | 0.56% | 1000 unique values | `1:44.170`, `1:44.440`, `1:44.640`, `1:45.780`, `1:46.010` |
| `timeMillis` | `int` | No | 43 | 0.56% | Range: `61380` to `3643900` | `104170`, `104440`, `104640`, `105780`, `106010` |
| `q1` | `string` | No | 7,707 | 100.0% |  | _None_ |
| `q1Millis` | `string` | No | 7,707 | 100.0% |  | _None_ |
| `q2` | `string` | No | 7,707 | 100.0% |  | _None_ |
| `q2Millis` | `string` | No | 7,707 | 100.0% |  | _None_ |
| `q3` | `string` | No | 7,707 | 100.0% |  | _None_ |
| `q3Millis` | `string` | No | 7,707 | 100.0% |  | _None_ |
| `gap` | `float` | No | 335 | 4.35% | Range: `0.001` to `57.246` | `+0.270`, `+0.470`, `+1.610`, `+1.840`, `+1.870` |
| `gapMillis` | `int` | No | 335 | 4.35% | Range: `1` to `3557697` | `270`, `470`, `1610`, `1840`, `1870` |
| `interval` | `float` | No | 335 | 4.35% | Range: `0.0` to `54.068` | `+0.270`, `+0.200`, `+1.140`, `+0.230`, `+0.030` |
| `intervalMillis` | `int` | No | 335 | 4.35% | Range: `0` to `3547129` | `270`, `200`, `1140`, `230`, `30` |
| `laps` | `int` | No | 5,660 | 73.44% | Range: `1` to `35` | `18`, `14`, `16`, `15`, `19` |

---

### <a id='f1db-races-qualifying-2-results'></a> f1db-races-qualifying-2-results.csv

- **Description**: Contains race-specific historical statistics and results for F1. Specifically: `qualifying 2 results` details.
- **Total Records (Rows)**: 7,541
- **Total Columns**: 24

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `raceId` | `int` | No | 0 | 0.0% | Range: `329` to `737` | `329`, `330`, `331`, `332`, `333` |
| `year` | `int` | No | 0 | 0.0% | Range: `1980` to `2005` | `1980`, `1981`, `1982`, `1983`, `1984` |
| `round` | `int` | No | 0 | 0.0% | Range: `1` to `18` | `1`, `2`, `3`, `4`, `5` |
| `positionDisplayOrder` | `int` | No | 0 | 0.0% | Range: `1` to `31` | `1`, `2`, `3`, `4`, `5` |
| `positionNumber` | `int` | No | 3 | 0.04% | Range: `1` to `31` | `1`, `2`, `3`, `4`, `5` |
| `positionText` | `int` | No | 0 | 0.0% | Range: `1` to `31` | `1`, `2`, `3`, `4`, `5` |
| `driverNumber` | `int` | No | 0 | 0.0% | Range: `0` to `51` | `27`, `5`, `12`, `2`, `25` |
| `driverId` | `string` | No | 0 | 0.0% | 189 unique values | `alan-jones`, `nelson-piquet`, `elio-de-angelis`, `gilles-villeneuve`, `didier-pironi` |
| `constructorId` | `string` | No | 0 | 0.0% | 46 unique values | `williams`, `brabham`, `lotus`, `ferrari`, `ligier` |
| `engineManufacturerId` | `string` | No | 0 | 0.0% | 25 unique values | `ford`, `ferrari`, `renault`, `alfa-romeo`, `matra` |
| `tyreManufacturerId` | `string` | No | 0 | 0.0% | 'avon', 'bridgestone', 'goodyear', 'michelin', 'pirelli' | `goodyear`, `michelin`, `avon`, `pirelli`, `bridgestone` |
| `time` | `string` | No | 97 | 1.29% | 1000 unique values | `1:44.830`, `1:45.020`, `1:45.460`, `1:46.070`, `1:46.150` |
| `timeMillis` | `int` | No | 97 | 1.29% | Range: `62366` to `3679245` | `104830`, `105020`, `105460`, `106070`, `106150` |
| `q1` | `string` | No | 7,541 | 100.0% |  | _None_ |
| `q1Millis` | `string` | No | 7,541 | 100.0% |  | _None_ |
| `q2` | `string` | No | 7,541 | 100.0% |  | _None_ |
| `q2Millis` | `string` | No | 7,541 | 100.0% |  | _None_ |
| `q3` | `string` | No | 7,541 | 100.0% |  | _None_ |
| `q3Millis` | `string` | No | 7,541 | 100.0% |  | _None_ |
| `gap` | `float` | No | 390 | 5.17% | Range: `0.002` to `59.852` | `+0.190`, `+0.630`, `+1.240`, `+1.320`, `+1.450` |
| `gapMillis` | `int` | No | 390 | 5.17% | Range: `2` to `3558413` | `190`, `630`, `1240`, `1320`, `1450` |
| `interval` | `float` | No | 391 | 5.18% | Range: `0.0` to `56.908` | `+0.190`, `+0.440`, `+0.610`, `+0.080`, `+0.130` |
| `intervalMillis` | `int` | No | 391 | 5.18% | Range: `0` to `3546332` | `190`, `440`, `610`, `80`, `130` |
| `laps` | `int` | No | 5,547 | 73.56% | Range: `1` to `23` | `15`, `10`, `20`, `14`, `17` |

---

### <a id='f1db-races-qualifying-results'></a> f1db-races-qualifying-results.csv

- **Description**: Contains race-specific historical statistics and results for F1. Specifically: `qualifying results` details.
- **Total Records (Rows)**: 26,822
- **Total Columns**: 24

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `raceId` | `int` | No | 0 | 0.0% | Range: `1` to `1154` | `1`, `2`, `3`, `4`, `5` |
| `year` | `int` | No | 0 | 0.0% | Range: `1950` to `2026` | `1950`, `1951`, `1952`, `1953`, `1954` |
| `round` | `int` | No | 0 | 0.0% | Range: `1` to `24` | `1`, `2`, `3`, `4`, `5` |
| `positionDisplayOrder` | `int` | No | 0 | 0.0% | Range: `1` to `35` | `1`, `2`, `3`, `4`, `5` |
| `positionNumber` | `int` | No | 136 | 0.51% | Range: `1` to `35` | `1`, `2`, `3`, `4`, `5` |
| `positionText` | `int` | No | 0 | 0.0% | Range: `1` to `35` | `1`, `2`, `3`, `4`, `5` |
| `driverNumber` | `int` | No | 0 | 0.0% | Range: `0` to `208` | `2`, `3`, `1`, `4`, `21` |
| `driverId` | `string` | No | 0 | 0.0% | 839 unique values | `nino-farina`, `luigi-fagioli`, `juan-manuel-fangio`, `reg-parnell`, `birabongse-bhanudej` |
| `constructorId` | `string` | No | 0 | 0.0% | 182 unique values | `alfa-romeo`, `maserati`, `talbot-lago`, `era`, `alta` |
| `engineManufacturerId` | `string` | No | 0 | 0.0% | 76 unique values | `alfa-romeo`, `maserati`, `talbot-lago`, `era`, `alta` |
| `tyreManufacturerId` | `string` | No | 0 | 0.0% | 'avon', 'bridgestone', 'continental', 'dunlop', 'englebert', 'firestone', 'goodyear', 'michelin', 'pirelli' | `pirelli`, `dunlop`, `englebert`, `firestone`, `continental` |
| `time` | `string` | No | 8,640 | 32.21% | 1000 unique values | `1:50.800`, `1:51.000`, `1:52.200`, `1:52.600`, `1:53.400` |
| `timeMillis` | `int` | No | 8,640 | 32.21% | Range: `58790` to `1136000` | `110800`, `111000`, `112200`, `112600`, `113400` |
| `q1` | `string` | No | 18,426 | 68.7% | 1000 unique values | `1:33.310`, `1:33.579`, `1:32.603`, `1:32.433`, `1:33.233` |
| `q1Millis` | `int` | No | 18,426 | 68.7% | Range: `53904` to `141611` | `93310`, `93579`, `92603`, `92433`, `93233` |
| `q2` | `string` | No | 20,647 | 76.98% | 1000 unique values | `1:32.025`, `1:32.014`, `1:31.215`, `1:31.487`, `1:32.322` |
| `q2Millis` | `int` | No | 20,647 | 76.98% | Range: `53647` to `132470` | `92025`, `92014`, `91215`, `91487`, `92322` |
| `q3` | `string` | No | 22,907 | 85.4% | 1000 unique values | `1:31.431`, `1:31.478`, `1:31.549`, `1:31.702`, `1:32.164` |
| `q3Millis` | `int` | No | 22,907 | 85.4% | Range: `53377` to `129776` | `91431`, `91478`, `91549`, `91702`, `92164` |
| `gap` | `float` | No | 5,887 | 21.95% | Range: `-4.57` to `59.9` | `+0.200`, `+1.400`, `+1.800`, `+2.600`, `+4.600` |
| `gapMillis` | `int` | No | 5,887 | 21.95% | Range: `-3940` to `904617` | `200`, `1400`, `1800`, `2600`, `4600` |
| `interval` | `float` | No | 5,897 | 21.99% | Range: `-43.7` to `59.139` | `+0.200`, `+0.000`, `+1.200`, `+0.400`, `+0.800` |
| `intervalMillis` | `int` | No | 5,897 | 21.99% | Range: `-59600` to `894351` | `200`, `0`, `1200`, `400`, `800` |
| `laps` | `int` | No | 13,922 | 51.91% | Range: `0` to `35` | `22`, `20`, `14`, `23`, `24` |

---

### <a id='f1db-races-race-results'></a> f1db-races-race-results.csv

- **Description**: Contains race-specific historical statistics and results for F1. Specifically: `race results` details.
- **Total Records (Rows)**: 27,401
- **Total Columns**: 34

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `raceId` | `int` | No | 0 | 0.0% | Range: `1` to `1154` | `1`, `2`, `3`, `4`, `5` |
| `year` | `int` | No | 0 | 0.0% | Range: `1950` to `2026` | `1950`, `1951`, `1952`, `1953`, `1954` |
| `round` | `int` | No | 0 | 0.0% | Range: `1` to `24` | `1`, `2`, `3`, `4`, `5` |
| `positionDisplayOrder` | `int` | No | 0 | 0.0% | Range: `1` to `55` | `1`, `2`, `3`, `4`, `5` |
| `positionNumber` | `int` | No | 10,882 | 39.71% | Range: `1` to `33` | `1`, `2`, `3`, `4`, `5` |
| `positionText` | `int` | No | 0 | 0.0% | Range: `1` to `33` | `1`, `2`, `3`, `4`, `5` |
| `driverNumber` | `int` | No | 0 | 0.0% | Range: `0` to `208` | `2`, `3`, `4`, `14`, `15` |
| `driverId` | `string` | No | 0 | 0.0% | 860 unique values | `nino-farina`, `luigi-fagioli`, `reg-parnell`, `yves-giraud-cabantous`, `louis-rosier` |
| `constructorId` | `string` | No | 0 | 0.0% | 186 unique values | `alfa-romeo`, `talbot-lago`, `era`, `maserati`, `alta` |
| `engineManufacturerId` | `string` | No | 0 | 0.0% | 78 unique values | `alfa-romeo`, `talbot-lago`, `era`, `maserati`, `alta` |
| `tyreManufacturerId` | `string` | No | 0 | 0.0% | 'avon', 'bridgestone', 'continental', 'dunlop', 'englebert', 'firestone', 'goodyear', 'michelin', 'pirelli' | `pirelli`, `dunlop`, `englebert`, `firestone`, `continental` |
| `sharedCar` | `string` | No | 0 | 0.0% | 'false', 'true' | `false`, `true` |
| `laps` | `int` | No | 1,932 | 7.05% | Range: `0` to `200` | `70`, `68`, `67`, `65`, `64` |
| `time` | `string` | No | 19,348 | 70.61% | 1000 unique values | `2:13:23.600`, `2:13:26.200`, `2:14:15.600`, `3:13:18.700`, `2:46:55.970` |
| `timeMillis` | `int` | No | 19,348 | 70.61% | Range: `207071` to `15090540` | `8003600`, `8006200`, `8055600`, `11598700`, `10015970` |
| `timePenalty` | `float` | No | 27,136 | 99.03% | Range: `5.0` to `60.0` | `60.000`, `25.000`, `20.000`, `5.000`, `30.000` |
| `timePenaltyMillis` | `int` | No | 27,136 | 99.03% | Range: `5000` to `60000` | `60000`, `25000`, `20000`, `5000`, `30000` |
| `gap` | `string` | No | 12,766 | 46.59% | 1000 unique values | `+2.600`, `+52.000`, `+2 laps`, `+3 laps`, `+5 laps` |
| `gapMillis` | `int` | No | 20,502 | 74.82% | Range: `10` to `1128660` | `2600`, `52000`, `400`, `14000`, `139000` |
| `gapLaps` | `int` | No | 19,665 | 71.77% | Range: `1` to `56` | `2`, `3`, `5`, `6`, `13` |
| `interval` | `float` | No | 20,520 | 74.89% | Range: `0.01` to `59.98` | `+2.600`, `+49.400`, `+0.400`, `+14.000`, `+2:05.000` |
| `intervalMillis` | `int` | No | 20,520 | 74.89% | Range: `10` to `425000` | `2600`, `49400`, `400`, `14000`, `125000` |
| `reasonRetired` | `string` | No | 17,329 | 63.24% | 196 unique values | `Oil pipe`, `Out of fuel`, `Engine`, `Transmission`, `Clutch` |
| `points` | `int` | No | 18,939 | 69.12% | Range: `0.14` to `50` | `9`, `6`, `4`, `3`, `2` |
| `polePosition` | `string` | No | 0 | 0.0% | 'false', 'true' | `true`, `false` |
| `qualificationPositionNumber` | `int` | No | 721 | 2.63% | Range: `1` to `35` | `1`, `2`, `4`, `6`, `9` |
| `qualificationPositionText` | `int` | No | 586 | 2.14% | Range: `1` to `35` | `1`, `2`, `4`, `6`, `9` |
| `gridPositionNumber` | `int` | No | 2,004 | 7.31% | Range: `1` to `34` | `1`, `2`, `4`, `6`, `9` |
| `gridPositionText` | `int` | No | 1,773 | 6.47% | Range: `1` to `34` | `1`, `2`, `4`, `6`, `9` |
| `positionsGained` | `int` | No | 10,983 | 40.08% | Range: `-31` to `30` | `0`, `1`, `2`, `4`, `7` |
| `pitStops` | `int` | No | 14,495 | 52.9% | Range: `0` to `7` | `2`, `3`, `1`, `0`, `4` |
| `fastestLap` | `string` | No | 20 | 0.07% | 'false', 'true' | `true`, `false` |
| `driverOfTheDay` | `string` | No | 22,990 | 83.9% | 'false', 'true' | `false`, `true` |
| `grandSlam` | `string` | No | 0 | 0.0% | 'false', 'true' | `false`, `true` |

---

### <a id='f1db-races-sprint-qualifying-results'></a> f1db-races-sprint-qualifying-results.csv

- **Description**: Contains race-specific historical statistics and results for F1. Specifically: `sprint qualifying results` details.
- **Total Records (Rows)**: 422
- **Total Columns**: 24

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `raceId` | `int` | No | 0 | 0.0% | Range: `1083` to `1154` | `1083`, `1088`, `1091`, `1096`, `1097` |
| `year` | `int` | No | 0 | 0.0% | Range: `2023` to `2026` | `2023`, `2024`, `2025`, `2026` |
| `round` | `int` | No | 0 | 0.0% | Range: `2` to `23` | `4`, `9`, `12`, `17`, `18` |
| `positionDisplayOrder` | `int` | No | 0 | 0.0% | Range: `1` to `21` | `1`, `2`, `3`, `4`, `5` |
| `positionNumber` | `int` | No | 4 | 0.95% | Range: `1` to `21` | `1`, `2`, `3`, `4`, `5` |
| `positionText` | `int` | No | 0 | 0.0% | Range: `1` to `21` | `1`, `2`, `3`, `4`, `5` |
| `driverNumber` | `int` | No | 0 | 0.0% | Range: `1` to `87` | `16`, `11`, `1`, `63`, `55` |
| `driverId` | `string` | No | 0 | 0.0% | 29 unique values | `charles-leclerc`, `sergio-perez`, `max-verstappen`, `george-russell`, `carlos-sainz-jr` |
| `constructorId` | `string` | No | 0 | 0.0% | 'alfa-romeo', 'alphatauri', 'alpine', 'aston-martin', 'audi', 'cadillac', 'ferrari', 'haas', 'kick-sauber', 'mclaren', 'mercedes', 'racing-bulls', 'rb', 'red-bull', 'williams' | `ferrari`, `red-bull`, `mercedes`, `williams`, `aston-martin` |
| `engineManufacturerId` | `string` | No | 0 | 0.0% | 'audi', 'ferrari', 'honda', 'honda-rbpt', 'mercedes', 'red-bull-ford', 'renault' | `ferrari`, `honda-rbpt`, `mercedes`, `renault`, `red-bull-ford` |
| `tyreManufacturerId` | `string` | No | 0 | 0.0% | 'pirelli' | `pirelli` |
| `time` | `string` | No | 422 | 100.0% |  | _None_ |
| `timeMillis` | `string` | No | 422 | 100.0% |  | _None_ |
| `q1` | `string` | No | 2 | 0.47% | 416 unique values | `1:42.820`, `1:43.858`, `1:43.288`, `1:43.763`, `1:43.622` |
| `q1Millis` | `int` | No | 2 | 0.47% | Range: `65690` to `125741` | `102820`, `103858`, `103288`, `103763`, `103622` |
| `q2` | `string` | No | 120 | 28.44% | 302 unique values | `1:42.500`, `1:42.925`, `1:42.417`, `1:43.112`, `1:42.909` |
| `q2Millis` | `int` | No | 120 | 28.44% | Range: `65186` to `117687` | `102500`, `102925`, `102417`, `103112`, `102909` |
| `q3` | `string` | No | 217 | 51.42% | 204 unique values | `1:41.697`, `1:41.844`, `1:41.987`, `1:42.252`, `1:42.287` |
| `q3Millis` | `int` | No | 217 | 51.42% | Range: `64440` to `123537` | `101697`, `101844`, `101987`, `102252`, `102287` |
| `gap` | `float` | No | 238 | 56.4% | Range: `0.011` to `6.686` | `+0.147`, `+0.290`, `+0.555`, `+0.590`, `+0.805` |
| `gapMillis` | `int` | No | 238 | 56.4% | Range: `11` to `6686` | `147`, `290`, `555`, `590`, `805` |
| `interval` | `float` | No | 238 | 56.4% | Range: `0.001` to `5.248` | `+0.147`, `+0.143`, `+0.265`, `+0.035`, `+0.215` |
| `intervalMillis` | `int` | No | 238 | 56.4% | Range: `1` to `5248` | `147`, `143`, `265`, `35`, `215` |
| `laps` | `int` | No | 0 | 0.0% | Range: `3` to `24` | `14`, `15`, `13`, `18`, `17` |

---

### <a id='f1db-races-sprint-race-results'></a> f1db-races-sprint-race-results.csv

- **Description**: Contains race-specific historical statistics and results for F1. Specifically: `sprint race results` details.
- **Total Records (Rows)**: 546
- **Total Columns**: 34

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `raceId` | `int` | No | 0 | 0.0% | Range: `1045` to `1154` | `1045`, `1049`, `1054`, `1061`, `1068` |
| `year` | `int` | No | 0 | 0.0% | Range: `2021` to `2026` | `2021`, `2022`, `2023`, `2024`, `2025` |
| `round` | `int` | No | 0 | 0.0% | Range: `2` to `23` | `10`, `14`, `19`, `4`, `11` |
| `positionDisplayOrder` | `int` | No | 0 | 0.0% | Range: `1` to `22` | `1`, `2`, `3`, `4`, `5` |
| `positionNumber` | `int` | No | 35 | 6.41% | Range: `1` to `21` | `1`, `2`, `3`, `4`, `5` |
| `positionText` | `int` | No | 0 | 0.0% | Range: `1` to `21` | `1`, `2`, `3`, `4`, `5` |
| `driverNumber` | `int` | No | 0 | 0.0% | Range: `1` to `99` | `33`, `44`, `77`, `16`, `4` |
| `driverId` | `string` | No | 0 | 0.0% | 36 unique values | `max-verstappen`, `lewis-hamilton`, `valtteri-bottas`, `charles-leclerc`, `lando-norris` |
| `constructorId` | `string` | No | 0 | 0.0% | 'alfa-romeo', 'alphatauri', 'alpine', 'aston-martin', 'audi', 'cadillac', 'ferrari', 'haas', 'kick-sauber', 'mclaren', 'mercedes', 'racing-bulls', 'rb', 'red-bull', 'williams' | `red-bull`, `mercedes`, `ferrari`, `mclaren`, `alpine` |
| `engineManufacturerId` | `string` | No | 0 | 0.0% | 'audi', 'ferrari', 'honda', 'honda-rbpt', 'mercedes', 'rbpt', 'red-bull-ford', 'renault' | `honda`, `mercedes`, `ferrari`, `renault`, `rbpt` |
| `tyreManufacturerId` | `string` | No | 0 | 0.0% | 'pirelli' | `pirelli` |
| `sharedCar` | `string` | No | 0 | 0.0% | 'false' | `false` |
| `laps` | `int` | No | 4 | 0.73% | Range: `0` to `24` | `17`, `16`, `18`, `0`, `24` |
| `time` | `string` | No | 45 | 8.24% | 501 unique values | `25:38.426`, `25:39.856`, `25:45.928`, `25:49.704`, `26:02.537` |
| `timeMillis` | `int` | No | 45 | 8.24% | Range: `1498433` to `3261384` | `1538426`, `1539856`, `1545928`, `1549704`, `1562537` |
| `timePenalty` | `float` | No | 521 | 95.42% | Range: `5.0` to `35.0` | `5.000`, `10.000`, `20.000`, `35.000` |
| `timePenaltyMillis` | `int` | No | 521 | 95.42% | Range: `5000` to `35000` | `5000`, `10000`, `20000`, `35000` |
| `gap` | `float` | No | 66 | 12.09% | Range: `0.136` to `59.409` | `+1.430`, `+7.502`, `+11.278`, `+24.111`, `+30.959` |
| `gapMillis` | `int` | No | 72 | 13.19% | Range: `136` to `89597` | `1430`, `7502`, `11278`, `24111`, `30959` |
| `gapLaps` | `int` | No | 540 | 98.9% | Range: `1` to `3` | `1`, `3` |
| `interval` | `float` | No | 72 | 13.19% | Range: `0.009` to `35.797` | `+1.430`, `+6.072`, `+3.776`, `+12.833`, `+6.848` |
| `intervalMillis` | `int` | No | 72 | 13.19% | Range: `9` to `35797` | `1430`, `6072`, `3776`, `12833`, `6848` |
| `reasonRetired` | `string` | No | 509 | 93.22% | 'Accident', 'Brakes', 'Car damaged in qualifying', 'Collision', 'Collision damage', 'Electrical', 'Engine', 'Gearbox', 'Mechanical', 'Puncture', 'Spun off', 'Undertray', 'Vibration', 'Water leak', 'Withdrew' | `Vibration`, `Accident`, `Collision`, `Collision damage`, `Electrical` |
| `points` | `int` | No | 345 | 63.19% | Range: `1` to `8` | `3`, `2`, `1`, `8`, `7` |
| `polePosition` | `string` | No | 0 | 0.0% | 'false' | `false` |
| `qualificationPositionNumber` | `int` | No | 10 | 1.83% | Range: `1` to `21` | `2`, `1`, `3`, `4`, `6` |
| `qualificationPositionText` | `int` | No | 4 | 0.73% | Range: `1` to `21` | `2`, `1`, `3`, `4`, `6` |
| `gridPositionNumber` | `int` | No | 24 | 4.4% | Range: `1` to `22` | `2`, `1`, `3`, `4`, `6` |
| `gridPositionText` | `int` | No | 3 | 0.55% | Range: `1` to `22` | `2`, `1`, `3`, `4`, `6` |
| `positionsGained` | `int` | No | 35 | 6.41% | Range: `-17` to `15` | `1`, `-1`, `0`, `4`, `2` |
| `pitStops` | `string` | No | 546 | 100.0% |  | _None_ |
| `fastestLap` | `string` | No | 0 | 0.0% | 'false' | `false` |
| `driverOfTheDay` | `string` | No | 0 | 0.0% | 'false' | `false` |
| `grandSlam` | `string` | No | 0 | 0.0% | 'false' | `false` |

---

### <a id='f1db-races-sprint-starting-grid-positions'></a> f1db-races-sprint-starting-grid-positions.csv

- **Description**: Contains race-specific historical statistics and results for F1. Specifically: `sprint starting grid positions` details.
- **Total Records (Rows)**: 545
- **Total Columns**: 17

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `raceId` | `int` | No | 0 | 0.0% | Range: `1045` to `1154` | `1045`, `1049`, `1054`, `1061`, `1068` |
| `year` | `int` | No | 0 | 0.0% | Range: `2021` to `2026` | `2021`, `2022`, `2023`, `2024`, `2025` |
| `round` | `int` | No | 0 | 0.0% | Range: `2` to `23` | `10`, `14`, `19`, `4`, `11` |
| `positionDisplayOrder` | `int` | No | 0 | 0.0% | Range: `1` to `22` | `1`, `2`, `3`, `4`, `5` |
| `positionNumber` | `int` | No | 21 | 3.85% | Range: `1` to `22` | `1`, `2`, `3`, `4`, `5` |
| `positionText` | `int` | No | 0 | 0.0% | Range: `1` to `22` | `1`, `2`, `3`, `4`, `5` |
| `driverNumber` | `int` | No | 0 | 0.0% | Range: `1` to `99` | `44`, `33`, `77`, `16`, `11` |
| `driverId` | `string` | No | 0 | 0.0% | 36 unique values | `lewis-hamilton`, `max-verstappen`, `valtteri-bottas`, `charles-leclerc`, `sergio-perez` |
| `constructorId` | `string` | No | 0 | 0.0% | 'alfa-romeo', 'alphatauri', 'alpine', 'aston-martin', 'audi', 'cadillac', 'ferrari', 'haas', 'kick-sauber', 'mclaren', 'mercedes', 'racing-bulls', 'rb', 'red-bull', 'williams' | `mercedes`, `red-bull`, `ferrari`, `mclaren`, `williams` |
| `engineManufacturerId` | `string` | No | 0 | 0.0% | 'audi', 'ferrari', 'honda', 'honda-rbpt', 'mercedes', 'rbpt', 'red-bull-ford', 'renault' | `mercedes`, `honda`, `ferrari`, `renault`, `rbpt` |
| `tyreManufacturerId` | `string` | No | 0 | 0.0% | 'pirelli' | `pirelli` |
| `qualificationPositionNumber` | `int` | No | 10 | 1.83% | Range: `1` to `21` | `1`, `2`, `3`, `4`, `5` |
| `qualificationPositionText` | `int` | No | 4 | 0.73% | Range: `1` to `21` | `1`, `2`, `3`, `4`, `5` |
| `gridPenalty` | `int` | No | 541 | 99.27% | Range: `3` to `3` | `SFB`, `3` |
| `gridPenaltyPositions` | `int` | No | 542 | 99.45% | Range: `3` to `3` | `3` |
| `time` | `string` | No | 30 | 5.5% | 510 unique values | `1:26.134`, `1:26.209`, `1:26.328`, `1:26.828`, `1:26.844` |
| `timeMillis` | `int` | No | 30 | 5.5% | Range: `64440` to `125741` | `86134`, `86209`, `86328`, `86828`, `86844` |

---

### <a id='f1db-races-starting-grid-positions'></a> f1db-races-starting-grid-positions.csv

- **Description**: Contains race-specific historical statistics and results for F1. Specifically: `starting grid positions` details.
- **Total Records (Rows)**: 25,638
- **Total Columns**: 17

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `raceId` | `int` | No | 0 | 0.0% | Range: `1` to `1154` | `1`, `2`, `3`, `4`, `5` |
| `year` | `int` | No | 0 | 0.0% | Range: `1950` to `2026` | `1950`, `1951`, `1952`, `1953`, `1954` |
| `round` | `int` | No | 0 | 0.0% | Range: `1` to `24` | `1`, `2`, `3`, `4`, `5` |
| `positionDisplayOrder` | `int` | No | 0 | 0.0% | Range: `1` to `34` | `1`, `2`, `3`, `4`, `5` |
| `positionNumber` | `int` | No | 155 | 0.6% | Range: `1` to `34` | `1`, `2`, `3`, `4`, `5` |
| `positionText` | `int` | No | 0 | 0.0% | Range: `1` to `34` | `1`, `2`, `3`, `4`, `5` |
| `driverNumber` | `int` | No | 0 | 0.0% | Range: `0` to `136` | `2`, `3`, `1`, `4`, `21` |
| `driverId` | `string` | No | 0 | 0.0% | 793 unique values | `nino-farina`, `luigi-fagioli`, `juan-manuel-fangio`, `reg-parnell`, `birabongse-bhanudej` |
| `constructorId` | `string` | No | 0 | 0.0% | 176 unique values | `alfa-romeo`, `maserati`, `talbot-lago`, `era`, `alta` |
| `engineManufacturerId` | `string` | No | 0 | 0.0% | 74 unique values | `alfa-romeo`, `maserati`, `talbot-lago`, `era`, `alta` |
| `tyreManufacturerId` | `string` | No | 0 | 0.0% | 'avon', 'bridgestone', 'continental', 'dunlop', 'englebert', 'firestone', 'goodyear', 'michelin', 'pirelli' | `pirelli`, `dunlop`, `englebert`, `firestone`, `continental` |
| `qualificationPositionNumber` | `int` | No | 149 | 0.58% | Range: `1` to `34` | `1`, `2`, `3`, `4`, `5` |
| `qualificationPositionText` | `int` | No | 22 | 0.09% | Range: `1` to `34` | `1`, `2`, `3`, `4`, `5` |
| `gridPenalty` | `int` | No | 25,066 | 97.77% | Range: `1` to `70` | `SFB`, `10`, `20`, `2`, `5` |
| `gridPenaltyPositions` | `int` | No | 25,138 | 98.05% | Range: `1` to `70` | `10`, `20`, `2`, `5`, `3` |
| `time` | `string` | No | 554 | 2.16% | 1000 unique values | `1:50.800`, `1:51.000`, `1:52.200`, `1:52.600`, `1:53.400` |
| `timeMillis` | `int` | No | 554 | 2.16% | Range: `53377` to `1136000` | `110800`, `111000`, `112200`, `112600`, `113400` |

---

### <a id='f1db-races-warming-up-results'></a> f1db-races-warming-up-results.csv

- **Description**: Contains race-specific historical statistics and results for F1. Specifically: `warming up results` details.
- **Total Records (Rows)**: 7,683
- **Total Columns**: 18

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `raceId` | `int` | No | 0 | 0.0% | Range: `389` to `713` | `389`, `390`, `391`, `392`, `393` |
| `year` | `int` | No | 0 | 0.0% | Range: `1984` to `2003` | `1984`, `1985`, `1986`, `1987`, `1988` |
| `round` | `int` | No | 0 | 0.0% | Range: `1` to `17` | `1`, `2`, `3`, `4`, `5` |
| `positionDisplayOrder` | `int` | No | 0 | 0.0% | Range: `1` to `27` | `1`, `2`, `3`, `4`, `5` |
| `positionNumber` | `int` | No | 0 | 0.0% | Range: `1` to `27` | `1`, `2`, `3`, `4`, `5` |
| `positionText` | `int` | No | 0 | 0.0% | Range: `1` to `27` | `1`, `2`, `3`, `4`, `5` |
| `driverNumber` | `int` | No | 0 | 0.0% | Range: `0` to `40` | `8`, `7`, `11`, `27`, `1` |
| `driverId` | `string` | No | 0 | 0.0% | 151 unique values | `niki-lauda`, `alain-prost`, `elio-de-angelis`, `michele-alboreto`, `nelson-piquet` |
| `constructorId` | `string` | No | 0 | 0.0% | 43 unique values | `mclaren`, `lotus`, `ferrari`, `brabham`, `renault` |
| `engineManufacturerId` | `string` | No | 0 | 0.0% | 32 unique values | `tag`, `renault`, `ferrari`, `bmw`, `alfa-romeo` |
| `tyreManufacturerId` | `string` | No | 0 | 0.0% | 'bridgestone', 'goodyear', 'michelin', 'pirelli' | `michelin`, `goodyear`, `pirelli`, `bridgestone` |
| `time` | `string` | No | 16 | 0.21% | 1000 unique values | `1:34.061`, `1:34.740`, `1:35.138`, `1:35.863`, `1:36.670` |
| `timeMillis` | `int` | No | 16 | 0.21% | Range: `66371` to `1743968` | `94061`, `94740`, `95138`, `95863`, `96670` |
| `gap` | `float` | No | 340 | 4.43% | Range: `0.001` to `53.402` | `+0.679`, `+1.077`, `+1.802`, `+2.609`, `+3.453` |
| `gapMillis` | `int` | No | 340 | 4.43% | Range: `1` to `1660536` | `679`, `1077`, `1802`, `2609`, `3453` |
| `interval` | `float` | No | 340 | 4.43% | Range: `0.0` to `58.834` | `+0.679`, `+0.398`, `+0.725`, `+0.807`, `+0.844` |
| `intervalMillis` | `int` | No | 340 | 4.43% | Range: `0` to `1651210` | `679`, `398`, `725`, `807`, `844` |
| `laps` | `int` | No | 4,043 | 52.62% | Range: `1` to `21` | `12`, `13`, `17`, `14`, `11` |

---

### <a id='f1db-races'></a> f1db-races.csv

- **Description**: Core entity reference table for F1: `races` details.
- **Total Records (Rows)**: 1,171
- **Total Columns**: 43

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `id` | `int` | No | 0 | 0.0% | Range: `1` to `1171` | `1`, `2`, `3`, `4`, `5` |
| `year` | `int` | No | 0 | 0.0% | Range: `1950` to `2026` | `1950`, `1951`, `1952`, `1953`, `1954` |
| `round` | `int` | No | 0 | 0.0% | Range: `1` to `24` | `1`, `2`, `3`, `4`, `5` |
| `date` | `date` | No | 0 | 0.0% | 1000 unique values | `1950-05-13`, `1950-05-21`, `1950-05-30`, `1950-06-04`, `1950-06-18` |
| `time` | `string` | No | 1,101 | 94.02% | '04:00', '05:00', '06:00', '07:00', '11:00', '12:00', '13:00', '14:00', '15:00', '15:30', '16:00', '17:00', '18:00', '19:00', '20:00' | `15:00`, `17:00`, `04:00`, `05:00`, `07:00` |
| `grandPrixId` | `string` | No | 0 | 0.0% | 54 unique values | `great-britain`, `monaco`, `indianapolis`, `switzerland`, `belgium` |
| `officialName` | `string` | No | 0 | 0.0% | 1000 unique values | `1950 RAC British Grand Prix`, `Grand Prix de Monaco 1950`, `1950 Indianapolis 500`, `Grosser Preis der Schweiz 1950`, `1950 Belgian Grand Prix` |
| `qualifyingFormat` | `string` | No | 0 | 0.0% | 'AGGREGATE', 'ELIMINATION', 'FOUR_LAPS', 'KNOCKOUT', 'ONE_LAP', 'ONE_SESSION', 'SPRINT_RACE', 'TWO_SESSION' | `TWO_SESSION`, `FOUR_LAPS`, `ONE_SESSION`, `ONE_LAP`, `AGGREGATE` |
| `sprintQualifyingFormat` | `string` | No | 1,147 | 97.95% | 'SPRINT_SHOOTOUT' | `SPRINT_SHOOTOUT` |
| `circuitId` | `string` | No | 0 | 0.0% | 78 unique values | `silverstone`, `monaco`, `indianapolis`, `bremgarten`, `spa-francorchamps` |
| `circuitLayoutId` | `string` | No | 0 | 0.0% | 160 unique values | `silverstone-1`, `monaco-1`, `indianapolis-1`, `bremgarten-1`, `spa-francorchamps-1` |
| `circuitType` | `string` | No | 0 | 0.0% | 'RACE', 'ROAD', 'STREET' | `RACE`, `STREET`, `ROAD` |
| `direction` | `string` | No | 0 | 0.0% | 'ANTI_CLOCKWISE', 'CLOCKWISE' | `CLOCKWISE`, `ANTI_CLOCKWISE` |
| `courseLength` | `float` | No | 0 | 0.0% | Range: `3.145` to `25.579` | `4.649`, `3.180`, `4.023`, `7.280`, `14.120` |
| `turns` | `int` | No | 0 | 0.0% | Range: `4` to `160` | `8`, `14`, `4`, `13`, `21` |
| `laps` | `int` | No | 0 | 0.0% | Range: `1` to `200` | `70`, `100`, `138`, `42`, `35` |
| `distance` | `float` | No | 0 | 0.0% | Range: `6.88` to `804.672` | `325.430`, `318.000`, `555.224`, `305.760`, `494.200` |
| `scheduledLaps` | `int` | No | 1,087 | 92.83% | Range: `40` to `200` | `200`, `80`, `40`, `90`, `75` |
| `scheduledDistance` | `float` | No | 1,087 | 92.83% | Range: `251.712` to `804.672` | `804.672`, `316.560`, `318.400`, `306.360`, `284.325` |
| `driversChampionshipDecider` | `string` | No | 0 | 0.0% | 'false', 'true' | `false`, `true` |
| `constructorsChampionshipDecider` | `string` | No | 0 | 0.0% | 'false', 'true' | `false`, `true` |
| `preQualifyingDate` | `string` | No | 1,171 | 100.0% |  | _None_ |
| `preQualifyingTime` | `string` | No | 1,171 | 100.0% |  | _None_ |
| `freePractice1Date` | `date` | No | 1,101 | 94.02% | 70 unique values | `2024-02-29`, `2024-03-07`, `2024-03-22`, `2024-04-05`, `2024-04-19` |
| `freePractice1Time` | `string` | No | 1,101 | 94.02% | '00:30', '01:30', '02:30', '03:30', '08:30', '09:30', '10:30', '11:30', '13:30', '14:30', '15:30', '16:00', '16:30', '17:30', '18:30' | `11:30`, `13:30`, `01:30`, `02:30`, `03:30` |
| `freePractice2Date` | `date` | No | 1,119 | 95.56% | 52 unique values | `2024-02-29`, `2024-03-07`, `2024-03-22`, `2024-04-05`, `2024-05-17` |
| `freePractice2Time` | `string` | No | 1,119 | 95.56% | '04:00', '05:00', '06:00', '12:00', '13:00', '14:00', '15:00', '17:00', '19:00', '21:00', '22:00' | `15:00`, `17:00`, `05:00`, `06:00`, `21:00` |
| `freePractice3Date` | `date` | No | 1,119 | 95.56% | 52 unique values | `2024-03-01`, `2024-03-08`, `2024-03-23`, `2024-04-06`, `2024-05-18` |
| `freePractice3Time` | `string` | No | 1,119 | 95.56% | '00:30', '01:30', '02:30', '08:30', '09:30', '10:30', '12:30', '13:30', '14:30', '16:30', '17:30' | `12:30`, `13:30`, `01:30`, `02:30`, `10:30` |
| `freePractice4Date` | `string` | No | 1,171 | 100.0% |  | _None_ |
| `freePractice4Time` | `string` | No | 1,171 | 100.0% |  | _None_ |
| `qualifying1Date` | `string` | No | 1,171 | 100.0% |  | _None_ |
| `qualifying1Time` | `string` | No | 1,171 | 100.0% |  | _None_ |
| `qualifying2Date` | `string` | No | 1,171 | 100.0% |  | _None_ |
| `qualifying2Time` | `string` | No | 1,171 | 100.0% |  | _None_ |
| `qualifyingDate` | `date` | No | 1,101 | 94.02% | 70 unique values | `2024-03-01`, `2024-03-08`, `2024-03-23`, `2024-04-06`, `2024-04-20` |
| `qualifyingTime` | `string` | No | 1,101 | 94.02% | '04:00', '05:00', '06:00', '07:00', '10:30', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '20:00', '21:00', '22:00' | `16:00`, `17:00`, `05:00`, `06:00`, `07:00` |
| `sprintQualifyingDate` | `date` | No | 1,153 | 98.46% | 18 unique values | `2024-04-19`, `2024-05-03`, `2024-06-28`, `2024-10-18`, `2024-11-01` |
| `sprintQualifyingTime` | `string` | No | 1,153 | 98.46% | '07:30', '12:30', '14:30', '15:30', '17:30', '18:30', '20:30', '21:30' | `07:30`, `20:30`, `14:30`, `21:30`, `18:30` |
| `sprintRaceDate` | `date` | No | 1,153 | 98.46% | 18 unique values | `2024-04-20`, `2024-05-04`, `2024-06-29`, `2024-10-19`, `2024-11-02` |
| `sprintRaceTime` | `string` | No | 1,153 | 98.46% | '03:00', '09:00', '10:00', '11:00', '14:00', '16:00', '17:00', '18:00' | `03:00`, `16:00`, `10:00`, `18:00`, `14:00` |
| `warmingUpDate` | `string` | No | 1,171 | 100.0% |  | _None_ |
| `warmingUpTime` | `string` | No | 1,171 | 100.0% |  | _None_ |

---

### <a id='f1db-seasons-constructor-standings'></a> f1db-seasons-constructor-standings.csv

- **Description**: Contains season-level aggregations, historical summaries, and participants. Specifically: `constructor standings` details.
- **Total Records (Rows)**: 721
- **Total Columns**: 8

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `year` | `int` | No | 0 | 0.0% | Range: `1958` to `2026` | `1958`, `1959`, `1960`, `1961`, `1962` |
| `positionDisplayOrder` | `int` | No | 0 | 0.0% | Range: `1` to `16` | `1`, `2`, `3`, `4`, `5` |
| `positionNumber` | `int` | No | 3 | 0.42% | Range: `1` to `15` | `1`, `2`, `3`, `4`, `5` |
| `positionText` | `int` | No | 0 | 0.0% | Range: `1` to `15` | `1`, `2`, `3`, `4`, `5` |
| `constructorId` | `string` | No | 0 | 0.0% | 81 unique values | `vanwall`, `ferrari`, `cooper`, `brm`, `maserati` |
| `engineManufacturerId` | `string` | No | 0 | 0.0% | 47 unique values | `vanwall`, `ferrari`, `climax`, `brm`, `maserati` |
| `points` | `int` | No | 0 | 0.0% | Range: `0` to `860` | `48`, `40`, `31`, `18`, `6` |
| `championshipWon` | `string` | No | 0 | 0.0% | 'false', 'true' | `true`, `false` |

---

### <a id='f1db-seasons-constructors'></a> f1db-seasons-constructors.csv

- **Description**: Contains season-level aggregations, historical summaries, and participants. Specifically: `constructors` details.
- **Total Records (Rows)**: 1,079
- **Total Columns**: 19

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `year` | `int` | No | 0 | 0.0% | Range: `1950` to `2026` | `1950`, `1951`, `1952`, `1953`, `1954` |
| `constructorId` | `string` | No | 0 | 0.0% | 187 unique values | `alfa-romeo`, `kurtis-kraft`, `maserati`, `talbot-lago`, `marchese` |
| `positionNumber` | `int` | No | 383 | 35.5% | Range: `1` to `15` | `3`, `5`, `6`, `4`, `2` |
| `positionText` | `int` | No | 381 | 35.31% | Range: `1` to `15` | `3`, `5`, `6`, `4`, `2` |
| `bestStartingGridPosition` | `int` | No | 28 | 2.59% | Range: `1` to `33` | `1`, `3`, `4`, `16`, `23` |
| `bestRaceResult` | `int` | No | 94 | 8.71% | Range: `1` to `33` | `1`, `3`, `11`, `2`, `8` |
| `bestSprintRaceResult` | `int` | No | 1,018 | 94.35% | Range: `1` to `17` | `8`, `7`, `3`, `1`, `17` |
| `totalRaceEntries` | `int` | No | 0 | 0.0% | Range: `0` to `24` | `6`, `1`, `7`, `3`, `5` |
| `totalRaceStarts` | `int` | No | 0 | 0.0% | Range: `0` to `24` | `6`, `1`, `7`, `3`, `5` |
| `totalRaceWins` | `int` | No | 0 | 0.0% | Range: `0` to `21` | `6`, `1`, `0`, `4`, `3` |
| `total1And2Finishes` | `int` | No | 0 | 0.0% | Range: `0` to `12` | `4`, `0`, `1`, `6`, `3` |
| `totalRaceLaps` | `int` | No | 0 | 0.0% | Range: `0` to `3529` | `1005`, `1492`, `1220`, `1264`, `133` |
| `totalPodiums` | `int` | No | 0 | 0.0% | Range: `0` to `34` | `12`, `1`, `2`, `0`, `3` |
| `totalPodiumRaces` | `int` | No | 0 | 0.0% | Range: `0` to `21` | `6`, `1`, `2`, `0`, `3` |
| `totalPoints` | `int` | No | 0 | 0.0% | Range: `0` to `860` | `89`, `14`, `11`, `20`, `0` |
| `totalPolePositions` | `int` | No | 0 | 0.0% | Range: `0` to `20` | `6`, `1`, `0`, `4`, `3` |
| `totalFastestLaps` | `int` | No | 0 | 0.0% | Range: `0` to `14` | `6`, `1`, `0`, `7`, `4` |
| `totalSprintRaceStarts` | `int` | No | 0 | 0.0% | Range: `0` to `6` | `0`, `3`, `6` |
| `totalSprintRaceWins` | `int` | No | 0 | 0.0% | Range: `0` to `5` | `0`, `2`, `1`, `5`, `4` |

---

### <a id='f1db-seasons-driver-standings'></a> f1db-seasons-driver-standings.csv

- **Description**: Contains season-level aggregations, historical summaries, and participants. Specifically: `driver standings` details.
- **Total Records (Rows)**: 1,680
- **Total Columns**: 7

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `year` | `int` | No | 0 | 0.0% | Range: `1950` to `2026` | `1950`, `1951`, `1952`, `1953`, `1954` |
| `positionDisplayOrder` | `int` | No | 0 | 0.0% | Range: `1` to `29` | `1`, `2`, `3`, `4`, `5` |
| `positionNumber` | `int` | No | 1 | 0.06% | Range: `1` to `28` | `1`, `2`, `3`, `4`, `5` |
| `positionText` | `int` | No | 0 | 0.0% | Range: `1` to `28` | `1`, `2`, `3`, `4`, `5` |
| `driverId` | `string` | No | 0 | 0.0% | 388 unique values | `nino-farina`, `juan-manuel-fangio`, `luigi-fagioli`, `louis-rosier`, `alberto-ascari` |
| `points` | `int` | No | 0 | 0.0% | Range: `0` to `575` | `30`, `27`, `24`, `13`, `11` |
| `championshipWon` | `string` | No | 0 | 0.0% | 'false', 'true' | `true`, `false` |

---

### <a id='f1db-seasons-drivers'></a> f1db-seasons-drivers.csv

- **Description**: Contains season-level aggregations, historical summaries, and participants. Specifically: `drivers` details.
- **Total Records (Rows)**: 3,407
- **Total Columns**: 19

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `year` | `int` | No | 0 | 0.0% | Range: `1950` to `2026` | `1950`, `1951`, `1952`, `1953`, `1954` |
| `driverId` | `string` | No | 0 | 0.0% | 915 unique values | `juan-manuel-fangio`, `luigi-fagioli`, `nino-farina`, `reg-parnell`, `consalvo-sanesi` |
| `positionNumber` | `int` | No | 1,728 | 50.72% | Range: `1` to `28` | `2`, `3`, `1`, `9`, `4` |
| `positionText` | `int` | No | 1,727 | 50.69% | Range: `1` to `28` | `2`, `3`, `1`, `9`, `4` |
| `bestStartingGridPosition` | `int` | No | 344 | 10.1% | Range: `1` to `34` | `1`, `2`, `4`, `7`, `11` |
| `bestRaceResult` | `int` | No | 733 | 21.51% | Range: `1` to `33` | `1`, `2`, `3`, `10`, `5` |
| `bestSprintRaceResult` | `int` | No | 3,279 | 96.24% | Range: `1` to `18` | `8`, `13`, `18`, `9`, `7` |
| `totalRaceEntries` | `int` | No | 0 | 0.0% | Range: `0` to `24` | `6`, `2`, `1`, `4`, `5` |
| `totalRaceStarts` | `int` | No | 0 | 0.0% | Range: `0` to `24` | `6`, `2`, `1`, `4`, `5` |
| `totalRaceWins` | `int` | No | 0 | 0.0% | Range: `0` to `19` | `3`, `0`, `1`, `2`, `6` |
| `totalRaceLaps` | `int` | No | 0 | 0.0% | Range: `0` to `1444` | `317`, `291`, `282`, `80`, `11` |
| `totalPodiums` | `int` | No | 0 | 0.0% | Range: `0` to `21` | `3`, `5`, `1`, `0`, `2` |
| `totalPoints` | `int` | No | 0 | 0.0% | Range: `0` to `575` | `27`, `28`, `30`, `4`, `0` |
| `totalPolePositions` | `int` | No | 0 | 0.0% | Range: `0` to `15` | `4`, `0`, `2`, `1`, `5` |
| `totalFastestLaps` | `int` | No | 0 | 0.0% | Range: `0` to `10` | `3`, `0`, `1`, `5`, `2` |
| `totalSprintRaceStarts` | `int` | No | 0 | 0.0% | Range: `0` to `6` | `0`, `3`, `2`, `1`, `6` |
| `totalSprintRaceWins` | `int` | No | 0 | 0.0% | Range: `0` to `4` | `0`, `2`, `1`, `4` |
| `totalDriverOfTheDay` | `int` | No | 0 | 0.0% | Range: `0` to `8` | `0`, `2`, `1`, `8`, `3` |
| `totalGrandSlams` | `int` | No | 0 | 0.0% | Range: `0` to `3` | `1`, `0`, `3`, `2` |

---

### <a id='f1db-seasons-engine-manufacturers'></a> f1db-seasons-engine-manufacturers.csv

- **Description**: Contains season-level aggregations, historical summaries, and participants. Specifically: `engine manufacturers` details.
- **Total Records (Rows)**: 560
- **Total Columns**: 18

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `year` | `int` | No | 0 | 0.0% | Range: `1950` to `2026` | `1950`, `1951`, `1952`, `1953`, `1954` |
| `engineManufacturerId` | `string` | No | 0 | 0.0% | 78 unique values | `alfa-romeo`, `offenhauser`, `maserati`, `talbot-lago`, `era` |
| `positionNumber` | `int` | No | 175 | 31.25% | Range: `1` to `15` | `3`, `5`, `4`, `2`, `1` |
| `positionText` | `int` | No | 174 | 31.07% | Range: `1` to `15` | `3`, `5`, `4`, `2`, `1` |
| `bestStartingGridPosition` | `int` | No | 9 | 1.61% | Range: `1` to `32` | `1`, `3`, `4`, `10`, `25` |
| `bestRaceResult` | `int` | No | 47 | 8.39% | Range: `1` to `33` | `1`, `3`, `6`, `29`, `4` |
| `bestSprintRaceResult` | `int` | No | 535 | 95.54% | Range: `1` to `15` | `3`, `7`, `1`, `2`, `6` |
| `totalRaceEntries` | `int` | No | 0 | 0.0% | Range: `0` to `24` | `6`, `1`, `3`, `2`, `5` |
| `totalRaceStarts` | `int` | No | 0 | 0.0% | Range: `0` to `24` | `6`, `1`, `3`, `2`, `5` |
| `totalRaceWins` | `int` | No | 0 | 0.0% | Range: `0` to `21` | `6`, `1`, `0`, `4`, `3` |
| `totalRaceLaps` | `int` | No | 0 | 0.0% | Range: `0` to `14658` | `1005`, `3652`, `952`, `1264`, `286` |
| `totalPodiums` | `int` | No | 0 | 0.0% | Range: `0` to `48` | `12`, `3`, `1`, `2`, `0` |
| `totalPodiumRaces` | `int` | No | 0 | 0.0% | Range: `0` to `24` | `6`, `1`, `2`, `0`, `3` |
| `totalPoints` | `int` | No | 0 | 0.0% | Range: `0` to `1528` | `89`, `24`, `11`, `20`, `0` |
| `totalPolePositions` | `int` | No | 0 | 0.0% | Range: `0` to `20` | `6`, `1`, `0`, `4`, `3` |
| `totalFastestLaps` | `int` | No | 0 | 0.0% | Range: `0` to `19` | `6`, `1`, `0`, `7`, `4` |
| `totalSprintRaceStarts` | `int` | No | 0 | 0.0% | Range: `0` to `6` | `0`, `3`, `6` |
| `totalSprintRaceWins` | `int` | No | 0 | 0.0% | Range: `0` to `5` | `0`, `2`, `1`, `5`, `4` |

---

### <a id='f1db-seasons-entrants-chassis'></a> f1db-seasons-entrants-chassis.csv

- **Description**: Contains season-level aggregations, historical summaries, and participants. Specifically: `entrants chassis` details.
- **Total Records (Rows)**: 2,292
- **Total Columns**: 5

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `year` | `int` | No | 0 | 0.0% | Range: `1950` to `2026` | `1950`, `1951`, `1952`, `1953`, `1954` |
| `entrantId` | `string` | No | 0 | 0.0% | 830 unique values | `alfa-romeo-spa`, `andy-granatelli`, `antonio-branca`, `automobiles-talbot-darracq`, `bardahl` |
| `constructorId` | `string` | No | 0 | 0.0% | 187 unique values | `alfa-romeo`, `kurtis-kraft`, `maserati`, `talbot-lago`, `marchese` |
| `engineManufacturerId` | `string` | No | 0 | 0.0% | 78 unique values | `alfa-romeo`, `offenhauser`, `maserati`, `talbot-lago`, `era` |
| `chassisId` | `string` | No | 0 | 0.0% | 1000 unique values | `alfa-romeo-158`, `kurtis-kraft-kk3000`, `maserati-4cl`, `talbot-lago-t26c`, `talbot-lago-t26c-da` |

---

### <a id='f1db-seasons-entrants-constructors'></a> f1db-seasons-entrants-constructors.csv

- **Description**: Contains season-level aggregations, historical summaries, and participants. Specifically: `entrants constructors` details.
- **Total Records (Rows)**: 1,925
- **Total Columns**: 4

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `year` | `int` | No | 0 | 0.0% | Range: `1950` to `2026` | `1950`, `1951`, `1952`, `1953`, `1954` |
| `entrantId` | `string` | No | 0 | 0.0% | 830 unique values | `alfa-romeo-spa`, `andy-granatelli`, `antonio-branca`, `automobiles-talbot-darracq`, `bardahl` |
| `constructorId` | `string` | No | 0 | 0.0% | 187 unique values | `alfa-romeo`, `kurtis-kraft`, `maserati`, `talbot-lago`, `marchese` |
| `engineManufacturerId` | `string` | No | 0 | 0.0% | 78 unique values | `alfa-romeo`, `offenhauser`, `maserati`, `talbot-lago`, `era` |

---

### <a id='f1db-seasons-entrants-drivers'></a> f1db-seasons-entrants-drivers.csv

- **Description**: Contains season-level aggregations, historical summaries, and participants. Specifically: `entrants drivers` details.
- **Total Records (Rows)**: 3,870
- **Total Columns**: 8

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `year` | `int` | No | 0 | 0.0% | Range: `1950` to `2026` | `1950`, `1951`, `1952`, `1953`, `1954` |
| `entrantId` | `string` | No | 0 | 0.0% | 830 unique values | `alfa-romeo-spa`, `andy-granatelli`, `antonio-branca`, `automobiles-talbot-darracq`, `bardahl` |
| `constructorId` | `string` | No | 0 | 0.0% | 187 unique values | `alfa-romeo`, `kurtis-kraft`, `maserati`, `talbot-lago`, `marchese` |
| `engineManufacturerId` | `string` | No | 0 | 0.0% | 78 unique values | `alfa-romeo`, `offenhauser`, `maserati`, `talbot-lago`, `era` |
| `driverId` | `string` | No | 0 | 0.0% | 915 unique values | `juan-manuel-fangio`, `luigi-fagioli`, `nino-farina`, `reg-parnell`, `consalvo-sanesi` |
| `rounds` | `string` | No | 157 | 4.06% | 561 unique values | `1;2;4;5;6;7`, `1`, `7`, `3`, `5` |
| `roundsText` | `string` | No | 157 | 4.06% | 562 unique values | `1-2,4-7`, `1`, `7`, `3`, `5` |
| `testDriver` | `string` | No | 0 | 0.0% | 'false', 'true' | `false`, `true` |

---

### <a id='f1db-seasons-entrants-engines'></a> f1db-seasons-entrants-engines.csv

- **Description**: Contains season-level aggregations, historical summaries, and participants. Specifically: `entrants engines` details.
- **Total Records (Rows)**: 2,027
- **Total Columns**: 5

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `year` | `int` | No | 0 | 0.0% | Range: `1950` to `2026` | `1950`, `1951`, `1952`, `1953`, `1954` |
| `entrantId` | `string` | No | 0 | 0.0% | 830 unique values | `alfa-romeo-spa`, `andy-granatelli`, `antonio-branca`, `automobiles-talbot-darracq`, `bardahl` |
| `constructorId` | `string` | No | 0 | 0.0% | 187 unique values | `alfa-romeo`, `kurtis-kraft`, `maserati`, `talbot-lago`, `marchese` |
| `engineManufacturerId` | `string` | No | 0 | 0.0% | 78 unique values | `alfa-romeo`, `offenhauser`, `maserati`, `talbot-lago`, `era` |
| `engineId` | `string` | No | 0 | 0.0% | 424 unique values | `alfa-romeo-158-15-l8-s`, `offenhauser-45-l4`, `maserati-4cl-15-l4-s`, `talbot-lago-23cv-45-l6`, `era-15-l6-s` |

---

### <a id='f1db-seasons-entrants-tyre-manufacturers'></a> f1db-seasons-entrants-tyre-manufacturers.csv

- **Description**: Contains season-level aggregations, historical summaries, and participants. Specifically: `entrants tyre manufacturers` details.
- **Total Records (Rows)**: 1,955
- **Total Columns**: 5

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `year` | `int` | No | 0 | 0.0% | Range: `1950` to `2026` | `1950`, `1951`, `1952`, `1953`, `1954` |
| `entrantId` | `string` | No | 0 | 0.0% | 830 unique values | `alfa-romeo-spa`, `andy-granatelli`, `antonio-branca`, `automobiles-talbot-darracq`, `bardahl` |
| `constructorId` | `string` | No | 0 | 0.0% | 187 unique values | `alfa-romeo`, `kurtis-kraft`, `maserati`, `talbot-lago`, `marchese` |
| `engineManufacturerId` | `string` | No | 0 | 0.0% | 78 unique values | `alfa-romeo`, `offenhauser`, `maserati`, `talbot-lago`, `era` |
| `tyreManufacturerId` | `string` | No | 0 | 0.0% | 'avon', 'bridgestone', 'continental', 'dunlop', 'englebert', 'firestone', 'goodyear', 'michelin', 'pirelli' | `pirelli`, `firestone`, `dunlop`, `englebert`, `continental` |

---

### <a id='f1db-seasons-entrants'></a> f1db-seasons-entrants.csv

- **Description**: Contains season-level aggregations, historical summaries, and participants. Specifically: `entrants` details.
- **Total Records (Rows)**: 1,799
- **Total Columns**: 3

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `year` | `int` | No | 0 | 0.0% | Range: `1950` to `2026` | `1950`, `1951`, `1952`, `1953`, `1954` |
| `entrantId` | `string` | No | 0 | 0.0% | 830 unique values | `alfa-romeo-spa`, `andy-granatelli`, `antonio-branca`, `automobiles-talbot-darracq`, `bardahl` |
| `countryId` | `string` | No | 0 | 0.0% | 31 unique values | `italy`, `united-states-of-america`, `switzerland`, `france`, `united-kingdom` |

---

### <a id='f1db-seasons-tyre-manufacturers'></a> f1db-seasons-tyre-manufacturers.csv

- **Description**: Contains season-level aggregations, historical summaries, and participants. Specifically: `tyre manufacturers` details.
- **Total Records (Rows)**: 160
- **Total Columns**: 15

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `year` | `int` | No | 0 | 0.0% | Range: `1950` to `2026` | `1950`, `1951`, `1952`, `1953`, `1954` |
| `tyreManufacturerId` | `string` | No | 0 | 0.0% | 'avon', 'bridgestone', 'continental', 'dunlop', 'englebert', 'firestone', 'goodyear', 'michelin', 'pirelli' | `pirelli`, `firestone`, `dunlop`, `englebert`, `continental` |
| `bestStartingGridPosition` | `int` | No | 0 | 0.0% | Range: `1` to `22` | `1`, `4`, `10`, `7`, `3` |
| `bestRaceResult` | `int` | No | 6 | 3.75% | Range: `1` to `11` | `1`, `3`, `4`, `2`, `5` |
| `bestSprintRaceResult` | `int` | No | 154 | 96.25% | Range: `1` to `1` | `1` |
| `totalRaceEntries` | `int` | No | 0 | 0.0% | Range: `1` to `24` | `6`, `1`, `3`, `7`, `4` |
| `totalRaceStarts` | `int` | No | 0 | 0.0% | Range: `1` to `24` | `6`, `1`, `3`, `7`, `4` |
| `totalRaceWins` | `int` | No | 0 | 0.0% | Range: `0` to `24` | `6`, `1`, `0`, `7`, `8` |
| `totalRaceLaps` | `int` | No | 0 | 0.0% | Range: `24` to `26544` | `2280`, `3704`, `1996`, `81`, `2767` |
| `totalPodiums` | `int` | No | 0 | 0.0% | Range: `0` to `72` | `16`, `3`, `2`, `0`, `19` |
| `totalPodiumRaces` | `int` | No | 0 | 0.0% | Range: `0` to `24` | `6`, `1`, `2`, `0`, `7` |
| `totalPolePositions` | `int` | No | 0 | 0.0% | Range: `0` to `24` | `6`, `1`, `0`, `7`, `8` |
| `totalFastestLaps` | `int` | No | 0 | 0.0% | Range: `0` to `24` | `6`, `1`, `0`, `7`, `8` |
| `totalSprintRaceStarts` | `int` | No | 0 | 0.0% | Range: `0` to `6` | `0`, `3`, `6` |
| `totalSprintRaceWins` | `int` | No | 0 | 0.0% | Range: `0` to `6` | `0`, `3`, `6` |

---

### <a id='f1db-seasons'></a> f1db-seasons.csv

- **Description**: Core entity reference table for F1: `seasons` details.
- **Total Records (Rows)**: 77
- **Total Columns**: 1

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `year` | `int` | ✅ Yes | 0 | 0.0% | Range: `1950` to `2026` | `1950`, `1951`, `1952`, `1953`, `1954` |

---

### <a id='f1db-tyre-manufacturers'></a> f1db-tyre-manufacturers.csv

- **Description**: Core entity reference table for F1: `tyre manufacturers` details.
- **Total Records (Rows)**: 9
- **Total Columns**: 16

#### Schema Definition & Columns

| Column Name | Type | Inferred PK | Nulls | Null % | Range / Unique Values | Sample Values |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `id` | `string` | ✅ Yes | 0 | 0.0% | 'avon', 'bridgestone', 'continental', 'dunlop', 'englebert', 'firestone', 'goodyear', 'michelin', 'pirelli' | `avon`, `bridgestone`, `continental`, `dunlop`, `englebert` |
| `name` | `string` | ✅ Yes | 0 | 0.0% | 'Avon', 'Bridgestone', 'Continental', 'Dunlop', 'Englebert', 'Firestone', 'Goodyear', 'Michelin', 'Pirelli' | `Avon`, `Bridgestone`, `Continental`, `Dunlop`, `Englebert` |
| `countryId` | `string` | No | 0 | 0.0% | 'belgium', 'france', 'germany', 'italy', 'japan', 'united-kingdom', 'united-states-of-america' | `united-kingdom`, `japan`, `germany`, `belgium`, `united-states-of-america` |
| `bestStartingGridPosition` | `int` | No | 0 | 0.0% | Range: `1` to `2` | `2`, `1` |
| `bestRaceResult` | `int` | No | 0 | 0.0% | Range: `1` to `5` | `5`, `1` |
| `bestSprintRaceResult` | `int` | No | 8 | 88.89% | Range: `1` to `1` | `1` |
| `totalRaceEntries` | `int` | ✅ Yes | 0 | 0.0% | Range: `13` to `520` | `32`, `244`, `13`, `177`, `60` |
| `totalRaceStarts` | `int` | ✅ Yes | 0 | 0.0% | Range: `13` to `515` | `28`, `244`, `13`, `175`, `60` |
| `totalRaceWins` | `int` | ✅ Yes | 0 | 0.0% | Range: `0` to `368` | `0`, `175`, `10`, `84`, `8` |
| `totalRaceLaps` | `int` | ✅ Yes | 0 | 0.0% | Range: `2232` to `410604` | `2961`, `173435`, `2232`, `84698`, `11016` |
| `totalPodiums` | `int` | ✅ Yes | 0 | 0.0% | Range: `0` to `1139` | `0`, `482`, `18`, `241`, `40` |
| `totalPodiumRaces` | `int` | ✅ Yes | 0 | 0.0% | Range: `0` to `459` | `0`, `209`, `11`, `104`, `26` |
| `totalPolePositions` | `int` | ✅ Yes | 0 | 0.0% | Range: `0` to `362` | `0`, `168`, `8`, `77`, `11` |
| `totalFastestLaps` | `int` | ✅ Yes | 0 | 0.0% | Range: `0` to `372` | `0`, `170`, `9`, `83`, `12` |
| `totalSprintRaceStarts` | `int` | No | 0 | 0.0% | Range: `0` to `27` | `0`, `27` |
| `totalSprintRaceWins` | `int` | No | 0 | 0.0% | Range: `0` to `27` | `0`, `27` |

---
