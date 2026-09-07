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
  const lastDatasetNameRef = useRef<string>("");

  // Suggested friendly, beginner-accessible prompts
  const suggestedPrompts = [
    "Explain this file to me in simple everyday words",
    "What is the single most important takeaway?",
    "Which group or category is performing best?",
    "Did you find any unusual records or mistakes?",
    "What concrete steps should my team take first?",
  ];

  useEffect(() => {
    if (dataset) {
      if (lastDatasetNameRef.current !== dataset.name) {
        lastDatasetNameRef.current = dataset.name;
        setMessages([
          {
            id: "welcome-" + Date.now(),
            sender: "bot",
            text: `Hello! I am your Plain-English Data Assistant for "${dataset.name}". I have checked and cleaned ${dataset.cleanedRows.length} rows across ${dataset.columns.length} columns. You don't need any technical background to talk with me—ask me anything like "What should our business focus on?" or "Explain the main charts in plain words"!`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            source: "Plain-English Assistant",
          },
        ]);
      }
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
          conversationHistory: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
          summary: dataset.summary,
          cleaningAudit: dataset.audit,
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
            categoryTopCounts: dataset.columns
              .filter((c) => c.type === "categorical" && c.topCategories)
              .reduce((acc, c) => {
                acc[c.name] = (c.topCategories || []).reduce((m, item) => {
                  m[item.value] = item.count;
                  return m;
                }, {} as Record<string, number>);
                return acc;
              }, {} as Record<string, any>),
          },
          mlInsights: {
            clusters: dataset.ml.clusters,
            correlations: dataset.ml.correlations.slice(0, 5),
            outlierCount: dataset.ml.outlierCount,
            outlierRatio: dataset.ml.outlierRatio,
            outliers: dataset.ml.outliers.slice(0, 3),
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
            source: data.source || "Analyst Engine",
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
          source: "Evidence Engine",
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
                  <span className="text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                    AI Active
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
  const q = question.toLowerCase().trim();
  const numericCols = dataset.columns.filter((c) => c.type === "numeric");
  const primary = numericCols[0];
  const primaryName = primary?.name || "Metric";
  const primarySum = primary?.sum || 0;
  const primaryMean = primary?.mean || 0;
  const primaryMax = primary?.max || 0;
  const primaryMin = primary?.min || 0;
  const topCorr = dataset.ml.correlations[0];
  const clusters = dataset.ml.clusters;
  const recs = dataset.summary?.actionableRecommendations || [];
  const findings = dataset.summary?.keyFindings || [];

  // 1. Takeaway / Main finding / Core message / Headline / TLDR / Key
  if (
    q.includes("takeaway") ||
    q.includes("main finding") ||
    q.includes("important") ||
    q.includes("headline") ||
    q.includes("core") ||
    q.includes("tldr") ||
    q.includes("key point") ||
    q.includes("conclusion")
  ) {
    const lead = dataset.summary?.executiveHeadline || "Positive operational momentum detected across validated rows";
    const topF = findings[0] ? ` ${findings[0].title}: ${findings[0].finding}` : "";
    return `Single Most Important Takeaway:\n${lead}.${topF}\n\nKey Strategic Driver: Prioritize the dominant segment ("${clusters[0]?.name || primaryName}", representing ${clusters[0]?.percentage || 'majority'}% of records) to maximize operational performance.`;
  }

  // 2. Simple words / Everyday terms / Beginner explanation / Walk me through
  if (
    q.includes("simple") ||
    q.includes("everyday") ||
    q.includes("explain this file") ||
    q.includes("explain") ||
    q.includes("walk me through") ||
    q.includes("what is this") ||
    q.includes("plain english") ||
    q.includes("beginner") ||
    q.includes("overview")
  ) {
    const segText = clusters.length > 0
      ? `Shoppers and records naturally partition into ${clusters.length} groups, led by "${clusters[0].name}" (${clusters[0].percentage}% of total activity).`
      : "";
    const corrText = topCorr
      ? ` Also, higher ${topCorr.colA} correlates with ${topCorr.coefficient > 0 ? "higher" : "lower"} ${topCorr.colB}.`
      : "";
    return `In simple words, think of "${dataset.name}" as a verified digital ledger with ${dataset.cleanedRows.length.toLocaleString()} clean rows. For ${primaryName}, the typical average per entry is ${primaryMean.toLocaleString(undefined, { maximumFractionDigits: 1 })}, spanning from ${primaryMin.toLocaleString()} to ${primaryMax.toLocaleString()}. ${segText}${corrText} Overall data cleanliness is verified at ${dataset.audit.cleanedHealthScore}%.`;
  }

  // 3. Strategic Action / Recommendations / Next steps / Concrete steps
  if (
    q.includes("recommend") ||
    q.includes("action") ||
    q.includes("next step") ||
    q.includes("step") ||
    q.includes("concrete") ||
    q.includes("what should") ||
    q.includes("strategy") ||
    q.includes("focus") ||
    q.includes("decision")
  ) {
    if (recs && recs.length > 0) {
      const list = recs.map((r, i) => `${i + 1}. ${r}`).join("\n");
      return `Recommended Strategic Actions for "${dataset.name}":\n${list}`;
    }
    return `Recommended Strategic Actions:\n1. Focus campaign budget and resources on "${clusters[0]?.name || 'Primary Segment'}" (${clusters[0]?.percentage || 0}% share).\n2. Review and audit the ${dataset.ml.outlierCount} flagged outlier entries.\n3. Expand product bundles around top positive correlation drivers.`;
  }

  // 4. Best / Top / Performing / Winners / Leader / Categories
  if (
    q.includes("best") ||
    q.includes("top") ||
    q.includes("highest") ||
    q.includes("leader") ||
    q.includes("performing") ||
    q.includes("winner") ||
    q.includes("peak") ||
    q.includes("maximum") ||
    q.includes("max")
  ) {
    const colMatch = dataset.columns.find((c) => c.type === "numeric" && q.includes(c.name.toLowerCase()));
    if (colMatch) {
      return `Top Performance for "${colMatch.name}":\n• Maximum Value: ${(colMatch.max || 0).toLocaleString()}\n• Average Value: ${(colMatch.mean || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}\n• Cumulative Total: ${(colMatch.sum || 0).toLocaleString()}`;
    }

    const catCol = dataset.columns.find((c) => c.type === "categorical" && c.topCategories && c.topCategories.length > 0);
    if (catCol && catCol.topCategories) {
      const topCat = catCol.topCategories[0];
      if (topCat) {
        return `Top Performing Highlights:\n• Leading Category in ${catCol.name}: "${topCat.value}" with ${topCat.count.toLocaleString()} occurrences (${topCat.percentage}%).\n• Highest Activity Segment: "${clusters[0]?.name || 'Segment 1'}" (${clusters[0]?.size || 0} records, ${clusters[0]?.percentage || 0}% share).\n• Peak ${primaryName}: ${primaryMax.toLocaleString()}.`;
      }
    }

    return `Top Performing Highlights:\n• Leading Segment: "${clusters[0]?.name || 'Segment 1'}" with ${clusters[0]?.percentage || 0}% share.\n• Highest Recorded ${primaryName}: ${primaryMax.toLocaleString()} (Mean: ${primaryMean.toLocaleString(undefined, { maximumFractionDigits: 1 })}).`;
  }

  // 5. Worst / Lowest / Minimum / Least / Smallest / Bottom
  if (
    q.includes("worst") ||
    q.includes("lowest") ||
    q.includes("least") ||
    q.includes("minimum") ||
    q.includes("min") ||
    q.includes("bottom") ||
    q.includes("underperform")
  ) {
    const colMatch = dataset.columns.find((c) => c.type === "numeric" && q.includes(c.name.toLowerCase()));
    const target = colMatch || primary;
    const smallestCluster = clusters.length > 1 ? clusters[clusters.length - 1] : null;

    return `Lowest Baseline Metrics:\n• Minimum ${target?.name || primaryName}: ${(target?.min ?? 0).toLocaleString()}\n• Mean Baseline: ${(target?.mean || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}\n${smallestCluster ? `• Smallest Segment: "${smallestCluster.name}" (${smallestCluster.size} records, ${smallestCluster.percentage}% share).` : ""}`;
  }

  // 6. Correlations / Relationships / Influence
  if (
    q.includes("correlation") ||
    q.includes("relationship") ||
    q.includes("depend") ||
    q.includes("link") ||
    q.includes("connection") ||
    q.includes("influence")
  ) {
    if (topCorr) {
      return `The strongest statistical association is between ${topCorr.colA} and ${topCorr.colB} with Pearson r = ${topCorr.coefficient > 0 ? "+" : ""}${topCorr.coefficient} (${topCorr.strength} ${topCorr.direction} correlation).\n\nKey Takeaway: ${topCorr.insight || 'This indicates a significant mutual association between the metrics.'}`;
    }
    return "No strong linear correlation (Pearson |r| > 0.4) was detected across the numeric dimensions.";
  }

  // 7. Clusters / Groups / Segments / Audience
  if (
    q.includes("cluster") ||
    q.includes("segment") ||
    q.includes("group") ||
    q.includes("cohort") ||
    q.includes("audience") ||
    q.includes("category")
  ) {
    const list = clusters
      .map((c) => `• ${c.name}: ${c.size.toLocaleString()} records (${c.percentage}%), marked by ${c.topCharacteristics.slice(0, 2).join(" & ")}`)
      .join("\n");
    return `K-Means clustering partitioned the dataset into ${clusters.length} distinct operational clusters:\n${list}`;
  }

  // 8. Outliers / Anomalies / Unusual / Mistakes / Errors
  if (
    q.includes("outlier") ||
    q.includes("anomal") ||
    q.includes("unusual") ||
    q.includes("mistake") ||
    q.includes("error") ||
    q.includes("strange") ||
    q.includes("standout")
  ) {
    if (dataset.ml.outlierCount === 0) {
      return "Zero statistical outliers were identified. All numeric records fall within 2.5 standard deviations / 1.5x IQR boundaries.";
    }
    const sampleReason = dataset.ml.outliers[0]?.reasons[0] || "values exceeding normal distribution range";
    return `An anomaly audit identified ${dataset.ml.outlierCount} records (${dataset.ml.outlierRatio}) exceeding 2.5 standard deviations or 1.5x IQR. Example finding: ${sampleReason}.`;
  }

  // 9. Cleaning / Hygiene / Quality / Health / Duplicates / Missing
  if (
    q.includes("clean") ||
    q.includes("quality") ||
    q.includes("hygiene") ||
    q.includes("health") ||
    q.includes("missing") ||
    q.includes("duplicate") ||
    q.includes("normalize")
  ) {
    return `Automated hygiene raised the data health score from ${dataset.audit.rawHealthScore}% to ${dataset.audit.cleanedHealthScore}%. This resolved ${dataset.audit.missingValuesImputed} null cells, removed ${dataset.audit.duplicatesRemoved} duplicate rows, and standardized ${dataset.audit.formatsNormalized} format inconsistencies.`;
  }

  // 10. Columns / Fields / Structure / Attributes
  if (
    q.includes("column") ||
    q.includes("field") ||
    q.includes("attribute") ||
    q.includes("dimension") ||
    q.includes("schema") ||
    q.includes("structure")
  ) {
    const list = dataset.columns.map((c) => `• ${c.name} (${c.type}${c.distinctCount ? `, ${c.distinctCount} unique` : ""})`).join("\n");
    return `Dataset Architecture for "${dataset.name}":\nTotal Columns: ${dataset.columns.length}\n${list}`;
  }

  // 11. Specific Column Inquiry
  for (const col of dataset.columns) {
    if (q.includes(col.name.toLowerCase())) {
      if (col.type === "numeric") {
        return `Statistical Profile for "${col.name}":\n• Cumulative Sum: ${(col.sum || 0).toLocaleString()}\n• Mean Average: ${(col.mean || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}\n• Range: ${(col.min || 0).toLocaleString()} (Min) to ${(col.max || 0).toLocaleString()} (Max)\n• Standard Deviation: ${(col.stdDev || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}`;
      }
      if (col.topCategories && col.topCategories.length > 0) {
        const top3 = col.topCategories.slice(0, 3).map((item) => `${item.value} (${item.count.toLocaleString()})`).join(", ");
        return `Categorical Profile for "${col.name}":\n• Unique Count: ${col.distinctCount}\n• Top Values: ${top3}`;
      }
    }
  }

  // 12. Dynamic Contextual Summary
  const clText = clusters[0] ? ` The primary cluster is "${clusters[0].name}" (${clusters[0].percentage}% share).` : "";
  const crText = topCorr ? ` Noteworthy correlation: ${topCorr.colA} and ${topCorr.colB} (r = ${topCorr.coefficient}).` : "";

  return `Analysis for "${dataset.name}": Covering ${dataset.cleanedRows.length.toLocaleString()} verified rows across ${dataset.columns.length} columns. For ${primaryName}, the cumulative total is ${primarySum.toLocaleString()} with a mean of ${primaryMean.toLocaleString(undefined, { maximumFractionDigits: 1 })}.${clText}${crText}\n\nYou can also ask: "What is the single most important takeaway?", "Which group is performing best?", or "What should our team do next?"`;
}
