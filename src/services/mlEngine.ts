import { ColumnProfile, MLInsights, CorrelationPair, ClusterInfo, OutlierRecord } from "../types";

// Pearson Correlation Calculation
export function calculatePearson(arrX: number[], arrY: number[]): number {
  const n = arrX.length;
  if (n < 2) return 0;

  const meanX = arrX.reduce((a, b) => a + b, 0) / n;
  const meanY = arrY.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = arrX[i] - meanX;
    const diffY = arrY[i] - meanY;
    numerator += diffX * diffY;
    denomX += diffX * diffX;
    denomY += diffY * diffY;
  }

  const denominator = Math.sqrt(denomX * denomY);
  if (denominator === 0) return 0;

  const r = numerator / denominator;
  return Math.max(-1, Math.min(1, Math.round(r * 1000) / 1000));
}

// Compute Correlation Matrix and Top Pairs
export function runCorrelationAnalysis(
  rows: Record<string, any>[],
  numericColumns: ColumnProfile[]
): {
  correlations: CorrelationPair[];
  correlationMatrix: { columns: string[]; matrix: number[][] };
} {
  const colNames = numericColumns.map((c) => c.name);
  const matrix: number[][] = [];
  const pairs: CorrelationPair[] = [];

  for (let i = 0; i < colNames.length; i++) {
    matrix[i] = [];
    const colA = colNames[i];
    const valsA = rows.map((r) => Number(r[colA]) || 0);

    for (let j = 0; j < colNames.length; j++) {
      const colB = colNames[j];
      const valsB = rows.map((r) => Number(r[colB]) || 0);

      const r = i === j ? 1.0 : calculatePearson(valsA, valsB);
      matrix[i][j] = r;

      if (i < j) {
        const absR = Math.abs(r);
        let strength: "strong" | "moderate" | "weak" = "weak";
        if (absR >= 0.65) strength = "strong";
        else if (absR >= 0.35) strength = "moderate";

        const direction = r >= 0 ? "positive" : "negative";

        let insight = "";
        if (absR >= 0.65) {
          insight = `${direction === "positive" ? "Strong direct synergy" : "Strong inverse trade-off"} between ${colA} and ${colB} (r = ${r > 0 ? "+" : ""}${r}).`;
        } else if (absR >= 0.35) {
          insight = `Moderate ${direction} relationship observed between ${colA} and ${colB} (r = ${r > 0 ? "+" : ""}${r}).`;
        } else {
          insight = `Little to no linear dependency between ${colA} and ${colB} (r = ${r > 0 ? "+" : ""}${r}).`;
        }

        pairs.push({
          colA,
          colB,
          coefficient: r,
          strength,
          direction,
          insight,
        });
      }
    }
  }

  // Sort by strongest correlation magnitude
  pairs.sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient));

  return {
    correlations: pairs,
    correlationMatrix: {
      columns: colNames,
      matrix,
    },
  };
}

// K-Means Clustering on Standardized Numeric Features
export function runKMeansClustering(
  rows: Record<string, any>[],
  numericColumns: ColumnProfile[],
  k: number = 3
): {
  clusters: ClusterInfo[];
  rowClusterAssignments: number[];
  featureNames: string[];
} {
  // Use up to top 4 numeric columns with highest variance to prevent curse of dimensionality
  const featureCols = [...numericColumns]
    .filter((c) => (c.stdDev || 0) > 0)
    .slice(0, 4);

  const featureNames = featureCols.map((c) => c.name);
  if (featureNames.length === 0 || rows.length < k) {
    return { clusters: [], rowClusterAssignments: rows.map(() => 0), featureNames: [] };
  }

  // Z-Score Standardize feature values
  const standardizedRows: number[][] = rows.map((r) =>
    featureCols.map((col) => {
      const val = Number(r[col.name]) || 0;
      const mean = col.mean ?? 0;
      const stdDev = col.stdDev || 1;
      return (val - mean) / stdDev;
    })
  );

  // Initialize centroids with k-means++ style spread
  const centroids: number[][] = [];
  centroids.push([...standardizedRows[0]]);

  while (centroids.length < k) {
    // Find point furthest from existing centroids
    let maxDist = -1;
    let bestPoint = standardizedRows[0];

    for (const point of standardizedRows) {
      const minDistToAny = Math.min(
        ...centroids.map((c) => euclideanDistance(point, c))
      );
      if (minDistToAny > maxDist) {
        maxDist = minDistToAny;
        bestPoint = point;
      }
    }
    centroids.push([...bestPoint]);
  }

  // Run iterations
  let assignments = new Array(rows.length).fill(0);
  const maxIterations = 15;

  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;

    // Assign points to closest centroid
    for (let i = 0; i < standardizedRows.length; i++) {
      const point = standardizedRows[i];
      let closestCentroid = 0;
      let minDistance = Infinity;

      for (let c = 0; c < centroids.length; c++) {
        const dist = euclideanDistance(point, centroids[c]);
        if (dist < minDistance) {
          minDistance = dist;
          closestCentroid = c;
        }
      }

      if (assignments[i] !== closestCentroid) {
        assignments[i] = closestCentroid;
        changed = true;
      }
    }

    if (!changed && iter > 0) break;

    // Update centroids
    for (let c = 0; c < k; c++) {
      const clusterPoints = standardizedRows.filter((_, idx) => assignments[idx] === c);
      if (clusterPoints.length > 0) {
        for (let dim = 0; dim < featureNames.length; dim++) {
          centroids[c][dim] =
            clusterPoints.reduce((sum, p) => sum + p[dim], 0) / clusterPoints.length;
        }
      }
    }
  }

  // Calculate cluster characteristics and unstandardized centroids
  const clusters: ClusterInfo[] = [];

  for (let c = 0; c < k; c++) {
    const indices = assignments
      .map((clusterId, idx) => (clusterId === c ? idx : -1))
      .filter((idx) => idx !== -1);
    const size = indices.length;
    const percentage = Math.round((size / rows.length) * 1000) / 10;

    const unstandardizedCentroid: Record<string, number> = {};
    const characteristics: string[] = [];

    for (let dim = 0; dim < featureCols.length; dim++) {
      const col = featureCols[dim];
      const clusterVals = indices.map((idx) => Number(rows[idx][col.name]) || 0);
      const avg =
        clusterVals.length > 0
          ? clusterVals.reduce((a, b) => a + b, 0) / clusterVals.length
          : 0;

      unstandardizedCentroid[col.name] = Math.round(avg * 100) / 100;

      const overallMean = col.mean ?? 1;
      const ratio = overallMean !== 0 ? avg / overallMean : 1;

      if (ratio >= 1.3) {
        characteristics.push(`High ${col.name} (+${Math.round((ratio - 1) * 100)}% above avg)`);
      } else if (ratio <= 0.7) {
        characteristics.push(`Low ${col.name} (-${Math.round((1 - ratio) * 100)}% below avg)`);
      } else {
        characteristics.push(`Balanced ${col.name}`);
      }
    }

    // Name cluster based on its most distinctive feature
    const mainTrait = characteristics[0] || `Segment ${c + 1}`;
    const name = `Cluster ${c + 1}: ${mainTrait}`;

    clusters.push({
      clusterId: c + 1,
      name,
      size,
      percentage,
      centroid: unstandardizedCentroid,
      topCharacteristics: characteristics,
    });
  }

  return {
    clusters,
    rowClusterAssignments: assignments.map((c) => c + 1),
    featureNames,
  };
}

function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }
  return Math.sqrt(sum);
}

// Multi-variate and IQR Outlier Detection
export function detectOutliers(
  rows: Record<string, any>[],
  numericColumns: ColumnProfile[]
): {
  outliers: OutlierRecord[];
  outlierCount: number;
  outlierRatio: string;
} {
  const outliers: OutlierRecord[] = [];

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const reasons: string[] = [];
    let severitySum = 0;

    for (const col of numericColumns) {
      const val = Number(row[col.name]);
      if (isNaN(val)) continue;

      const q1 = col.q1 ?? 0;
      const q3 = col.q3 ?? 0;
      const iqr = col.iqr ?? 0;
      const mean = col.mean ?? 0;
      const stdDev = col.stdDev || 1;

      // IQR check (threshold 1.8x IQR for distinct anomalies)
      const lowerBound = q1 - 1.8 * iqr;
      const upperBound = q3 + 1.8 * iqr;

      // Z-Score check
      const zScore = Math.abs((val - mean) / stdDev);

      if ((val < lowerBound || val > upperBound) && zScore > 2.5) {
        const diffStr = val > upperBound ? "elevated" : "depressed";
        reasons.push(
          `${col.name} = ${val} is unusually ${diffStr} (Z-Score: ${zScore.toFixed(1)})`
        );
        severitySum += Math.min(1, (zScore - 2.5) / 3);
      }
    }

    if (reasons.length > 0) {
      const anomalyScore = Math.min(
        1,
        Math.round(((severitySum / numericColumns.length) * 0.5 + 0.5) * 100) / 100
      );
      outliers.push({
        rowIndex,
        anomalyScore,
        reasons,
        data: row,
      });
    }
  }

  // Sort by anomaly severity
  outliers.sort((a, b) => b.anomalyScore - a.anomalyScore);

  const ratio = ((outliers.length / (rows.length || 1)) * 100).toFixed(1) + "%";

  return {
    outliers,
    outlierCount: outliers.length,
    outlierRatio: ratio,
  };
}

// Combined ML Engine runner
export function runMLEngine(
  rows: Record<string, any>[],
  columns: ColumnProfile[]
): {
  mlInsights: MLInsights;
  enrichedRows: Record<string, any>[];
} {
  const numericCols = columns.filter((c) => c.type === "numeric");

  const { correlations, correlationMatrix } = runCorrelationAnalysis(rows, numericCols);
  const { clusters, rowClusterAssignments, featureNames } = runKMeansClustering(
    rows,
    numericCols,
    3
  );
  const { outliers, outlierCount, outlierRatio } = detectOutliers(rows, numericCols);

  const outlierIndexSet = new Set(outliers.map((o) => o.rowIndex));

  // Enrich rows with ML tags for interactive filtering and drill-down
  const enrichedRows = rows.map((row, idx) => {
    const isOutlier = outlierIndexSet.has(idx);
    const clusterId = rowClusterAssignments[idx] || 1;
    const outlierObj = outliers.find((o) => o.rowIndex === idx);

    return {
      ...row,
      _clusterId: clusterId,
      _clusterName: `Cluster ${clusterId}`,
      _isOutlier: isOutlier,
      _anomalyScore: outlierObj ? outlierObj.anomalyScore : 0,
    };
  });

  return {
    mlInsights: {
      correlations,
      correlationMatrix,
      clusters,
      outliers,
      outlierCount,
      outlierRatio,
      clusterFeatureNames: featureNames,
    },
    enrichedRows,
  };
}
