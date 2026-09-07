import React, { useState } from "react";
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
  HelpCircle,
  FileCheck,
  Filter,
} from "lucide-react";
import { ColumnProfile, ColumnType, ProcessedDataset } from "../types";

interface CleaningAuditViewProps {
  dataset: ProcessedDataset;
  isEasyMode?: boolean;
}

export const CleaningAuditView: React.FC<CleaningAuditViewProps> = ({
  dataset,
  isEasyMode = true,
}) => {
  const { audit, columns, rawRows, cleanedRows } = dataset;
  const [showExplanation, setShowExplanation] = useState(false);

  const getTypeFriendlyLabel = (type: ColumnType) => {
    switch (type) {
      case "numeric":
        return { label: isEasyMode ? "Numbers (Amounts)" : "Numeric", desc: "Calculable values (revenue, age, score)" };
      case "date":
        return { label: isEasyMode ? "Dates (Timeline)" : "Date", desc: "Calendar dates and time periods" };
      case "categorical":
        return { label: isEasyMode ? "Categories (Labels)" : "Categorical", desc: "Names, departments, statuses" };
      case "id":
        return { label: isEasyMode ? "Unique ID Code" : "Identifier", desc: "Codes like #1043 or SKU" };
      case "boolean":
        return { label: isEasyMode ? "Yes / No Toggle" : "Boolean", desc: "True/False or Yes/No flags" };
    }
  };

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
      {/* DATA HEALTH & QUALITY OVERVIEW */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Data Quality & Clean-up Report
              </h3>
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>{showExplanation ? "Hide Explanation" : "What is this?"}</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Autonomous cleaning pipeline resolving missing blanks, removing duplicates, and standardizing values.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 text-[11px] font-semibold self-start sm:self-auto">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>100% Reliable for Analysis</span>
          </div>
        </div>

        {/* Optional Beginner Explanation Banner */}
        {showExplanation && (
          <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs text-slate-700 space-y-1.5">
            <p className="font-bold text-indigo-950 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              Why data cleaning matters:
            </p>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Raw spreadsheets often contain accidental duplicate entries, missing numbers, and conflicting text formats
              (like mixing &ldquo;$1,000&rdquo; with &ldquo;1000&rdquo;). This pipeline automatically cleans these issues
              without changing your original file, ensuring that your reports, averages, and charts are completely accurate.
            </p>
          </div>
        )}

        {/* Before vs After Clean-up Cards */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Quality Health Score Evolution */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Overall Data Health Score
              </p>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold">ORIGINAL FILE</span>
                  <p className="text-xl font-bold text-slate-700">{audit.rawHealthScore}%</p>
                </div>
                <ArrowRight className="h-4 w-4 text-indigo-400" />
                <div>
                  <span className="text-[10px] text-emerald-600 font-semibold">AFTER CLEANING</span>
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
            <p className="mt-3 text-[11px] text-slate-600 leading-tight">
              {audit.cleanedHealthScore === 100
                ? "Perfect quality: zero missing blanks and no duplicate records remaining."
                : "Great quality: major issues normalized and verified."}
            </p>
          </div>

          {/* Three Interventions in Plain English */}
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    {isEasyMode ? "Blank Cells Filled In (Imputation)" : "Missing Values Imputation"}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {audit.missingValuesImputed > 0
                      ? `Repaired ${audit.missingValuesImputed} blank cells by filling in the typical average value so charts and math calculations don't break.`
                      : "No missing or blank cells were found in your rows."}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded shrink-0 ml-2 border border-emerald-100">
                {audit.missingValuesImputed > 0 ? `${audit.missingValuesImputed} Fixed` : "All Clean"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    {isEasyMode ? "Duplicate Rows Removed" : "Duplicate Key Suppression"}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {audit.duplicatesRemoved > 0
                      ? `Found and removed ${audit.duplicatesRemoved} identical duplicate rows so totals aren't accidentally counted twice.`
                      : "Zero duplicate entries found in your file."}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded shrink-0 ml-2 border border-emerald-100">
                {audit.duplicatesRemoved > 0 ? `${audit.duplicatesRemoved} Dropped` : "No Duplicates"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    {isEasyMode ? "Formatting & Numbers Standardized" : "Format Normalization"}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {audit.formatsNormalized} adjustments made: stripped currency symbols ($/€), cleaned commas, trimmed whitespace, and unified date formats.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded shrink-0 ml-2 border border-indigo-100">
                Standardized
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SCHEMA & COLUMN DETAILS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-600" />
              Column Types & Profiles
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              The system automatically detected the purpose of each column (dates, amounts, categories).
            </p>
          </div>
          <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg self-start sm:self-auto">
            {columns.length} Columns Analyzed
          </span>
        </div>

        {/* Quick Column Category Badges */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {columns.map((col) => {
            const friendly = getTypeFriendlyLabel(col.type);
            return (
              <div
                key={col.name}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/70 bg-slate-50/70"
                title={`${col.name}: ${friendly.desc}`}
              >
                <div className="flex items-center gap-2 truncate">
                  {getTypeIcon(col.type)}
                  <span className="text-xs font-semibold text-slate-800 truncate" title={col.name}>
                    {col.name}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0 ml-1">
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
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">{isEasyMode ? "Missing Cells" : "Missing (Raw)"}</th>
                <th className="py-3 px-4">{isEasyMode ? "Unique Values" : "Distinct"}</th>
                <th className="py-3 px-4">{isEasyMode ? "Summary & Typical Values" : "Distribution & Parameters"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {columns.map((col) => {
                const friendly = getTypeFriendlyLabel(col.type);
                return (
                  <tr key={col.name} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900">{col.name}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold border ${getTypeBadgeClass(
                          col.type
                        )}`}
                      >
                        {getTypeIcon(col.type)}
                        {friendly.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">
                      {Math.round(col.confidence * 100)}%
                    </td>
                    <td className="py-3 px-4">
                      {col.nullCount > 0 ? (
                        <span className="text-amber-600 font-semibold">
                          {col.nullCount} ({Math.round(col.nullRatio * 100)}%)
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">0 (Complete)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {col.distinctCount.toLocaleString()} {isEasyMode ? "different items" : "unique"}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {col.type === "numeric" && col.stats ? (
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
                            Avg: <strong>{col.stats.mean.toLocaleString()}</strong>
                          </span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
                            Middle: <strong>{col.stats.median.toLocaleString()}</strong>
                          </span>
                          <span className="text-slate-400">
                            Range: {col.stats.min.toLocaleString()} to {col.stats.max.toLocaleString()}
                          </span>
                        </div>
                      ) : col.topValues ? (
                        <div className="flex flex-wrap gap-1 text-[11px]">
                          {col.topValues.slice(0, 3).map((tv) => (
                            <span
                              key={tv.value}
                              className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                            >
                              {tv.value} ({tv.count})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Uniform data</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
