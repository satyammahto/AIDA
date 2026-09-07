import React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Hash,
  Calendar,
  Layers,
  Key,
  ToggleLeft,
  AlertOctagon,
  ArrowRight,
  Sparkles,
  Info,
} from "lucide-react";
import { ColumnProfile, ColumnType, ProcessedDataset } from "../types";

interface CleaningAuditViewProps {
  dataset: ProcessedDataset;
}

export const CleaningAuditView: React.FC<CleaningAuditViewProps> = ({ dataset }) => {
  const { audit, columns, rawRows, cleanedRows } = dataset;

  const getTypeIcon = (type: ColumnType) => {
    switch (type) {
      case "numeric":
        return <Hash className="h-3.5 w-3.5 text-blue-600" />;
      case "date":
        return <Calendar className="h-3.5 w-3.5 text-amber-600" />;
      case "categorical":
        return <Layers className="h-3.5 w-3.5 text-emerald-600" />;
      case "id":
        return <Key className="h-3.5 w-3.5 text-purple-600" />;
      case "boolean":
        return <ToggleLeft className="h-3.5 w-3.5 text-rose-600" />;
    }
  };

  const getTypeBadgeClass = (type: ColumnType) => {
    switch (type) {
      case "numeric":
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      case "date":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case "categorical":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "id":
        return "bg-purple-50 text-purple-700 border-purple-200/80";
      case "boolean":
        return "bg-rose-50 text-rose-700 border-rose-200/80";
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION 01: DATA HYGIENE */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span className="text-indigo-600 font-bold">01</span> DATA HYGIENE
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Autonomous cleaning pipeline resolving nulls, duplicate keys, and data discrepancies.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 text-[11px] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Pipeline Active
          </div>
        </div>

        {/* Health Score & Hygiene Metric Grid */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Health Score Evolution */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Quality Health Score
              </p>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold">RAW</span>
                  <p className="text-xl font-bold text-slate-700">{audit.rawHealthScore}%</p>
                </div>
                <ArrowRight className="h-4 w-4 text-indigo-400" />
                <div>
                  <span className="text-[10px] text-emerald-600 font-semibold">CLEANED</span>
                  <p className="text-2xl font-extrabold text-emerald-600">
                    {audit.cleanedHealthScore}%
                  </p>
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${audit.cleanedHealthScore}%` }}
                ></div>
              </div>
            </div>
            <p className="mt-2 text-[10px] text-slate-500 leading-tight">
              100% column completeness, validated types, zero unresolved nulls.
            </p>
          </div>

          {/* Cleaning Interventions (Sleek Theme Item Format) */}
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-xs font-semibold text-slate-800">Missing Values Imputation</p>
                <p className="text-[10px] text-slate-500">
                  {audit.missingValuesImputed > 0
                    ? `${audit.missingValuesImputed} null cells imputed via Median / Mode heuristic`
                    : "Zero null values detected across records"}
                </p>
              </div>
              <span className="text-emerald-500 font-bold text-sm">✓</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-xs font-semibold text-slate-800">Duplicate Key Suppression</p>
                <p className="text-[10px] text-slate-500">
                  {audit.duplicatesRemoved > 0
                    ? `${audit.duplicatesRemoved} redundant records removed to prevent sample bias`
                    : "Zero duplicate records found"}
                </p>
              </div>
              <span className="text-emerald-500 font-bold text-sm">✓</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-xs font-semibold text-slate-800">Format Normalization</p>
                <p className="text-[10px] text-slate-500">
                  {audit.formatsNormalized} format transformations (ISO-8601 dates, currency stripping, whitespace trim)
                </p>
              </div>
              <span className="text-emerald-500 font-bold text-sm">✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 02: SCHEMA DETECTION */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span className="text-indigo-600 font-bold">02</span> SCHEMA DETECTION
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Autonomous type inference evaluated through formatting rules, regexes, and cardinality.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md self-start sm:self-auto">
            {columns.length} ATTRIBUTES DETECTED
          </span>
        </div>

        {/* Sleek Left-Bordered Schema Cards (Design Reference Pattern) */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {columns.map((col) => {
            const getBorderAccent = (type: ColumnType) => {
              switch (type) {
                case "numeric":
                  return "border-indigo-500 bg-indigo-50/40 text-indigo-900";
                case "date":
                  return "border-amber-500 bg-amber-50/40 text-amber-900";
                case "categorical":
                  return "border-purple-500 bg-purple-50/40 text-purple-900";
                case "id":
                  return "border-slate-500 bg-slate-50 text-slate-900";
                case "boolean":
                  return "border-rose-500 bg-rose-50/40 text-rose-900";
              }
            };

            return (
              <div
                key={col.name}
                className={`flex items-center justify-between px-3 py-2 border-l-2 rounded-r-lg ${getBorderAccent(
                  col.type
                )}`}
              >
                <span className="text-xs font-mono text-slate-700 uppercase truncate max-w-[130px]" title={col.name}>
                  {col.name}
                </span>
                <span className="text-[10px] font-mono font-bold bg-slate-200/90 text-slate-700 px-1.5 py-0.5 rounded tracking-wider uppercase">
                  {col.type}
                </span>
              </div>
            );
          })}
        </div>

        {/* Detailed Column Profiling Table */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Column Name</th>
                <th className="py-3 px-4">Inferred Type</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Missing (Raw)</th>
                <th className="py-3 px-4">Distinct</th>
                <th className="py-3 px-4">Distribution & Parameters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {columns.map((col) => (
                <tr key={col.name} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">{col.name}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold border ${getTypeBadgeClass(
                        col.type
                      )}`}
                    >
                      {getTypeIcon(col.type)}
                      <span className="capitalize">{col.type}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    {Math.round(col.inferredConfidence * 100)}%
                  </td>
                  <td className="py-3 px-4">
                    {col.nullCount > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-amber-700 font-semibold border border-amber-200/60">
                        {col.nullCount} ({Math.round((col.nullCount / col.totalCount) * 100)}%)
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> 0 nulls
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {col.distinctCount} unique
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {col.type === "numeric" && (
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        <span>
                          <strong className="text-slate-800">Mean:</strong> {col.mean}
                        </span>
                        <span>
                          <strong className="text-slate-800">Median:</strong> {col.median}
                        </span>
                        <span>
                          <strong className="text-slate-800">Range:</strong> [{col.min} - {col.max}]
                        </span>
                        <span>
                          <strong className="text-slate-800">IQR:</strong> {col.iqr}
                        </span>
                      </div>
                    )}
                    {col.type === "categorical" && (
                      <div className="flex flex-wrap gap-1 text-[11px]">
                        {(col.topCategories || []).slice(0, 3).map((c, i) => (
                          <span
                            key={i}
                            className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700"
                          >
                            {c.value} ({c.percentage}%)
                          </span>
                        ))}
                      </div>
                    )}
                    {col.type === "date" && (
                      <div className="text-[11px] text-slate-600">
                        Span: <span className="font-medium text-slate-800">{col.minDate}</span> to{" "}
                        <span className="font-medium text-slate-800">{col.maxDate}</span>
                      </div>
                    )}
                    {(col.type === "id" || col.type === "boolean") && (
                      <div className="text-[11px] text-slate-500 font-mono">
                        Samples: {col.sampleValues.slice(0, 3).join(", ")}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 03: DETAILED AUDIT TRACE */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <span className="text-indigo-600 font-bold">03</span> AUDIT LOG TRACE
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Chronological record of every imputation, key validation, and format standardization.
        </p>

        <div className="mt-4 space-y-2">
          {audit.actions.map((action, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-700 border border-slate-100"
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-[10px]">
                {i + 1}
              </div>
              <div className="flex-1">
                <span className="font-semibold capitalize text-slate-900">
                  {action.type.replace(/_/g, " ")}:
                </span>{" "}
                <span className="text-slate-600">{action.details}</span>
              </div>
            </div>
          ))}
          {audit.actions.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-400">
              No cleaning interventions were required for this pristine dataset.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
