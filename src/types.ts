export type ColumnType = "numeric" | "categorical" | "date" | "boolean" | "id";

export interface ColumnProfile {
  name: string;
  type: ColumnType;
  inferredConfidence: number; // 0 to 1
  sampleValues: any[];
  totalCount: number;
  nullCount: number;
  distinctCount: number;
  // Numeric stats
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  stdDev?: number;
  sum?: number;
  q1?: number;
  q3?: number;
  iqr?: number;
  // Categorical stats
  topCategories?: { value: string; count: number; percentage: number }[];
  // Date stats
  minDate?: string;
  maxDate?: string;
  dateFormat?: string;
}

export interface CleaningAction {
  type: "missing_imputed" | "duplicate_removed" | "format_normalized" | "casing_standardized" | "type_coerced";
  column?: string;
  count: number;
  details: string;
}

export interface CleaningAudit {
  rawRowCount: number;
  cleanedRowCount: number;
  duplicatesRemoved: number;
  missingValuesImputed: number;
  formatsNormalized: number;
  actions: CleaningAction[];
  rawHealthScore: number; // 0 to 100
  cleanedHealthScore: number; // 0 to 100
}

export interface CorrelationPair {
  colA: string;
  colB: string;
  coefficient: number; // -1 to 1
  strength: "strong" | "moderate" | "weak";
  direction: "positive" | "negative";
  insight: string;
}

export interface ClusterInfo {
  clusterId: number;
  name: string;
  size: number;
  percentage: number;
  centroid: Record<string, number>;
  topCharacteristics: string[];
}

export interface OutlierRecord {
  rowIndex: number;
  anomalyScore: number; // 0 to 1
  reasons: string[];
  data: Record<string, any>;
}

export interface MLInsights {
  correlations: CorrelationPair[];
  correlationMatrix: {
    columns: string[];
    matrix: number[][];
  };
  clusters: ClusterInfo[];
  outliers: OutlierRecord[];
  outlierCount: number;
  outlierRatio: string;
  clusterFeatureNames: string[];
}

export type ChartType = "line" | "area" | "bar" | "pie" | "scatter" | "metric_card";

export interface DashboardWidget {
  id: string;
  title: string;
  type: ChartType;
  xAxisKey?: string;
  yAxisKeys?: string[];
  categoryKey?: string;
  description: string;
  data: any[];
  config?: {
    format?: "currency" | "number" | "percentage" | "date";
    colors?: string[];
    value?: number | string;
    subValue?: string;
    change?: number;
  };
}

export interface ExecutiveSummary {
  executiveHeadline: string;
  narrative: string;
  keyFindings: { title: string; finding: string }[];
  actionableRecommendations: string[];
  source: "gemini" | "fallback" | "gemini_raw";
}

export interface ProcessedDataset {
  name: string;
  rawRows: Record<string, any>[];
  cleanedRows: Record<string, any>[];
  columns: ColumnProfile[];
  audit: CleaningAudit;
  ml: MLInsights;
  widgets: DashboardWidget[];
  summary: ExecutiveSummary;
  timestamp: string;
}
