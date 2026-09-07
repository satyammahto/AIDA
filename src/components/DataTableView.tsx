import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  AlertTriangle,
  Layers,
  ArrowUpDown,
  CheckCircle2,
  RefreshCw,
  Table as TableIcon,
} from "lucide-react";
import { ProcessedDataset } from "../types";

interface DataTableViewProps {
  dataset: ProcessedDataset;
  onExportCsv: () => void;
}

export const DataTableView: React.FC<DataTableViewProps> = ({ dataset, onExportCsv }) => {
  const [viewMode, setViewMode] = useState<"cleaned" | "raw">("cleaned");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCluster, setSelectedCluster] = useState("all");
  const [onlyOutliers, setOnlyOutliers] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const rawColumns = dataset.columns.map((c) => c.name);
  const sourceRows = viewMode === "cleaned" ? dataset.cleanedRows : dataset.rawRows;

  // Filter rows
  const filteredRows = useMemo(() => {
    return sourceRows.filter((row) => {
      // Cluster filter (cleaned mode only)
      if (viewMode === "cleaned" && selectedCluster !== "all") {
        if (row._clusterName !== selectedCluster) return false;
      }

      // Outlier filter (cleaned mode only)
      if (viewMode === "cleaned" && onlyOutliers) {
        if (!row._isOutlier) return false;
      }

      // Search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matches = rawColumns.some((col) => {
          const val = row[col];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(query);
        });
        if (!matches) return false;
      }

      return true;
    });
  }, [sourceRows, viewMode, selectedCluster, onlyOutliers, searchQuery, rawColumns]);

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  return (
    <div className="space-y-4">
      {/* Controls & Header Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <TableIcon className="h-4 w-4 text-indigo-600" />
              Browse Data Records
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Search, filter, and inspect your table. Every row here is cleaned, standardized, and ready for Excel.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold self-start lg:self-auto">
            <button
              onClick={() => {
                setViewMode("cleaned");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition ${
                viewMode === "cleaned"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Cleaned Data ({dataset.cleanedRows.length} rows)
            </button>
            <button
              onClick={() => {
                setViewMode("raw");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition ${
                viewMode === "raw"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
              Original File Before Cleaning ({dataset.rawRows.length})
            </button>
          </div>
        </div>

        {/* Filter & Action Row */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search all records..."
                className="rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-52 sm:w-64"
              />
            </div>

            {/* Cluster Filter (if cleaned) */}
            {viewMode === "cleaned" && (
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
                <Layers className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cluster:</span>
                <select
                  value={selectedCluster}
                  onChange={(e) => {
                    setSelectedCluster(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="all">All Clusters</option>
                  {dataset.ml.clusters.map((c) => (
                    <option key={c.clusterId} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Outlier Filter */}
            {viewMode === "cleaned" && (
              <button
                onClick={() => {
                  setOnlyOutliers(!onlyOutliers);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-2xs transition ${
                  onlyOutliers
                    ? "border-rose-300 bg-rose-50 text-rose-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Anomalies Only</span>
              </button>
            )}
          </div>

          {/* Export CSV */}
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            <Download className="h-3.5 w-3.5 text-indigo-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-100 sticky top-0">
              <tr>
                <th className="py-3 px-4 font-mono text-[10px] text-slate-400">#</th>
                {rawColumns.map((col) => (
                  <th key={col} className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                    {col}
                  </th>
                ))}
                {viewMode === "cleaned" && (
                  <>
                    <th className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                      ML Cluster
                    </th>
                    <th className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                      Anomaly Flag
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedRows.map((row, idx) => {
                const globalIndex = (currentPage - 1) * pageSize + idx + 1;
                const isOutlier = Boolean(row._isOutlier);

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-50/70 transition ${
                      isOutlier && viewMode === "cleaned" ? "bg-rose-50/30" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                      {globalIndex}
                    </td>
                    {rawColumns.map((col) => {
                      const val = row[col];
                      const isNull = val === null || val === undefined || String(val).trim() === "";

                      return (
                        <td key={col} className="py-3 px-4 whitespace-nowrap">
                          {isNull ? (
                            <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] text-rose-600 font-mono font-medium">
                              null
                            </span>
                          ) : typeof val === "number" ? (
                            <span className="font-mono">{val.toLocaleString()}</span>
                          ) : (
                            <span>{String(val)}</span>
                          )}
                        </td>
                      );
                    })}
                    {viewMode === "cleaned" && (
                      <>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200/80 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-800">
                            <Layers className="h-3 w-3 text-indigo-600" />
                            {row._clusterName || "Cluster 1"}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {isOutlier ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-700">
                              <AlertTriangle className="h-3 w-3 text-rose-600" />
                              {(row._anomalyScore * 100).toFixed(0)}% Anomaly
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">Normal</span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
              {paginatedRows.length === 0 && (
                <tr>
                  <td
                    colSpan={rawColumns.length + (viewMode === "cleaned" ? 3 : 1)}
                    className="py-12 text-center text-xs text-slate-400"
                  >
                    No records matched the active search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-slate-100 p-4 text-xs text-slate-500">
          <div>
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {filteredRows.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-800">
              {Math.min(currentPage * pageSize, filteredRows.length)}
            </span>{" "}
            of <span className="font-semibold text-slate-800">{filteredRows.length}</span> entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              Previous
            </button>
            <span className="font-mono text-slate-700 font-bold px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
