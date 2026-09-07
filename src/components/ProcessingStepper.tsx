import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Sparkles, Database, FileSpreadsheet, Cpu, BarChart3, ShieldCheck } from "lucide-react";

interface ProcessingStepperProps {
  datasetName: string;
}

const STAGES = [
  { id: 1, title: "Uploading & Parsing", desc: "Validating file format and parsing raw tabular records", icon: FileSpreadsheet },
  { id: 2, title: "Inferring Schema", desc: "Determining numeric, date, and categorical columns", icon: Database },
  { id: 3, title: "Cleaning & Normalizing", desc: "Removing duplicate rows and imputing missing cells", icon: ShieldCheck },
  { id: 4, title: "Machine Learning Analysis", desc: "Computing correlations, K-Means clusters, and IQR outliers", icon: Cpu },
  { id: 5, title: "Generating Visualizations", desc: "Compiling charts, KPI metrics, and executive findings", icon: BarChart3 },
];

export const ProcessingStepper: React.FC<ProcessingStepperProps> = ({ datasetName }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => (prev < 5 ? prev + 1 : prev));
    }, 1100);

    return () => {
      clearInterval(timer);
      clearInterval(stepTimer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        {/* Header */}
        <div className="text-center pb-6 border-b border-slate-100">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Automated Insight Pipeline in Progress
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            Autonomous ingestion of <span className="font-semibold text-slate-800 font-mono">"{datasetName}"</span>. Transforming raw records into an analyzed dashboard.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
            <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />
            <span>Elapsed: {elapsedSeconds}s</span>
          </div>
        </div>

        {/* Stepper list */}
        <div className="mt-6 space-y-4">
          {STAGES.map((stage) => {
            const isCompleted = stage.id < currentStep;
            const isCurrent = stage.id === currentStep;
            const Icon = stage.icon;

            return (
              <div
                key={stage.id}
                className={`flex items-start gap-3.5 p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? "border-indigo-200 bg-indigo-50/50 shadow-2xs"
                    : isCompleted
                    ? "border-slate-100 bg-slate-50/60 opacity-80"
                    : "border-transparent opacity-40"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    isCompleted
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-indigo-600 text-white animate-pulse"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-bold ${isCurrent ? "text-indigo-950" : "text-slate-900"}`}>
                      {stage.title}
                    </p>
                    {isCurrent && (
                      <span className="text-[10px] font-semibold text-indigo-600 animate-pulse">
                        Analyzing...
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-[10px] font-semibold text-emerald-600">Done</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{stage.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            <span>Overall Pipeline Completion</span>
            <span className="text-indigo-600">{Math.min(currentStep * 20, 100)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(currentStep * 20, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
