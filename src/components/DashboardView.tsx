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
} from "lucide-react";
import { DashboardWidget, ProcessedDataset } from "../types";

interface DashboardViewProps {
  dataset: ProcessedDataset;
}

const PALETTE = ["#4F46E5", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export const DashboardView: React.FC<DashboardViewProps> = ({ dataset }) => {
  const [selectedClusterFilter, setSelectedClusterFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyOutliers, setOnlyOutliers] = useState(false);

  // Filter widgets or data if user applies cluster/outlier filter
  const kpiWidgets = dataset.widgets.filter((w) => w.type === "metric_card");
  const chartWidgets = dataset.widgets.filter((w) => w.type !== "metric_card");

  return (
    <div className="space-y-6">
      {/* SECTION 03: AUTO-GENERATED VISUALIZATION HEADER */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span className="text-indigo-600 font-bold">03</span> AUTO-GENERATED VISUALIZATION
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Heuristic visual engine automatically generating {chartWidgets.length} charts and {kpiWidgets.length} KPI cards from column semantics.
            </p>
          </div>

          {/* Interactive Slicer / Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Cluster Filter */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs shadow-2xs">
              <Layers className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-500 font-semibold text-[11px]">SEGMENT:</span>
              <select
                value={selectedClusterFilter}
                onChange={(e) => setSelectedClusterFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                <option value="all">All Clusters ({dataset.cleanedRows.length})</option>
                {dataset.ml.clusters.map((c) => (
                  <option key={c.clusterId} value={c.name}>
                    {c.name} ({c.size})
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
              <span>Anomalies Only ({dataset.ml.outlierCount})</span>
            </button>
          </div>
        </div>

        {/* 1. KPI Metric Cards (Sleek Theme Format) */}
        {kpiWidgets.length > 0 && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiWidgets.map((kpi) => (
              <div
                key={kpi.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition"
              >
                <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                  {kpi.title}
                </p>
                <p className="text-2xl font-bold text-indigo-600 tracking-tight">
                  {kpi.config?.format === "currency" ? `$${kpi.config.value}` : kpi.config?.value}
                </p>
                {kpi.config?.subValue && (
                  <p className="text-[10px] mt-2 text-slate-500 leading-relaxed line-clamp-1">
                    {kpi.config.subValue}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Auto-generated Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartWidgets.map((widget) => (
          <div
            key={widget.id}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    {widget.title}
                  </h4>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded tracking-wider uppercase">
                    {widget.type}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{widget.description}</p>
              </div>
            </div>

            {/* Render chart by type */}
            <div className="h-72 w-full pt-2">
              {renderChartComponent(widget)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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
                fillOpacity={1}
                fill={`url(#${i === 0 ? "areaGradient" : "areaGradient2"})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    case "bar": {
      const xKey = widget.xAxisKey || "category";
      const yKeys = widget.yAxisKeys || [];
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={widget.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 11, fill: "#64748B" }}
              interval={0}
              tickLine={false}
            />
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
            {yKeys.map((yKey, idx) => (
              <Bar
                key={yKey}
                dataKey={yKey}
                fill={PALETTE[idx % PALETTE.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    case "pie": {
      const catKey = widget.categoryKey || "name";
      const valKey = widget.yAxisKeys?.[0] || "value";
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={widget.data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={4}
              dataKey={valKey}
              nameKey={catKey}
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
            <Legend wrapperStyle={{ fontSize: 11 }} />
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
            <Scatter name="Data Points" data={widget.data} fill="#4F46E5" shape="circle" />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    default:
      return null;
  }
}
