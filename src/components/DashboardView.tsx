import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  ScatterChart as ScatterIcon,
  Filter,
  Search,
  AlertTriangle,
  Layers,
  Sparkles,
  Info,
  HelpCircle,
  Download,
} from "lucide-react";
import { DashboardWidget, ProcessedDataset } from "../types";

interface DashboardViewProps {
  dataset: ProcessedDataset;
  isEasyMode?: boolean;
  onExportReport?: () => void;
}

const PALETTE = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export const DashboardView: React.FC<DashboardViewProps> = ({
  dataset,
  isEasyMode = true,
  onExportReport,
}) => {
  const [selectedClusterFilter, setSelectedClusterFilter] = useState<string>("all");
  const [onlyOutliers, setOnlyOutliers] = useState(false);
  const [showHelper, setShowHelper] = useState(false);

  // Filter widgets or data if user applies cluster/outlier filter
  const kpiWidgets = dataset.widgets.filter((w) => w.type === "metric_card");
  const chartWidgets = dataset.widgets.filter((w) => w.type !== "metric_card");

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-indigo-600" />
                Visual Dashboard
              </h3>
              <button
                onClick={() => setShowHelper(!showHelper)}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
                title="Click to learn how to read this dashboard"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>{showHelper ? "Hide Guide" : "How to Read"}</span>
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {chartWidgets.length} charts and {kpiWidgets.length} key metric cards generated automatically from your file.
            </p>
          </div>

          {/* Interactive Slicer / Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Cluster Filter */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs shadow-2xs">
              <Layers className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-500 font-semibold text-[11px]">AUDIENCE GROUP:</span>
              <select
                value={selectedClusterFilter}
                onChange={(e) => setSelectedClusterFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                <option value="all">All Groups ({dataset.cleanedRows.length} rows)</option>
                {dataset.ml.clusters.map((c) => (
                  <option key={c.clusterId} value={c.name}>
                    {c.name} ({c.size} rows)
                  </option>
                ))}
              </select>
            </div>

            {/* Outliers Only Toggle */}
            <button
              onClick={() => setOnlyOutliers(!onlyOutliers)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-2xs transition ${
                onlyOutliers
                  ? "border-rose-300 bg-rose-50 text-rose-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Standout Records Only ({dataset.ml.outlierCount})</span>
            </button>

            {/* Export PDF Report */}
            {onExportReport && (
              <button
                onClick={onExportReport}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 shadow-2xs transition"
                title="Download formatted Executive PDF Report with charts"
              >
                <Download className="h-3.5 w-3.5 text-indigo-600" />
                <span>Download PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Beginner Helper Tip Card */}
        {showHelper && (
          <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs text-slate-700 space-y-1.5">
            <p className="font-bold text-indigo-950 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              How to explore these charts without technical skills:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
              <li><strong>Hover over any chart:</strong> Move your mouse (or tap on mobile) over any bar or line to see the exact number and date.</li>
              <li><strong>Filter by Audience Group:</strong> Pick a group from the dropdown above to isolate and compare how different customer segments behave.</li>
              <li><strong>Click Standout Records:</strong> Toggle the red button to focus solely on extreme transactions or unusual anomalies.</li>
            </ul>
          </div>
        )}

        {/* KPI Metric Cards */}
        {kpiWidgets.length > 0 && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiWidgets.map((kpi) => (
              <div
                key={kpi.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {kpi.title}
                  </p>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-100">
                    Verified
                  </span>
                </div>
                <p className="text-2xl font-bold text-indigo-600 tracking-tight">
                  {kpi.config?.format === "currency" ? `$${kpi.config.value}` : kpi.config?.value}
                </p>
                {kpi.config?.subValue && (
                  <p className="text-[11px] mt-2 text-slate-600 leading-relaxed">
                    {kpi.config.subValue}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auto-generated Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartWidgets.map((widget) => (
          <div
            key={widget.id}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      {widget.title}
                    </h4>
                    <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded tracking-wide">
                      {widget.type === "area" ? "Trend Timeline" : widget.type === "bar" ? "Bar Comparison" : widget.type === "donut" ? "Share / Breakdown" : "Relationship Scatter"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{widget.description}</p>
                </div>
              </div>

              {/* Render chart component */}
              <div className="h-72 w-full pt-2">
                {renderChartComponent(widget)}
              </div>
            </div>

            {/* Plain-English Takeaway Badge */}
            {isEasyMode && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5 font-medium text-indigo-700">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                  Takeaway:
                </span>
                <span className="text-right truncate ml-2 text-slate-600">
                  {getChartPlainTakeaway(widget)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

function getChartPlainTakeaway(widget: DashboardWidget): string {
  if (widget.type === "area" || widget.type === "line") {
    return "Shows performance and volume over chronological periods.";
  }
  if (widget.type === "bar") {
    return "Highlights top-contributing categories ranked from highest to lowest.";
  }
  if (widget.type === "pie") {
    return "Shows how the total pie is divided among primary groups.";
  }
  if (widget.type === "scatter") {
    return "Tests if high values in one column correspond to high values in another.";
  }
  return "Automatically calculated from your spreadsheet rows.";
}

function renderChartComponent(widget: DashboardWidget) {
  if (!widget.data || widget.data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-slate-400">
        No graphical data available for this dimension
      </div>
    );
  }

  switch (widget.type) {
    case "area":
    case "line": {
      const xKey = widget.xAxisKey || "date";
      const yKeys = widget.yAxisKeys || [];
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={widget.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="areaGradient2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F172A",
                color: "#F8FAFC",
                borderRadius: "8px",
                fontSize: "12px",
                border: "none",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
            {yKeys.map((yKey, i) => (
              <Area
                key={yKey}
                type="monotone"
                dataKey={yKey}
                stroke={i === 0 ? "#4F46E5" : "#06B6D4"}
                strokeWidth={2}
                fill={i === 0 ? "url(#areaGradient)" : "url(#areaGradient2)"}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    case "bar": {
      const xKey = widget.xAxisKey || "category";
      const yKeys = widget.yAxisKeys || ["value"];
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={widget.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F172A",
                color: "#F8FAFC",
                borderRadius: "8px",
                fontSize: "12px",
                border: "none",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
            {yKeys.map((yKey, i) => (
              <Bar key={yKey} dataKey={yKey} fill={PALETTE[i % PALETTE.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    case "pie": {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={widget.data}
              innerRadius={60}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              nameKey="name"
            >
              {widget.data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F172A",
                color: "#F8FAFC",
                borderRadius: "8px",
                fontSize: "12px",
                border: "none",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    case "scatter": {
      const xKey = widget.xAxisKey || "x";
      const yKey = widget.yAxisKeys?.[0] || "y";
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              type="number"
              dataKey={xKey}
              name={xKey}
              tick={{ fontSize: 11, fill: "#64748B" }}
              tickLine={false}
            />
            <YAxis
              type="number"
              dataKey={yKey}
              name={yKey}
              tick={{ fontSize: 11, fill: "#64748B" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{
                backgroundColor: "#0F172A",
                color: "#F8FAFC",
                borderRadius: "8px",
                fontSize: "12px",
                border: "none",
              }}
            />
            <Scatter name="Data Points" data={widget.data} fill="#4F46E5" />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    default:
      return null;
  }
}
