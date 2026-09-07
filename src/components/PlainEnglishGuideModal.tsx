import React from "react";
import {
  X,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Layers,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  FileSpreadsheet,
  ArrowRight,
} from "lucide-react";

interface PlainEnglishGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlainEnglishGuideModal: React.FC<PlainEnglishGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div
        id="plain-english-modal"
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl border border-slate-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Beginner's Guide & Plain English Explainer
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Understand your numbers, charts, and insights without any math or technical background
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Guide"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Cards */}
        <div className="mt-5 space-y-4 text-xs text-slate-700 leading-relaxed">
          {/* 1. What does this app do? */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-1.5 text-sm">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              What is this tool doing for me?
            </div>
            <p>
              When you drop in a spreadsheet or CSV file, this tool automatically acts like a full-time business analyst:
              it fixes messy formatting, cleans up duplicates and blanks, creates clear charts, discovers customer groups,
              and writes an executive summary highlighting what you should do next.
            </p>
          </div>

          {/* 2. Key Terms Explained Simply */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Health Score */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Data Health Score (0% to 100%)
              </div>
              <p className="text-slate-600">
                Think of this like a report card for your file. A 100% score means zero missing blanks, no duplicate entries,
                and consistent numbers that you can safely rely on for decision-making.
              </p>
            </div>

            {/* Connections / Correlations */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
                Number Connections (Correlations)
              </div>
              <p className="text-slate-600">
                Shows whether two numbers move together. For example: as advertising spend increases, total revenue tends to rise.
                If they are connected, knowing one helps you predict the other.
              </p>
            </div>

            {/* Groups / Clusters */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                <Layers className="h-4 w-4 text-purple-600" />
                Automatic Groups (Clusters)
              </div>
              <p className="text-slate-600">
                Similar to sorting customers into shopping tiers (e.g. "Frequent Big Spenders" vs. "Occasional Shoppers").
                The tool automatically groups similar rows together so you can treat each group differently.
              </p>
            </div>

            {/* Unusual Records / Outliers */}
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Unusual Records (Outliers)
              </div>
              <p className="text-slate-600">
                Rows that stand far apart from everything else—like a $50,000 order when most are $100.
                These are flagged so you can check them for typing mistakes or celebrate high-performing wins.
              </p>
            </div>
          </div>

          {/* 3. What did the auto-cleaner do? */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
              <FileSpreadsheet className="h-4 w-4 text-slate-700" />
              How did the tool clean my spreadsheet?
            </div>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>
                  <strong>Removed Duplicate Rows:</strong> If the exact same transaction appeared twice, the duplicate was safely dropped so totals aren't double-counted.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>
                  <strong>Filled Blank Spots (Imputation):</strong> If a cell was left empty, it was filled with the typical middle number (median) or most common category so calculations don't crash.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>
                  <strong>Standardized Text & Formats:</strong> Turned currency signs (like $1,200 or €850) into pure numbers, and made varied date styles consistent.
                </span>
              </li>
            </ul>
          </div>

          {/* 4. Tips for non-technical users */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 text-emerald-950">
            <div className="font-bold mb-1 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Pro Tip: You Can Download Your Cleaned File Anytime
            </div>
            <p className="text-[11px] text-emerald-900 leading-normal">
              Click <strong>"CSV"</strong> in the top-right navbar anytime to download your polished, error-free spreadsheet.
              It opens directly in Microsoft Excel, Google Sheets, or Apple Numbers.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Have more questions? Click the <strong>Ask Analyst</strong> chat bubble in the bottom corner!
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
          >
            Got it, take me back
          </button>
        </div>
      </div>
    </div>
  );
};
