export interface ModelMetadata {
  name: string;
  displayName: string;
  description: string;
}

export interface SQLGenerationResponse {
  sql: string;
  requiredTables: string[];
  chartSuggestion: {
    type: 'bar' | 'line' | 'pie' | 'none';
    xKey: string;
    yKey: string;
    label: string;
  };
  suggestions: string[];
}

export interface ConversationContext {
  role: 'user' | 'model';
  text: string;
}

// System prompt describing the complete database schema and query instructions
const SYSTEM_PROMPT_SQL = `
You are an elite Formula 1 data analyst. Your job is to translate a user's natural language question into a valid, standard SQL query for an in-memory database, and identify which tables are required.

Here is the exact schema of the Formula 1 database (18 tables):

1. **circuits** (circuitId [INT], circuitRef [TEXT], name [TEXT], location [TEXT], country [TEXT], lat [REAL], lng [REAL], alt [INT])
2. **constructors** (constructorId [INT], constructorRef [TEXT], name [TEXT], nationality [TEXT])
3. **drivers** (driverId [INT], driverRef [TEXT], number [INT], code [TEXT], forename [TEXT], surname [TEXT], dob [TEXT], nationality [TEXT])
4. **races** (raceId [INT], year [INT], round [INT], circuitId [INT], name [TEXT], date [TEXT], time [TEXT])
5. **results** (resultId [INT], raceId [INT], driverId [INT], constructorId [INT], number [INT], grid [INT], position [INT], positionText [TEXT], positionOrder [INT], points [REAL], laps [INT], time [TEXT], milliseconds [INT], fastestLap [INT], rank [INT], fastestLapTime [TEXT], fastestLapSpeed [REAL], statusId [INT])
6. **status** (statusId [INT], status [TEXT] - e.g. "Finished", "Accident", "Spun off", "Engine")
7. **seasons** (year [INT], url [TEXT])
8. **lap_times** (raceId [INT], driverId [INT], lap [INT], position [INT], time [TEXT], milliseconds [INT])
9. **pit_stops** (raceId [INT], driverId [INT], stop [INT], lap [INT], time [TEXT], duration [REAL], milliseconds [INT])
10. **qualifying** (qualifyId [INT], raceId [INT], driverId [INT], constructorId [INT], number [INT], position [INT], q1 [TEXT], q2 [TEXT], q3 [TEXT])
11. **driver_standings** (driverStandingsId [INT], raceId [INT], driverId [INT], points [REAL], position [INT], wins [INT])
12. **constructor_standings** (constructorStandingsId [INT], raceId [INT], constructorId [INT], points [REAL], position [INT], wins [INT])
13. **constructor_results** (constructorResultsId [INT], raceId [INT], constructorId [INT], points [REAL], status [TEXT])
14. **sprint_results** (resultId [INT], raceId [INT], driverId [INT], constructorId [INT], number [INT], grid [INT], position [INT], positionText [TEXT], positionOrder [INT], points [REAL], laps [INT], time [TEXT], milliseconds [INT], fastestLap [INT], fastestLapTime [TEXT], statusId [INT], rank [INT])
15. **safety_cars** (Race [TEXT], Cause [TEXT], Deployed [INT], Retreated [INT], FullLaps [INT])
16. **red_flags** (Race [TEXT], Lap [INT], Resumed [TEXT], Incident [TEXT], Excluded [TEXT])
17. **fatal_accidents_drivers** (Driver [TEXT], Age [INT], Date Of Accident [TEXT], Event [TEXT], Car [TEXT], Session [TEXT])
18. **fatal_accidents_marshalls** (Name [TEXT], Age [INT], Date Of Accident [TEXT], Event [TEXT])

---

### CRITICAL QUERY RULES:
1. **Combine Data via JOINs**: When a query requires multiple tables, JOIN them on primary/foreign keys:
   - \`results\` connects to \`drivers\` via \`driverId\`.
   - \`results\` connects to \`races\` via \`raceId\`.
   - \`results\` connects to \`constructors\` via \`constructorId\`.
   - \`results\` connects to \`status\` via \`statusId\`.
   - \`races\` connects to \`circuits\` via \`circuitId\`.
   - \`lap_times\` and \`pit_stops\` connect to \`races\` via \`raceId\` and \`drivers\` via \`driverId\`.
   - \`qualifying\` connects to \`drivers\` via \`driverId\` and \`constructors\` via \`constructorId\`.
2. **AlaSQL Compatibility**: Use standard standard ANSI SQL. Groupings, joins, orderings, aggregates work perfectly. Do not use advanced database-specific syntax.
3. **Strings**: Use exact case or \`LOWER()\` for string searches. For F1 drivers, \`driverRef\` is lowercase and hyphenated (e.g., 'hamilton', 'max_verstappen', 'vettel', 'leclerc'). Always query \`driverRef\` or \`constructorRef\` for filters if possible!
4. **Wins & Podiums**:
   - A race win is defined by \`results.position = 1\` or \`results.positionOrder = 1\`.
   - A podium finish is defined by \`results.position IN (1, 2, 3)\` or \`results.positionOrder IN (1, 2, 3)\`.
5. **Time / Duration Metrics**:
   - In \`lap_times\`, \`milliseconds\` is an integer. ALWAYS use \`milliseconds\` for calculations, sorting, averages, and comparisons.
   - In \`pit_stops\`, \`milliseconds\` is an integer. ALWAYS use \`milliseconds\` for averages, sums, and comparisons.
6. **Output Format**: You MUST output a clean, parsable JSON block. No markdown tags, no backticks, no wrap-ups, just raw JSON.
7. **Suggestions**: Provide 2-3 logical, interesting, and brief follow-up questions relevant to the user's query and F1 database schema under "suggestions".

JSON Structure:
{
  "sql": "SELECT drivers.forename, drivers.surname, COUNT(*) AS wins FROM results JOIN drivers ON results.driverId = drivers.driverId WHERE results.position = 1 GROUP BY drivers.forename, drivers.surname ORDER BY wins DESC LIMIT 5",
  "requiredTables": ["results", "drivers"],
  "chartSuggestion": {
    "type": "bar",
    "xKey": "surname",
    "yKey": "wins",
    "label": "Top 5 Race Winners in F1 History"
  },
  "suggestions": [
    "Who is the active driver with the most wins?",
    "How many wins did they score with each constructor?"
  ]
}

Use "type": "none" for charts if the result is a single number, a text name, or not plottable.
`;

// Dynamic discovery of Google Gemini models
export async function fetchAvailableModels(apiKey: string): Promise<ModelMetadata[]> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    if (!data.models) return [];

    // Filter for Gemini models that support generateContent
    return data.models
      .filter((model: any) => 
        model.name.includes('gemini') && 
        model.supportedGenerationMethods.includes('generateContent') &&
        !model.name.includes('vision') &&
        !model.name.includes('embedding')
      )
      .map((model: any) => ({
        name: model.name.replace('models/', ''),
        displayName: model.displayName,
        description: model.description
      }));
  } catch (error) {
    console.error('[AI] Error fetching Gemini models:', error);
    // Return standard fallback models in case the request fails
    return [
      { name: 'gemini-1.5-flash', displayName: 'Gemini 1.5 Flash (Default)', description: 'Fast and lightweight' },
      { name: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro', description: 'Advanced reasoning' },
      { name: 'gemini-2.0-flash-exp', displayName: 'Gemini 2.0 Flash (Experimental)', description: 'Next generation speed' }
    ];
  }
}

// Call Gemini to generate SQL and Required Tables
export async function generateSQL(
  userQuery: string,
  apiKey: string,
  modelName: string,
  history?: ConversationContext[]
): Promise<SQLGenerationResponse> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  
  // Format history context cleanly
  let historyPrompt = "";
  if (history && history.length > 0) {
    historyPrompt = "\n\n[CONVERSATION HISTORY]\n" + history.map(h => {
      const prefix = h.role === 'user' ? 'User Question' : 'Assistant SQL';
      return `${prefix}: "${h.text}"`;
    }).join('\n') + "\n\n";
  }

  const payload = {
    contents: [
      {
        parts: [
          { text: SYSTEM_PROMPT_SQL },
          { text: `${historyPrompt}User Question: "${userQuery}"\n\nGenerate the SQL query JSON:` }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API returned status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error('Gemini API returned an empty response.');
    }

    return JSON.parse(responseText.trim()) as SQLGenerationResponse;
  } catch (error) {
    console.error('[AI] SQL Generation failed:', error);
    throw error;
  }
}

// SQL Self-Healing: Correct failed SQL based on error log
export async function selfHealSQL(
  userQuery: string,
  failedSql: string,
  errorMessage: string,
  apiKey: string,
  modelName: string,
  history?: ConversationContext[]
): Promise<SQLGenerationResponse> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  
  let historyPrompt = "";
  if (history && history.length > 0) {
    historyPrompt = "\n\n[CONVERSATION HISTORY]\n" + history.map(h => {
      const prefix = h.role === 'user' ? 'User Question' : 'Assistant SQL';
      return `${prefix}: "${h.text}"`;
    }).join('\n') + "\n\n";
  }

  const healingPrompt = `
You are an expert F1 database debugger. A SQL query you generated for AlaSQL in-memory database failed with an error.

${historyPrompt}
Original User Question: "${userQuery}"
Failed SQL Query:
\`\`\`sql
${failedSql}
\`\`\`

Execution Error Message: "${errorMessage}"

Review the schema carefully and fix the query so that it executes perfectly in AlaSQL. 
Make sure table and column names exactly match the schema.
Only return a corrected JSON block.

JSON Structure:
{
  "sql": "CORRECTED_SQL_QUERY",
  "requiredTables": ["drivers", "results", ...],
  "chartSuggestion": { ... },
  "suggestions": [ ... ]
}
  `;

  const payload = {
    contents: [
      {
        parts: [
          { text: SYSTEM_PROMPT_SQL },
          { text: healingPrompt }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  try {
    console.log(`[AI] Attempting SQL Self-Healing for error: "${errorMessage}"`);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Self-healing failed: HTTP ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(responseText.trim()) as SQLGenerationResponse;
  } catch (error) {
    console.error('[AI] Self-healing failed:', error);
    throw error;
  }
}

// Call Gemini to write a natural language summary of the query results
export async function generateSummary(
  userQuery: string,
  sqlQuery: string,
  rows: Record<string, unknown>[],
  apiKey: string,
  modelName: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  
  // Truncate rows if too large to prevent blowing up tokens
  const maxRowsForSummary = rows.slice(0, 40);
  const dataString = JSON.stringify(maxRowsForSummary, null, 2);

  const prompt = `
You are an expert F1 sports commentator and analyst. Write an engaging, highly detailed, and accurate summary of the following data findings to answer the user's question.

User Question: "${userQuery}"
SQL Query Executed: \`${sqlQuery}\`
Total Rows Found: ${rows.length}

Data Results (first 40 rows):
\`\`\`json
${dataString}
\`\`\`

Instructions:
1. Provide a direct, friendly, and complete answer in plain English.
2. Adopt a knowledgeable F1 commentator tone. Highlight fascinating insights (e.g. key winners, surprising differences, or season dominance) if applicable.
3. Keep the summary detailed but concise (2 to 4 paragraphs is ideal).
4. Do not include markdown tables or code blocks in your answer. Use normal paragraph structure with clean lists if necessary.
  `;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return summary || "Unable to generate summary.";
  } catch (error) {
    console.error('[AI] Summary generation failed:', error);
    return `Query executed successfully, returning ${rows.length} rows. Unable to generate AI summary at this time.`;
  }
}
