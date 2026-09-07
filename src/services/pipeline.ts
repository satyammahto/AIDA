import Papa from "papaparse";
import { ProcessedDataset } from "../types";
import { detectColumnProfiles } from "./typeDetector";
import { cleanDataset } from "./cleaner";
import { runMLEngine } from "./mlEngine";
import { generateAutomatedDashboard } from "./dashboardEngine";
import { generateExecutiveSummary } from "./summaryGenerator";

export function parseRawInputToRows(rawInput: string): Record<string, any>[] {
  const trimmed = rawInput.trim();
  if (!trimmed) return [];

  // 1. JSON Array or JSON Object with nested array
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object") {
        return parsed.filter((r) => r && typeof r === "object");
      }
      if (typeof parsed === "object" && parsed !== null) {
        // Look for common array keys
        for (const key of ["data", "records", "rows", "items", "results", "values", "payload"]) {
          if (Array.isArray(parsed[key]) && parsed[key].length > 0 && typeof parsed[key][0] === "object") {
            return parsed[key].filter((r: any) => r && typeof r === "object");
          }
        }
        // Check any top-level key containing an array of objects
        for (const val of Object.values(parsed)) {
          if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object") {
            return val.filter((r: any) => r && typeof r === "object");
          }
        }
      }
    } catch {
      // Not valid JSON, continue to tabular parsing
    }
  }

  // 2. NDJSON (Newline-delimited JSON)
  const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1 && lines[0].startsWith("{") && lines[0].endsWith("}")) {
    try {
      const ndjsonRows = lines
        .map((l) => {
          try {
            return JSON.parse(l);
          } catch {
            return null;
          }
        })
        .filter((r): r is Record<string, any> => r !== null && typeof r === "object");

      if (ndjsonRows.length > 0) return ndjsonRows;
    } catch {
      // Continue to tabular parsing
    }
  }

  // 3. Tabular Delimited (CSV, TSV, Semicolon, Pipe)
  const cleaned = trimmed.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const parsed2D = Papa.parse(cleaned, {
    header: false,
    skipEmptyLines: "greedy",
    delimitersToGuess: [",", ";", "\t", "|"],
  });

  const matrix = parsed2D.data as any[][];
  if (!matrix || matrix.length === 0) return [];

  // Find real header index: row with maximum non-empty cells among the first 15 rows
  let headerIndex = 0;
  let maxCols = 0;
  for (let i = 0; i < Math.min(15, matrix.length); i++) {
    const row = matrix[i];
    if (!Array.isArray(row)) continue;
    const nonEmptyCount = row.filter((c) => c !== null && c !== undefined && String(c).trim() !== "").length;
    if (nonEmptyCount > maxCols) {
      maxCols = nonEmptyCount;
      headerIndex = i;
    }
  }

  const rawHeaders = (matrix[headerIndex] || []).map((h, idx) => {
    const s = String(h ?? "")
      .trim()
      .replace(/^["']|["']$/g, "");
    return s || `Column_${idx + 1}`;
  });

  // Deduplicate header names
  const seen = new Set<string>();
  const headers = rawHeaders.map((h) => {
    let name = h;
    let count = 2;
    while (seen.has(name.toLowerCase())) {
      name = `${h}_${count++}`;
    }
    seen.add(name.toLowerCase());
    return name;
  });

  const rawRows: Record<string, any>[] = [];
  for (let r = headerIndex + 1; r < matrix.length; r++) {
    const row = matrix[r];
    if (!Array.isArray(row)) continue;
    // Skip row if completely empty
    if (!row.some((c) => c !== null && c !== undefined && String(c).trim() !== "")) continue;

    const obj: Record<string, any> = {};
    headers.forEach((h, colIdx) => {
      const val = row[colIdx];
      obj[h] = val !== undefined && val !== null ? val : "";
    });
    rawRows.push(obj);
  }

  if (rawRows.length === 0) return [];

  // Drop columns where 100% of rows are empty and header is an auto-generated or blank column
  const activeHeaders = headers.filter((h) => {
    const hasAnyValue = rawRows.some((r) => {
      const v = r[h];
      return v !== null && v !== undefined && String(v).trim() !== "";
    });
    return hasAnyValue;
  });

  if (activeHeaders.length === 0) return rawRows;

  return rawRows.map((r) => {
    const cleanRecord: Record<string, any> = {};
    for (const h of activeHeaders) {
      cleanRecord[h] = r[h];
    }
    return cleanRecord;
  });
}

export async function processRawDataset(
  rawInput: string,
  datasetName: string = "Automated Records"
): Promise<ProcessedDataset> {
  // Step 1: Robust Tabular Parsing
  const rawRows = parseRawInputToRows(rawInput);

  if (rawRows.length === 0) {
    throw new Error(
      "No valid records could be detected in the provided dataset. Please check that the file contains a header row and at least one row of data."
    );
  }

  // Step 2: Automatic Column Type Inference & Statistical Profiling
  const columnProfiles = detectColumnProfiles(rawRows);

  // Step 3: Automated Dataset Cleaning (Deduplication, Imputation, Normalization)
  const { cleanedRows, audit, updatedColumns } = cleanDataset(rawRows, columnProfiles);

  // Step 4: Machine Learning Techniques (Correlations, K-Means Clustering, Outlier Detection)
  const { mlInsights, enrichedRows } = runMLEngine(cleanedRows, updatedColumns);

  // Step 5: Automated Visual Dashboard Generation
  const widgets = generateAutomatedDashboard(enrichedRows, updatedColumns, mlInsights);

  // Step 6: Executive Plain-Language Summary
  const summary = await generateExecutiveSummary(
    datasetName,
    rawRows.length,
    enrichedRows.length,
    updatedColumns,
    audit,
    mlInsights,
    enrichedRows
  );

  return {
    name: datasetName,
    rawRows,
    cleanedRows: enrichedRows,
    columns: updatedColumns,
    audit,
    ml: mlInsights,
    widgets,
    summary,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}
