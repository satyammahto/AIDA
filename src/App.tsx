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
import { PlainEnglishGuideModal } from "./components/PlainEnglishGuideModal";
import { ExecutiveReportModal } from "./components/ExecutiveReportModal";
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
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isEasyMode, setIsEasyMode] = useState<boolean>(true); // Plain English mode by default
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

  // Open formatted executive report & PDF download modal
  const handleExportReport = () => {
    if (!processedDataset) return;
    setIsReportModalOpen(true);
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
        onOpenGuide={() => setIsGuideOpen(true)}
        isEasyMode={isEasyMode}
        onToggleEasyMode={() => setIsEasyMode(!isEasyMode)}
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

        {/* Loading State / Transparent Processing Stepper */}
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
              isEasyMode={isEasyMode}
              onOpenChatbot={() => setIsChatbotOpen(true)}
              onOpenGuide={() => setIsGuideOpen(true)}
              onExportReport={handleExportReport}
            />

            {/* Tab Views */}
            {activeTab === "dashboard" && (
              <DashboardView
                dataset={processedDataset}
                isEasyMode={isEasyMode}
                onExportReport={handleExportReport}
              />
            )}

            {activeTab === "audit" && (
              <CleaningAuditView dataset={processedDataset} isEasyMode={isEasyMode} />
            )}

            {activeTab === "ml" && (
              <MachineLearningView dataset={processedDataset} isEasyMode={isEasyMode} />
            )}

            {activeTab === "data" && (
              <DataTableView dataset={processedDataset} onExportCsv={handleExportCsv} />
            )}

            {/* Collapsed Technical Details Accordion */}
            <TechnicalDetailsAccordion dataset={processedDataset} isEasyMode={isEasyMode} />
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

      {/* Floating Bottom-Right Chatbot */}
      <FloatingDataChatbot
        dataset={processedDataset}
        isOpen={isChatbotOpen}
        onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
      />

      {/* Beginner & Plain-English Guide Modal */}
      <PlainEnglishGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Formatted Executive Report & PDF Download Modal */}
      {processedDataset && (
        <ExecutiveReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          dataset={processedDataset}
          isEasyMode={isEasyMode}
        />
      )}
    </div>
  );
}
