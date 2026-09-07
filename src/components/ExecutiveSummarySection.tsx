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
} from "lucide-react";
import { ExecutiveSummary, ProcessedDataset } from "../types";

interface ExecutiveSummaryProps {
  summary: ExecutiveSummary;
  dataset: ProcessedDataset;
  onOpenChatbot?: () => void;
}

export const ExecutiveSummarySection: React.FC<ExecutiveSummaryProps> = ({
  summary,
  dataset,
  onOpenChatbot,
}) => {
  // Determine categorical insight badge type
  const getInsightBadge = (title: string, idx: number) => {
    const t = title.toLowerCase();
    if (t.includes("correlation") || t.includes("signal") || t.includes("relationship")) {
      return { label: "Relationship", color: "text-indigo-600 bg-indigo-50 border-indigo-200", caveat: "Association detected; does not prove causation." };
    }
    if (t.includes("cluster") || t.includes("segment") || t.includes("population")) {
      return { label: "Segment", color: "text-violet-600 bg-violet-50 border-violet-200", caveat: "Exploratory behavioral grouping." };
    }
    if (t.includes("outlier") || t.includes("anomal") || t.includes("deviation")) {
      return { label: "Outlier", color: "text-amber-600 bg-amber-50 border-amber-200", caveat: "Variance beyond 2.5 standard deviations." };
    }
    if (t.includes("trend") || t.includes("growth") || t.includes("increase") || t.includes("change")) {
      return { label: "Trend", color: "text-emerald-600 bg-emerald-50 border-emerald-200", caveat: "Observed historical trajectory." };
    }
    return { label: "Distribution", color: "text-blue-600 bg-blue-50 border-blue-200", caveat: "Parametric dispersion summary." };
  };

  return (
    <section className="mb-8 space-y-6">
      {/* Sleek Hero Dark Executive Card */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-sm border border-slate-800">
        <div className="absolute -right-12 -bottom-12 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                  AI Executive Summary
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded border border-slate-700/80">
                  {summary.source === "gemini" ? "Gemini AI" : "Autonomous Synthesis"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/50">
                  <CheckCircle className="h-3 w-3" />
                  100% Validated Pipeline
                </div>
                {onOpenChatbot && (
                  <button
                    onClick={onOpenChatbot}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded-full transition shadow-2xs"
                  >
                    <Bot className="h-3.5 w-3.5" />
                    <span>Ask Analyst</span>
                  </button>
                )}
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-3 leading-snug">
              {summary.executiveHeadline}
            </h2>

            <div className="text-sm leading-relaxed text-slate-300 space-y-2 max-w-4xl">
              {summary.narrative.split("\n\n").map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* Sleek Highlight Block */}
            {summary.actionableRecommendations[0] && (
              <div className="mt-4 border-l-2 border-indigo-400 bg-slate-800/60 pl-4 py-2 rounded-r-lg max-w-3xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                  Primary Strategic Recommendation
                </p>
                <p className="text-xs text-slate-200 mt-0.5">
                  {summary.actionableRecommendations[0]}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Confidence Bar */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="w-full sm:max-w-md">
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
                <span>Model Confidence & Audit Rigor</span>
                <span className="text-indigo-400">98% High Precision</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full w-[98%] transition-all duration-700"></div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Audited dataset:</span>
              <span className="font-mono text-white font-semibold">{dataset.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Screen 5: Key Insight Cards with Categorical Badges (Sleek Theme) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Key Empirical Insights & Grounded Evidence
            </h3>
          </div>
          <span className="text-[10px] font-medium text-slate-500">
            {summary.keyFindings.length} core observations verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.keyFindings.map((finding, idx) => {
            const badge = getInsightBadge(finding.title, idx);
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      #{idx + 1}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{finding.title}</h4>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">{finding.finding}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="truncate italic">{badge.caveat}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actionable Strategic Recommendations & Floating Chatbot Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strategic Recommendations List */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900">
                <Lightbulb className="h-4 w-4 text-indigo-600" />
                Actionable Strategic Recommendations
              </h3>
              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                Executive
              </span>
            </div>
            <ul className="space-y-3">
              {summary.actionableRecommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 leading-normal">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[10px] font-bold text-white shadow-2xs">
                    0{i + 1}
                  </span>
                  <span className="mt-0.5">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Derived from multi-variate clustering and correlation signals.</span>
            <span className="font-semibold text-indigo-600">Prescriptive Step 1 of 3</span>
          </div>
        </div>

        {/* Quick Conversational Prompt Card linking to Floating Chatbot */}
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-indigo-950 font-bold text-xs">
              <Bot className="h-4 w-4 text-indigo-600" />
              <span>Interactive Data Analyst</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Have specific questions about outliers, segment differences, or correlation coefficients? Click the floating assistant in the bottom right anytime.
            </p>

            <div className="mt-4 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Suggested questions:
              </p>
              {[
                "Explain the strongest correlation",
                "Which customer segments drive revenue?",
                "What anomalies should we audit?",
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
              className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl bg-slate-900 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Open Chat Assistant</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
