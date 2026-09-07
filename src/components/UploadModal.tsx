import React, { useState, useRef } from "react";
import { X, Upload, FileCode, CheckCircle2, AlertCircle, FileText, Trash2, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

interface QueuedFile {
  id: string;
  file: File;
  name: string;
  size: string;
  parsedContent: string;
  rowCountEstimate: number;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcessData: (content: string, name: string) => void;
  isProcessing: boolean;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onProcessData,
  isProcessing,
}) => {
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [datasetName, setDatasetName] = useState("Custom Imported Dataset");
  const [pastedText, setPastedText] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFiles = async (files: File[]) => {
    setError(null);
    const newQueued: QueuedFile[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      try {
        let textContent = "";

        if (ext === "xlsx" || ext === "xls") {
          const buffer = await file.arrayBuffer();
          const workbook = XLSX.read(buffer, { type: "array" });
          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error("Excel workbook contains no sheets");
          }

          // Search for sheet with the most data rows
          let bestSheet = workbook.SheetNames[0];
          let maxRows = 0;
          for (const sName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sName];
            if (sheet && sheet["!ref"]) {
              const range = XLSX.utils.decode_range(sheet["!ref"]);
              const rowCount = range.e.r - range.s.r + 1;
              if (rowCount > maxRows) {
                maxRows = rowCount;
                bestSheet = sName;
              }
            }
          }

          const targetSheet = workbook.Sheets[bestSheet];
          if (!targetSheet) throw new Error("No readable sheet found in Excel workbook");
          
          // Convert sheet to JSON records directly
          const jsonRecords = XLSX.utils.sheet_to_json(targetSheet, { defval: "" });
          if (jsonRecords.length > 0) {
            textContent = JSON.stringify(jsonRecords);
          } else {
            // Fallback to CSV if sheet_to_json found no header
            textContent = XLSX.utils.sheet_to_csv(targetSheet);
          }
        } else {
          textContent = await file.text();
        }

        if (!textContent || textContent.trim() === "") {
          setError(`File "${file.name}" is empty.`);
          continue;
        }

        let estimatedRows = 0;
        const trimmed = textContent.trim();
        if (trimmed.startsWith("[")) {
          try {
            estimatedRows = JSON.parse(trimmed).length;
          } catch {
            estimatedRows = 0;
          }
        } else {
          const normalizedLines = trimmed.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
          estimatedRows = Math.max(0, normalizedLines.length - 1);
        }

        const item: QueuedFile = {
          id: Math.random().toString(36).substring(2, 9),
          file,
          name: file.name,
          size: formatFileSize(file.size),
          parsedContent: textContent,
          rowCountEstimate: estimatedRows,
        };
        newQueued.push(item);
      } catch (err: any) {
        setError(`Failed to read "${file.name}": ${err?.message || "Invalid file format"}`);
      }
    }

    if (newQueued.length > 0) {
      setQueuedFiles((prev) => [...prev, ...newQueued]);
      // Ensure the first uploaded file is immediately selected
      setSelectedFileId(newQueued[0].id);
      setDatasetName(newQueued[0].name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
    }
  };

  const handleSelectFile = (fileItem: QueuedFile) => {
    setSelectedFileId(fileItem.id);
    setDatasetName(fileItem.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
  };

  const handleRemoveFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setQueuedFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== id);
      if (selectedFileId === id) {
        if (filtered[0]) {
          setSelectedFileId(filtered[0].id);
          setDatasetName(filtered[0].name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
        } else {
          setSelectedFileId(null);
        }
      }
      return filtered;
    });
  };

  const handleSubmit = () => {
    const fileToUse = queuedFiles.find((f) => f.id === selectedFileId) || queuedFiles[0];
    const content = fileToUse ? fileToUse.parsedContent : pastedText;

    if (!content || content.trim().length === 0) {
      setError("Please select a file or paste dataset rows to analyze.");
      return;
    }

    const cleanName = datasetName.trim() || (fileToUse ? fileToUse.name.replace(/\.[^/.]+$/, "") : "Custom Dataset");
    onProcessData(content, cleanName);
  };

  const activeFile = queuedFiles.find((f) => f.id === selectedFileId) || queuedFiles[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span className="text-indigo-600 font-bold">00</span> DATASET INGESTION PIPELINE
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload CSV, XLSX, XLS, TSV, or JSON. Columns, schema, and machine learning heuristics are derived automatically.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-4 space-y-4">
          {/* Dataset Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dataset Display Name
            </label>
            <input
              type="text"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              placeholder="e.g. Q3 Regional Sales & Clinical Outcomes"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Drag & Drop File Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
              dragActive
                ? "border-indigo-500 bg-indigo-50/50"
                : "border-slate-200 hover:border-slate-300 bg-slate-50/60"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".csv,.xlsx,.xls,.tsv,.json,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-2xs border border-slate-200 text-slate-600 mb-2">
              <Upload className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-slate-800">
              Drag and drop spreadsheet files here, or <span className="text-indigo-600">browse</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports multi-file upload (.csv, .xlsx, .xls, .tsv, .json) up to 25MB
            </p>
          </div>

          {/* Queued Files List */}
          {queuedFiles.length > 0 && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-600">
                Uploaded Files ({queuedFiles.length}) — Select primary dataset to analyze:
              </label>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {queuedFiles.map((f) => {
                  const isSelected = f.id === selectedFileId;
                  const isExcel = f.name.endsWith(".xlsx") || f.name.endsWith(".xls");
                  return (
                    <div
                      key={f.id}
                      onClick={() => handleSelectFile(f)}
                      className={`cursor-pointer flex items-center justify-between p-2.5 rounded-xl border text-xs transition ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50/50 text-indigo-950 font-semibold"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isExcel ? (
                          <FileSpreadsheet className="h-4 w-4 text-emerald-600 shrink-0" />
                        ) : (
                          <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                        )}
                        <span className="truncate">{f.name}</span>
                        <span className="text-[10px] text-slate-400">({f.size} · ~{f.rowCountEstimate} rows)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100/60 px-2 py-0.5 rounded">
                            Active
                          </span>
                        )}
                        <button
                          onClick={(e) => handleRemoveFile(f.id, e)}
                          title="Remove file"
                          className="text-slate-400 hover:text-red-500 transition p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Or Paste Raw Text */}
          {queuedFiles.length === 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Or paste CSV / JSON directly
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Header row required</span>
              </div>
              <textarea
                rows={4}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Product,Sales,Discount,Units,Date&#10;Widget A,1200,0.1,50,2026-01-15&#10;Widget B,850,0.05,30,2026-01-16"
                className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-[11px] text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="text-[11px] text-slate-400">
            {activeFile ? (
              <span>Ready: <span className="font-semibold text-slate-700">{activeFile.name}</span></span>
            ) : pastedText.trim() ? (
              <span>Ready to parse pasted data</span>
            ) : (
              <span>Select or drop a file to start</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isProcessing || (!activeFile && !pastedText.trim())}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 transition"
            >
              {isProcessing ? "Processing..." : "Analyze Dataset"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
