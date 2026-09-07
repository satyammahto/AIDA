import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Bot,
  X,
  Send,
  Sparkles,
  ChevronDown,
  RotateCcw,
  Copy,
  Check,
  HelpCircle,
  Database,
} from "lucide-react";
import { ProcessedDataset } from "../types";

interface FloatingDataChatbotProps {
  dataset: ProcessedDataset | null;
  isOpen: boolean;
  onToggle: () => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  source?: string;
}

export const FloatingDataChatbot: React.FC<FloatingDataChatbotProps> = ({
  dataset,
  isOpen,
  onToggle,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested prompts based on dataset context
  const suggestedPrompts = [
    "What is the strongest correlation finding?",
    "Describe the clusters identified by K-Means",
    "Which records were flagged as anomalies?",
    "What data cleaning actions were applied?",
    "What are the top actionable recommendations?",
  ];

  useEffect(() => {
    if (dataset && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          sender: "bot",
          text: `Hello! I am your Automated Data Analyst for "${dataset.name}". I have analyzed ${dataset.cleanedRows.length} cleaned rows across ${dataset.columns.length} columns with an overall health score of ${dataset.audit.cleanedHealthScore}%. Ask me anything about correlations, clusters, anomalies, or KPIs!`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          source: "Autonomous Analyst",
        },
      ]);
    }
  }, [dataset]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (customPrompt?: string) => {
    const q = (customPrompt || inputQuery).trim();
    if (!q || !dataset) return;

    const userMessageId = Date.now().toString();
    const userMsg: ChatMessage = {
      id: userMessageId,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputQuery("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ask-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          datasetProfile: {
            datasetName: dataset.name,
            totalRows: dataset.cleanedRows.length,
            cleanedRows: dataset.cleanedRows.length,
            healthScore: dataset.audit.cleanedHealthScore,
            columns: dataset.columns.map((c) => ({
              name: c.name,
              type: c.type,
              mean: c.mean,
              min: c.min,
              max: c.max,
              distinctCount: c.distinctCount,
            })),
            numericSummaries: dataset.columns
              .filter((c) => c.type === "numeric")
              .reduce((acc, c) => {
                acc[c.name] = { mean: c.mean, sum: c.sum, stdDev: c.stdDev, min: c.min, max: c.max };
                return acc;
              }, {} as Record<string, any>),
          },
          mlInsights: {
            clusters: dataset.ml.clusters,
            correlations: dataset.ml.correlations.slice(0, 5),
            outlierCount: dataset.ml.outlierCount,
            outlierRatio: dataset.ml.outlierRatio,
          },
          sampleRows: dataset.cleanedRows.slice(0, 5),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "bot",
            text: data.answer || "No response received.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            source: "Gemini AI",
          },
        ]);
      } else {
        throw new Error("API returned non-200");
      }
    } catch {
      // Local zero-latency fallback grounded strictly in computed evidence
      const fallbackText = generateLocalEvidenceAnswer(q, dataset);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          source: "Deterministic Engine",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    if (!dataset) return;
    setMessages([
      {
        id: "welcome-reset",
        sender: "bot",
        text: `Conversation reset. Ready to query dataset "${dataset.name}".`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <aside aria-label="Dataset AI Assistant" className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Floating Chat Window */}
      {isOpen && (
        <div
          id="floating-chatbot-panel"
          className="mb-3 w-[360px] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-slate-900 text-white border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <Bot className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white tracking-wide">
                    Automated Data Analyst
                  </h3>
                  <span className="text-[9px] font-semibold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/30">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 truncate max-w-[220px]">
                  {dataset ? `${dataset.name} · ${dataset.cleanedRows.length} rows` : "No dataset active"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Reset conversation"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onToggle}
                title="Close chat"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Preset Suggested Query Chips */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <Sparkles className="h-3 w-3 text-indigo-600 shrink-0 ml-1" />
            {suggestedPrompts.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading || !dataset}
                className="shrink-0 text-[10px] font-medium text-slate-600 bg-white hover:bg-slate-100 hover:text-slate-900 px-2 py-1 rounded-full border border-slate-200 transition disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#F8FAFC]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`relative max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-br-xs"
                      : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs"
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {msg.sender === "bot" && (
                    <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px] text-slate-400">
                      <span>{msg.source || "Data Analyst"}</span>
                      <button
                        onClick={() => handleCopyText(msg.text, msg.id)}
                        className="flex items-center gap-1 hover:text-slate-600 transition"
                      >
                        {copiedId === msg.id ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 px-1 mt-0.5">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="flex items-center gap-1 rounded-2xl bg-white px-3.5 py-2.5 border border-slate-200 text-slate-500 shadow-2xs">
                  <Bot className="h-3.5 w-3.5 text-indigo-600 animate-spin" />
                  <span className="text-xs">Analyzing dataset metrics...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-1.5"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about this dataset..."
              disabled={isLoading || !dataset}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim() || !dataset}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm hover:bg-slate-800 disabled:opacity-40 transition"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger Button in Bottom-Right */}
      <button
        id="floating-chatbot-toggle"
        onClick={onToggle}
        className={`group flex items-center gap-2.5 rounded-full px-4 py-3 shadow-xl transition-all duration-200 ${
          isOpen
            ? "bg-slate-900 text-white ring-2 ring-indigo-500"
            : "bg-slate-900 text-white hover:bg-indigo-700 hover:shadow-indigo-500/20"
        }`}
        aria-expanded={isOpen}
      >
        <div className="relative flex items-center justify-center">
          <Bot className="h-5 w-5 text-indigo-300 group-hover:rotate-6 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
          </span>
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold tracking-tight">Data Analyst</span>
          <span className="text-[10px] text-slate-300 font-medium">
            {isOpen ? "Close assistant" : "Ask questions"}
          </span>
        </div>
      </button>
    </aside>
  );
};

// Grounded local deterministic insight fallback
function generateLocalEvidenceAnswer(question: string, dataset: ProcessedDataset): string {
  const q = question.toLowerCase();
  const numericCols = dataset.columns.filter((c) => c.type === "numeric");
  const topCorr = dataset.ml.correlations[0];

  if (q.includes("correlation") || q.includes("relationship") || q.includes("depend")) {
    if (topCorr) {
      return `The strongest statistical association is between ${topCorr.colA} and ${topCorr.colB} with Pearson r = ${topCorr.coefficient > 0 ? "+" : ""}${topCorr.coefficient} (${topCorr.strength} ${topCorr.direction} correlation).\n\nCaveat: This indicates a mutual statistical relationship, not direct causation.`;
    }
    return "No strong linear correlation (Pearson |r| > 0.4) was detected across the numeric dimensions.";
  }

  if (q.includes("cluster") || q.includes("segment")) {
    const list = dataset.ml.clusters
      .map((c) => `• ${c.name}: ${c.size} records (${c.percentage}%), marked by ${c.topCharacteristics.slice(0, 2).join(" & ")}`)
      .join("\n");
    return `K-Means clustering partitioned the dataset into ${dataset.ml.clusters.length} distinct operational clusters:\n${list}`;
  }

  if (q.includes("outlier") || q.includes("anomal")) {
    if (dataset.ml.outlierCount === 0) {
      return "Zero statistical outliers were identified. All numeric records fall within 2.5 standard deviations / 1.5x IQR boundaries.";
    }
    const sampleReason = dataset.ml.outliers[0]?.reasons[0] || "values exceeding normal distribution range";
    return `An anomaly audit identified ${dataset.ml.outlierCount} records (${dataset.ml.outlierRatio}) exceeding 2.5 standard deviations or 1.5x IQR. Example finding: ${sampleReason}.`;
  }

  if (q.includes("clean") || q.includes("quality") || q.includes("hygiene")) {
    return `Automated hygiene raised the data health score from ${dataset.audit.rawHealthScore}% to ${dataset.audit.cleanedHealthScore}%. This resolved ${dataset.audit.missingValuesImputed} null cells, removed ${dataset.audit.duplicatesRemoved} duplicate rows, and standardized ${dataset.audit.formatsNormalized} format inconsistencies.`;
  }

  if (q.includes("recommend") || q.includes("action") || q.includes("next step")) {
    const recs = dataset.summary.actionableRecommendations
      .map((r, i) => `${i + 1}. ${r}`)
      .join("\n");
    return `Recommended Strategic Actions:\n${recs}`;
  }

  const primary = numericCols[0];
  return `Dataset Overview for "${dataset.name}":\n• Validated Rows: ${dataset.cleanedRows.length.toLocaleString()}\n• Detected Attributes: ${dataset.columns.length} columns (${dataset.columns.map((c) => c.name).slice(0, 4).join(", ")})\n• Primary Metric: ${primary?.name || "N/A"} (Cumulative: ${(primary?.sum || 0).toLocaleString()}, Mean: ${(primary?.mean || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })})\n• Health Score: ${dataset.audit.cleanedHealthScore}%`;
}
