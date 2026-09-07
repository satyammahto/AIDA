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

// AI candidate models in priority order: gemini-3.1-flash-lite first for instant availability and resilience, followed by gemini-3.8-flash
const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
];

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
  mlInsights: any
): string {
  const qLower = (question || "").toLowerCase();
  const topCorr = mlInsights?.correlations?.[0];
  const clusters = mlInsights?.clusters || [];
  const outlierCount = mlInsights?.outlierCount || 0;
  const outlierRatio = mlInsights?.outlierRatio || "0%";
  const numSummaryKeys = Object.keys(datasetProfile?.numericSummaries || {});
  const primaryMetricName = numSummaryKeys[0] || "primary metric";
  const primaryMetric = datasetProfile?.numericSummaries?.[primaryMetricName] || {};

  if (qLower.includes("correlation") || qLower.includes("relationship") || qLower.includes("depend")) {
    if (topCorr) {
      return `The strongest correlation observed is between ${topCorr.colA} and ${topCorr.colB} with coefficient r = ${topCorr.coefficient} (${topCorr.strength} ${topCorr.direction} relationship). ${topCorr.insight || ""}`;
    }
    return "No strong linear correlation was identified among numeric columns in this dataset.";
  }

  if (qLower.includes("cluster") || qLower.includes("segment")) {
    if (clusters.length > 0) {
      const clusterSummaries = clusters
        .map((c: any) => `${c.name} (${c.size} records, ${c.percentage}%)`)
        .join("; ");
      return `K-Means clustering separated the dataset into ${clusters.length} segments: ${clusterSummaries}.`;
    }
    return "The dataset was segmented into automated clusters based on normalized numeric dimensions.";
  }

  if (qLower.includes("outlier") || qLower.includes("anomal")) {
    return `A total of ${outlierCount} records (${outlierRatio}) were flagged as statistical anomalies exceeding 2.5 standard deviations from the distribution mean or cluster centroid.`;
  }

  if (qLower.includes("clean") || qLower.includes("quality") || qLower.includes("health")) {
    return `The dataset health score is ${datasetProfile?.healthScore || 100}%. The automated pipeline handled missing cell imputations, eliminated redundant duplicates, and normalized typed formats.`;
  }

  return `This dataset contains ${datasetProfile?.cleanedRows || 0} validated records across ${datasetProfile?.columns?.length || 0} columns. For ${primaryMetricName}, the cumulative total is ${(primaryMetric.sum || 0).toLocaleString()} with a mean of ${(primaryMetric.mean || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}.`;
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

    const ai = getGenAI();
    if (!ai) {
      const fallback = buildServerFallbackSummary(
        datasetProfile,
        cleaningAudit,
        mlInsights,
        sampleRows || []
      );
      return res.json(fallback);
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

Provide a concise, high-impact, plain-language executive summary.
Strict requirements:
1. "executiveHeadline": A single punchy, high-level takeaway sentence explaining what this dataset reveals.
2. "narrative": 2 crisp paragraphs translating the technical data into practical real-world insight, explaining major patterns, segment differences, and risk/opportunity drivers.
3. "keyFindings": An array of exactly 4 clear bullet points (title + 1-sentence finding).
4. "actionableRecommendations": An array of 3 concrete, strategic next steps.
5. Return strictly valid JSON with keys: "executiveHeadline", "narrative", "keyFindings", "actionableRecommendations". Do NOT include markdown code blocks.
`;

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

    // Graceful synthesis fallback if model API is experiencing temporary high demand (503)
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
    const { question, datasetProfile, mlInsights, sampleRows } = req.body;
    if (!question) {
      return res.status(400).json({ error: "question is required" });
    }

    const ai = getGenAI();
    if (!ai) {
      const answer = buildServerFallbackAnswer(question, datasetProfile, mlInsights);
      return res.json({ answer });
    }

    const prompt = `
You are the interactive Automated Insight Analyst assistant.
Answer the user's question directly, accurately, and concisely based strictly on this dataset and its ML outputs.

Dataset Profile:
- Rows: ${datasetProfile?.totalRows}, Cleaned: ${datasetProfile?.cleanedRows}
- Columns: ${JSON.stringify(datasetProfile?.columns || [])}
- Numeric Stats: ${JSON.stringify(datasetProfile?.numericSummaries || {})}
- Categorical Distributions: ${JSON.stringify(datasetProfile?.categoryTopCounts || {})}
- ML Clusters: ${JSON.stringify(mlInsights?.clusters || [])}
- Correlations: ${JSON.stringify(mlInsights?.correlations || [])}
- Outliers: ${mlInsights?.outlierCount || 0} flagged
- Sample Rows: ${JSON.stringify((sampleRows || []).slice(0, 5))}

User Question: "${question}"

Provide a direct, factual answer highlighting specific numbers, percentages, or trends from the dataset. Keep it within 2-4 sentences.
`;

    const geminiResult = await callGeminiWithFallback(ai, prompt, {
      temperature: 0.2,
    });

    if (geminiResult && geminiResult.text) {
      return res.json({ answer: geminiResult.text });
    }

    const answer = buildServerFallbackAnswer(question, datasetProfile, mlInsights);
    return res.json({ answer });
  } catch (error: any) {
    console.warn("Ask data fallback engaged:", error?.message || error);
    const { question, datasetProfile, mlInsights } = req.body || {};
    const answer = buildServerFallbackAnswer(question, datasetProfile, mlInsights);
    return res.json({ answer });
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
