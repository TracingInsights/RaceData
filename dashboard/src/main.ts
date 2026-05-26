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
  SQLGenerationResponse,
  ConversationContext
} from './ai';
import { renderChart, renderMultiDatasetChart, clearAllCharts } from './chart';

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

// Added for chat thread management and suggestions
const newChatBtn = document.getElementById('new-chat-btn') as HTMLButtonElement;
const threadListContainer = document.getElementById('thread-list') as HTMLDivElement;
const suggestionsChipsContainer = document.getElementById('suggestions-chips-container') as HTMLDivElement;

// Chat Thread Structures
export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  sqlResponse?: SQLGenerationResponse;
  sqlResults?: Record<string, unknown>[];
  timeTakenMs?: number;
  loadDurationMs?: number;
  logs?: string[];
  errorMessage?: string;
}

export interface ChatThread {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
}

// Application State variables
let apiKey = localStorage.getItem('f1_api_key') || '';
let selectedModel = localStorage.getItem('f1_model') || 'gemini-1.5-flash';
let messageCounter = 0;

let threads: ChatThread[] = [];
let activeThreadId: string | null = null;

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

  setupThreadManagement();
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

// ============================================================
// Thread / Chat History Management
// ============================================================

const STORAGE_KEY = 'f1_chat_threads';
const MAX_RESULTS_STORED = 100;

function saveThreadsToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  } catch (e) {
    console.warn('[Threads] Could not save threads to localStorage (quota exceeded?):', e);
  }
}

function loadThreadsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      threads = JSON.parse(raw) as ChatThread[];
    }
  } catch (e) {
    console.warn('[Threads] Could not load threads from localStorage:', e);
    threads = [];
  }
}

function generateThreadId(): string {
  return `thread_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getActiveThread(): ChatThread | undefined {
  return threads.find(t => t.id === activeThreadId);
}

function createNewThread() {
  // Clear chat UI
  clearAllCharts();
  chatContainer.innerHTML = '';
  if (welcomeSlate) {
    const welcomeClone = welcomeSlate.cloneNode(true) as HTMLDivElement;
    welcomeClone.id = 'welcome-slate';
    welcomeClone.style.display = '';
    chatContainer.appendChild(welcomeClone);
    // Re-bind preset cards on the new clone
    welcomeClone.querySelectorAll('.preset-card').forEach(card => {
      card.addEventListener('click', () => {
        const query = card.getAttribute('data-query');
        if (query) {
          queryInput.value = query;
          chatForm.requestSubmit();
        }
      });
    });
  }

  // Create and store new thread
  const newThread: ChatThread = {
    id: generateThreadId(),
    title: 'New Analysis',
    createdAt: Date.now(),
    messages: []
  };
  threads.unshift(newThread);
  activeThreadId = newThread.id;
  messageCounter = 0;
  saveThreadsToStorage();
  renderThreadList();
  renderStarterChips();
  console.log('[Threads] Created new thread:', newThread.id);
}

function selectThread(threadId: string) {
  const thread = threads.find(t => t.id === threadId);
  if (!thread) return;

  activeThreadId = threadId;
  messageCounter = thread.messages.length;

  // Clear and re-render all messages
  clearAllCharts();
  chatContainer.innerHTML = '';
  suggestionsChipsContainer.innerHTML = '';

  if (thread.messages.length === 0) {
    if (welcomeSlate) {
      const welcomeClone = welcomeSlate.cloneNode(true) as HTMLDivElement;
      welcomeClone.id = 'welcome-slate';
      chatContainer.appendChild(welcomeClone);
      welcomeClone.querySelectorAll('.preset-card').forEach(card => {
        card.addEventListener('click', () => {
          const query = card.getAttribute('data-query');
          if (query) { queryInput.value = query; chatForm.requestSubmit(); }
        });
      });
    }
    renderStarterChips();
    renderThreadList();
    return;
  }

  thread.messages.forEach(msg => {
    if (msg.role === 'user') {
      appendUserMessageDOM(msg.text);
    } else if (msg.role === 'assistant') {
      if (msg.errorMessage) {
        appendErrorMessageDOM(msg.id, msg.errorMessage, '');
      } else if (msg.sqlResponse) {
        appendBotReport(
          msg.id,
          msg.text,
          msg.sqlResponse.sql ? `*Loaded from history* — ${msg.text}` : '',
          msg.sqlResponse,
          msg.sqlResults || [],
          msg.timeTakenMs || 0,
          msg.loadDurationMs || 0,
          msg.logs || [],
          false // suppress saving again on re-render
        );
      }
    }
  });

  // Show last suggestions if available
  const lastAiMsg = [...thread.messages].reverse().find(m => m.role === 'assistant' && m.sqlResponse?.suggestions?.length);
  if (lastAiMsg?.sqlResponse?.suggestions) {
    renderSuggestionChips(lastAiMsg.sqlResponse.suggestions);
  }

  renderThreadList();
  chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
}

function deleteThread(threadId: string) {
  threads = threads.filter(t => t.id !== threadId);
  if (activeThreadId === threadId) {
    activeThreadId = null;
    createNewThread();
  } else {
    saveThreadsToStorage();
    renderThreadList();
  }
}

function addMessageToActiveThread(msg: ChatMessage) {
  const thread = getActiveThread();
  if (!thread) return;
  // Truncate stored results to cap storage size
  if (msg.sqlResults && msg.sqlResults.length > MAX_RESULTS_STORED) {
    msg.sqlResults = msg.sqlResults.slice(0, MAX_RESULTS_STORED);
  }
  thread.messages.push(msg);
  // Auto-update thread title based on first user message
  if (thread.title === 'New Analysis' && msg.role === 'user') {
    thread.title = msg.text.length > 50 ? msg.text.substring(0, 47) + '...' : msg.text;
  }
  saveThreadsToStorage();
  renderThreadList();
}

function renderThreadList() {
  threadListContainer.innerHTML = '';

  if (threads.length === 0) {
    threadListContainer.innerHTML = '<div class="text-xs text-slate-500 italic py-2">No active sessions</div>';
    return;
  }

  threads.forEach(thread => {
    const item = document.createElement('div');
    const isActive = thread.id === activeThreadId;
    item.className = `group flex items-center justify-between rounded px-2.5 py-2 cursor-pointer transition text-xs ${
      isActive
        ? 'bg-f1-red bg-opacity-20 border border-f1-red border-opacity-40 text-white'
        : 'hover:bg-slate-800 text-slate-300 hover:text-white border border-transparent'
    }`;

    const msgCount = thread.messages.filter(m => m.role === 'user').length;
    item.innerHTML = `
      <div class="flex items-center min-w-0 flex-1 mr-2">
        <i class="fa-solid fa-comments text-[10px] ${isActive ? 'text-f1-red' : 'text-slate-600 group-hover:text-slate-400'} mr-2 flex-shrink-0"></i>
        <div class="min-w-0">
          <span class="block truncate font-medium text-[11px]">${thread.title}</span>
          <span class="text-[9px] text-slate-500">${msgCount} quer${msgCount === 1 ? 'y' : 'ies'}</span>
        </div>
      </div>
      <button class="delete-thread-btn flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-400 transition text-slate-500" data-thread-id="${thread.id}">
        <i class="fa-solid fa-trash-can text-[9px]"></i>
      </button>
    `;

    // Click on item body = select thread
    item.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.delete-thread-btn')) {
        selectThread(thread.id);
      }
    });

    // Click on delete button = delete thread
    const deleteBtn = item.querySelector('.delete-thread-btn') as HTMLButtonElement;
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Delete "${thread.title}"?`)) {
          deleteThread(thread.id);
        }
      });
    }

    threadListContainer.appendChild(item);
  });
}

// Render starter suggestion chips above chat input (when chat is empty)
function renderStarterChips() {
  const starters = [
    'Who has the most podiums in F1 history?',
    'Average pitstop time per constructor in 2023',
    'Top 5 fastest laps ever at Monza',
    'Safety car appearances per season since 2010',
    'Hamilton vs Verstappen — points year by year'
  ];
  suggestionsChipsContainer.innerHTML = '';

  const label = document.createElement('span');
  label.className = 'text-[10px] text-slate-500 font-mono uppercase mr-1 flex-shrink-0';
  label.textContent = 'Try:';
  suggestionsChipsContainer.appendChild(label);

  starters.forEach(starter => {
    const chip = document.createElement('button');
    chip.className = 'suggestion-chip bg-slate-800 hover:bg-f1-red text-slate-300 hover:text-white text-[10px] font-mono px-2.5 py-1 rounded-full border border-slate-700 hover:border-f1-red transition truncate max-w-[200px]';
    chip.textContent = starter;
    chip.title = starter;
    chip.addEventListener('click', () => {
      queryInput.value = starter;
      queryInput.focus();
      chatForm.requestSubmit();
    });
    suggestionsChipsContainer.appendChild(chip);
  });
}

// Render dynamic follow-up suggestion chips (after bot report)
function renderSuggestionChips(suggestions: string[]) {
  suggestionsChipsContainer.innerHTML = '';

  if (!suggestions || suggestions.length === 0) return;

  const label = document.createElement('span');
  label.className = 'text-[10px] text-slate-500 font-mono uppercase mr-1 flex-shrink-0 animate-pulse';
  label.innerHTML = '<i class="fa-solid fa-lightbulb text-f1-red mr-1"></i>Next:';
  suggestionsChipsContainer.appendChild(label);

  suggestions.forEach(suggestion => {
    const chip = document.createElement('button');
    chip.className = 'suggestion-chip bg-slate-800 hover:bg-f1-red text-slate-300 hover:text-white text-[10px] font-mono px-2.5 py-1 rounded-full border border-slate-700 hover:border-f1-red transition truncate max-w-[240px]';
    chip.textContent = suggestion;
    chip.title = suggestion;
    chip.addEventListener('click', () => {
      queryInput.value = suggestion;
      queryInput.focus();
      chatForm.requestSubmit();
    });
    suggestionsChipsContainer.appendChild(chip);
  });
}

function setupThreadManagement() {
  loadThreadsFromStorage();

  if (threads.length > 0) {
    // Restore last active thread
    activeThreadId = threads[0].id;
    selectThread(activeThreadId);
  } else {
    createNewThread();
  }

  newChatBtn.addEventListener('click', () => {
    createNewThread();
  });
}

// ============================================================
// Map clicking quick start preset cards to immediate search
// ============================================================
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

    // Ensure there is an active thread; if not, create one
    if (!activeThreadId) {
      createNewThread();
    }

    // Hide welcome panel on first interaction
    const currentWelcomeSlate = chatContainer.querySelector('#welcome-slate') as HTMLDivElement | null;
    if (currentWelcomeSlate) {
      currentWelcomeSlate.style.display = 'none';
    }

    // Save user message to thread and append to DOM
    const currentMsgId = ++messageCounter;
    addMessageToActiveThread({ id: currentMsgId, role: 'user', text: query });
    appendUserMessageDOM(query);
    queryInput.value = '';
    suggestionsChipsContainer.innerHTML = '';

    // Activate loading indicators
    queryLoaderPanel.classList.remove('hidden');
    queryLoaderStatus.textContent = 'Translating question to SQL...';
    dbLoadStatusInline.textContent = '';
    submitBtn.disabled = true;

    const startTime = performance.now();

    let sqlResponse: SQLGenerationResponse | null = null;
    let sqlResults: Record<string, unknown>[] = [];
    let loadDuration = 0;
    let loadLogs: string[] = [];

    // Build conversation history context for follow-up support
    const thread = getActiveThread();
    const history: ConversationContext[] = (thread?.messages || [])
      .filter(m => m.role === 'user' || (m.role === 'assistant' && m.sqlResponse))
      .slice(-8) // last 4 exchanges = 8 messages max to limit token count
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.role === 'user' ? m.text : (m.sqlResponse?.sql || '')
      }));

    try {
      // 1. Generate SQL via Gemini (with history context)
      sqlResponse = await generateSQL(query, apiKey, selectedModel, history);
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
        
        const healedResponse = await selfHealSQL(query, sqlResponse.sql, errorMessage, apiKey, selectedModel, history);
        
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

      // 6. Save assistant message to active thread
      addMessageToActiveThread({
        id: currentMsgId,
        role: 'assistant',
        text: query,
        sqlResponse,
        sqlResults,
        timeTakenMs: totalTime,
        loadDurationMs: loadDuration,
        logs: loadLogs
      });

      // 7. Render the full composite Bot Report
      appendBotReport(
        currentMsgId,
        query,
        summaryText,
        sqlResponse,
        sqlResults,
        totalTime,
        loadDuration,
        loadLogs,
        true // save to thread flag (already saved, just for clarity)
      );

    } catch (err: any) {
      console.error('[Orchestrator] Error processing request:', err);
      addMessageToActiveThread({
        id: currentMsgId,
        role: 'assistant',
        text: query,
        errorMessage: err.message || 'An unexpected error occurred.'
      });
      appendErrorMessageDOM(
        currentMsgId,
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

// Append User Chat Bubble (DOM only — no thread save)
function appendUserMessageDOM(text: string) {
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

// Keep backward compatibility (used by preset re-render)
export function appendUserMessage(text: string) {
  appendUserMessageDOM(text);
}

// Append Bot Error Message Card (DOM only — no thread save)
function appendErrorMessageDOM(_id: number, message: string, sql: string) {
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
          ${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
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

// Keep backward compat
export function appendErrorMessage(_id: number, _query: string, message: string, sql: string) {
  appendErrorMessageDOM(_id, message, sql);
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
  logs: string[],
  _saveFlag = true
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

      // Premium Touch: Multi-Series / Multi-Dataset Charting detection
      // If we have at least 3 columns, and one is string-based grouping category with 2-12 unique values:
      let groupKey: string | null = null;
      let uniqueGroups: string[] = [];
      
      if (keys.length >= 3) {
        for (const key of keys) {
          if (key !== xKey && key !== yKey) {
            const uniqueVals = Array.from(new Set(rows.map(r => String(r[key]))))
              .filter(v => v !== 'null' && v !== 'undefined' && v.trim() !== '');
            if (uniqueVals.length >= 2 && uniqueVals.length <= 12) {
              groupKey = key;
              uniqueGroups = uniqueVals;
              break;
            }
          }
        }
      }

      if (groupKey && uniqueGroups.length > 0) {
        // Group the data by groupKey
        // Extract all unique X values and sort them
        const xValues = Array.from(new Set(rows.map(r => r[xKey])))
          .filter(x => x !== null && x !== undefined);
        
        // Sort X values (numerically if possible, otherwise string sort)
        xValues.sort((a: any, b: any) => {
          const numA = Number(a);
          const numB = Number(b);
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          }
          return String(a).localeCompare(String(b));
        });

        const labels = xValues.map(x => String(x));

        // Create a dataset for each unique group
        const datasets = uniqueGroups.map(group => {
          const data = xValues.map(x => {
            const matchingRow = rows.find(r => String(r[groupKey!]) === group && r[xKey] === x);
            return matchingRow ? Number(matchingRow[yKey]) : 0;
          });
          return {
            label: group,
            data: data
          };
        });

        renderMultiDatasetChart(
          `${reportId}-canvas`,
          response.chartSuggestion.type,
          labels,
          datasets,
          response.chartSuggestion.label || 'Analytics Comparison'
        );
      } else {
        // Fallback to standard single series chart
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
      }
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

  // Render dynamic follow-up suggestion chips after report
  if (response.suggestions && response.suggestions.length > 0) {
    renderSuggestionChips(response.suggestions);
  }

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
