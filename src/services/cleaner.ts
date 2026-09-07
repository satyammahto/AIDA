import { CleaningAction, CleaningAudit, ColumnProfile } from "../types";
import { parseCleanNumber, isMissingValue, parseDateSafe, detectColumnProfiles } from "./typeDetector";

export interface CleanDatasetResult {
  cleanedRows: Record<string, any>[];
  audit: CleaningAudit;
  updatedColumns: ColumnProfile[];
}

export function cleanDataset(
  rawRows: Record<string, any>[],
  columnProfiles: ColumnProfile[]
): CleanDatasetResult {
  if (!rawRows || rawRows.length === 0) {
    return {
      cleanedRows: [],
      audit: {
        rawRowCount: 0,
        cleanedRowCount: 0,
        duplicatesRemoved: 0,
        missingValuesImputed: 0,
        formatsNormalized: 0,
        actions: [],
        rawHealthScore: 100,
        cleanedHealthScore: 100,
      },
      updatedColumns: [],
    };
  }

  // If column profiles are empty, generate them automatically
  let effectiveProfiles = columnProfiles;
  if (!effectiveProfiles || effectiveProfiles.length === 0) {
    effectiveProfiles = detectColumnProfiles(rawRows);
  }

  const actions: CleaningAction[] = [];
  let formatsNormalizedCount = 0;
  let missingImputedCount = 0;

  // Step 1: Calculate raw quality metrics
  let rawNullCells = 0;
  const rawTotalCells = rawRows.length * (effectiveProfiles.length || 1);

  for (const row of rawRows) {
    for (const col of effectiveProfiles) {
      const v = row[col.name];
      if (isMissingValue(v)) {
        rawNullCells++;
      }
    }
  }

  // Step 2: Exact Duplicate Removal
  const seenRowHashes = new Set<string>();
  const uniqueRows: Record<string, any>[] = [];
  let duplicatesRemoved = 0;

  for (const row of rawRows) {
    // Generate normalized string representation for duplicate checking
    const hash = effectiveProfiles
      .map((col) => `${col.name}:${String(row[col.name] ?? "").trim().toLowerCase()}`)
      .join("|");

    if (seenRowHashes.has(hash)) {
      duplicatesRemoved++;
    } else {
      seenRowHashes.add(hash);
      uniqueRows.push({ ...row });
    }
  }

  if (duplicatesRemoved > 0) {
    actions.push({
      type: "duplicate_removed",
      count: duplicatesRemoved,
      details: `Removed ${duplicatesRemoved} exact duplicate row${duplicatesRemoved > 1 ? "s" : ""} to prevent statistical skew.`,
    });
  }

  // Step 3: Column-by-Column Formatting & Imputation Strategies
  const imputationMap: Record<string, any> = {};
  const caseCorrectionMap: Record<string, Record<string, string>> = {};

  for (const col of effectiveProfiles) {
    if (col.type === "numeric") {
      const impValue = col.median !== undefined ? col.median : (col.mean ?? 0);
      imputationMap[col.name] = impValue;
    } else if (col.type === "categorical" || col.type === "boolean") {
      const topCat = col.topCategories?.[0]?.value;
      imputationMap[col.name] = topCat || "Unknown";

      // Build case canonicalization map
      const lowerMap: Record<string, { original: string; count: number }> = {};
      for (const row of uniqueRows) {
        const val = row[col.name];
        if (!isMissingValue(val)) {
          const s = String(val).trim();
          const lower = s.toLowerCase();
          if (!lowerMap[lower]) {
            lowerMap[lower] = { original: s, count: 1 };
          } else {
            lowerMap[lower].count++;
          }
        }
      }

      const colCaseFix: Record<string, string> = {};
      for (const [lower, info] of Object.entries(lowerMap)) {
        const canonical =
          info.original.charAt(0).toUpperCase() + info.original.slice(1).toLowerCase();
        colCaseFix[lower] = canonical;
      }
      caseCorrectionMap[col.name] = colCaseFix;
    } else if (col.type === "date") {
      imputationMap[col.name] = col.minDate || new Date().toISOString().split("T")[0];
    } else {
      imputationMap[col.name] = "N/A";
    }
  }

  // Apply transformations
  const cleanedRows: Record<string, any>[] = [];

  for (const row of uniqueRows) {
    const cleanedRow: Record<string, any> = {};

    for (const col of effectiveProfiles) {
      const val = row[col.name];
      const missing = isMissingValue(val);

      if (missing) {
        cleanedRow[col.name] = imputationMap[col.name];
        missingImputedCount++;
      } else if (col.type === "numeric") {
        const originalStr = String(val);
        const parsed = parseCleanNumber(val);
        if (isNaN(parsed)) {
          cleanedRow[col.name] = imputationMap[col.name];
          missingImputedCount++;
        } else {
          cleanedRow[col.name] = parsed;
          if (originalStr !== String(parsed)) {
            formatsNormalizedCount++;
          }
        }
      } else if (col.type === "categorical" || col.type === "boolean") {
        const str = String(val).trim();
        const lower = str.toLowerCase();
        const canonical = caseCorrectionMap[col.name]?.[lower] || str;
        cleanedRow[col.name] = canonical;
        if (str !== canonical) {
          formatsNormalizedCount++;
        }
      } else if (col.type === "date") {
        const parsedDate = parseDateSafe(val);
        if (parsedDate) {
          const iso = parsedDate.toISOString().split("T")[0];
          cleanedRow[col.name] = iso;
          if (String(val).trim() !== iso) formatsNormalizedCount++;
        } else {
          cleanedRow[col.name] = imputationMap[col.name];
          missingImputedCount++;
        }
      } else {
        cleanedRow[col.name] = String(val).trim();
      }
    }

    cleanedRows.push(cleanedRow);
  }

  // Record audit actions
  if (missingImputedCount > 0) {
    actions.push({
      type: "missing_imputed",
      count: missingImputedCount,
      details: `Imputed ${missingImputedCount} missing/null value${missingImputedCount > 1 ? "s" : ""} using column medians for numbers and modes for categories.`,
    });
  }

  if (formatsNormalizedCount > 0) {
    actions.push({
      type: "format_normalized",
      count: formatsNormalizedCount,
      details: `Normalized ${formatsNormalizedCount} formatting discrepancies (harmonized currencies, commas, case variants, and standardized date formats).`,
    });
  }

  // Calculate Health Scores (0 - 100)
  const nullPenalty = Math.min(40, Math.round((rawNullCells / (rawTotalCells || 1)) * 100));
  const duplicatePenalty = Math.min(30, Math.round((duplicatesRemoved / (rawRows.length || 1)) * 100));
  const formatPenalty = Math.min(30, Math.round((formatsNormalizedCount / (rawTotalCells || 1)) * 80));

  const rawHealthScore = Math.max(25, 100 - nullPenalty - duplicatePenalty - formatPenalty);
  const cleanedHealthScore = 100;

  const audit: CleaningAudit = {
    rawRowCount: rawRows.length,
    cleanedRowCount: cleanedRows.length,
    duplicatesRemoved,
    missingValuesImputed: missingImputedCount,
    formatsNormalized: formatsNormalizedCount,
    actions,
    rawHealthScore,
    cleanedHealthScore,
  };

  return {
    cleanedRows,
    audit,
    updatedColumns: effectiveProfiles,
  };
}
