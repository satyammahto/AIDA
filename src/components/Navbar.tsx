import React from "react";
import {
  Sparkles,
  Database,
  BarChart3,
  ShieldCheck,
  Cpu,
  Table as TableIcon,
  Upload,
  Download,
  FileText,
  ChevronDown,
} from "lucide-react";
import { PRESET_DATASETS } from "../services/sampleDatasets";

interface NavbarProps {
  currentDatasetId: string;
  onSelectPreset: (id: string) => void;
  onOpenUpload: () => void;
  onExportCsv: () => void;
  onExportReport: () => void;
  activeTab: "dashboard" | "audit" | "ml" | "data";
  setActiveTab: (tab: "dashboard" | "audit" | "ml" | "data") => void;
  healthScore: number;
  totalRows: number;
  isProcessing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentDatasetId,
  onSelectPreset,
  onOpenUpload,
  onExportCsv,
  onExportReport,
  activeTab,
  setActiveTab,
  healthScore,
  totalRows,
  isProcessing,
}) => {
  return (
    <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xl shadow-sm">
            Σ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Insight Engine v2.4
              </h1>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200/80">
                Autonomous
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Automated Dataset Analysis & Heuristic Visual Engine
            </p>
          </div>
        </div>

        {/* Dataset Selector & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Status Pill (Sleek Theme style) */}
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100/90 shadow-2xs">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              {healthScore}% Quality • {totalRows} Rows
            </span>
          </div>

          {/* Preset Selector */}
          <div className="relative">
            <select
              id="dataset-selector"
              aria-label="Select Dataset"
              value={currentDatasetId}
              onChange={(e) => onSelectPreset(e.target.value)}
              disabled={isProcessing}
              className="appearance-none rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            >
              <optgroup label="Benchmark Datasets">
                {PRESET_DATASETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="User Data">
                <option value="custom">Custom Uploaded Dataset</option>
              </optgroup>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Upload Button */}
          <button
            id="btn-upload-data"
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:border-slate-400"
          >
            <Upload className="h-3.5 w-3.5 text-slate-500" />
            <span>Upload Data</span>
          </button>

          {/* Export Report (Sleek Dark Button) */}
          <button
            id="btn-export-report"
            onClick={onExportReport}
            title="Export Full Insight Audit Report"
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Export Report</span>
          </button>

          {/* Export CSV */}
          <button
            id="btn-export-csv"
            onClick={onExportCsv}
            title="Export Cleaned Dataset as CSV"
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <nav className="flex flex-wrap gap-1 sm:gap-2" aria-label="Tabs">
          <button
            id="tab-dashboard"
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "dashboard"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span className={activeTab === "dashboard" ? "text-indigo-400" : "text-indigo-600"}>
              01
            </span>
            <BarChart3 className="h-3.5 w-3.5" />
            Auto Dashboard
          </button>

          <button
            id="tab-audit"
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "audit"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span className={activeTab === "audit" ? "text-indigo-400" : "text-indigo-600"}>
              02
            </span>
            <ShieldCheck className="h-3.5 w-3.5" />
            Hygiene & Schema
          </button>

          <button
            id="tab-ml"
            onClick={() => setActiveTab("ml")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "ml"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span className={activeTab === "ml" ? "text-indigo-400" : "text-indigo-600"}>
              03
            </span>
            <Cpu className="h-3.5 w-3.5" />
            Machine Learning
          </button>

          <button
            id="tab-data"
            onClick={() => setActiveTab("data")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "data"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <span className={activeTab === "data" ? "text-indigo-400" : "text-indigo-600"}>
              04
            </span>
            <TableIcon className="h-3.5 w-3.5" />
            Records Explorer
          </button>
        </nav>

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
            Automating pipeline...
          </div>
        )}
      </div>
    </header>
  );
};
