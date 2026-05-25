import { 
  F1_TABLES, 
  loadCoreTables, 
  ensureTablesLoaded, 
  executeSQL, 
  registerUIUpdateCallback,
  formatBytes 
} from './db';
import { 
  fetchAvailableModels, 
  generateSQL, 
  selfHealSQL, 
  generateSummary,
  SQLGenerationResponse 
} from './ai';
import { renderChart } from './chart';

// DOM elements references
const apiKeyInput = document.getElementById('api-key') as HTMLInputElement;
const toggleApiKeyBtn = document.getElementById('toggle-api-key') as HTMLButtonElement;
const modelSelector = document.getElementById('model-selector') as HTMLSelectElement;
const dbStatusList = document.getElementById('db-status-list') as HTMLDivElement;
const loadProgressPill = document.getElementById('load-progress-pill') as HTMLSpanElement;
const chatContainer = document.getElementById('chat-container') as HTMLDivElement;
const welcomeSlate = document.getElementById('welcome-slate') as HTMLDivElement;
const chatForm = document.getElementById('chat-form') as HTMLFormElement;
const queryInput = document.getElementById('query-input') as HTMLInputElement;
const queryLoaderPanel = document.getElementById('query-loader-panel') as HTMLDivElement;
const queryLoaderStatus = document.getElementById('query-loader-status') as HTMLSpanElement;
const dbLoadStatusInline = document.getElementById('db-load-status-inline') as HTMLDivElement;
const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;

// Application State variables
let apiKey = localStorage.getItem('f1_api_key') || '';
let selectedModel = localStorage.getItem('f1_model') || 'gemini-1.5-flash';
let messageCounter = 0;

// Initialize Page Logic
window.addEventListener('DOMContentLoaded', async () => {
  setupAPIKeyHandlers();
  registerUIUpdateCallback(renderDatabaseSidebar);
  renderDatabaseSidebar();

  // Load API key from memory and list models
  if (apiKey) {
    apiKeyInput.value = apiKey;
    loadProgressPill.textContent = 'Booting Core...';
    await refreshModelList();
  }

  // Pre-load core tables automatically
  try {
    loadProgressPill.textContent = 'Loading Core...';
    await loadCoreTables((loaded, total) => {
      loadProgressPill.textContent = `Core ${loaded}/${total}`;
    });
    loadProgressPill.textContent = 'Live & Ready';
    loadProgressPill.classList.remove('bg-slate-800');
    loadProgressPill.classList.add('bg-green-950', 'text-green-300', 'border', 'border-green-800');
  } catch (error) {
    console.error('Failed to load core tables:', error);
    loadProgressPill.textContent = 'Load Fail';
    loadProgressPill.classList.add('bg-red-950', 'text-red-300', 'border', 'border-red-800');
  }

  setupPresetHandlers();
  setupChatHandlers();
});

// Configure API Key visibility & persistence
function setupAPIKeyHandlers() {
  toggleApiKeyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const type = apiKeyInput.type === 'password' ? 'text' : 'password';
    apiKeyInput.type = type;
    const icon = toggleApiKeyBtn.querySelector('i');
    if (icon) {
      icon.className = type === 'password' ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash';
    }
  });

  apiKeyInput.addEventListener('input', async () => {
    apiKey = apiKeyInput.value.trim();
    localStorage.setItem('f1_api_key', apiKey);
    console.log('[UI] API Key input detected, refreshing models...');
    if (apiKey) {
      await refreshModelList();
    } else {
      modelSelector.innerHTML = '<option value="pending">Enter API Key first...</option>';
    }
  });

  modelSelector.addEventListener('change', () => {
    selectedModel = modelSelector.value;
    localStorage.setItem('f1_model', selectedModel);
  });
}

// Fetch model list from Google API dynamically
async function refreshModelList() {
  if (!apiKey) return;
  modelSelector.innerHTML = '<option value="loading">Fetching live models...</option>';
  
  const models = await fetchAvailableModels(apiKey);
  modelSelector.innerHTML = '';
  
  if (models.length === 0) {
    modelSelector.innerHTML = '<option value="gemini-1.5-flash">Gemini 1.5 Flash (Fallback)</option>';
    return;
  }

  models.forEach(model => {
    const opt = document.createElement('option');
    opt.value = model.name;
    opt.textContent = model.displayName;
    if (model.name === selectedModel) {
      opt.selected = true;
    }
    modelSelector.appendChild(opt);
  });

  // Ensure selectedModel points to a valid option
  selectedModel = modelSelector.value;
}

// Render the reactive sidebar showing loaded status for all files
function renderDatabaseSidebar() {
  dbStatusList.innerHTML = '';
  
  Object.values(F1_TABLES).forEach(table => {
    const card = document.createElement('div');
    card.className = 'flex items-center justify-between p-3 rounded bg-slate-900 bg-opacity-40 border border-slate-800 text-xs hover:border-slate-700 transition';
    
    // Icon mapping based on status
    let statusIcon = '<span class="w-2.5 h-2.5 rounded-full bg-slate-600 mr-2 flex-shrink-0"></span>'; // Unloaded
    if (table.status === 'loading') {
      statusIcon = '<i class="fa-solid fa-circle-notch fa-spin text-f1-red text-xs mr-2 flex-shrink-0"></i>';
    } else if (table.status === 'loaded') {
      statusIcon = '<span class="w-2.5 h-2.5 rounded-full bg-green-500 mr-2 flex-shrink-0 animate-pulse shadow-[0_0_8px_#22c55e]"></span>';
    } else if (table.status === 'error') {
      statusIcon = '<i class="fa-solid fa-circle-xmark text-red-500 text-xs mr-2 flex-shrink-0"></i>';
    }

    card.innerHTML = `
      <div class="flex items-center min-w-0">
        ${statusIcon}
        <div class="truncate">
          <span class="font-semibold text-slate-200 font-mono">${table.name}</span>
          <span class="text-[10px] text-slate-500 block">${table.file}</span>
        </div>
      </div>
      <div class="text-right text-[10px] text-slate-400 font-mono">
        ${table.status === 'loaded' 
          ? `<div>${table.rowCount.toLocaleString()} rows</div><div class="text-[9px] text-slate-500">${table.loadTimeMs}ms</div>` 
          : `<div>${formatBytes(table.sizeBytes)}</div>`
        }
      </div>
    `;

    dbStatusList.appendChild(card);
  });
}

// Map clicking quick start preset cards to immediate search
function setupPresetHandlers() {
  document.querySelectorAll('.preset-card').forEach(card => {
    card.addEventListener('click', () => {
      const query = card.getAttribute('data-query');
      if (query) {
        queryInput.value = query;
        chatForm.requestSubmit();
      }
    });
  });
}

// Coordinate query submissions and bot responses
function setupChatHandlers() {
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = queryInput.value.trim();
    if (!query) return;

    if (!apiKey) {
      alert('Please configure your Google AI Studio API Key in the left sidebar first!');
      return;
    }

    // Hide welcome panel on first interaction
    if (welcomeSlate) {
      welcomeSlate.style.display = 'none';
    }

    // Append User Question bubble
    appendUserMessage(query);
    queryInput.value = '';
    
    // Activate loading indicators
    queryLoaderPanel.classList.remove('hidden');
    queryLoaderStatus.textContent = 'Translating question to SQL...';
    dbLoadStatusInline.textContent = '';
    submitBtn.disabled = true;

    const currentMsgId = ++messageCounter;
    const startTime = performance.now();

    let sqlResponse: SQLGenerationResponse | null = null;
    let sqlResults: Record<string, unknown>[] = [];
    let loadDuration = 0;
    let loadLogs: string[] = [];

    try {
      // 1. Generate SQL via Gemini
      sqlResponse = await generateSQL(query, apiKey, selectedModel);
      console.log('[Orchestrator] Generated SQL Query:', sqlResponse.sql);

      // 2. Fetch and parse any un-loaded tables on-demand
      if (sqlResponse.requiredTables && sqlResponse.requiredTables.length > 0) {
        queryLoaderStatus.textContent = 'Loading required datasets on-demand...';
        
        const loadStart = performance.now();
        await ensureTablesLoaded(sqlResponse.requiredTables, (tableToLoad) => {
          const tableMeta = F1_TABLES[tableToLoad];
          dbLoadStatusInline.textContent = `[Loading ${tableMeta?.file || tableToLoad}]`;
          loadLogs.push(`Loaded un-cached dataset: ${tableMeta?.file || tableToLoad}`);
        });
        loadDuration = Math.round(performance.now() - loadStart);
      }

      // 3. Execute SQL Query via AlaSQL
      queryLoaderStatus.textContent = 'Executing query inside local database...';
      try {
        sqlResults = executeSQL(sqlResponse.sql);
      } catch (sqlError: any) {
        // 4. SQL Self-Healing: If SQL execution fails, attempt correction loop
        queryLoaderStatus.textContent = 'SQL failed. Activating AI self-healing correction...';
        dbLoadStatusInline.textContent = '[Healing SQL]';
        
        const errorMessage = sqlError.message || String(sqlError);
        console.warn('[Orchestrator] Direct execution failed. Triggering Self-Healing:', errorMessage);
        
        const healedResponse = await selfHealSQL(query, sqlResponse.sql, errorMessage, apiKey, selectedModel);
        
        // Load any new required tables if the self-healed query has new table JOINs
        if (healedResponse.requiredTables && healedResponse.requiredTables.length > 0) {
          await ensureTablesLoaded(healedResponse.requiredTables, (tableToLoad) => {
            const tableMeta = F1_TABLES[tableToLoad];
            loadLogs.push(`Loaded un-cached dataset (healing): ${tableMeta?.file || tableToLoad}`);
          });
        }

        // Retry the self-healed query
        sqlResponse = healedResponse;
        sqlResults = executeSQL(sqlResponse.sql);
        loadLogs.push(`Self-healing successfully corrected query to: ${sqlResponse.sql}`);
      }

      // 5. Generate Natural Language Summary
      queryLoaderStatus.textContent = 'Summarizing findings and statistics...';
      dbLoadStatusInline.textContent = '[Analyzing Data]';
      const summaryText = await generateSummary(query, sqlResponse.sql, sqlResults, apiKey, selectedModel);
      
      const totalTime = Math.round(performance.now() - startTime);

      // 6. Render the massive composite Bot Report
      appendBotReport(
        currentMsgId,
        query,
        summaryText,
        sqlResponse,
        sqlResults,
        totalTime,
        loadDuration,
        loadLogs
      );

    } catch (err: any) {
      console.error('[Orchestrator] Error processing request:', err);
      appendErrorMessage(
        currentMsgId,
        query,
        err.message || 'An unexpected error occurred during processing.',
        sqlResponse?.sql || ''
      );
    } finally {
      queryLoaderPanel.classList.add('hidden');
      submitBtn.disabled = false;
      chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
    }
  });
}

// Append User Chat Bubble
function appendUserMessage(text: string) {
  const container = document.createElement('div');
  container.className = 'flex items-start space-x-4 max-w-3xl ml-auto justify-end';
  
  container.innerHTML = `
    <div class="space-y-1">
      <span class="text-xs text-slate-400 font-mono text-right block uppercase">YOU</span>
      <div class="bg-f1-lightgray text-slate-100 rounded-lg rounded-tr-none px-5 py-3 border border-slate-800 shadow-md text-sm font-medium">
        ${text}
      </div>
    </div>
    <div class="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 font-outfit text-xs">
      DR
    </div>
  `;
  chatContainer.appendChild(container);
  chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
}

// Append Bot Error Message Card
function appendErrorMessage(_id: number, _query: string, message: string, sql: string) {
  const container = document.createElement('div');
  container.className = 'flex items-start space-x-4 max-w-4xl mr-auto';
  
  container.innerHTML = `
    <div class="w-10 h-10 rounded-full bg-f1-red bg-opacity-25 border border-f1-red flex items-center justify-center font-extrabold text-f1-red font-outfit text-xs animate-pulse shadow-[0_0_10px_rgba(225,6,0,0.3)]">
      AI
    </div>
    <div class="flex-1 space-y-1">
      <span class="text-xs text-f1-red font-semibold font-mono tracking-wider uppercase block">ANALYTICS ERROR</span>
      <div class="f1-carbon-border rounded-lg rounded-tl-none p-6 border-red-900 border-opacity-40 text-sm space-y-4">
        <p class="text-slate-300 font-medium">
          Apologies, the query execution encountered a critical exception:
        </p>
        <div class="bg-red-950 bg-opacity-40 text-red-300 border border-red-900 border-opacity-35 px-4 py-3 rounded font-mono text-xs overflow-x-auto">
          ${message}
        </div>
        ${sql ? `
        <div class="space-y-1">
          <span class="text-[10px] text-slate-400 font-mono block uppercase">FAILED SQL:</span>
          <pre class="bg-slate-950 text-slate-400 px-3 py-2 rounded text-[11px] overflow-x-auto font-mono max-h-40 scrollbar-thin border border-slate-900">${sql}</pre>
        </div>
        ` : ''}
        <p class="text-xs text-slate-400">
          Try re-phrasing the question to clarify required filters or fields (e.g. qualify years or specific driver names).
        </p>
      </div>
    </div>
  `;
  chatContainer.appendChild(container);
}

// Render full F1 Carbon visual dashboard report card in chat
function appendBotReport(
  id: number,
  query: string,
  summary: string,
  response: SQLGenerationResponse,
  rows: Record<string, unknown>[],
  timeTakenMs: number,
  loadDurationMs: number,
  logs: string[]
) {
  const container = document.createElement('div');
  container.className = 'flex items-start space-x-4 max-w-5xl mr-auto w-full';
  
  // Format summary to include racing red accents
  const formattedSummary = summary.replace(/\*\*(.*?)\*\*/g, '<b class="text-white font-semibold font-outfit">$1</b>');

  const reportId = `report-${id}`;
  
  container.innerHTML = `
    <div class="w-10 h-10 rounded-full bg-f1-red text-white flex items-center justify-center font-extrabold font-outfit text-xs shadow-[0_0_12px_rgba(225,6,0,0.5)]">
      AI
    </div>
    <div class="flex-1 space-y-1 min-w-0">
      <span class="text-xs text-f1-red font-semibold font-mono tracking-wider uppercase block">ANALYSIS REPORT</span>
      
      <!-- Premium Glass Panel Card -->
      <div class="f1-carbon-border rounded-lg rounded-tl-none p-6 space-y-6 shadow-2xl relative overflow-hidden">
        
        <!-- Subtle F1 Accent Bar -->
        <div class="absolute left-0 top-0 bottom-0 w-1 bg-f1-red"></div>

        <!-- Section 1: NL summary response -->
        <div class="space-y-2">
          <h3 class="text-lg font-bold font-outfit text-white leading-tight uppercase tracking-tight flex items-center">
            <i class="fa-solid fa-flag-checkered mr-2 text-f1-red"></i> Analytical Overview
          </h3>
          <div class="text-slate-300 text-sm leading-relaxed whitespace-pre-line space-y-4">
            ${formattedSummary}
          </div>
        </div>

        <!-- Section 2: Render Multi-Tab Visual Panel -->
        <div class="space-y-4 pt-4 border-t border-slate-800">
          
          <!-- Tab Headers -->
          <div class="flex border-b border-slate-800 text-xs uppercase font-mono font-semibold" role="tablist">
            <button id="${reportId}-tab-chart" class="px-4 py-2 border-b-2 border-f1-red text-white flex items-center transition" role="tab" aria-selected="true">
              <i class="fa-solid fa-chart-bar mr-2"></i> Chart Visual
            </button>
            <button id="${reportId}-tab-table" class="px-4 py-2 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center transition" role="tab" aria-selected="false">
              <i class="fa-solid fa-table mr-2"></i> Data Grid
            </button>
            <button id="${reportId}-tab-diag" class="px-4 py-2 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center transition" role="tab" aria-selected="false">
              <i class="fa-solid fa-sliders mr-2"></i> Diagnostics
            </button>
          </div>

          <!-- Tab Panels -->
          <div class="min-h-[300px] flex flex-col">
            
            <!-- Panel 1: Chart -->
            <div id="${reportId}-panel-chart" class="flex-1 block h-[300px]">
              ${response.chartSuggestion && response.chartSuggestion.type !== 'none' && rows.length > 0
                ? `<div class="w-full h-full relative p-2"><canvas id="${reportId}-canvas" class="w-full h-full"></canvas></div>`
                : `<div class="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center p-8 border border-dashed border-slate-800 rounded">
                     <i class="fa-solid fa-circle-info text-xl mb-2 text-slate-600"></i>
                     No visualization recommended for this tabular format.<br>
                     (Ideal for comparisons, bar graphs, and line mappings over years).
                   </div>`
              }
            </div>

            <!-- Panel 2: Table -->
            <div id="${reportId}-panel-table" class="flex-1 hidden">
              <div class="flex justify-between items-center mb-3">
                <span class="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-semibold">
                  Returned ${rows.length} rows of data
                </span>
                ${rows.length > 0 ? `
                <button id="${reportId}-btn-download" class="bg-slate-800 hover:bg-f1-red text-slate-200 hover:text-white px-3 py-1.5 rounded text-[10px] font-mono flex items-center transition uppercase">
                  <i class="fa-solid fa-download mr-1.5"></i> Export CSV
                </button>
                ` : ''}
              </div>
              
              <div class="overflow-x-auto max-h-[320px] scrollbar-thin border border-slate-800 rounded">
                <table class="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr class="bg-slate-900 border-b border-slate-800 text-[10px] uppercase text-slate-400 font-semibold sticky top-0 z-10">
                      ${rows.length > 0 
                        ? Object.keys(rows[0]).map(key => `
                            <th class="px-4 py-2 border-r border-slate-800 cursor-pointer hover:bg-slate-850 hover:text-white select-none relative" data-key="${key}">
                              ${key} <i class="fa-solid fa-sort ml-1 opacity-40"></i>
                            </th>`).join('') 
                        : '<th class="px-4 py-2">No Records Found</th>'
                      }
                    </tr>
                  </thead>
                  <tbody id="${reportId}-tbody" class="divide-y divide-slate-800 bg-slate-900 bg-opacity-25">
                    ${rows.length > 0 
                      ? renderTableRows(rows) 
                      : '<tr><td class="px-4 py-4 text-slate-500 text-center">Query succeeded but returned empty dataset.</td></tr>'
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Panel 3: Diagnostics / SQL logs -->
            <div id="${reportId}-panel-diag" class="flex-1 hidden space-y-4 text-xs font-mono">
              <div class="grid grid-cols-2 gap-4 text-[11px]">
                <div class="p-3 bg-slate-900 bg-opacity-40 rounded border border-slate-800">
                  <span class="text-slate-400 block uppercase text-[9px] mb-1 font-semibold">Total Time</span>
                  <span class="text-white font-bold">${timeTakenMs.toLocaleString()} ms</span>
                </div>
                <div class="p-3 bg-slate-900 bg-opacity-40 rounded border border-slate-800">
                  <span class="text-slate-400 block uppercase text-[9px] mb-1 font-semibold">On-Demand Dataset Loading</span>
                  <span class="text-white font-bold">${loadDurationMs.toLocaleString()} ms</span>
                </div>
              </div>

              <!-- Executed SQL Code Panel -->
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] text-slate-400 uppercase font-semibold">Executed SQL (AlaSQL)</span>
                  <button id="${reportId}-btn-copy-sql" class="text-slate-500 hover:text-white text-[10px] flex items-center transition uppercase">
                    <i class="fa-solid fa-copy mr-1"></i> Copy SQL
                  </button>
                </div>
                <pre class="bg-slate-950 text-cyan-400 border border-slate-900 px-4 py-3 rounded overflow-x-auto text-[11px] leading-relaxed max-h-40 scrollbar-thin">${response.sql}</pre>
              </div>

              <!-- Loader Logs -->
              ${logs.length > 0 ? `
              <div class="space-y-1">
                <span class="text-[10px] text-slate-400 uppercase font-semibold block">Execution & Cache Logs</span>
                <div class="bg-slate-950 text-slate-400 px-4 py-3 rounded border border-slate-900 leading-relaxed text-[10px] space-y-1">
                  ${logs.map(log => `<div class="flex items-center"><span class="w-1 h-1 rounded-full bg-cyan-400 mr-2"></span>${log}</div>`).join('')}
                </div>
              </div>
              ` : ''}
            </div>

          </div>
        </div>

      </div>
    </div>
  `;
  chatContainer.appendChild(container);
  
  // Attach interactive tab listeners
  const tabs = ['chart', 'table', 'diag'];
  tabs.forEach(tab => {
    const button = document.getElementById(`${reportId}-tab-${tab}`) as HTMLButtonElement;
    button.addEventListener('click', () => {
      // Toggle button active states
      tabs.forEach(t => {
        const btn = document.getElementById(`${reportId}-tab-${t}`) as HTMLButtonElement;
        const panel = document.getElementById(`${reportId}-panel-${t}`) as HTMLDivElement;
        if (t === tab) {
          btn.className = "px-4 py-2 border-b-2 border-f1-red text-white flex items-center transition";
          btn.setAttribute('aria-selected', 'true');
          panel.className = t === 'chart' ? "flex-1 block h-[300px]" : "flex-1 block";
        } else {
          btn.className = "px-4 py-2 border-b-2 border-transparent text-slate-400 hover:text-slate-200 flex items-center transition";
          btn.setAttribute('aria-selected', 'false');
          panel.className = "flex-1 hidden";
        }
      });
    });
  });

  // Attach CSV Download listener
  if (rows.length > 0) {
    const downloadBtn = document.getElementById(`${reportId}-btn-download`) as HTMLButtonElement;
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        const cleanedFileName = query.toLowerCase().replace(/[^a-z0-9_]+/g, '_').substring(0, 40);
        downloadCSV(rows, `f1_analysis_${cleanedFileName}.csv`);
      });
    }
  }

  // Attach Copy SQL listener
  const copyBtn = document.getElementById(`${reportId}-btn-copy-sql`) as HTMLButtonElement;
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(response.sql);
      const icon = copyBtn.querySelector('i');
      if (icon) {
        icon.className = 'fa-solid fa-check text-green-500 mr-1';
        setTimeout(() => {
          icon.className = 'fa-solid fa-copy mr-1';
        }, 2000);
      }
    });
  }

  // Initialize canvas charting if chart recommended
  if (response.chartSuggestion && response.chartSuggestion.type !== 'none' && rows.length > 0) {
    try {
      const keys = Object.keys(rows[0]);
      // Use LLM designated keys or fallback to first two keys
      const xKey = response.chartSuggestion.xKey && keys.includes(response.chartSuggestion.xKey)
        ? response.chartSuggestion.xKey 
        : keys[0];
      const yKey = response.chartSuggestion.yKey && keys.includes(response.chartSuggestion.yKey)
        ? response.chartSuggestion.yKey 
        : keys[1];

      // Exclude null values from chart datasets
      const chartRows = rows.filter(r => r[xKey] !== null && r[yKey] !== null);
      const labels = chartRows.map(r => String(r[xKey]));
      const values = chartRows.map(r => Number(r[yKey]));

      renderChart(
        `${reportId}-canvas`,
        response.chartSuggestion.type,
        labels,
        values,
        response.chartSuggestion.label || 'Analytics Curve'
      );
    } catch (chartErr) {
      console.error('[Orchestrator] Charting failed:', chartErr);
    }
  }

  // Attach interactive sorting to Table columns
  const tableHeaders = container.querySelectorAll(`#${reportId}-panel-table th`);
  let sortDirection = 1;
  tableHeaders.forEach(th => {
    th.addEventListener('click', () => {
      const sortKey = th.getAttribute('data-key');
      if (!sortKey) return;
      sortDirection *= -1; // toggle

      const sortedRows = [...rows].sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        
        return valA < valB ? -sortDirection : sortDirection;
      });

      // Rerender table body
      const tbody = document.getElementById(`${reportId}-tbody`) as HTMLTableSectionElement;
      if (tbody) {
        tbody.innerHTML = renderTableRows(sortedRows);
      }
      
      // Update icons
      tableHeaders.forEach(header => {
        const icon = header.querySelector('i');
        if (icon) {
          icon.className = header === th 
            ? (sortDirection === 1 ? 'fa-solid fa-sort-up text-f1-red' : 'fa-solid fa-sort-down text-f1-red')
            : 'fa-solid fa-sort ml-1 opacity-40';
        }
      });
    });
  });

  chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
}

// Convert JSON rows into HTML rows for table
function renderTableRows(rows: Record<string, unknown>[]): string {
  return rows.map(row => `
    <tr class="hover:bg-slate-800 hover:bg-opacity-40 transition">
      ${Object.values(row).map(val => `
        <td class="px-4 py-2 border-r border-slate-800 border-opacity-40 truncate max-w-xs text-slate-300">
          ${val === null || val === undefined ? '<span class="text-slate-600 font-sans italic">null</span>' : val}
        </td>`).join('')}
    </tr>`).join('');
}

// Helper to convert rows to standard CSV text and trigger download
function downloadCSV(rows: Record<string, any>[], filename: string) {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      headers.map(fieldName => {
        const val = row[fieldName];
        if (val === null || val === undefined) return '';
        const valStr = String(val);
        return valStr.includes(',') || valStr.includes('\n') || valStr.includes('"')
          ? `"${valStr.replace(/"/g, '""')}"` 
          : valStr;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
