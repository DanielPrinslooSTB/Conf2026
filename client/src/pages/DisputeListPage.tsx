import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchDisputes } from "../services/api";
import { PriorityBadge } from "../components/PriorityBadge";
import { MultiSelectFilter } from "../components/MultiSelectFilter";
import { DateRangeFilter } from "../components/DateRangeFilter";
import type { DisputeWithTriage } from "../types/index";

const PAGE_SIZE_OPTIONS = [10, 15, 20] as const;

type SortField =
  | "customer"
  | "paymentType"
  | "issueCategory"
  | "priority"
  | "date"
  | "status";
type SortDirection = "asc" | "desc";

const PRIORITY_ORDER: Record<string, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

export function DisputeListPage() {
  const [disputes, setDisputes] = useState<DisputeWithTriage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const navigate = useNavigate();

  // Filter state
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedPaymentTypes, setSelectedPaymentTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Sort state
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Derive filter options from data
  const filterOptions = useMemo(() => {
    const paymentTypes = [...new Set(disputes.map((d) => d.paymentType))].sort();
    const categories = [...new Set(disputes.map((d) => d.issueCategory))].sort();
    const priorities = [...new Set(disputes.map((d) => d.triageRecommendation.priorityLevel))].sort();
    const statuses = [...new Set(disputes.map((d) => d.status))].sort();
    return { paymentTypes, categories, priorities, statuses };
  }, [disputes]);

  // Apply filters
  const filteredDisputes = useMemo(() => {
    return disputes.filter((d) => {
      // Customer text search
      if (
        customerSearch &&
        !d.customer.name.toLowerCase().includes(customerSearch.toLowerCase())
      ) {
        return false;
      }
      // Multi-select filters
      if (selectedPaymentTypes.length > 0 && !selectedPaymentTypes.includes(d.paymentType)) {
        return false;
      }
      if (selectedCategories.length > 0 && !selectedCategories.includes(d.issueCategory)) {
        return false;
      }
      if (
        selectedPriorities.length > 0 &&
        !selectedPriorities.includes(d.triageRecommendation.priorityLevel)
      ) {
        return false;
      }
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(d.status)) {
        return false;
      }
      // Date range
      if (dateFrom) {
        const disputeDate = new Date(d.createdAt).toISOString().slice(0, 10);
        if (disputeDate < dateFrom) return false;
      }
      if (dateTo) {
        const disputeDate = new Date(d.createdAt).toISOString().slice(0, 10);
        if (disputeDate > dateTo) return false;
      }
      return true;
    });
  }, [
    disputes,
    customerSearch,
    selectedPaymentTypes,
    selectedCategories,
    selectedPriorities,
    selectedStatuses,
    dateFrom,
    dateTo,
  ]);

  // Apply sorting
  const sortedDisputes = useMemo(() => {
    const sorted = [...filteredDisputes];
    sorted.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "customer":
          comparison = a.customer.name.localeCompare(b.customer.name);
          break;
        case "paymentType":
          comparison = a.paymentType.localeCompare(b.paymentType);
          break;
        case "issueCategory":
          comparison = a.issueCategory.localeCompare(b.issueCategory);
          break;
        case "priority":
          comparison =
            (PRIORITY_ORDER[a.triageRecommendation.priorityLevel] ?? 0) -
            (PRIORITY_ORDER[b.triageRecommendation.priorityLevel] ?? 0);
          break;
        case "date":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return sorted;
  }, [filteredDisputes, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedDisputes.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedDisputes = sortedDisputes.slice(startIndex, startIndex + pageSize);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    customerSearch,
    selectedPaymentTypes,
    selectedCategories,
    selectedPriorities,
    selectedStatuses,
    dateFrom,
    dateTo,
  ]);

  useEffect(() => {
    fetchDisputes()
      .then(setDisputes)
      .catch(() => setError("Unable to load disputes. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) {
      return (
        <svg className="w-3 h-3 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === "asc" ? (
      <svg className="w-3 h-3 ml-1 text-brand-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-3 h-3 ml-1 text-brand-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Disputes</h1>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-12 border-b border-gray-200 animate-pulse bg-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (disputes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          No disputes found. Create your first dispute to get started.
        </p>
        <Link
          to="/disputes/new"
          className="mt-4 inline-block bg-brand-blue-800 text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-brand-blue-600 transition-colors"
        >
          Create Dispute
        </Link>
      </div>
    );
  }

  const hasActiveFilters =
    customerSearch !== "" ||
    selectedPaymentTypes.length > 0 ||
    selectedCategories.length > 0 ||
    selectedPriorities.length > 0 ||
    selectedStatuses.length > 0 ||
    dateFrom !== "" ||
    dateTo !== "";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Disputes</h1>
        <Link
          to="/disputes/new"
          className="bg-brand-blue-800 text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-brand-blue-600 transition-colors"
        >
          Create Dispute
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Customer search */}
          <div className="relative">
            <input
              type="text"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder="Search customer..."
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-blue-600 w-48"
              aria-label="Search by customer name"
            />
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Multi-select filters */}
          <MultiSelectFilter
            label="Payment Type"
            options={filterOptions.paymentTypes}
            selected={selectedPaymentTypes}
            onChange={setSelectedPaymentTypes}
          />
          <MultiSelectFilter
            label="Issue Category"
            options={filterOptions.categories}
            selected={selectedCategories}
            onChange={setSelectedCategories}
          />
          <MultiSelectFilter
            label="Priority"
            options={filterOptions.priorities}
            selected={selectedPriorities}
            onChange={setSelectedPriorities}
          />
          <MultiSelectFilter
            label="Status"
            options={filterOptions.statuses}
            selected={selectedStatuses}
            onChange={setSelectedStatuses}
          />

          {/* Date range filter */}
          <DateRangeFilter
            label="Date"
            from={dateFrom}
            to={dateTo}
            onChange={(from, to) => {
              setDateFrom(from);
              setDateTo(to);
            }}
          />

          {/* Clear all filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setCustomerSearch("");
                setSelectedPaymentTypes([]);
                setSelectedCategories([]);
                setSelectedPriorities([]);
                setSelectedStatuses([]);
                setDateFrom("");
                setDateTo("");
              }}
              className="text-xs text-red-600 hover:text-red-800 font-medium ml-auto"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th
                className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase cursor-pointer select-none hover:text-gray-700"
                onClick={() => handleSort("customer")}
              >
                <span className="inline-flex items-center">
                  Customer
                  <SortIcon field="customer" />
                </span>
              </th>
              <th
                className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase cursor-pointer select-none hover:text-gray-700"
                onClick={() => handleSort("paymentType")}
              >
                <span className="inline-flex items-center">
                  Payment Type
                  <SortIcon field="paymentType" />
                </span>
              </th>
              <th
                className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase cursor-pointer select-none hover:text-gray-700"
                onClick={() => handleSort("issueCategory")}
              >
                <span className="inline-flex items-center">
                  Issue Category
                  <SortIcon field="issueCategory" />
                </span>
              </th>
              <th
                className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase cursor-pointer select-none hover:text-gray-700"
                onClick={() => handleSort("priority")}
              >
                <span className="inline-flex items-center">
                  Priority
                  <SortIcon field="priority" />
                </span>
              </th>
              <th
                className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase cursor-pointer select-none hover:text-gray-700"
                onClick={() => handleSort("date")}
              >
                <span className="inline-flex items-center">
                  Date
                  <SortIcon field="date" />
                </span>
              </th>
              <th
                className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase cursor-pointer select-none hover:text-gray-700"
                onClick={() => handleSort("status")}
              >
                <span className="inline-flex items-center">
                  Status
                  <SortIcon field="status" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedDisputes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                  No disputes match the current filters.
                </td>
              </tr>
            ) : (
              paginatedDisputes.map((dispute) => (
                <tr
                  key={dispute.id}
                  onClick={() => navigate(`/disputes/${dispute.id}`)}
                  className="border-b border-gray-200 hover:bg-brand-blue-50 cursor-pointer h-12"
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigate(`/disputes/${dispute.id}`);
                    }
                  }}
                  aria-label={`View dispute ${dispute.id} for ${dispute.customer.name}`}
                >
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {dispute.customer.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {dispute.paymentType}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {dispute.issueCategory}
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge
                      level={dispute.triageRecommendation.priorityLevel}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(dispute.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {dispute.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg shadow-sm px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <label htmlFor="page-size" className="font-medium">
            Rows per page:
          </label>
          <select
            id="page-size"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue-600"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>
            {sortedDisputes.length === 0
              ? "0 of 0"
              : `${startIndex + 1}–${Math.min(startIndex + pageSize, sortedDisputes.length)} of ${sortedDisputes.length}`}
          </span>
          <nav aria-label="Pagination" className="flex gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-3 py-1 rounded border border-gray-300 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              aria-label="Previous page"
            >
              ←
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-3 py-1 rounded border border-gray-300 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              aria-label="Next page"
            >
              →
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
