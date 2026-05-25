import alasql from 'alasql';
import Papa from 'papaparse';

export interface TableMetadata {
  name: string;
  file: string;
  isCore: boolean;
  status: 'unloaded' | 'loading' | 'loaded' | 'error';
  rowCount: number;
  sizeBytes: number;
  loadTimeMs: number;
}

export const F1_TABLES: Record<string, TableMetadata> = {
  races: { name: 'races', file: 'races.csv', isCore: true, status: 'unloaded', rowCount: 0, sizeBytes: 174296, loadTimeMs: 0 },
  drivers: { name: 'drivers', file: 'drivers.csv', isCore: true, status: 'unloaded', rowCount: 0, sizeBytes: 95706, loadTimeMs: 0 },
  constructors: { name: 'constructors', file: 'constructors.csv', isCore: true, status: 'unloaded', rowCount: 0, sizeBytes: 17863, loadTimeMs: 0 },
  circuits: { name: 'circuits', file: 'circuits.csv', isCore: true, status: 'unloaded', rowCount: 0, sizeBytes: 10285, loadTimeMs: 0 },
  results: { name: 'results', file: 'results.csv', isCore: true, status: 'unloaded', rowCount: 0, sizeBytes: 1684211, loadTimeMs: 0 },
  status: { name: 'status', file: 'status.csv', isCore: true, status: 'unloaded', rowCount: 0, sizeBytes: 2293, loadTimeMs: 0 },
  seasons: { name: 'seasons', file: 'seasons.csv', isCore: true, status: 'unloaded', rowCount: 0, sizeBytes: 4818, loadTimeMs: 0 },
  
  lap_times: { name: 'lap_times', file: 'lap_times.csv', isCore: false, status: 'unloaded', rowCount: 0, sizeBytes: 25306282, loadTimeMs: 0 },
  pit_stops: { name: 'pit_stops', file: 'pit_stops.csv', isCore: false, status: 'unloaded', rowCount: 0, sizeBytes: 785803, loadTimeMs: 0 },
  qualifying: { name: 'qualifying', file: 'qualifying.csv', isCore: false, status: 'unloaded', rowCount: 0, sizeBytes: 463403, loadTimeMs: 0 },
  driver_standings: { name: 'driver_standings', file: 'driver_standings.csv', isCore: false, status: 'unloaded', rowCount: 0, sizeBytes: 864582, loadTimeMs: 0 },
  constructor_standings: { name: 'constructor_standings', file: 'constructor_standings.csv', isCore: false, status: 'unloaded', rowCount: 0, sizeBytes: 311058, loadTimeMs: 0 },
  constructor_results: { name: 'constructor_results', file: 'constructor_results.csv', isCore: false, status: 'unloaded', rowCount: 0, sizeBytes: 238011, loadTimeMs: 0 },
  sprint_results: { name: 'sprint_results', file: 'sprint_results.csv', isCore: false, status: 'unloaded', rowCount: 0, sizeBytes: 36334, loadTimeMs: 0 },
  safety_cars: { name: 'safety_cars', file: 'safety_cars.csv', isCore: false, status: 'unloaded', rowCount: 0, sizeBytes: 16934, loadTimeMs: 0 },
  red_flags: { name: 'red_flags', file: 'red_flags.csv', isCore: false, status: 'unloaded', rowCount: 0, sizeBytes: 14969, loadTimeMs: 0 },
  fatal_accidents_drivers: { name: 'fatal_accidents_drivers', file: 'fatal_accidents_drivers.csv', isCore: false, status: 'unloaded', rowCount: 0, sizeBytes: 3316, loadTimeMs: 0 },
  fatal_accidents_marshalls: { name: 'fatal_accidents_marshalls', file: 'fatal_accidents_marshalls.csv', isCore: false, status: 'unloaded', rowCount: 0, sizeBytes: 307, loadTimeMs: 0 }
};

// UI update callback to trigger re-renders
let uiUpdateCallback: (() => void) | null = null;

export function registerUIUpdateCallback(callback: () => void) {
  uiUpdateCallback = callback;
}

function notifyUI() {
  if (uiUpdateCallback) {
    uiUpdateCallback();
  }
}

// Convert bytes to human-readable string
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Fetch and parse a CSV file, then register it in AlaSQL
export async function loadTable(tableName: string): Promise<void> {
  const table = F1_TABLES[tableName];
  if (!table) return;

  if (table.status === 'loaded' || table.status === 'loading') return;

  table.status = 'loading';
  notifyUI();

  const startTime = performance.now();
  try {
    // CSV files are in the parent /data folder
    // When served by Vite, they are accessed at "../data/filename.csv" relative to the page
    const response = await fetch(`./data/${table.file}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();
    
    return new Promise<void>((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true, // Parse numbers as numbers, booleans as booleans
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data as Record<string, unknown>[];
          
          // Register with AlaSQL
          alasql.tables[tableName] = {
            data: rows
          };

          table.status = 'loaded';
          table.rowCount = rows.length;
          table.loadTimeMs = Math.round(performance.now() - startTime);
          
          console.log(`[Database] Loaded table '${tableName}' with ${table.rowCount} rows in ${table.loadTimeMs}ms`);
          notifyUI();
          resolve();
        },
        error: (error: any) => {
          table.status = 'error';
          notifyUI();
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error(`[Database] Error loading table '${tableName}':`, error);
    table.status = 'error';
    notifyUI();
    throw error;
  }
}

// Load all core tables upfront
export async function loadCoreTables(onProgress?: (loaded: number, total: number) => void): Promise<void> {
  const coreTables = Object.values(F1_TABLES).filter(t => t.isCore);
  const total = coreTables.length;
  let loaded = 0;

  console.log('[Database] Loading core metadata tables...');
  
  for (const table of coreTables) {
    try {
      await loadTable(table.name);
      loaded++;
      if (onProgress) {
        onProgress(loaded, total);
      }
    } catch (e) {
      console.error(`[Database] Failed to load core table ${table.name}`, e);
    }
  }
  console.log('[Database] Core metadata tables loading completed.');
}

// Ensure required tables are loaded before running query
export async function ensureTablesLoaded(tableNames: string[], onTableLoadStart?: (tableName: string) => void): Promise<void> {
  for (const tableName of tableNames) {
    const table = F1_TABLES[tableName];
    if (table && table.status !== 'loaded') {
      if (onTableLoadStart) {
        onTableLoadStart(tableName);
      }
      await loadTable(tableName);
    }
  }
}

// Execute query using AlaSQL
export function executeSQL(sqlQuery: string): Record<string, unknown>[] {
  const startTime = performance.now();
  try {
    // AlaSQL executes queries directly on registered tables
    const results = alasql(sqlQuery) as any;
    const timeTaken = performance.now() - startTime;
    console.log(`[Database] Executed query in ${timeTaken.toFixed(2)}ms, returned ${results?.length || 0} rows.`);
    return (results as Record<string, unknown>[]) || [];
  } catch (error) {
    console.error(`[Database] SQL execution error:`, error);
    throw error;
  }
}
