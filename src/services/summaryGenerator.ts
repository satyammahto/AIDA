import { CleaningAudit, ColumnProfile, ExecutiveSummary, MLInsights } from "../types";

export async function generateExecutiveSummary(
  datasetName: string,
  totalRows: number,
  cleanedRows: number,
  columns: ColumnProfile[],
  cleaningAudit: CleaningAudit,
  mlInsights: MLInsights,
  sampleRows: Record<string, any>[]
): Promise<ExecutiveSummary> {
  const numericCols = columns.filter((c) => c.type === "numeric");
  const topCorr = mlInsights.correlations[0];
  const dominantCluster = [...mlInsights.clusters].sort((a, b) => b.size - a.size)[0];

  // Try server-side Gemini endpoint first
  try {
    const numericSummaries: Record<string, any> = {};
    for (const c of numericCols) {
      numericSummaries[c.name] = {
        mean: c.mean,
        sum: c.sum,
        min: c.min,
        max: c.max,
        stdDev: c.stdDev,
      };
    }

    const payload = {
      datasetProfile: {
        datasetName,
        totalRows,
        cleanedRows,
        columns: columns.map((c) => ({
          name: c.name,
          type: c.type,
          distinctCount: c.distinctCount,
        })),
        healthScore: cleaningAudit.cleanedHealthScore,
        numericSummaries,
      },
      cleaningAudit: {
        missingCount: cleaningAudit.missingValuesImputed,
        duplicatesRemoved: cleaningAudit.duplicatesRemoved,
        transformationsCount: cleaningAudit.formatsNormalized,
      },
      mlInsights: {
        correlations: mlInsights.correlations.slice(0, 5),
        clusters: mlInsights.clusters,
        outlierCount: mlInsights.outlierCount,
        outlierRatio: mlInsights.outlierRatio,
      },
      sampleRows: sampleRows.slice(0, 3),
    };

    const res = await fetch("/api/analyze-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.executiveHeadline && data.narrative) {
        return {
          executiveHeadline: data.executiveHeadline,
          narrative: data.narrative,
          keyFindings: data.keyFindings || [],
          actionableRecommendations: data.actionableRecommendations || [],
          source: data.source === "gemini" ? "gemini" : "fallback",
        };
      }
    }
  } catch {
    // Graceful fallback to deterministic statistical engine
  }

  // Deterministic high-precision statistical NLG fallback
  return generateDeterministicSummary(
    datasetName,
    cleanedRows,
    columns,
    cleaningAudit,
    mlInsights,
    topCorr,
    dominantCluster
  );
}

function generateDeterministicSummary(
  datasetName: string,
  cleanedRows: number,
  columns: ColumnProfile[],
  cleaningAudit: CleaningAudit,
  mlInsights: MLInsights,
  topCorr: any,
  dominantCluster: any
): ExecutiveSummary {
  const numericCols = columns.filter((c) => c.type === "numeric");
  const primaryMetric = numericCols[0];
  const secondaryMetric = numericCols.length > 1 ? numericCols[1] : null;

  const headline = `Dataset analyzed: ${cleanedRows.toLocaleString()} validated records processed with ${cleaningAudit.cleanedHealthScore}% data health across ${columns.length} auto-detected attributes.`;

  const p1 = `Our automated ingestion pipeline completed full data normalization, resolving ${cleaningAudit.missingValuesImputed} missing data points and eliminating ${cleaningAudit.duplicatesRemoved} redundant records. Evaluation of ${primaryMetric?.name || "core values"} indicates a cumulative volume of ${(primaryMetric?.sum || 0).toLocaleString()} with a mean of ${(primaryMetric?.mean || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}.`;

  const p2 = `Machine learning segmentation partitioned the cohort into ${mlInsights.clusters.length} distinct behavioral clusters, with ${dominantCluster ? dominantCluster.name : "the primary segment"} comprising ${dominantCluster ? dominantCluster.percentage : 0}% of all records. Statistical anomaly detection flagged ${mlInsights.outlierCount} records (${mlInsights.outlierRatio}) exceeding normal operational variance.`;

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
      finding: `${dominantCluster.name} represents ${dominantCluster.size} records (${dominantCluster.percentage}%), distinguished by ${dominantCluster.topCharacteristics.slice(0, 2).join(" and ")}.`,
    });
  }

  if (mlInsights.outlierCount > 0) {
    keyFindings.push({
      title: "Operational Anomalies Flagged",
      finding: `${mlInsights.outlierCount} entries (${mlInsights.outlierRatio}) display extreme deviations beyond 2.5 standard deviations, warranting review for risk management or exceptional revenue events.`,
    });
  }

  if (secondaryMetric) {
    keyFindings.push({
      title: `${secondaryMetric.name} Distribution`,
      finding: `Averages ${(secondaryMetric.mean || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} with an interquartile spread of ${(secondaryMetric.iqr || 0).toLocaleString()}, showing ${((secondaryMetric.stdDev || 0) / (secondaryMetric.mean || 1) > 0.5 ? "high dispersion" : "stable consistency")}.`,
    });
  }

  const recommendations = [
    `Focus optimization initiatives on ${dominantCluster ? dominantCluster.name : "the core cluster"} to capitalize on high-density volume.`,
    topCorr
      ? `Leverage the ${topCorr.strength} correlation between ${topCorr.colA} and ${topCorr.colB} for predictive forecasting and scenario planning.`
      : `Audit anomalous outliers to establish protective guardrails and prevent operational slippage.`,
    `Maintain continuous automated cleaning pipelines to sustain data integrity scores above 95%.`,
  ];

  return {
    executiveHeadline: headline,
    narrative: `${p1}\n\n${p2}`,
    keyFindings,
    actionableRecommendations: recommendations,
    source: "fallback",
  };
}
