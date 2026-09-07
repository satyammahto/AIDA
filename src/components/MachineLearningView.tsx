import React, { useState } from "react";
import {
  Cpu,
  GitCommit,
  Network,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Activity,
  CheckCircle2,
  Sliders,
  Info,
} from "lucide-react";
import { ProcessedDataset } from "../types";

interface MachineLearningViewProps {
  dataset: ProcessedDataset;
}

export const MachineLearningView: React.FC<MachineLearningViewProps> = ({ dataset }) => {
  const { ml, columns } = dataset;
  const [selectedTab, setSelectedTab] = useState<"correlations" | "clustering" | "outliers">(
    "correlations"
  );
  const [selectedOutlierRow, setSelectedOutlierRow] = useState<number | null>(null);

  // Helper for correlation matrix cell colors
  const getMatrixCellBg = (val: number) => {
    if (val === 1.0) return "bg-indigo-600 text-white font-bold";
    if (val >= 0.7) return "bg-indigo-500 text-white font-bold";
    if (val >= 0.4) return "bg-indigo-200 text-indigo-950 font-semibold";
    if (val >= 0.1) return "bg-indigo-50 text-indigo-900";
    if (val <= -0.7) return "bg-rose-500 text-white font-bold";
    if (val <= -0.4) return "bg-rose-200 text-rose-950 font-semibold";
    if (val <= -0.1) return "bg-rose-50 text-rose-900";
    return "bg-slate-50 text-slate-600";
  };

  return (
    <div className="space-y-6">
      {/* ML Navigation Subtabs & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <span className="text-indigo-600 font-bold">04</span> STATISTICAL DEPENDENCIES & ML
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Surfacing continuous correlations, unsupervised K-Means clustering, and multi-variate anomalies.
          </p>
        </div>

        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600 self-start md:self-auto">
          <button
            onClick={() => setSelectedTab("correlations")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition ${
              selectedTab === "correlations"
                ? "bg-slate-900 text-white shadow-sm"
                : "hover:text-slate-900"
            }`}
          >
            <Network className="h-3.5 w-3.5" />
            Correlations ({ml.correlations.length})
          </button>
          <button
            onClick={() => setSelectedTab("clustering")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition ${
              selectedTab === "clustering"
                ? "bg-slate-900 text-white shadow-sm"
                : "hover:text-slate-900"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Clusters ({ml.clusters.length})
          </button>
          <button
            onClick={() => setSelectedTab("outliers")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition ${
              selectedTab === "outliers"
                ? "bg-slate-900 text-white shadow-sm"
                : "hover:text-slate-900"
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Outliers ({ml.outlierCount})
          </button>
        </div>
      </div>

      {/* 1. CORRELATION ANALYSIS */}
      {selectedTab === "correlations" && (
        <div className="space-y-6">
          {/* Top Ranked Correlation Findings (Sleek Theme Card Style) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="pb-3 border-b border-slate-100 mb-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Ranked Pearson Linear Correlations
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Covariance analysis isolating inter-dependent numerical columns.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ml.correlations.slice(0, 6).map((pair, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 shadow-2xs hover:bg-white hover:border-slate-300 transition flex flex-col justify-between"
                >
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                      {pair.colA} × {pair.colB}
                    </p>
                    <p className="text-2xl font-bold text-indigo-600 tracking-tight">
                      {pair.coefficient > 0 ? `+${pair.coefficient}` : pair.coefficient}{" "}
                      <span className="text-xs text-slate-400 font-normal ml-1 capitalize">
                        {pair.strength}
                      </span>
                    </p>
                    <p className="text-[11px] mt-2 text-slate-600 leading-relaxed">
                      {pair.insight}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{Math.round(Math.pow(pair.coefficient, 2) * 100)}% shared variance (R²)</span>
                    <span className="uppercase font-bold text-slate-700">{pair.direction}</span>
                  </div>
                </div>
              ))}
              {ml.correlations.length === 0 && (
                <div className="col-span-3 p-8 text-center text-xs text-slate-400">
                  Insufficient numeric dimensions to compute correlation matrices.
                </div>
              )}
            </div>
          </div>

          {/* Full NxN Correlation Heatmap Table */}
          {ml.correlationMatrix.columns.length > 1 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
              <div className="pb-3 border-b border-slate-100 mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Relational Heatmap Matrix
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Full relational coefficient grid across all continuous dimensions.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-left text-slate-400 font-mono text-[10px] uppercase">Dimension</th>
                      {ml.correlationMatrix.columns.map((c) => (
                        <th key={c} className="p-2 font-mono text-[10px] uppercase font-semibold text-slate-700 max-w-[110px] truncate">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ml.correlationMatrix.columns.map((rowName, i) => (
                      <tr key={rowName} className="hover:bg-slate-50/50">
                        <td className="p-2 text-left font-mono font-semibold text-slate-900 max-w-[120px] truncate">
                          {rowName}
                        </td>
                        {ml.correlationMatrix.matrix[i].map((val, j) => (
                          <td key={j} className="p-1.5">
                            <div
                              className={`mx-auto flex h-8 w-14 items-center justify-center rounded-lg font-mono text-[11px] transition ${getMatrixCellBg(
                                val
                              )}`}
                              title={`${rowName} vs ${ml.correlationMatrix.columns[j]}: r = ${val}`}
                            >
                              {val.toFixed(2)}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. K-MEANS CLUSTERING */}
      {selectedTab === "clustering" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {ml.clusters.map((cluster) => (
              <div
                key={cluster.clusterId}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="rounded-lg bg-slate-900 text-white px-2.5 py-1 text-[11px] font-bold font-mono">
                      CLUSTER 0{cluster.clusterId}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      {cluster.size} rows ({cluster.percentage}%)
                    </span>
                  </div>

                  <h4 className="mt-3 text-sm font-bold text-slate-900">{cluster.name}</h4>

                  {/* Distinctive Traits */}
                  <div className="mt-3 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Distinctive Characteristics:
                    </span>
                    {cluster.topCharacteristics.map((trait, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
                        <span>{trait}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Centroid Dimensions */}
                <div className="mt-5 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Unstandardized Centroid:
                  </span>
                  <div className="mt-1.5 space-y-1 text-[11px] text-slate-600 font-mono">
                    {Object.entries(cluster.centroid).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="truncate max-w-[130px]">{k}:</span>
                        <span className="font-bold text-slate-900">
                          {typeof v === "number" ? v.toLocaleString() : v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-600 flex items-center gap-3 shadow-2xs">
            <Info className="h-5 w-5 text-indigo-600 shrink-0" />
            <p>
              Partitions were derived via Euclidean distances across Z-score normalized features:{" "}
              <strong className="text-slate-800">{ml.clusterFeatureNames.join(", ")}</strong>.
              All records have been assigned cluster IDs accessible in the Records Explorer and Dashboard slicers.
            </p>
          </div>
        </div>
      )}

      {/* 3. OUTLIER & ANOMALY DETECTION */}
      {selectedTab === "outliers" && (
        <div className="space-y-6">
          {/* Anomaly Overview Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Multi-Variate Statistical Outliers
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Derived using Tukey's Interquartile Range (IQR 1.8x) and Gaussian Z-Score tests (|Z| &gt; 2.5).
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-2 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Flagged Anomalies</span>
                <p className="text-xl font-bold text-rose-700">{ml.outlierCount} Records</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-2 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Outlier Ratio</span>
                <p className="text-xl font-bold text-slate-800">{ml.outlierRatio}</p>
              </div>
            </div>
          </div>

          {/* Outliers Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Ranked Anomaly Queue
              </span>
              <span className="text-xs text-slate-400">Sorted by Anomaly Score Severity</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Row #</th>
                    <th className="py-3 px-4">Anomaly Score</th>
                    <th className="py-3 px-4">Flagged Statistical Triggers</th>
                    <th className="py-3 px-4">Cluster Assigned</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {ml.outliers.map((outlier) => (
                    <tr
                      key={outlier.rowIndex}
                      className={`hover:bg-slate-50/70 transition cursor-pointer ${
                        selectedOutlierRow === outlier.rowIndex ? "bg-indigo-50/40" : ""
                      }`}
                      onClick={() =>
                        setSelectedOutlierRow(
                          selectedOutlierRow === outlier.rowIndex ? null : outlier.rowIndex
                        )
                      }
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        #{outlier.rowIndex + 1}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${
                            outlier.anomalyScore >= 0.8
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {(outlier.anomalyScore * 100).toFixed(0)}% Severity
                        </span>
                      </td>
                      <td className="py-3 px-4 space-y-1">
                        {outlier.reasons.map((reason, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-slate-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">
                        {outlier.data._clusterName || "Cluster 1"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-indigo-600 font-semibold hover:text-indigo-800">
                          {selectedOutlierRow === outlier.rowIndex ? "Hide" : "Inspect"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {ml.outlierCount === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                        Zero extreme outliers identified. All values align within standard distributions.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Expanded Row Inspector */}
            {selectedOutlierRow !== null && (
              <div className="border-t border-slate-100 bg-slate-50/80 p-5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Record #{selectedOutlierRow + 1} Full Attribute Values:
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {Object.entries(
                    ml.outliers.find((o) => o.rowIndex === selectedOutlierRow)?.data || {}
                  )
                    .filter(([k]) => !k.startsWith("_"))
                    .map(([key, val]) => (
                      <div key={key} className="rounded-xl bg-white p-3 border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-medium block">{key}</span>
                        <span className="font-semibold text-slate-900 truncate block">{String(val)}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
