import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Cpu,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Sparkles,
  BookOpen,
  Code2,
} from "lucide-react";
import { ProcessedDataset } from "../types";

interface TechnicalDetailsAccordionProps {
  dataset: ProcessedDataset;
  isEasyMode?: boolean;
}

export const TechnicalDetailsAccordion: React.FC<TechnicalDetailsAccordionProps> = ({
  dataset,
  isEasyMode = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewStyle, setViewStyle] = useState<"simple" | "technical">("simple");

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-slate-50/70 hover:bg-slate-100/70 text-left transition"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-200 text-slate-700">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              How Was This Analysis Generated?
              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Behind the Scenes
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Learn how your file was cleaned, categorized, and analyzed step-by-step.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>{isOpen ? "Collapse" : "Explore How It Works"}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-6 border-t border-slate-100 space-y-6 text-xs text-slate-700">
          {/* Sub-toggle: Simple Explanation vs Technical Math */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-semibold">
              <button
                onClick={() => setViewStyle("simple")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 transition ${
                  viewStyle === "simple"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                Plain English Explanation
              </button>
              <button
                onClick={() => setViewStyle("technical")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 transition ${
                  viewStyle === "technical"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Code2 className="h-3.5 w-3.5 text-slate-600" />
                Technical & Math Specifications
              </button>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {viewStyle === "simple" ? "Written for everyday business users" : "Algorithms & formulas"}
            </span>
          </div>

          {viewStyle === "simple" ? (
            /* SIMPLE PLAIN ENGLISH VIEW */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Inspecting */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-2">
                    <Sliders className="h-4 w-4 text-indigo-600" />
                    1. Automatic Type Detection
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    The tool examines every column in your file to see whether it represents money, dates, names, or numbers.
                    You never have to tell it what each column means manually.
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-200/80 text-[10px] text-slate-500 font-medium">
                    Auto-classified {dataset.columns.length} columns with 95%+ confidence
                  </div>
                </div>

                {/* 2. Cleaning */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    2. Data Polishing & Repair
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Removed duplicate rows so numbers aren&apos;t double counted. Filled blank spots with reasonable middle values
                    so formulas and charts don&apos;t crash or produce errors.
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-200/80 text-[10px] text-emerald-700 font-medium">
                    {dataset.audit.duplicatesRemoved} duplicates dropped • {dataset.audit.missingValuesImputed} blanks filled
                  </div>
                </div>

                {/* 3. Discovering */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-2">
                    <Layers className="h-4 w-4 text-indigo-600" />
                    3. Smart Pattern Finding
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Grouped your records into natural categories (like customer shopping tiers) and tested every pair of columns
                    to see which numbers rise or fall together.
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-200/80 text-[10px] text-indigo-700 font-medium">
                    {dataset.ml.clusters.length} groups formed • {dataset.ml.correlations.length} connections evaluated
                  </div>
                </div>

                {/* 4. Common Sense Caution */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    4. Clear Guidance
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Connections between numbers show that they tend to happen together, but they do not guarantee that one causes the other.
                    Use these insights to guide questions and team decisions.
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-200/80 text-[10px] text-slate-500 font-medium">
                    Designed for decision-making
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TECHNICAL SPECIFICATIONS VIEW */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-2">
                    <Sliders className="h-4 w-4 text-indigo-600" />
                    1. Type Classification
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Heuristic sampling inspects non-null tokens for RFC-3339/ISO dates, clean numeric coercibility (accounting for currency symbols & separators), and distinct cardinality.
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-200/80 text-[10px] font-mono text-slate-500">
                    Confidence: 95%+ sample threshold
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    2. Cleaning & Normalization
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Deterministic deduplication identifies hash collisions. Missing numeric values use median imputation for skewed series and mean for Gaussian profiles.
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-200/80 text-[10px] font-mono text-slate-500">
                    {dataset.audit.duplicatesRemoved} duplicate rows dropped
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-2">
                    <Layers className="h-4 w-4 text-indigo-600" />
                    3. ML Engine
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Computes pairwise Pearson correlation matrices. K-Means clustering standardizes dimensional z-scores over k=2..5. Outlier detection computes 1.5x IQR Tukey fences.
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-200/80 text-[10px] font-mono text-slate-500">
                    {dataset.ml.clusters.length} clusters · {dataset.ml.outlierCount} outliers
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    4. Caveats & Non-Causality
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    All correlation insights describe empirical co-variance and statistical associations, not causal mechanisms. Outlier flags denote high variance relative to the sample.
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-200/80 text-[10px] font-mono text-slate-500">
                    Descriptive & Exploratory Scope
                  </div>
                </div>
              </div>

              {/* Transformation Log Table */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-2.5">
                  Applied Transformations & Pipeline Steps
                </h4>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-3.5 py-2">Operation Type</th>
                        <th className="px-3.5 py-2">Column / Scope</th>
                        <th className="px-3.5 py-2 text-right">Rows Affected</th>
                        <th className="px-3.5 py-2">Applied Strategy & Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                      {dataset.audit.actions.map((act, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-3.5 py-2 font-mono font-medium text-slate-900 capitalize">
                            {act.type.replace(/_/g, " ")}
                          </td>
                          <td className="px-3.5 py-2 text-slate-600">{act.column || "Full Table"}</td>
                          <td className="px-3.5 py-2 text-right font-mono font-medium">{act.count}</td>
                          <td className="px-3.5 py-2 text-slate-500">{act.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
