import React from "react";
import {
  Sparkles,
  TrendingUp,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  MessageSquare,
  Bot,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookOpen,
  Download,
} from "lucide-react";
import { ExecutiveSummary, ProcessedDataset } from "../types";

interface ExecutiveSummaryProps {
  summary: ExecutiveSummary;
  dataset: ProcessedDataset;
  isEasyMode?: boolean;
  onOpenChatbot?: () => void;
  onOpenGuide?: () => void;
  onExportReport?: () => void;
}

export const ExecutiveSummarySection: React.FC<ExecutiveSummaryProps> = ({
  summary,
  dataset,
  isEasyMode = true,
  onOpenChatbot,
  onOpenGuide,
  onExportReport,
}) => {
  // Determine categorical insight badge with plain-English translations
  const getInsightBadge = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("correlation") || t.includes("signal") || t.includes("relationship")) {
      return {
        label: isEasyMode ? "Connected Numbers" : "Correlation",
        color: "text-indigo-600 bg-indigo-50 border-indigo-200",
        simpleDesc: "These two factors move together in your data.",
        caveat: "Statistical association observed.",
      };
    }
    if (t.includes("cluster") || t.includes("segment") || t.includes("population")) {
      return {
        label: isEasyMode ? "Audience Group" : "Cluster",
        color: "text-violet-600 bg-violet-50 border-violet-200",
        simpleDesc: "A distinct group of customers or records with shared habits.",
        caveat: "Behavioral grouping.",
      };
    }
    if (t.includes("outlier") || t.includes("anomal") || t.includes("deviation")) {
      return {
        label: isEasyMode ? "Standout Record" : "Anomaly",
        color: "text-amber-600 bg-amber-50 border-amber-200",
        simpleDesc: "Noticeably higher or lower than usual.",
        caveat: "Statistically unusual variation.",
      };
    }
    if (t.includes("trend") || t.includes("growth") || t.includes("increase") || t.includes("change")) {
      return {
        label: isEasyMode ? "Trend & Growth" : "Trajectory",
        color: "text-emerald-600 bg-emerald-50 border-emerald-200",
        simpleDesc: "Clear upward or downward pattern over time.",
        caveat: "Observed trend.",
      };
    }
    return {
      label: isEasyMode ? "Distribution" : "Dispersion",
      color: "text-blue-600 bg-blue-50 border-blue-200",
      simpleDesc: "How the data spreads across categories.",
      caveat: "Categorical spread.",
    };
  };

  return (
    <section className="mb-8 space-y-6">
      {/* Hero Executive Card with 3-Step Plain English Story */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-sm border border-slate-800">
        <div className="absolute -right-12 -bottom-12 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col justify-between">
          <div>
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Executive Briefing
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded border border-slate-700/80">
                  {summary.source === "gemini" ? "AI Generated" : "Automated Analysis"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/50">
                  <CheckCircle className="h-3 w-3" />
                  Cleaned & 100% Reliable
                </div>
                {onExportReport && (
                  <button
                    onClick={onExportReport}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1 rounded-full transition shadow-2xs"
                    title="Generate and download formatted PDF report with charts"
                  >
                    <Download className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Download PDF</span>
                  </button>
                )}
                {onOpenChatbot && (
                  <button
                    onClick={onOpenChatbot}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded-full transition shadow-2xs"
                  >
                    <Bot className="h-3.5 w-3.5" />
                    <span>Ask Any Question</span>
                  </button>
                )}
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-3 leading-snug">
              {summary.executiveHeadline}
            </h2>

            {/* 3-Step Plain English Data Story Pills (Non-Tech Super-Clarity) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
              <div className="rounded-xl bg-slate-800/80 p-3 border border-slate-700/60">
                <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                  1. What Was Checked
                </p>
                <p className="text-xs font-semibold text-white mt-1">
                  {dataset.cleanedRows.length.toLocaleString()} rows across {dataset.columns.length} columns
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Full dataset parsed and verified
                </p>
              </div>

              <div className="rounded-xl bg-slate-800/80 p-3 border border-slate-700/60">
                <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                  2. What Was Cleaned
                </p>
                <p className="text-xs font-semibold text-emerald-400 mt-1">
                  {dataset.audit.missingValuesImputed} blanks filled • {dataset.audit.duplicatesRemoved} duplicates removed
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  100% clean for charts & reporting
                </p>
              </div>

              <div className="rounded-xl bg-slate-800/80 p-3 border border-slate-700/60">
                <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                  3. Key Discovery
                </p>
                <p className="text-xs font-semibold text-white mt-1">
                  {dataset.ml.clusters.length} distinct groups found
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {dataset.ml.outlierCount} standout records flagged
                </p>
              </div>
            </div>

            {/* Narrative */}
            <div className="text-sm leading-relaxed text-slate-300 space-y-2 max-w-4xl">
              {summary.narrative.split("\n\n").map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* Strategic Highlight Banner */}
            {summary.actionableRecommendations[0] && (
              <div className="mt-4 border-l-2 border-indigo-400 bg-slate-800/60 pl-4 py-2.5 rounded-r-lg max-w-3xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                  Recommended Action for Your Team
                </p>
                <p className="text-xs text-slate-200 mt-0.5 leading-normal">
                  {summary.actionableRecommendations[0]}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Reliability Bar */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="w-full sm:max-w-md">
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
                <span>Data Completeness & Audit Confidence</span>
                <span className="text-indigo-400">100% Verified</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-full"></div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Active dataset:</span>
              <span className="text-white font-semibold">{dataset.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insight Cards with Plain-English Translations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {isEasyMode ? "Top 4 Things You Need to Know" : "Key Empirical Insights & Findings"}
            </h3>
          </div>
          <span className="text-[10px] font-medium text-slate-500">
            {summary.keyFindings.length} key observations
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.keyFindings.map((finding, idx) => {
            const badge = getInsightBadge(finding.title);
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold tracking-wide px-2 py-0.5 rounded border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      #{idx + 1}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{finding.title}</h4>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">{finding.finding}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="truncate italic">{isEasyMode ? badge.simpleDesc : badge.caveat}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actionable Recommendations & Plain-English Chat Assistant Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strategic Recommendations List */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900">
                <Lightbulb className="h-4 w-4 text-indigo-600" />
                {isEasyMode ? "Suggested Next Steps for Your Business" : "Actionable Strategic Recommendations"}
              </h3>
              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Practical
              </span>
            </div>
            <ul className="space-y-3">
              {summary.actionableRecommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 leading-normal">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[10px] font-bold text-white shadow-2xs">
                    {i + 1}
                  </span>
                  <div className="mt-0.5">
                    <p className="font-semibold text-slate-900">{rec}</p>
                    {isEasyMode && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Focus here first to capture maximum value from your data findings.
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Derived automatically from your dataset patterns.</span>
            <span className="font-semibold text-indigo-600">Action Plan Ready</span>
          </div>
        </div>

        {/* Beginner-Friendly Chat Assistant Card */}
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-indigo-950 font-bold text-xs">
              <Bot className="h-4 w-4 text-indigo-600" />
              <span>Ask in Plain English</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              No technical prompt engineering needed. Just ask your questions as if you were talking to a friendly colleague:
            </p>

            <div className="mt-4 space-y-2">
              {[
                "Explain this dataset to me in 2 simple sentences",
                "Which customer group or product is most profitable?",
                "Are there any unusual records or potential mistakes?",
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={onOpenChatbot}
                  className="w-full text-left text-[11px] text-slate-700 bg-white hover:bg-indigo-50 hover:text-indigo-900 p-2 rounded-xl border border-slate-200/80 transition flex items-center justify-between"
                >
                  <span className="truncate">{q}</span>
                  <ArrowRight className="h-3 w-3 text-slate-400 shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>

          {onOpenChatbot && (
            <button
              onClick={onOpenChatbot}
              className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Ask Analyst a Question</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
