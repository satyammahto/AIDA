import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { Navbar } from "./components/Navbar";
import { UploadModal } from "./components/UploadModal";
import { ExecutiveSummarySection } from "./components/ExecutiveSummarySection";
import { DashboardView } from "./components/DashboardView";
import { CleaningAuditView } from "./components/CleaningAuditView";
import { MachineLearningView } from "./components/MachineLearningView";
import { DataTableView } from "./components/DataTableView";
import { FloatingDataChatbot } from "./components/FloatingDataChatbot";
import { ProcessingStepper } from "./components/ProcessingStepper";
import { TechnicalDetailsAccordion } from "./components/TechnicalDetailsAccordion";
import { PRESET_DATASETS } from "./services/sampleDatasets";
import { processRawDataset } from "./services/pipeline";
import { ProcessedDataset } from "./types";
import { Sparkles, AlertCircle, RefreshCw } from "lucide-react";

export default function App() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_DATASETS[0].id);
  const [processedDataset, setProcessedDataset] = useState<ProcessedDataset | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "audit" | "ml" | "data">("dashboard");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [currentProcessingName, setCurrentProcessingName] = useState<string>(PRESET_DATASETS[0].name);

  // Load preset dataset on mount or selection
  const loadPreset = async (presetId: string) => {
    const preset = PRESET_DATASETS.find((p) => p.id === presetId);
    if (!preset) return;

    setIsProcessing(true);
    setCurrentProcessingName(preset.name);
    setErrorMessage(null);
    setSelectedPresetId(presetId);

    try {
      const result = await processRawDataset(preset.csvData, preset.name);
      setProcessedDataset(result);
    } catch (err: any) {
      console.error("Pipeline failure:", err);
      setErrorMessage(err?.message || "Failed to process the dataset.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    loadPreset(PRESET_DATASETS[0].id);
  }, []);

  // Process user uploaded data
  const handleProcessUploadedData = async (rawContent: string, name: string) => {
    setIsProcessing(true);
    setCurrentProcessingName(name);
    setErrorMessage(null);
    setSelectedPresetId("custom");
    setIsUploadModalOpen(false);

    try {
      const result = await processRawDataset(rawContent, name);
      setProcessedDataset(result);
      setActiveTab("dashboard");
    } catch (err: any) {
      console.error("Upload pipeline failure:", err);
      setErrorMessage(err?.message || "Failed to process custom uploaded data.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Export cleaned data to CSV
  const handleExportCsv = () => {
    if (!processedDataset || processedDataset.cleanedRows.length === 0) return;
    const cleanOnlyRows = processedDataset.cleanedRows.map((r) => {
      const copy = { ...r };
      delete copy._clusterId;
      delete copy._clusterName;
      delete copy._isOutlier;
      delete copy._anomalyScore;
      return copy;
    });

    const csvString = Papa.unparse(cleanOnlyRows);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${processedDataset.name.toLowerCase().replace(/\s+/g, "_")}_cleaned.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export executive insight report
  const handleExportReport = () => {
    if (!processedDataset) return;
    const reportText = `# Automated Insight Analyst Executive Report
Dataset: ${processedDataset.name}
Generated: ${new Date().toLocaleString()}

## Executive Headline
${processedDataset.summary.executiveHeadline}

## Narrative
${processedDataset.summary.narrative}

## Quality Health & Cleaning Audit
- Initial Raw Health Score: ${processedDataset.audit.rawHealthScore}%
- Cleaned Health Score: ${processedDataset.audit.cleanedHealthScore}%
- Raw Records: ${processedDataset.rawRows.length}
- Validated Records: ${processedDataset.cleanedRows.length}
- Duplicates Removed: ${processedDataset.audit.duplicatesRemoved}
- Missing Values Imputed: ${processedDataset.audit.missingValuesImputed}
- Formats Normalized: ${processedDataset.audit.formatsNormalized}

## Machine Learning Findings
- Primary Correlation: ${
      processedDataset.ml.correlations[0]
        ? `${processedDataset.ml.correlations[0].colA} x ${processedDataset.ml.correlations[0].colB} (r = ${processedDataset.ml.correlations[0].coefficient})`
        : "None"
    }
- Clusters Identified: ${processedDataset.ml.clusters.length}
- Anomalies Flagged: ${processedDataset.ml.outlierCount} records (${processedDataset.ml.outlierRatio})

## Key Findings
${processedDataset.summary.keyFindings.map((f, i) => `${i + 1}. **${f.title}**: ${f.finding}`).join("\n")}

## Actionable Recommendations
${processedDataset.summary.actionableRecommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}
`;

    const blob = new Blob([reportText], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${processedDataset.name.toLowerCase().replace(/\s+/g, "_")}_insight_report.md`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentDatasetId={selectedPresetId}
        onSelectPreset={loadPreset}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onExportCsv={handleExportCsv}
        onExportReport={handleExportReport}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        healthScore={processedDataset?.audit.cleanedHealthScore ?? 100}
        totalRows={processedDataset?.cleanedRows.length ?? 0}
        isProcessing={isProcessing}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 flex items-center justify-between rounded-xl bg-rose-50 p-4 border border-rose-200 text-rose-800">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => loadPreset(PRESET_DATASETS[0].id)}
              className="text-xs font-bold underline hover:text-rose-950"
            >
              Reset to default
            </button>
          </div>
        )}

        {/* Loading State / Transparent Processing Stepper (Screen 2) */}
        {isProcessing && (
          <ProcessingStepper datasetName={currentProcessingName} />
        )}

        {/* Main Processed Workspace */}
        {!isProcessing && processedDataset && (
          <div>
            {/* Always-visible Executive Summary Section */}
            <ExecutiveSummarySection
              summary={processedDataset.summary}
              dataset={processedDataset}
              onOpenChatbot={() => setIsChatbotOpen(true)}
            />

            {/* Tab Views */}
            {activeTab === "dashboard" && (
              <DashboardView dataset={processedDataset} />
            )}

            {activeTab === "audit" && (
              <CleaningAuditView dataset={processedDataset} />
            )}

            {activeTab === "ml" && (
              <MachineLearningView dataset={processedDataset} />
            )}

            {activeTab === "data" && (
              <DataTableView dataset={processedDataset} onExportCsv={handleExportCsv} />
            )}

            {/* Collapsed Technical Details Accordion (Screen 17 & SRS) */}
            <TechnicalDetailsAccordion dataset={processedDataset} />
          </div>
        )}
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onProcessData={handleProcessUploadedData}
        isProcessing={isProcessing}
      />

      {/* Floating Bottom-Right Chatbot (Floating Action Button + Window) */}
      <FloatingDataChatbot
        dataset={processedDataset}
        isOpen={isChatbotOpen}
        onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
      />
    </div>
  );
}
