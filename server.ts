import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// AI candidate models in priority order: gemini-3.1-flash-lite first for instant response, followed by flash alternatives
const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-3.8-flash",
];

// Groq High-Speed LLM Inference integration
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

let cachedGroqModels: string[] | null = null;
let lastGroqModelFetch = 0;

async function getAvailableGroqChatModels(): Promise<string[]> {
  const now = Date.now();
  if (cachedGroqModels && now - lastGroqModelFetch < 30 * 60 * 1000) {
    return cachedGroqModels;
  }

  const preferredOrder = [
    "groq/compound-mini",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "groq/compound",
  ];

  if (!GROQ_API_KEY) return preferredOrder;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
    });
    if (res.ok) {
      const data = (await res.json()) as any;
      const ids: string[] = (data?.data || [])
        .map((m: any) => m.id)
        .filter((id: string) => typeof id === "string" && !id.includes("whisper") && !id.includes("guard"));

      const sorted = preferredOrder.filter((m) => ids.includes(m));
      for (const id of ids) {
        if (!sorted.includes(id)) {
          sorted.push(id);
        }
      }
      if (sorted.length > 0) {
        cachedGroqModels = sorted;
        lastGroqModelFetch = now;
        return sorted;
      }
    }
  } catch (err: any) {
    console.warn("Could not query Groq models list:", err?.message || err);
  }

  return preferredOrder;
}

function cleanGroqText(text: string): string {
  if (!text) return "";
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  if (cleaned.includes("**Answer") || cleaned.includes("### Answer")) {
    const answerMatch = cleaned.match(/(?:\*\*Answer.*?\*\*|### Answer[\s\S]*?)\n+([\s\S]+)$/i);
    if (answerMatch && answerMatch[1]) {
      cleaned = answerMatch[1].trim();
    }
  }
  if (cleaned.startsWith("```") && cleaned.endsWith("```")) {
    cleaned = cleaned.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();
  }
  return cleaned;
}

async function callGroqChat(
  systemPrompt: string,
  userPrompt: string
): Promise<{ text: string; modelUsed: string } | null> {
  if (!GROQ_API_KEY) return null;

  const candidateModels = await getAvailableGroqChatModels();

  for (const model of candidateModels) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 450,
        }),
      });

      if (!response.ok) {
        continue;
      }

      const data = (await response.json()) as any;
      const content = data?.choices?.[0]?.message?.content;
      if (content && typeof content === "string" && content.trim().length > 0) {
        const cleaned = cleanGroqText(content);
        if (cleaned.length > 0) {
          return { text: cleaned, modelUsed: `Groq (${model})` };
        }
      }
    } catch {
      // try next candidate model
    }
  }

  return null;
}

async function callGroqJson(
  systemPrompt: string,
  userPrompt: string
): Promise<{ data: any; modelUsed: string } | null> {
  if (!GROQ_API_KEY) return null;

  const jsonCandidateModels = [
    "groq/compound-mini",
    "openai/gpt-oss-120b",
    "groq/compound",
  ];

  for (const model of jsonCandidateModels) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
          max_tokens: 700,
        }),
      });

      if (!response.ok) continue;

      const data = (await response.json()) as any;
      const content = data?.choices?.[0]?.message?.content;
      if (content) {
        const cleaned = cleanGroqText(content);
        const parsed = JSON.parse(cleaned);
        if (parsed.executiveHeadline || parsed.narrative) {
          return { data: parsed, modelUsed: `Groq (${model})` };
        }
      }
    } catch {
      // try next candidate
    }
  }

  return null;
}

async function callGeminiWithFallback(
  ai: GoogleGenAI,
  prompt: string,
  config?: any
): Promise<{ text: string; modelUsed: string } | null> {
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });
      if (response && response.text) {
        return { text: response.text, modelUsed: model };
      }
    } catch {
      // Gracefully try next candidate model without noisy console warnings
      await new Promise((res) => setTimeout(res, 150));
    }
  }
  return null;
}

function buildServerFallbackSummary(
  datasetProfile: any,
  cleaningAudit: any,
  mlInsights: any,
  sampleRows: any[]
) {
  const totalRows = datasetProfile.totalRows || 0;
  const cleanedRows = datasetProfile.cleanedRows || totalRows;
  const healthScore = datasetProfile.healthScore || 100;
  const columns = datasetProfile.columns || [];
  const topCorr = mlInsights?.correlations?.[0];
  const dominantCluster = mlInsights?.clusters?.[0];
  const outlierCount = mlInsights?.outlierCount || 0;
  const outlierRatio = mlInsights?.outlierRatio || "0%";

  const numSummaryKeys = Object.keys(datasetProfile.numericSummaries || {});
  const primaryMetricName = numSummaryKeys[0] || "Primary Metric";
  const primaryMetric = datasetProfile.numericSummaries?.[primaryMetricName] || {};

  const headline = `Dataset analyzed: ${cleanedRows.toLocaleString()} validated records processed with ${healthScore}% data health across ${columns.length} auto-detected attributes.`;

  const narrative = `Our automated ingestion pipeline completed full data normalization, resolving ${cleaningAudit?.missingCount || 0} missing data points and eliminating ${cleaningAudit?.duplicatesRemoved || 0} redundant records. Evaluation of ${primaryMetricName} indicates a cumulative volume of ${(primaryMetric.sum || 0).toLocaleString()} with a mean of ${(primaryMetric.mean || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}.\n\nMachine learning segmentation partitioned the cohort into ${mlInsights?.clusters?.length || 0} distinct behavioral clusters, with ${dominantCluster ? dominantCluster.name : "the primary segment"} comprising ${dominantCluster ? dominantCluster.percentage : 0}% of all records. Statistical anomaly detection flagged ${outlierCount} records (${outlierRatio}) exceeding normal operational variance.`;

  const keyFindings: { title: string; finding: string }[] = [];
  if (topCorr) {
    keyFindings.push({
      title: "Dominant Correlation Signal",
      finding: `${topCorr.colA} and ${topCorr.colB} exhibit a ${topCorr.strength} ${topCorr.direction} correlation (r = ${topCorr.coefficient > 0 ? "+" : ""}${topCorr.coefficient}), highlighting an interdependent performance trajectory.`,
    });
  }
  if (dominantCluster) {
    keyFindings.push({
      title: "Core Population Cluster",
      finding: `${dominantCluster.name} represents ${dominantCluster.size} records (${dominantCluster.percentage}%), distinguished by ${dominantCluster.topCharacteristics?.slice(0, 2).join(" and ") || "characteristic properties"}.`,
    });
  }
  if (outlierCount > 0) {
    keyFindings.push({
      title: "Operational Anomalies Flagged",
      finding: `${outlierCount} entries (${outlierRatio}) display extreme deviations beyond 2.5 standard deviations, warranting review for risk mitigation.`,
    });
  }
  if (numSummaryKeys.length > 1) {
    const secName = numSummaryKeys[1];
    const secMetric = datasetProfile.numericSummaries?.[secName] || {};
    keyFindings.push({
      title: `${secName} Distribution`,
      finding: `Averages ${(secMetric.mean || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} with standard deviation of ${(secMetric.stdDev || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}, demonstrating stable consistency across records.`,
    });
  }

  const actionableRecommendations = [
    `Focus optimization initiatives on ${dominantCluster ? dominantCluster.name : "the primary cluster"} to capitalize on high-density performance.`,
    topCorr
      ? `Leverage the ${topCorr.strength} correlation between ${topCorr.colA} and ${topCorr.colB} for predictive forecasting and operational calibration.`
      : `Review anomalous outlier records to establish guardrails against unexpected variance.`,
    `Maintain continuous automated cleaning pipelines to sustain data integrity scores above 95%.`,
  ];

  return {
    source: "fallback",
    executiveHeadline: headline,
    narrative,
    keyFindings,
    actionableRecommendations,
  };
}

function buildServerFallbackAnswer(
  question: string,
  datasetProfile: any,
  mlInsights: any,
  summary?: any,
  cleaningAudit?: any
): string {
  const qLower = (question || "").toLowerCase().trim();
  const datasetName = datasetProfile?.datasetName || "the active dataset";
  const totalRows = datasetProfile?.totalRows || datasetProfile?.cleanedRows || 0;
  const cleanedRows = datasetProfile?.cleanedRows || totalRows;
  const healthScore = datasetProfile?.healthScore || cleaningAudit?.cleanedHealthScore || 100;
  const columns: any[] = datasetProfile?.columns || [];
  const numericSummaries = datasetProfile?.numericSummaries || {};
  const numSummaryKeys = Object.keys(numericSummaries);
  const primaryMetricName = numSummaryKeys[0] || columns.find((c: any) => c.type === "numeric")?.name || "metric";
  const primaryMetric = numericSummaries[primaryMetricName] || {};
  const clusters: any[] = mlInsights?.clusters || [];
  const correlations: any[] = mlInsights?.correlations || [];
  const outlierCount = mlInsights?.outlierCount || 0;
  const outlierRatio = mlInsights?.outlierRatio || "0%";
  const topCorr = correlations[0];
  const recs: string[] = summary?.actionableRecommendations || [];
  const findings: any[] = summary?.keyFindings || [];
  const categoryTopCounts = datasetProfile?.categoryTopCounts || {};

  // 1. Takeaway / Main finding / Core message / Headline / TLDR / Summary
  if (
    qLower.includes("takeaway") ||
    qLower.includes("main finding") ||
    qLower.includes("important") ||
    qLower.includes("headline") ||
    qLower.includes("core") ||
    qLower.includes("tldr") ||
    qLower.includes("conclusion")
  ) {
    if (summary?.executiveHeadline) {
      const topFinding = findings[0] ? ` ${findings[0].title}: ${findings[0].finding}` : "";
      return `Key Takeaway: ${summary.executiveHeadline}.${topFinding}\n\nTop Priority: Focus operational effort on the dominant segment (${clusters[0]?.name || primaryMetricName}) to optimize overall performance.`;
    }
    if (topCorr) {
      return `Key Takeaway for "${datasetName}": The primary operational driver is the relationship between ${topCorr.colA} and ${topCorr.colB} (Pearson r = ${topCorr.coefficient > 0 ? "+" : ""}${topCorr.coefficient}). Overall, ${cleanedRows.toLocaleString()} verified records show a cumulative ${primaryMetricName} of ${(primaryMetric.sum || 0).toLocaleString()}.`;
    }
    return `Key Takeaway: The dataset "${datasetName}" reflects ${cleanedRows.toLocaleString()} records in strong condition (${healthScore}% health). For ${primaryMetricName}, performance averages ${(primaryMetric.mean || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} across the population.`;
  }

  // 2. Simple words / Everyday terms / Beginner explanation
  if (
    qLower.includes("simple") ||
    qLower.includes("everyday") ||
    qLower.includes("explain this file") ||
    qLower.includes("walk me through") ||
    qLower.includes("what is this") ||
    qLower.includes("plain english") ||
    qLower.includes("beginner")
  ) {
    const clusterDesc = clusters.length > 0
      ? `Shoppers and records naturally split into ${clusters.length} distinct groups (led by "${clusters[0].name}" at ${clusters[0].percentage}% of total activity).`
      : `Records span ${columns.length} tracked characteristics.`;
    const corrDesc = topCorr
      ? ` When ${topCorr.colA} increases, ${topCorr.colB} tends to ${topCorr.coefficient > 0 ? "rise alongside it" : "decrease"}.`
      : "";
    return `In plain words, think of "${datasetName}" as a reliable log tracking ${cleanedRows.toLocaleString()} entries. For ${primaryMetricName}, the average per record is ${(primaryMetric.mean || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} (ranging from ${(primaryMetric.min || 0).toLocaleString()} up to ${(primaryMetric.max || 0).toLocaleString()}). ${clusterDesc}${corrDesc} Data quality is vetted at ${healthScore}%.`;
  }

  // 3. Strategic Action / Recommendations / Next steps / What should we do
  if (
    qLower.includes("recommend") ||
    qLower.includes("action") ||
    qLower.includes("next step") ||
    qLower.includes("step") ||
    qLower.includes("what should") ||
    qLower.includes("strategy") ||
    qLower.includes("focus") ||
    qLower.includes("decision")
  ) {
    if (recs.length > 0) {
      const formatted = recs.map((r, i) => `${i + 1}. ${r}`).join("\n");
      return `Recommended Strategic Actions for "${datasetName}":\n${formatted}`;
    }
    return `Recommended Strategic Actions:\n1. Double down on high-performing segments: Allocate top resources toward the "${clusters[0]?.name || 'primary cluster'}" segment (${clusters[0]?.percentage || 'majority'}% share).\n2. Monitor anomalies: Review the ${outlierCount} flagged outlier entries to prevent skew or operational leakage.\n3. Leverage key relationships: Utilize the link between ${topCorr?.colA || 'primary metrics'} and ${topCorr?.colB || 'outcomes'} to drive growth.`;
  }

  // 4. Best / Top / Highest / Performing / Leaders / Categories
  if (
    qLower.includes("best") ||
    qLower.includes("top") ||
    qLower.includes("highest") ||
    qLower.includes("leader") ||
    qLower.includes("performing") ||
    qLower.includes("winner") ||
    qLower.includes("peak") ||
    qLower.includes("maximum") ||
    qLower.includes("max")
  ) {
    const matchedCol = columns.find((c: any) => qLower.includes(c.name.toLowerCase()));
    if (matchedCol && numericSummaries[matchedCol.name]) {
      const stats = numericSummaries[matchedCol.name];
      return `Top Performance for "${matchedCol.name}":\n• Maximum Value: ${(stats.max || 0).toLocaleString()}\n• Mean Average: ${(stats.mean || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}\n• Cumulative Total: ${(stats.sum || 0).toLocaleString()}\n• Standard Deviation: ${(stats.stdDev || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}`;
    }

    const catKeys = Object.keys(categoryTopCounts);
    if (catKeys.length > 0) {
      const catName = catKeys[0];
      const counts = categoryTopCounts[catName];
      const sortedEntries = Object.entries(counts).sort((a: any, b: any) => b[1] - a[1]);
      if (sortedEntries.length > 0) {
        const [topVal, topCount] = sortedEntries[0];
        const topCluster = clusters[0];
        return `Top Performer & Categories:\n• Leading Category in ${catName}: "${topVal}" with ${topCount} occurrences.\n• Highest Activity Segment: "${topCluster?.name || 'Segment 1'}" representing ${topCluster?.size || 0} records (${topCluster?.percentage || 0}% of all data).\n• Peak ${primaryMetricName}: ${(primaryMetric.max || 0).toLocaleString()}.`;
      }
    }

    return `Top Performance Highlights:\n• Dominant Segment: "${clusters[0]?.name || 'Primary Segment'}" (${clusters[0]?.percentage || 0}% share).\n• Peak ${primaryMetricName}: ${(primaryMetric.max || 0).toLocaleString()} (vs. mean of ${(primaryMetric.mean || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}).`;
  }

  // 5. Worst / Lowest / Minimum / Least / Smallest / Bottom
  if (
    qLower.includes("worst") ||
    qLower.includes("lowest") ||
    qLower.includes("least") ||
    qLower.includes("minimum") ||
    qLower.includes("min") ||
    qLower.includes("bottom") ||
    qLower.includes("underperform")
  ) {
    const matchedCol = columns.find((c: any) => c.type === "numeric" && qLower.includes(c.name.toLowerCase()));
    const targetName = matchedCol?.name || primaryMetricName;
    const targetStats = numericSummaries[targetName] || primaryMetric;
    const smallestCluster = clusters.length > 1 ? clusters[clusters.length - 1] : null;

    return `Lowest Baseline Metrics:\n• Minimum ${targetName}: ${(targetStats.min ?? 0).toLocaleString()}\n• Average Baseline: ${(targetStats.mean || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}\n${smallestCluster ? `• Smallest Segment: "${smallestCluster.name}" with ${smallestCluster.size} records (${smallestCluster.percentage}% share).` : ""}`;
  }

  // 6. Correlations / Relationships / Influences
  if (
    qLower.includes("correlation") ||
    qLower.includes("relationship") ||
    qLower.includes("depend") ||
    qLower.includes("link") ||
    qLower.includes("connection") ||
    qLower.includes("affect") ||
    qLower.includes("influence")
  ) {
    if (correlations.length > 0) {
      const list = correlations.slice(0, 3).map((c: any) =>
        `• ${c.colA} ↔ ${c.colB}: Pearson r = ${c.coefficient > 0 ? "+" : ""}${c.coefficient} (${c.strength} ${c.direction}). ${c.insight || ""}`
      ).join("\n");
      return `Discovered Relationships Across Attributes:\n${list}\n\nNote: Statistical correlation reflects co-movement in the records, but does not guarantee direct causation.`;
    }
    return "No strong linear correlation (Pearson |r| > 0.40) was identified between the numeric metrics in this dataset.";
  }

  // 7. Clusters / Segments / Audience / Groups / Cohorts
  if (
    qLower.includes("cluster") ||
    qLower.includes("segment") ||
    qLower.includes("group") ||
    qLower.includes("cohort") ||
    qLower.includes("audience") ||
    qLower.includes("category")
  ) {
    if (clusters.length > 0) {
      const list = clusters.map((c: any) =>
        `• ${c.name}: ${c.size.toLocaleString()} records (${c.percentage}%), distinguished by ${c.topCharacteristics.slice(0, 2).join(" and ")}.`
      ).join("\n");
      return `Automated K-Means clustering separated the dataset into ${clusters.length} distinct operational groups:\n${list}`;
    }
    return "The dataset forms a cohesive operational distribution across normalized dimensions without severe sub-group fragmentation.";
  }

  // 8. Outliers / Anomalies / Unusual / Standouts / Mistakes / Errors
  if (
    qLower.includes("outlier") ||
    qLower.includes("anomal") ||
    qLower.includes("unusual") ||
    qLower.includes("mistake") ||
    qLower.includes("strange") ||
    qLower.includes("standout") ||
    qLower.includes("flag")
  ) {
    if (outlierCount === 0) {
      return `Zero statistical outliers were found. All records fall within 2.5 standard deviations of expected means and IQR boundaries.`;
    }
    const sampleReason = mlInsights?.outliers?.[0]?.reasons?.[0] || "values exceeding normal distribution range";
    return `Anomaly Audit Summary:\n• Flagged Records: ${outlierCount.toLocaleString()} out of ${cleanedRows.toLocaleString()} (${outlierRatio})\n• Criteria: Values deviating by > 2.5 standard deviations from the cluster centroid or 1.5x IQR\n• Example anomaly: ${sampleReason}.\n\nThese entries are preserved in the data table for auditability.`;
  }

  // 9. Cleaning / Quality / Health / Hygiene / Missing / Duplicates
  if (
    qLower.includes("clean") ||
    qLower.includes("quality") ||
    qLower.includes("health") ||
    qLower.includes("hygiene") ||
    qLower.includes("missing") ||
    qLower.includes("duplicate") ||
    qLower.includes("normalize") ||
    qLower.includes("audit")
  ) {
    const rawScore = cleaningAudit?.rawHealthScore ?? 92;
    const cleanScore = cleaningAudit?.cleanedHealthScore ?? healthScore;
    const imputed = cleaningAudit?.missingValuesImputed ?? 0;
    const dups = cleaningAudit?.duplicatesRemoved ?? 0;
    const normalized = cleaningAudit?.formatsNormalized ?? 0;

    return `Automated Hygiene & Quality Report:\n• Data Health Score: Raised from ${rawScore}% to ${cleanScore}%\n• Duplicate Records Removed: ${dups.toLocaleString()}\n• Missing Values Imputed: ${imputed.toLocaleString()}\n• Formats Standardized: ${normalized.toLocaleString()}\n\nThe resulting ${cleanedRows.toLocaleString()} records are fully normalized and type-safe for analysis.`;
  }

  // 10. Columns / Fields / Attributes / Schema / Dimensions
  if (
    qLower.includes("column") ||
    qLower.includes("field") ||
    qLower.includes("attribute") ||
    qLower.includes("dimension") ||
    qLower.includes("schema") ||
    qLower.includes("structure")
  ) {
    const colsList = columns.map((c: any) =>
      `• ${c.name} (${c.type}${c.distinctCount ? `, ${c.distinctCount} unique` : ""})`
    ).join("\n");
    return `Dataset Architecture for "${datasetName}":\nTotal Columns: ${columns.length}\n${colsList}`;
  }

  // 11. Specific Column Query (checks if question explicitly asks about one of the dataset's columns)
  for (const col of columns) {
    if (qLower.includes(col.name.toLowerCase())) {
      if (col.type === "numeric" && numericSummaries[col.name]) {
        const s = numericSummaries[col.name];
        return `Statistical Profile for "${col.name}":\n• Cumulative Sum: ${(s.sum || 0).toLocaleString()}\n• Mean Average: ${(s.mean || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}\n• Range: ${(s.min || 0).toLocaleString()} (Min) to ${(s.max || 0).toLocaleString()} (Max)\n• Standard Deviation: ${(s.stdDev || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
      }
      if (categoryTopCounts[col.name]) {
        const counts = categoryTopCounts[col.name];
        const top3 = Object.entries(counts).slice(0, 3).map(([k, v]) => `${k} (${v})`).join(", ");
        return `Categorical Profile for "${col.name}":\n• Unique Values: ${col.distinctCount || Object.keys(counts).length}\n• Top Distributions: ${top3}`;
      }
    }
  }

  // 12. Dynamic Contextual Summary (NOT a generic one-liner)
  const topClusterInfo = clusters[0] ? ` The dominant pattern is the "${clusters[0].name}" segment (${clusters[0].percentage}% of records).` : "";
  const corrInfo = topCorr ? ` Notably, ${topCorr.colA} and ${topCorr.colB} exhibit a ${topCorr.strength.toLowerCase()} association (r = ${topCorr.coefficient}).` : "";

  return `Analysis for "${datasetName}": Across ${cleanedRows.toLocaleString()} validated records, the primary tracked metric "${primaryMetricName}" totals ${(primaryMetric.sum || 0).toLocaleString()} with a mean of ${(primaryMetric.mean || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}.${topClusterInfo}${corrInfo}\n\nTip: You can ask specific questions like "What is the single most important takeaway?", "Which group is performing best?", or "What should our team do next?"`;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// AI Executive Findings Summary endpoint
app.post("/api/analyze-summary", async (req, res) => {
  try {
    const { datasetProfile, mlInsights, sampleRows, cleaningAudit } = req.body;

    if (!datasetProfile) {
      return res.status(400).json({ error: "datasetProfile is required" });
    }

    const prompt = `
You are the Automated Insight Analyst — an expert data scientist and executive business advisor.
Analyze the following dataset metadata, automated cleaning audit, and machine learning results:

Dataset Overview:
- Name: ${datasetProfile.datasetName || "Uploaded Records"}
- Rows: ${datasetProfile.totalRows} (Cleaned: ${datasetProfile.cleanedRows})
- Columns: ${datasetProfile.columns.map((c: any) => `${c.name} (${c.type})`).join(", ")}
- Quality Health Score: ${datasetProfile.healthScore}/100

Cleaning Audit Log:
- Missing values handled: ${cleaningAudit?.missingCount || 0}
- Duplicate rows removed: ${cleaningAudit?.duplicatesRemoved || 0}
- Normalizations applied: ${cleaningAudit?.transformationsCount || 0}

Statistical & Machine Learning Findings:
- Key Metrics Summary: ${JSON.stringify(datasetProfile.numericSummaries || {})}
- Top Correlations: ${JSON.stringify(mlInsights?.correlations?.slice(0, 5) || [])}
- Clustering Segments: ${JSON.stringify(mlInsights?.clusters?.slice(0, 4) || [])}
- Outliers Detected: ${mlInsights?.outlierCount || 0} records (${mlInsights?.outlierRatio || "0%"} of data)

Sample Records (Cleaned):
${JSON.stringify((sampleRows || []).slice(0, 3), null, 2)}

Provide a concise, high-impact, plain-language executive summary designed so that ANYONE from a non-technical background can immediately understand the findings and what actions to take.
Strict rules:
1. Avoid technical and statistical jargon (do NOT use terms like "parametric dispersion", "covariance", "eigenvalues", "imputation heuristics").
2. Use clear, everyday business words like "connected metrics", "customer groups", "typical middle range", and "standout records".
3. "executiveHeadline": A single punchy, clear takeaway sentence explaining what this dataset reveals in simple language.
4. "narrative": 2 crisp, friendly paragraphs translating the numbers into practical real-world stories, explaining major patterns, group differences, and opportunities.
5. "keyFindings": An array of exactly 4 clear bullet points (title + 1-sentence finding in everyday English).
6. "actionableRecommendations": An array of 3 concrete, strategic next steps any team can execute immediately.
7. Return strictly valid JSON with keys: "executiveHeadline", "narrative", "keyFindings", "actionableRecommendations". Do NOT include markdown code blocks.
`;

    // 1. Try Groq high-speed LLM first if API key is present
    const groqJsonResult = await callGroqJson(
      "You are a Senior Executive Data Analyst and Business Strategy Expert. Return strictly valid JSON with no markdown formatting.",
      prompt
    );
    if (groqJsonResult && groqJsonResult.data) {
      return res.json({
        source: groqJsonResult.modelUsed,
        modelUsed: groqJsonResult.modelUsed,
        ...groqJsonResult.data,
      });
    }

    // 2. Try Gemini if configured
    const ai = getGenAI();
    if (ai) {
      const geminiResult = await callGeminiWithFallback(ai, prompt, {
        responseMimeType: "application/json",
        temperature: 0.2,
      });

      if (geminiResult && geminiResult.text) {
        try {
          const parsed = JSON.parse(geminiResult.text);
          return res.json({
            source: "gemini",
            modelUsed: geminiResult.modelUsed,
            ...parsed,
          });
        } catch {
          return res.json({
            source: "gemini_raw",
            executiveHeadline: "Automated Data Analysis Completed",
            narrative: geminiResult.text,
            keyFindings: [],
            actionableRecommendations: [],
          });
        }
      }
    }

    // 3. Graceful synthesis fallback if model API is experiencing temporary high demand (503)
    const fallback = buildServerFallbackSummary(
      datasetProfile,
      cleaningAudit,
      mlInsights,
      sampleRows || []
    );
    return res.json(fallback);
  } catch (error: any) {
    console.warn("AI Summary fallback engaged:", error?.message || error);
    const { datasetProfile, mlInsights, sampleRows, cleaningAudit } = req.body || {};
    const fallback = buildServerFallbackSummary(
      datasetProfile || {},
      cleaningAudit || {},
      mlInsights || {},
      sampleRows || []
    );
    return res.json(fallback);
  }
});

// Interactive Data Natural Language Q&A endpoint
app.post("/api/ask-data", async (req, res) => {
  try {
    const {
      question,
      conversationHistory,
      datasetProfile,
      mlInsights,
      sampleRows,
      cleaningAudit,
      summary,
    } = req.body;

    if (!question) {
      return res.status(400).json({ error: "question is required" });
    }

    // 1. Try Gemini first (or if configured)
    const ai = getGenAI();
    if (ai) {
      const historyContext =
        Array.isArray(conversationHistory) && conversationHistory.length > 0
          ? conversationHistory
              .slice(-6)
              .map((m: any) => `${m.sender === "user" ? "User" : "Analyst"}: ${m.text}`)
              .join("\n")
          : "";

      const prompt = `You are the interactive Plain-English Data Analyst assistant for dataset "${datasetProfile?.datasetName || "Active Dataset"}".
Answer the user's question directly, accurately, and concisely based strictly on the provided dataset profile, ML outputs, and computed summary.

Dataset Context:
- Name: ${datasetProfile?.datasetName || "Current Dataset"}
- Verified Records: ${datasetProfile?.cleanedRows || datasetProfile?.totalRows || 0}
- Data Health Score: ${datasetProfile?.healthScore || cleaningAudit?.cleanedHealthScore || 100}%
- Detected Columns: ${JSON.stringify(datasetProfile?.columns || [])}
- Numeric Stats: ${JSON.stringify(datasetProfile?.numericSummaries || {})}
- Categorical Distributions: ${JSON.stringify(datasetProfile?.categoryTopCounts || {})}
- Segments / Clusters: ${JSON.stringify(mlInsights?.clusters || [])}
- Statistical Correlations: ${JSON.stringify(mlInsights?.correlations || [])}
- Flagged Anomalies: ${mlInsights?.outlierCount || 0} records (${mlInsights?.outlierRatio || "0%"})
- Executive Headline: ${summary?.executiveHeadline || "N/A"}
- Key Findings: ${JSON.stringify(summary?.keyFindings || [])}
- Actionable Recommendations: ${JSON.stringify(summary?.actionableRecommendations || [])}
- Sample Rows: ${JSON.stringify((sampleRows || []).slice(0, 4))}

${historyContext ? `Prior Conversation Context:\n${historyContext}\n` : ""}
Current User Question: "${question}"

Instructions:
1. Provide a direct, friendly, and factual answer in plain, conversational English suitable for someone with NO technical or data science background.
2. If the user asks for takeaways, recommendations, top performers, or comparisons, use the exact metrics, clusters, and recommendations provided above.
3. Keep it within 2-4 clear sentences (or clean bullet points if listing steps).
4. Never give a generic canned reply. Address the specific subject of the question.`;

      const geminiResult = await callGeminiWithFallback(ai, prompt, {
        temperature: 0.3,
      });

      if (geminiResult && geminiResult.text) {
        return res.json({
          answer: geminiResult.text,
          source: `Gemini (${geminiResult.modelUsed})`,
        });
      }
    }

    // 2. Try Groq if valid key is set
    if (GROQ_API_KEY && GROQ_API_KEY.trim().length > 10) {
      const systemPrompt = `You are the interactive Plain-English Data Analyst assistant.
Answer the user's question directly, accurately, and concisely based strictly on the provided dataset profile and statistical outputs.
Explain any numbers or metrics in practical real-world terms (using everyday business analogies). Keep it within 2-4 conversational, friendly, highly readable sentences. Avoid technical jargon.`;

      const userPrompt = `Dataset Profile:
- Name: ${datasetProfile?.datasetName || "Current Dataset"}
- Rows: ${datasetProfile?.totalRows}, Cleaned: ${datasetProfile?.cleanedRows}
- Health Score: ${datasetProfile?.healthScore || 100}%
- Numeric Stats: ${JSON.stringify(datasetProfile?.numericSummaries || {})}
- ML Clusters: ${JSON.stringify(mlInsights?.clusters || [])}
- Correlations: ${JSON.stringify(mlInsights?.correlations || [])}
- Outliers: ${mlInsights?.outlierCount || 0} flagged
- Recommendations: ${JSON.stringify(summary?.actionableRecommendations || [])}

User Question: "${question}"`;

      const groqResult = await callGroqChat(systemPrompt, userPrompt);
      if (groqResult && groqResult.text) {
        return res.json({
          answer: groqResult.text,
          source: groqResult.modelUsed,
        });
      }
    }

    // 3. Intelligent evidence-grounded algorithmic engine
    const answer = buildServerFallbackAnswer(
      question,
      datasetProfile,
      mlInsights,
      summary,
      cleaningAudit
    );
    return res.json({ answer, source: "Evidence Analytics Engine" });
  } catch (error: any) {
    console.warn("Ask data fallback engaged:", error?.message || error);
    const { question, datasetProfile, mlInsights, summary, cleaningAudit } = req.body || {};
    const answer = buildServerFallbackAnswer(
      question,
      datasetProfile,
      mlInsights,
      summary,
      cleaningAudit
    );
    return res.json({ answer, source: "Evidence Analytics Engine" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`The Automated Insight Analyst server running on http://localhost:${PORT}`);
  });
}

startServer();
