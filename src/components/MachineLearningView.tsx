import React, { useState } from "react";
import {
  Cpu,
  Network,
  AlertTriangle,
  Layers,
  TrendingDown,
  TrendingUp,
  Activity,
  CheckCircle2,
  Sliders,
  Info,
  HelpCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { ProcessedDataset } from "../types";

interface MachineLearningViewProps {
  dataset: ProcessedDataset;
  isEasyMode?: boolean;
}

export const MachineLearningView: React.FC<MachineLearningViewProps> = ({
  dataset,
  isEasyMode = true,
}) => {
  const { ml, columns } = dataset;
  const [selectedTab, setSelectedTab] = useState<"correlations" | "clustering" | "outliers">(
    "correlations"
  );
  const [selectedOutlierRow, setSelectedOutlierRow] = useState<number | null>(null);
  const [showHelper, setShowHelper] = useState(false);

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
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-indigo-600" />
              Smart Insights & Patterns
            </h3>
            <button
              onClick={() => setShowHelper(!showHelper)}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>{showHelper ? "Hide Guide" : "Explain This Tab"}</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover number connections, natural customer groups, and unusual records automatically.
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
            {isEasyMode ? "Connections" : "Correlations"} ({ml.correlations.length})
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
            {isEasyMode ? "Groups" : "Clusters"} ({ml.clusters.length})
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
            {isEasyMode ? "Unusual Records" : "Outliers"} ({ml.outlierCount})
          </button>
        </div>
      </div>

      {/* Beginner Explanation Banner */}
      {showHelper && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs text-slate-700 space-y-2">
          <p className="font-bold text-indigo-950 flex items-center gap-1.5 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            How to use these insights in real life:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-600">
            <div className="bg-white p-3 rounded-lg border border-slate-200/80">
              <strong className="text-slate-900 block mb-1">🔗 Number Connections:</strong>
              Shows when two numbers move together. Example: if ad spend rises, do sales rise too?
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200/80">
              <strong className="text-slate-900 block mb-1">👥 Automatic Groups:</strong>
              Sorts your data into customer or transaction tiers (like VIP high spenders vs. occasional buyers) so you can tailor your approach.
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200/80">
              <strong className="text-slate-900 block mb-1">🚨 Unusual Records:</strong>
              Highlights standout entries that deviate from normal patterns, helping you catch typos or spot exceptional opportunities.
            </div>
          </div>
        </div>
      )}

      {/* 1. CORRELATION / CONNECTION ANALYSIS */}
      {selectedTab === "correlations" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="pb-3 border-b border-slate-100 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  {isEasyMode ? "Discovered Connections Between Columns" : "Ranked Pearson Linear Correlations"}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEasyMode
                    ? "A high percentage means when one number goes up, the other tends to go up (or down) with it."
                    : "Pairwise covariance analysis isolating inter-dependent numerical columns."}
                </p>
              </div>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 self-start sm:self-auto">
                {ml.correlations.length} Pairs Evaluated
              </span>
            </div>

            {ml.correlations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No continuous numeric column pairs found to compute correlation metrics.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ml.correlations.slice(0, 6).map((pair, idx) => {
                  const percent = Math.round(Math.abs(pair.coefficient) * 100);
                  const isPositive = pair.coefficient > 0;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 shadow-2xs hover:bg-white hover:border-slate-300 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[180px]">
                            {pair.colA} & {pair.colB}
                          </p>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              isPositive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {isPositive ? "Direct Link" : "Inverse Link"}
                          </span>
                        </div>

                        <p className="text-2xl font-bold text-indigo-600 tracking-tight">
                          {percent}%{" "}
                          <span className="text-xs text-slate-500 font-normal ml-1">
                            {pair.strength} connection
                          </span>
                        </p>

                        {/* Visual Strength Meter */}
                        <div className="mt-3 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isPositive ? "bg-indigo-600" : "bg-rose-500"}`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>

                        {/* Plain English Translation */}
                        <p className="text-[11px] text-slate-600 mt-3 leading-relaxed">
                          {isPositive ? (
                            <span>
                              When <strong>{pair.colA}</strong> rises, <strong>{pair.colB}</strong> almost always rises as well.
                            </span>
                          ) : (
                            <span>
                              When <strong>{pair.colA}</strong> rises, <strong>{pair.colB}</strong> tends to decrease.
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Statistical coefficient: {pair.coefficient}</span>
                        <span className="font-semibold text-slate-600">r-score</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Full Correlation Matrix */}
          {ml.correlations.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="pb-3 border-b border-slate-100 mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  {isEasyMode ? "All-Columns Relationship Matrix" : "Complete Correlation Matrix"}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dark blue indicates a strong positive link, while dark red indicates an inverse relationship.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-slate-400 text-left font-normal text-[10px]"></th>
                      {ml.matrixColumns?.map((col) => (
                        <th
                          key={col}
                          className="p-2 text-slate-700 font-bold text-center text-[11px] max-w-[90px] truncate"
                          title={col}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ml.matrixColumns?.map((rowCol, rIdx) => (
                      <tr key={rowCol}>
                        <td className="p-2 font-bold text-slate-700 text-right text-[11px] pr-3 truncate max-w-[120px]">
                          {rowCol}
                        </td>
                        {ml.matrixColumns?.map((cCol, cIdx) => {
                          const val = ml.matrix?.[rIdx]?.[cIdx] ?? 0;
                          return (
                            <td
                              key={cCol}
                              className={`p-2 text-center text-[10px] border border-white rounded font-mono ${getMatrixCellBg(
                                val
                              )}`}
                              title={`${rowCol} × ${cCol}: r = ${val}`}
                            >
                              {val.toFixed(2)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. CLUSTERING / AUDIENCE GROUPS */}
      {selectedTab === "clustering" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="pb-3 border-b border-slate-100 mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                {isEasyMode ? "Discovered Groups in Your Data" : "Unsupervised K-Means Behavioral Clusters"}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                We grouped your {dataset.cleanedRows.length.toLocaleString()} records into {ml.clusters.length} natural segments based on shared characteristics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {ml.clusters.map((cluster, idx) => {
                const percentShare = Math.round((cluster.size / dataset.cleanedRows.length) * 100);
                return (
                  <div
                    key={cluster.clusterId}
                    className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 shadow-2xs hover:bg-white hover:border-slate-300 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-wide">
                          Group #{idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {percentShare}% of total
                        </span>
                      </div>

                      <h5 className="text-sm font-bold text-slate-900">{cluster.name}</h5>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {cluster.description || "A distinct subset of records exhibiting similar metrics."}
                      </p>

                      {/* Cluster Metrics */}
                      <div className="mt-4 pt-3 border-t border-slate-200/70 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Total Rows:</span>
                          <span className="font-semibold text-slate-800">
                            {cluster.size.toLocaleString()} records
                          </span>
                        </div>

                        {/* Top centroid features */}
                        {cluster.centroid &&
                          Object.entries(cluster.centroid)
                            .slice(0, 3)
                            .map(([key, val]) => (
                              <div key={key} className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-500 truncate max-w-[120px]" title={key}>
                                  Avg {key}:
                                </span>
                                <span className="font-semibold text-indigo-700">
                                  {typeof val === "number" ? val.toLocaleString(undefined, { maximumFractionDigits: 1 }) : String(val)}
                                </span>
                              </div>
                            ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Group ID: {cluster.clusterId}</span>
                      <span className="text-emerald-600 font-semibold">Active Segment</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. ANOMALIES & OUTLIERS */}
      {selectedTab === "outliers" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="pb-3 border-b border-slate-100 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  {isEasyMode ? "Standout & Unusual Records" : "Statistical Anomalies & Outliers"}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isEasyMode
                    ? "These entries stand far outside the typical range. Perfect for spotting high-value orders or data typos."
                    : "Identified using 1.5x IQR Tukey fences and multi-variate distance."}
                </p>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 self-start sm:self-auto">
                {ml.outlierCount} Records Flagged ({ml.outlierRatio})
              </span>
            </div>

            {ml.outlierCount === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                No statistical outliers detected. Your data values follow a very standard, consistent distribution.
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Click on any flagged row below to inspect why it was marked as unusual:
                </p>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Row #</th>
                        <th className="py-2.5 px-4">Why It Stands Out</th>
                        <th className="py-2.5 px-4">Assigned Group</th>
                        <th className="py-2.5 px-4">Key Values</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {dataset.cleanedRows
                        .filter((r) => r._isOutlier)
                        .slice(0, 10)
                        .map((row, idx) => {
                          const isSelected = selectedOutlierRow === idx;
                          return (
                            <tr
                              key={idx}
                              onClick={() => setSelectedOutlierRow(isSelected ? null : idx)}
                              className={`cursor-pointer transition ${
                                isSelected ? "bg-amber-50/70" : "hover:bg-slate-50"
                              }`}
                            >
                              <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                                #{idx + 1}
                              </td>
                              <td className="py-2.5 px-4">
                                <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded font-medium text-[11px]">
                                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                                  {row._outlierReason || "Significantly exceeds the average value"}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 font-medium text-indigo-700">
                                {row._clusterName || "General Group"}
                              </td>
                              <td className="py-2.5 px-4 text-slate-600 truncate max-w-xs">
                                {columns
                                  .filter((c) => c.type === "numeric")
                                  .slice(0, 2)
                                  .map((c) => `${c.name}: ${row[c.name]}`)
                                  .join(" | ")}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Expanded Row Inspector */}
                {selectedOutlierRow !== null && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>Row #{selectedOutlierRow + 1} Complete Inspection</span>
                      <button
                        onClick={() => setSelectedOutlierRow(null)}
                        className="text-[11px] text-slate-500 hover:text-slate-800"
                      >
                        Close
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Full values for this standout record:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      {columns.map((c) => {
                        const outlierRow = dataset.cleanedRows.filter((r) => r._isOutlier)[
                          selectedOutlierRow
                        ];
                        return (
                          <div key={c.name} className="bg-white p-2 rounded border border-slate-200">
                            <span className="text-[10px] text-slate-400 block uppercase font-bold truncate">
                              {c.name}
                            </span>
                            <span className="font-semibold text-slate-800 truncate block">
                              {String(outlierRow?.[c.name] ?? "—")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
