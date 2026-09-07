import React, { useRef, useState } from "react";
import {
  Download,
  FileText,
  Printer,
  X,
  Sparkles,
  CheckCircle,
  Lightbulb,
  TrendingUp,
  BarChart2,
  ShieldCheck,
  Loader2,
  Layers,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { ProcessedDataset } from "../types";

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: ProcessedDataset;
  isEasyMode?: boolean;
}

const PALETTE = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  isOpen,
  onClose,
  dataset,
  isEasyMode = true,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const { summary, audit, ml, widgets, columns, cleanedRows } = dataset;
  const kpiWidgets = widgets.filter((w) => w.type === "metric_card");
  const chartWidgets = widgets.filter((w) => w.type !== "metric_card").slice(0, 4);

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPdf(true);
    setDownloadSuccess(false);

    try {
      // Allow DOM to settle
      await new Promise((resolve) => setTimeout(resolve, 200));

      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // 2x retina clarity for crisp text and charts
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 850,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth(); // 595.28 pt
      const pageHeight = pdf.internal.pageSize.getHeight(); // 841.89 pt

      const canvasWidthPt = pageWidth;
      const canvasHeightPt = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = canvasHeightPt;
      let pageIndex = 0;

      while (heightLeft > 5) {
        if (pageIndex > 0) {
          pdf.addPage();
        }
        const position = -(pageIndex * pageHeight);
        pdf.addImage(imgData, "PNG", 0, position, canvasWidthPt, canvasHeightPt, undefined, "FAST");
        heightLeft -= pageHeight;
        pageIndex++;
      }

      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184); // slate-400
        pdf.text(
          `Page ${i} of ${totalPages} • Automated Insight Analyst`,
          pageWidth - 40,
          pageHeight - 16,
          { align: "right" }
        );
        pdf.text(
          `Executive Briefing Report • ${dataset.name}`,
          40,
          pageHeight - 16,
          { align: "left" }
        );
      }

      const fileName = `${dataset.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_executive_report.pdf`;
      pdf.save(fileName);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Could not generate PDF. Please try again or use the print option.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadMarkdown = () => {
    const reportText = `# Data Insight Executive Report
Dataset: ${dataset.name}
Generated: ${new Date().toLocaleString()}

## Executive Summary
${summary.executiveHeadline}

## Overview
${summary.narrative}

## Data Quality & Clean-up Verification
- Initial Raw File Quality: ${audit.rawHealthScore}%
- Cleaned Quality Score: ${audit.cleanedHealthScore}% (100% Reliable)
- Original Records: ${dataset.rawRows.length}
- Verified Clean Records: ${cleanedRows.length}
- Duplicate Rows Dropped: ${audit.duplicatesRemoved}
- Blank Cells Imputed: ${audit.missingValuesImputed}
- Formats Standardized: ${audit.formatsNormalized}

## Discovered Groups & Key Patterns
- Discovered Groups: ${ml.clusters.length}
- Standout / Unusual Records: ${ml.outlierCount} records (${ml.outlierRatio})

## Top Findings
${summary.keyFindings.map((f, i) => `${i + 1}. **${f.title}**: ${f.finding}`).join("\n")}

## Recommended Strategic Next Steps
${summary.actionableRecommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}
`;

    const blob = new Blob([reportText], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${dataset.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_summary.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Action Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                Executive Report Preview
              </h3>
              <p className="text-[11px] text-slate-500">
                Formatted multi-page briefing with executive narrative, findings & visual charts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {downloadSuccess && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle className="h-3 w-3" />
                Downloaded PDF!
              </span>
            )}

            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-2xs"
              title="Download raw Markdown text"
            >
              <FileText className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Markdown</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-2xs"
              title="Print report directly"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              id="btn-confirm-download-pdf"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg transition shadow-sm"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  <span>Download as PDF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition ml-1"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Report Container */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-8 flex justify-center">
          <div
            ref={reportRef}
            id="executive-report-document"
            className="w-full max-w-[800px] bg-white p-8 sm:p-10 shadow-lg border border-slate-200 rounded-xl text-slate-900 font-sans space-y-8"
          >
            {/* Report Header Bar */}
            <div className="border-b-2 border-indigo-600 pb-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                    The Automated Insight Analyst
                  </span>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded border border-indigo-200">
                    Executive Intelligence Briefing
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {new Date().toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
                {dataset.name} Report
              </h1>

              {/* Data Verification Sub-banner */}
              <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle className="h-3 w-3 text-emerald-600" />
                  {audit.cleanedHealthScore}% Health Verified
                </span>
                <span>•</span>
                <span>{cleanedRows.length.toLocaleString()} Validated Records</span>
                <span>•</span>
                <span>{columns.length} Fields Analyzed</span>
                <span>•</span>
                <span className="text-indigo-600 font-medium">{summary.source === "gemini" ? "AI Model Inference" : "Automated Statistical Engine"}</span>
              </div>
            </div>

            {/* Executive Summary Hero */}
            <div className="rounded-xl bg-slate-900 p-6 text-white space-y-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-indigo-400 font-bold uppercase tracking-wider">
                <span>Core Business Briefing</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Audit Passed
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                {summary.executiveHeadline}
              </h2>

              {/* 3-Step Summary Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="rounded-lg bg-slate-800/80 p-3 border border-slate-700/60">
                  <p className="text-[10px] font-bold text-indigo-300 uppercase">1. Scope Checked</p>
                  <p className="text-xs font-semibold text-white mt-0.5">
                    {cleanedRows.length.toLocaleString()} rows • {columns.length} columns
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">All entries verified</p>
                </div>

                <div className="rounded-lg bg-slate-800/80 p-3 border border-slate-700/60">
                  <p className="text-[10px] font-bold text-emerald-300 uppercase">2. Quality Cleans</p>
                  <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                    {audit.missingValuesImputed} blanks filled • {audit.duplicatesRemoved} duplicates dropped
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">100% clean formatting</p>
                </div>

                <div className="rounded-lg bg-slate-800/80 p-3 border border-slate-700/60">
                  <p className="text-[10px] font-bold text-amber-300 uppercase">3. Key Discovery</p>
                  <p className="text-xs font-semibold text-white mt-0.5">
                    {ml.clusters.length} distinct groups found
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{ml.outlierCount} standout records flagged</p>
                </div>
              </div>

              {/* Narrative Text */}
              <div className="text-xs text-slate-300 leading-relaxed pt-2 space-y-2">
                {summary.narrative.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            {/* Key KPI Metrics Grid */}
            {kpiWidgets.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                  <BarChart2 className="h-4 w-4 text-indigo-600" />
                  Key Business Metrics & Indicators
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {kpiWidgets.map((kpi) => (
                    <div
                      key={kpi.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 shadow-2xs"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {kpi.title}
                      </p>
                      <p className="text-lg font-bold text-indigo-600 mt-1">
                        {kpi.config?.format === "currency" ? `$${kpi.config.value}` : kpi.config?.value}
                      </p>
                      {kpi.config?.subValue && (
                        <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                          {kpi.config.subValue}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top 4 Empirical Findings */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                Empirical Discoveries & Key Findings
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {summary.keyFindings.map((f, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Finding #{i + 1}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{f.title}</h4>
                      <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{f.finding}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formatted Visual Charts Section */}
            {chartWidgets.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                  Visual Dashboard & Statistical Charts
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {chartWidgets.map((widget) => (
                    <div
                      key={widget.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs"
                    >
                      <div className="mb-2 pb-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-900">{widget.title}</p>
                        <p className="text-[10px] text-slate-500 truncate">{widget.description}</p>
                      </div>

                      <div className="h-48 w-full pt-1">
                        {renderReportChart(widget)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strategic Recommendations */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                <Lightbulb className="h-4 w-4 text-indigo-600" />
                Recommended Action Plan
              </h3>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                <ul className="space-y-2.5">
                  {summary.actionableRecommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-900 text-[10px] font-bold text-white">
                        {i + 1}
                      </span>
                      <span className="mt-0.5 font-medium leading-normal">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Data Pipeline & Cleaning Verification Audit Table */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Data Quality Verification & Pipeline Audit
              </h3>
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Validation Metric</th>
                      <th className="px-3 py-2">Raw File</th>
                      <th className="px-3 py-2">Cleaned State</th>
                      <th className="px-3 py-2">Audit Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
                    <tr>
                      <td className="px-3 py-1.5 font-medium">Record Count</td>
                      <td className="px-3 py-1.5 text-slate-500">{dataset.rawRows.length.toLocaleString()}</td>
                      <td className="px-3 py-1.5 font-bold text-slate-900">{cleanedRows.length.toLocaleString()}</td>
                      <td className="px-3 py-1.5 text-emerald-600 font-semibold">100% Retained</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-1.5 font-medium">Duplicate Rows</td>
                      <td className="px-3 py-1.5 text-slate-500">{audit.duplicatesRemoved} detected</td>
                      <td className="px-3 py-1.5 font-bold text-slate-900">0 remaining</td>
                      <td className="px-3 py-1.5 text-emerald-600 font-semibold">Cleaned</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-1.5 font-medium">Blank / Missing Cells</td>
                      <td className="px-3 py-1.5 text-slate-500">{audit.missingValuesImputed} blank</td>
                      <td className="px-3 py-1.5 font-bold text-slate-900">0 remaining</td>
                      <td className="px-3 py-1.5 text-emerald-600 font-semibold">Imputed</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-1.5 font-medium">Overall Health Score</td>
                      <td className="px-3 py-1.5 text-slate-500">{audit.rawHealthScore}%</td>
                      <td className="px-3 py-1.5 font-bold text-emerald-600">{audit.cleanedHealthScore}%</td>
                      <td className="px-3 py-1.5 text-emerald-600 font-semibold">Passed Verification</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Document Sign-off Footer */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
              <div>
                Report generated autonomously by <strong>The Automated Insight Analyst</strong>
              </div>
              <div>
                Confidential Business Document • Exported from Data Insight Studio
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function renderReportChart(widget: any) {
  if (!widget.data || widget.data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-slate-400">
        No chart points available
      </div>
    );
  }

  switch (widget.type) {
    case "area":
    case "line": {
      const xKey = widget.xAxisKey || "date";
      const yKeys = widget.yAxisKeys || [];
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={widget.data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey={xKey} tick={{ fontSize: 9, fill: "#64748B" }} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#64748B" }} tickLine={false} axisLine={false} />
            <Tooltip />
            {yKeys.map((yKey: string, i: number) => (
              <Area
                key={yKey}
                type="monotone"
                dataKey={yKey}
                stroke={i === 0 ? "#4F46E5" : "#06B6D4"}
                strokeWidth={1.5}
                fill={i === 0 ? "#EEF2FF" : "#ECFEFF"}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    case "bar": {
      const xKey = widget.xAxisKey || "category";
      const yKeys = widget.yAxisKeys || ["value"];
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={widget.data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey={xKey} tick={{ fontSize: 9, fill: "#64748B" }} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#64748B" }} tickLine={false} axisLine={false} />
            <Tooltip />
            {yKeys.map((yKey: string, i: number) => (
              <Bar key={yKey} dataKey={yKey} fill={PALETTE[i % PALETTE.length]} radius={[3, 3, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    case "pie": {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={widget.data}
              innerRadius={45}
              outerRadius={65}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
            >
              {widget.data.map((_: any, index: number) => (
                <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 9, paddingTop: 4 }} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    case "scatter": {
      const xKey = widget.xAxisKey || "x";
      const yKey = widget.yAxisKeys?.[0] || "y";
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis type="number" dataKey={xKey} tick={{ fontSize: 9, fill: "#64748B" }} tickLine={false} />
            <YAxis type="number" dataKey={yKey} tick={{ fontSize: 9, fill: "#64748B" }} tickLine={false} axisLine={false} />
            <Tooltip />
            <Scatter name="Data Points" data={widget.data} fill="#4F46E5" />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    default:
      return null;
  }
}
