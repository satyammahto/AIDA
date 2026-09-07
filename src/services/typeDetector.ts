import { ColumnProfile, ColumnType } from "../types";

// Common date format regular expressions
const DATE_REGEXES = [
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/, // ISO 8601
  /^\d{1,2}\/\d{1,2}\/\d{2,4}$/, // MM/DD/YYYY or DD/MM/YYYY
  /^\d{1,2}-\d{1,2}-\d{2,4}$/, // MM-DD-YYYY or DD-MM-YYYY
  /^[A-Za-z]{3,9}\s+\d{1,2},\s*\d{4}$/, // Jan 12, 2023
  /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
];

// Recognized missing / null representations in tabular files
const MISSING_TOKENS = new Set([
  "",
  "na",
  "n/a",
  "null",
  "none",
  "nan",
  "-",
  "--",
  "?",
  "nil",
  "#n/a",
  "#value!",
  "undefined",
]);

export function isMissingValue(val: any): boolean {
  if (val === null || val === undefined) return true;
  const s = String(val).trim().toLowerCase();
  return MISSING_TOKENS.has(s);
}

// Robust parsing for international dates (including DD/MM/YYYY and DD-MM-YYYY)
export function parseDateSafe(val: any): Date | null {
  if (isMissingValue(val)) return null;
  const str = String(val).trim();
  if (str.length < 4 || str.length > 35) return null;
  if (!isNaN(Number(str)) && str.length !== 8) return null;

  // Try native parse first
  const timestamp = Date.parse(str);
  if (!isNaN(timestamp) && timestamp > Date.parse("1970-01-01")) {
    return new Date(timestamp);
  }

  // Handle DD/MM/YYYY or DD-MM-YYYY (e.g. 15/08/2024, 25-12-2023)
  const dmyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (dmyMatch) {
    const p1 = parseInt(dmyMatch[1], 10);
    const p2 = parseInt(dmyMatch[2], 10);
    let year = parseInt(dmyMatch[3], 10);
    if (year < 100) year += 2000;

    // If first part > 12, it must be day (DD/MM/YYYY)
    if (p1 > 12 && p2 <= 12) {
      const d = new Date(year, p2 - 1, p1);
      if (!isNaN(d.getTime())) return d;
    } else if (p2 > 12 && p1 <= 12) {
      // Second part is day (MM/DD/YYYY)
      const d = new Date(year, p1 - 1, p2);
      if (!isNaN(d.getTime())) return d;
    } else {
      // Ambiguous: default to day-first standard
      const d = new Date(year, p2 - 1, p1);
      if (!isNaN(d.getTime())) return d;
    }
  }

  return null;
}

export function isDateString(val: any): boolean {
  return parseDateSafe(val) !== null;
}

// Comprehensive currency cleaner supporting $, €, £, ¥, ₹ (INR), Rs, Rs., etc.
function cleanNumericString(str: string): string {
  return str
    .replace(/^[$\u20AC\u00A3\u00A5\u20B9]/, "") // Leading $, €, £, ¥, ₹
    .replace(/^(rs\.?|inr|usd|eur|gbp)\s*/i, "") // Leading currency codes
    .replace(/\s*(rs\.?|inr|usd|eur|gbp)$/i, "") // Trailing currency codes
    .replace(/%$/, "") // Trailing %
    .replace(/,/g, "") // Thousands separators
    .replace(/\s+/g, "") // Whitespace between digits
    .trim();
}

export function isNumericString(val: any): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === "number") return !isNaN(val);
  const str = String(val).trim();
  if (isMissingValue(str)) return false;

  const cleanStr = cleanNumericString(str);
  if (cleanStr === "") return false;

  // Handles negative in parentheses like (120)
  const parenMatch = cleanStr.match(/^\((.+)\)$/);
  const targetStr = parenMatch ? `-${parenMatch[1]}` : cleanStr;

  return !isNaN(Number(targetStr));
}

export function parseCleanNumber(val: any): number {
  if (typeof val === "number") return val;
  if (isMissingValue(val)) return NaN;
  const str = String(val).trim();

  const cleanStr = cleanNumericString(str);
  const parenMatch = cleanStr.match(/^\((.+)\)$/);
  const targetStr = parenMatch ? `-${parenMatch[1]}` : cleanStr;
  return Number(targetStr);
}

export function isBooleanString(val: any): boolean {
  if (typeof val === "boolean") return true;
  if (isMissingValue(val)) return false;
  const s = String(val).trim().toLowerCase();
  return ["true", "false", "yes", "no", "y", "n", "0", "1"].includes(s);
}

export function isPotentialId(colName: string, distinctRatio: number, totalCount: number): boolean {
  const lower = colName.toLowerCase();
  if (
    lower.includes("id") ||
    lower.includes("key") ||
    lower.includes("uuid") ||
    lower.includes("code") ||
    lower.endsWith("_no") ||
    lower === "index"
  ) {
    return true;
  }
  return totalCount > 20 && distinctRatio > 0.98;
}

export function detectColumnProfiles(rows: Record<string, any>[]): ColumnProfile[] {
  if (!rows || rows.length === 0) return [];

  // Extract all unique, non-empty column names across ALL rows (preserving order of appearance)
  const colNamesSet = new Set<string>();
  for (const row of rows) {
    if (row && typeof row === "object") {
      for (const key of Object.keys(row)) {
        const cleanKey = key.trim();
        // Skip purely internal keys or completely empty keys
        if (cleanKey !== "" && !cleanKey.startsWith("_") && cleanKey !== "__parsed_extra") {
          colNamesSet.add(key);
        }
      }
    }
  }

  const colNames = Array.from(colNamesSet);
  if (colNames.length === 0) return [];

  const totalRows = rows.length;

  return colNames.map((colName) => {
    const rawValues = rows.map((r) => r[colName]);
    const nonNullValues = rawValues.filter((v) => !isMissingValue(v));
    const nullCount = totalRows - nonNullValues.length;

    let numCount = 0;
    let dateCount = 0;
    let boolCount = 0;

    for (const val of nonNullValues) {
      if (isNumericString(val)) numCount++;
      if (isDateString(val)) dateCount++;
      if (isBooleanString(val)) boolCount++;
    }

    const nonNullTotal = nonNullValues.length || 1;
    const numRatio = numCount / nonNullTotal;
    const dateRatio = dateCount / nonNullTotal;
    const boolRatio = boolCount / nonNullTotal;

    const distinctSet = new Set(nonNullValues.map((v) => String(v).trim()));
    const distinctCount = distinctSet.size;
    const distinctRatio = distinctCount / nonNullTotal;

    let inferredType: ColumnType = "categorical";
    let confidence = 0.5;

    if (isPotentialId(colName, distinctRatio, totalRows) && numRatio < 0.95) {
      inferredType = "id";
      confidence = 0.9;
    } else if (dateRatio >= 0.7) {
      inferredType = "date";
      confidence = dateRatio;
    } else if (numRatio >= 0.7) {
      // Check if it's really an ID (e.g. Employee_ID, Row_Num)
      if (isPotentialId(colName, distinctRatio, totalRows) && distinctRatio > 0.95) {
        inferredType = "id";
        confidence = 0.85;
      } else {
        inferredType = "numeric";
        confidence = numRatio;
      }
    } else if (boolRatio >= 0.85) {
      inferredType = "boolean";
      confidence = boolRatio;
    } else {
      inferredType = "categorical";
      confidence = 0.85;
    }

    const profile: ColumnProfile = {
      name: colName,
      type: inferredType,
      inferredConfidence: Math.round(confidence * 100) / 100,
      sampleValues: nonNullValues.slice(0, 5),
      totalCount: totalRows,
      nullCount,
      distinctCount,
    };

    // Calculate Numeric stats
    if (inferredType === "numeric") {
      const parsedNums = nonNullValues
        .map(parseCleanNumber)
        .filter((n) => !isNaN(n))
        .sort((a, b) => a - b);

      if (parsedNums.length > 0) {
        const sum = parsedNums.reduce((acc, curr) => acc + curr, 0);
        const mean = sum / parsedNums.length;
        const min = parsedNums[0];
        const max = parsedNums[parsedNums.length - 1];

        // Variance & Standard Deviation
        const variance =
          parsedNums.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0) /
          (parsedNums.length || 1);
        const stdDev = Math.sqrt(variance);

        // Percentiles
        const q1 = parsedNums[Math.floor(parsedNums.length * 0.25)];
        const median = parsedNums[Math.floor(parsedNums.length * 0.5)];
        const q3 = parsedNums[Math.floor(parsedNums.length * 0.75)];
        const iqr = q3 - q1;

        profile.min = Math.round(min * 100) / 100;
        profile.max = Math.round(max * 100) / 100;
        profile.mean = Math.round(mean * 100) / 100;
        profile.median = Math.round(median * 100) / 100;
        profile.stdDev = Math.round(stdDev * 100) / 100;
        profile.sum = Math.round(sum * 100) / 100;
        profile.q1 = Math.round(q1 * 100) / 100;
        profile.q3 = Math.round(q3 * 100) / 100;
        profile.iqr = Math.round(iqr * 100) / 100;
      }
    }

    // Calculate Categorical stats
    if (inferredType === "categorical" || inferredType === "boolean") {
      const counts: Record<string, number> = {};
      for (const val of nonNullValues) {
        const key = String(val).trim();
        counts[key] = (counts[key] || 0) + 1;
      }

      profile.topCategories = Object.entries(counts)
        .map(([value, count]) => ({
          value,
          count,
          percentage: Math.round((count / nonNullTotal) * 1000) / 10,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }

    // Calculate Date stats
    if (inferredType === "date") {
      const parsedDates = nonNullValues
        .map(parseDateSafe)
        .filter((d): d is Date => d !== null)
        .sort((a, b) => a.getTime() - b.getTime());

      if (parsedDates.length > 0) {
        profile.minDate = parsedDates[0].toISOString().split("T")[0];
        profile.maxDate = parsedDates[parsedDates.length - 1].toISOString().split("T")[0];
      }
    }

    return profile;
  });
}
