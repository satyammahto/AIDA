import React from "react";
import {
  Sparkles,
  BarChart3,
  ShieldCheck,
  Cpu,
  Table as TableIcon,
  Upload,
  Download,
  FileText,
  ChevronDown,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  BookOpen,
} from "lucide-react";
import { PRESET_DATASETS } from "../services/sampleDatasets";

interface NavbarProps {
  currentDatasetId: string;
  onSelectPreset: (id: string) => void;
  onOpenUpload: () => void;
  onExportCsv: () => void;
  onExportReport: () => void;
  onOpenGuide: () => void;
  isEasyMode: boolean;
  onToggleEasyMode: () => void;
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
  onOpenGuide,
  isEasyMode,
  onToggleEasyMode,
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
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Data Insight Studio
              </h1>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-700 border border-emerald-200">
                Non-Tech Friendly
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Automated Spreadsheet Cleaning, Visual Dashboards & Plain-English Insights
            </p>
          </div>
        </div>

        {/* Dataset Selector & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Beginner Guide Button */}
          <button
            id="btn-open-guide"
            onClick={onOpenGuide}
            title="Open Plain English Guide & Data Glossary"
            className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/60 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100/70 transition shadow-2xs"
          >
            <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
            <span>Simple Guide</span>
          </button>

          {/* Plain English Mode Switch */}
          <button
            id="btn-toggle-easy-mode"
            onClick={onToggleEasyMode}
            title={isEasyMode ? "Switch to detailed technical mode" : "Switch to plain English mode"}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition shadow-2xs ${
              isEasyMode
                ? "border-emerald-200 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100"
                : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {isEasyMode ? (
              <ToggleRight className="h-4 w-4 text-emerald-600" />
            ) : (
              <ToggleLeft className="h-4 w-4 text-slate-400" />
            )}
            <span>{isEasyMode ? "Plain English: ON" : "Technical Mode"}</span>
          </button>

          {/* Quality Pill */}
          <div
            className="flex items-center gap-2 bg-slate-50 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs"
            title="Data quality score based on completeness, uniqueness, and clean formatting."
          >
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[11px] font-semibold tracking-wide">
              {healthScore}% Cleaned • {totalRows.toLocaleString()} Rows
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
              <optgroup label="Sample Files to Try">
                {PRESET_DATASETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Your Files">
                <option value="custom">Custom Uploaded File</option>
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
            <span>Upload File</span>
          </button>

          {/* Export PDF Report */}
          <button
            id="btn-export-report"
            onClick={onExportReport}
            title="Preview and Download formatted Executive PDF Report with charts and insights"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download PDF</span>
          </button>

          {/* Export CSV */}
          <button
            id="btn-export-csv"
            onClick={onExportCsv}
            title="Download Cleaned Data as an Excel-ready CSV spreadsheet"
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Excel/CSV</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <nav className="flex flex-wrap gap-1 sm:gap-2" aria-label="Tabs">
          <button
            id="tab-dashboard"
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === "dashboard"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <BarChart3 className={`h-4 w-4 ${activeTab === "dashboard" ? "text-indigo-400" : "text-indigo-600"}`} />
            <span>Visual Dashboard</span>
            <span className={`text-[10px] hidden md:inline font-normal ${activeTab === "dashboard" ? "text-slate-300" : "text-slate-400"}`}>
              (Charts & KPIs)
            </span>
          </button>

          <button
            id="tab-audit"
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === "audit"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <ShieldCheck className={`h-4 w-4 ${activeTab === "audit" ? "text-emerald-400" : "text-emerald-600"}`} />
            <span>Data Quality & Clean-up</span>
            <span className={`text-[10px] hidden md:inline font-normal ${activeTab === "audit" ? "text-slate-300" : "text-slate-400"}`}>
              (Fixed blanks & duplicates)
            </span>
          </button>

          <button
            id="tab-ml"
            onClick={() => setActiveTab("ml")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === "ml"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Cpu className={`h-4 w-4 ${activeTab === "ml" ? "text-indigo-400" : "text-indigo-600"}`} />
            <span>Smart Insights & Groups</span>
            <span className={`text-[10px] hidden md:inline font-normal ${activeTab === "ml" ? "text-slate-300" : "text-slate-400"}`}>
              (Patterns & outliers)
            </span>
          </button>

          <button
            id="tab-data"
            onClick={() => setActiveTab("data")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === "data"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <TableIcon className={`h-4 w-4 ${activeTab === "data" ? "text-indigo-400" : "text-indigo-600"}`} />
            <span>Browse Clean Data</span>
            <span className={`text-[10px] hidden md:inline font-normal ${activeTab === "data" ? "text-slate-300" : "text-slate-400"}`}>
              (Interactive table)
            </span>
          </button>
        </nav>

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
            Automating analysis...
          </div>
        )}
      </div>
    </header>
  );
};
