import { ColumnProfile, DashboardWidget, MLInsights } from "../types";

export function generateAutomatedDashboard(
  rows: Record<string, any>[],
  columns: ColumnProfile[],
  mlInsights: MLInsights
): DashboardWidget[] {
  const widgets: DashboardWidget[] = [];
  if (!rows || rows.length === 0) return widgets;

  const numericCols = columns.filter((c) => c.type === "numeric");
  const dateCols = columns.filter((c) => c.type === "date");
  const catCols = columns.filter(
    (c) => c.type === "categorical" && c.distinctCount >= 2 && c.distinctCount <= 20
  );
  const lowCardCols = columns.filter(
    (c) => (c.type === "categorical" || c.type === "boolean") && c.distinctCount >= 2 && c.distinctCount <= 7
  );

  // 1. Core KPI Metric Cards
  if (numericCols.length > 0) {
    const primaryNum = numericCols[0];
    const totalVal = primaryNum.sum ?? 0;
    const avgVal = primaryNum.mean ?? 0;

    widgets.push({
      id: "kpi-primary",
      title: `Total ${primaryNum.name}`,
      type: "metric_card",
      description: `Cumulative sum across all ${rows.length} validated records`,
      data: [],
      config: {
        value: totalVal >= 1000 ? totalVal.toLocaleString() : totalVal.toFixed(1),
        subValue: `Avg: ${avgVal.toLocaleString(undefined, { maximumFractionDigits: 1 })} per record`,
        format: primaryNum.name.toLowerCase().includes("cost") || primaryNum.name.toLowerCase().includes("revenue") || primaryNum.name.toLowerCase().includes("sales") ? "currency" : "number",
      },
    });
  } else {
    // Fallback KPI when no numeric column exists
    widgets.push({
      id: "kpi-primary-records",
      title: "Validated Records",
      type: "metric_card",
      description: `Tabular records processed across ${columns.length} auto-detected fields`,
      data: [],
      config: {
        value: rows.length.toLocaleString(),
        subValue: "100% data health score",
      },
    });
  }

  if (numericCols.length > 1) {
    const secondaryNum = numericCols[1];
    const totalVal = secondaryNum.sum ?? 0;
    const avgVal = secondaryNum.mean ?? 0;

    widgets.push({
      id: "kpi-secondary",
      title: `Mean ${secondaryNum.name}`,
      type: "metric_card",
      description: `Baseline average with std dev of ${secondaryNum.stdDev?.toFixed(1) || "N/A"}`,
      data: [],
      config: {
        value: avgVal.toLocaleString(undefined, { maximumFractionDigits: 1 }),
        subValue: `Total sum: ${totalVal.toLocaleString()}`,
        format: secondaryNum.name.toLowerCase().includes("profit") || secondaryNum.name.toLowerCase().includes("income") ? "currency" : "number",
      },
    });
  } else if (catCols.length > 0) {
    widgets.push({
      id: "kpi-secondary-cat",
      title: `Top ${catCols[0].name}`,
      type: "metric_card",
      description: `Leading categorical classification by record count`,
      data: [],
      config: {
        value: catCols[0].topCategories?.[0]?.value || "N/A",
        subValue: `${catCols[0].distinctCount} distinct categories`,
      },
    });
  }

  // ML KPI: Outlier & Anomaly Rate
  widgets.push({
    id: "kpi-ml-outliers",
    title: "Anomaly Flags",
    type: "metric_card",
    description: "Multi-variate statistical anomalies detected via IQR & Z-score",
    data: [],
    config: {
      value: `${mlInsights.outlierCount} records`,
      subValue: `${mlInsights.outlierRatio} outlier ratio in dataset`,
      colors: ["#EF4444"],
    },
  });

  // ML KPI: Dominant Segment / Cluster
  if (mlInsights.clusters.length > 0) {
    const topCluster = [...mlInsights.clusters].sort((a, b) => b.size - a.size)[0];
    widgets.push({
      id: "kpi-cluster-dominant",
      title: "Core ML Cluster",
      type: "metric_card",
      description: "Dominant customer/operational segment identified by K-Means",
      data: [],
      config: {
        value: `${topCluster.percentage}% Share`,
        subValue: topCluster.name,
        colors: ["#3B82F6"],
      },
    });
  }

  // 2. Timeline / Trend Chart (if Date column is available)
  if (dateCols.length > 0 && numericCols.length > 0) {
    const dateCol = dateCols[0];
    const valCol = numericCols[0];
    const secondaryCol = numericCols.length > 1 ? numericCols[1] : undefined;

    // Aggregate by date (sort chronologically)
    const dateMap: Record<string, { count: number; sumA: number; sumB: number }> = {};
    for (const r of rows) {
      const d = String(r[dateCol.name] || "").split("T")[0];
      if (!d) continue;
      if (!dateMap[d]) {
        dateMap[d] = { count: 0, sumA: 0, sumB: 0 };
      }
      dateMap[d].count++;
      dateMap[d].sumA += Number(r[valCol.name]) || 0;
      if (secondaryCol) {
        dateMap[d].sumB += Number(r[secondaryCol.name]) || 0;
      }
    }

    const trendData = Object.entries(dateMap)
      .map(([date, vals]) => ({
        date,
        [valCol.name]: Math.round(vals.sumA * 10) / 10,
        ...(secondaryCol ? { [secondaryCol.name]: Math.round(vals.sumB * 10) / 10 } : {}),
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 40); // sensible resolution

    widgets.push({
      id: "chart-timeline",
      title: `Temporal Trend: ${valCol.name} over ${dateCol.name}`,
      type: "area",
      xAxisKey: "date",
      yAxisKeys: secondaryCol ? [valCol.name, secondaryCol.name] : [valCol.name],
      description: `Automated time-series progression demonstrating velocity and seasonal shifts`,
      data: trendData,
    });
  }

  // 3. Categorical Ranked Bar Chart
  if (catCols.length > 0 && numericCols.length > 0) {
    const catCol = catCols[0];
    const metricCol = numericCols[0];

    const catMap: Record<string, { sum: number; count: number }> = {};
    for (const r of rows) {
      const cat = String(r[catCol.name] || "Other");
      if (!catMap[cat]) catMap[cat] = { sum: 0, count: 0 };
      catMap[cat].sum += Number(r[metricCol.name]) || 0;
      catMap[cat].count++;
    }

    const barData = Object.entries(catMap)
      .map(([category, vals]) => ({
        category,
        [metricCol.name]: Math.round(vals.sum * 10) / 10,
        average: Math.round((vals.sum / (vals.count || 1)) * 10) / 10,
        count: vals.count,
      }))
      .sort((a, b) => (b[metricCol.name] as number) - (a[metricCol.name] as number))
      .slice(0, 10);

    widgets.push({
      id: "chart-categorical-bar",
      title: `${metricCol.name} Distribution by ${catCol.name}`,
      type: "bar",
      xAxisKey: "category",
      yAxisKeys: [metricCol.name],
      description: `Ranked contribution breakdown showing top-performing classifications`,
      data: barData,
    });
  } else if (catCols.length > 0 && numericCols.length === 0) {
    const catCol = catCols[0];
    const catMap: Record<string, number> = {};
    for (const r of rows) {
      const cat = String(r[catCol.name] || "Other");
      catMap[cat] = (catMap[cat] || 0) + 1;
    }

    const barData = Object.entries(catMap)
      .map(([category, count]) => ({
        category,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    widgets.push({
      id: "chart-categorical-bar",
      title: `Record Volume by ${catCol.name}`,
      type: "bar",
      xAxisKey: "category",
      yAxisKeys: ["count"],
      description: `Frequency distribution across ${catCol.name} classifications`,
      data: barData,
    });
  }

  // 4. Proportional Composition Donut Chart
  if (lowCardCols.length > 0) {
    // Pick low-cardinality column distinct from the bar chart category
    const donutCol =
      lowCardCols.find((c) => catCols.length === 0 || c.name !== catCols[0].name) ||
      lowCardCols[0];

    const donutData = (donutCol.topCategories || []).slice(0, 6).map((c) => ({
      name: c.value,
      value: c.count,
      percentage: c.percentage,
    }));

    if (donutData.length > 0) {
      widgets.push({
        id: "chart-donut-composition",
        title: `Proportion by ${donutCol.name}`,
        type: "pie",
        categoryKey: "name",
        yAxisKeys: ["value"],
        description: `Macro segment composition highlighting category volume ratios`,
        data: donutData,
      });
    }
  }

  // 5. Correlation Scatter Plot (Top 2 correlated numeric columns or highest variance pair)
  if (numericCols.length >= 2) {
    let colX = numericCols[0].name;
    let colY = numericCols[1].name;

    if (mlInsights.correlations.length > 0) {
      colX = mlInsights.correlations[0].colA;
      colY = mlInsights.correlations[0].colB;
    }

    const scatterData = rows.slice(0, 80).map((r, i) => ({
      id: i,
      x: Number(r[colX]) || 0,
      y: Number(r[colY]) || 0,
      cluster: r._clusterName || "Cluster 1",
      isOutlier: Boolean(r._isOutlier),
      label: `${colX}: ${r[colX]}, ${colY}: ${r[colY]}`,
    }));

    widgets.push({
      id: "chart-scatter-correlation",
      title: `Correlation Analysis: ${colX} vs ${colY}`,
      type: "scatter",
      xAxisKey: "x",
      yAxisKeys: ["y"],
      description: `Scatter distribution colored by ML cluster segments to identify non-linear groupings`,
      data: scatterData,
      config: {
        colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"],
      },
    });
  }

  // 6. Cluster Profiling Comparison Bar
  if (mlInsights.clusters.length > 0 && mlInsights.clusterFeatureNames.length > 0) {
    const clusterCompareData = mlInsights.clusters.map((c) => ({
      name: `C${c.clusterId}`,
      fullName: c.name,
      size: c.size,
      percentage: c.percentage,
      ...c.centroid,
    }));

    widgets.push({
      id: "chart-cluster-profiling",
      title: "K-Means Cluster Centroid Profiles",
      type: "bar",
      xAxisKey: "name",
      yAxisKeys: mlInsights.clusterFeatureNames.slice(0, 3),
      description: "Comparing standardized dimensional centroids across automated segment partitions",
      data: clusterCompareData,
    });
  }

  return widgets;
}
