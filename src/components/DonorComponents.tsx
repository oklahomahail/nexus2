// src/components/DonorComponents.tsx - Specialized donor management components
import clsx from "clsx";
import React from "react";

import { _Donor as Donor } from "../models/donor";

// Types
interface DonationHistoryItem {
  date: Date;
  amount: number;
  campaign?: string;
  method?: "credit_card" | "bank_transfer" | "check" | "cash";
  status?: "completed" | "pending" | "failed";
}

interface DonorSegment {
  id: string;
  name: string;
  criteria: string;
  color: "blue" | "green" | "yellow" | "red" | "purple";
}

interface DonorStats {
  totalDonations: number;
  averageGift: number;
  lastGiftDate?: Date;
  firstGiftDate?: Date;
  frequency: "high" | "medium" | "low";
  trend: "increasing" | "stable" | "decreasing";
}

// Donor Profile Card Component
export const DonorProfileCard: React.FC<{
  donor: Donor;
  stats?: DonorStats;
  segments?: DonorSegment[];
  onEdit?: () => void;
  onDelete?: () => void;
  onViewHistory?: () => void;
}> = ({ donor, stats, segments = [], onEdit, onDelete, onViewHistory }) => {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "high":
        return "text-green-400 bg-green-900/20";
      case "medium":
        return "text-yellow-400 bg-yellow-900/20";
      case "low":
        return "text-red-400 bg-red-900/20";
      default:
        return "text-slate-400 bg-slate-900/20";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return "📈";
      case "stable":
        return "➡️";
      case "decreasing":
        return "📉";
      default:
        return "➡️";
    }
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-1">
            {donor.name}
          </h3>
          <p className="text-slate-400 text-sm">{donor.email}</p>
          {donor.phone && (
            <p className="text-slate-400 text-sm">{donor.phone}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {stats && (
            <span
              className={clsx(
                "px-3 py-1 rounded-full text-xs font-medium",
                getFrequencyColor(stats.frequency),
              )}
            >
              {stats.frequency.toUpperCase()}
            </span>
          )}
          <div className="flex gap-1">
            {onViewHistory && (
              <button
                onClick={onViewHistory}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title="View History"
              >
                📊
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title="Edit"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                title="Delete"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Donation Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-slate-800/30 rounded-lg p-3">
          <p className="text-slate-400 text-xs mb-1">Total Given</p>
          <p className="font-semibold text-green-400">
            {formatCurrency(donor.totalGiven)}
          </p>
        </div>
        {stats && (
          <>
            <div className="bg-slate-800/30 rounded-lg p-3">
              <p className="text-slate-400 text-xs mb-1">Avg Gift</p>
              <p className="font-semibold text-blue-400">
                {formatCurrency(stats.averageGift)}
              </p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3">
              <p className="text-slate-400 text-xs mb-1">Last Gift</p>
              <p className="font-semibold text-white text-sm">
                {formatDate(stats.lastGiftDate)}
              </p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-3">
              <p className="text-slate-400 text-xs mb-1">Trend</p>
              <p className="font-semibold text-white flex items-center gap-1">
                <span>{getTrendIcon(stats.trend)}</span>
                <span className="text-sm capitalize">{stats.trend}</span>
              </p>
            </div>
          </>
        )}
      </div>

      {/* Segments */}
      {segments.length > 0 && (
        <div className="mb-4">
          <p className="text-slate-400 text-xs mb-2">Segments</p>
          <div className="flex flex-wrap gap-2">
            {segments.map((segment) => {
              const segmentColors = {
                blue: "bg-blue-900/20 text-blue-400 border-blue-800",
                green: "bg-green-900/20 text-green-400 border-green-800",
                yellow: "bg-yellow-900/20 text-yellow-400 border-yellow-800",
                red: "bg-red-900/20 text-red-400 border-red-800",
                purple: "bg-purple-900/20 text-purple-400 border-purple-800",
              };

              return (
                <span
                  key={segment.id}
                  className={clsx(
                    "px-2 py-1 rounded-md text-xs font-medium border",
                    segmentColors[segment.color],
                  )}
                >
                  {segment.name}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      {donor.notes && (
        <div className="mt-4 p-3 bg-slate-800/20 rounded-lg">
          <p className="text-slate-400 text-xs mb-1">Notes</p>
          <p className="text-slate-300 text-sm">{donor.notes}</p>
        </div>
      )}
    </div>
  );
};

// Donation History Component
export const DonationHistoryTable: React.FC<{
  donations: DonationHistoryItem[];
  showPagination?: boolean;
  pageSize?: number;
}> = ({ donations, showPagination = true, pageSize = 10 }) => {
  const [currentPage, setCurrentPage] = React.useState(1);

  const paginatedDonations = showPagination
    ? donations.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : donations;

  const totalPages = Math.ceil(donations.length / pageSize);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-900/20";
      case "pending":
        return "text-yellow-400 bg-yellow-900/20";
      case "failed":
        return "text-red-400 bg-red-900/20";
      default:
        return "text-slate-400 bg-slate-900/20";
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "credit_card":
        return "💳";
      case "bank_transfer":
        return "🏦";
      case "check":
        return "📝";
      case "cash":
        return "💵";
      default:
        return "💰";
    }
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800">
        <h3 className="text-lg font-semibold text-white">Donation History</h3>
        <p className="text-slate-400 text-sm">
          {donations.length} total donations
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="text-left py-3 px-6 text-slate-400 font-medium text-sm">
                Date
              </th>
              <th className="text-left py-3 px-6 text-slate-400 font-medium text-sm">
                Amount
              </th>
              <th className="text-left py-3 px-6 text-slate-400 font-medium text-sm">
                Campaign
              </th>
              <th className="text-left py-3 px-6 text-slate-400 font-medium text-sm">
                Method
              </th>
              <th className="text-left py-3 px-6 text-slate-400 font-medium text-sm">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedDonations.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-400">
                  No donations found
                </td>
              </tr>
            ) : (
              paginatedDonations.map((donation, index) => (
                <tr
                  key={index}
                  className="border-t border-slate-800/50 hover:bg-slate-800/20"
                >
                  <td className="py-3 px-6 text-white">
                    {donation.date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-6 font-semibold text-green-400">
                    ${donation.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-6 text-slate-300">
                    {donation.campaign || "General Fund"}
                  </td>
                  <td className="py-3 px-6 text-slate-300">
                    <div className="flex items-center gap-2">
                      <span>
                        {getMethodIcon(donation.method || "credit_card")}
                      </span>
                      <span className="capitalize">
                        {(donation.method || "credit_card").replace("_", " ")}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span
                      className={clsx(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        getStatusColor(donation.status || "completed"),
                      )}
                    >
                      {(donation.status || "completed").toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPagination && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <p className="text-slate-400 text-sm">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, donations.length)} of{" "}
            {donations.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-slate-800 text-slate-300 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-slate-400 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-slate-800 text-slate-300 rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Donor Search and Filter Component
export const DonorSearchFilters: React.FC<{
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSegments: string[];
  onSegmentChange: (segments: string[]) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  availableSegments: DonorSegment[];
}> = ({
  searchQuery,
  onSearchChange,
  selectedSegments,
  onSegmentChange,
  sortBy,
  onSortChange,
  availableSegments,
}) => {
  const sortOptions = [
    { value: "name", label: "Name" },
    { value: "totalGiven", label: "Total Given" },
    { value: "lastGiftDate", label: "Last Gift Date" },
    { value: "recentActivity", label: "Recent Activity" },
  ];

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search donors by name, email, or notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Sort */}
        <div className="min-w-0 lg:w-48">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                Sort by {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Segment Filters */}
      {availableSegments.length > 0 && (
        <div className="mt-4">
          <p className="text-slate-400 text-sm mb-2">Filter by segments:</p>
          <div className="flex flex-wrap gap-2">
            {availableSegments.map((segment) => {
              const isSelected = selectedSegments.includes(segment.id);
              const segmentColors = {
                blue: isSelected
                  ? "bg-blue-600 text-white"
                  : "bg-blue-900/20 text-blue-400 border-blue-800",
                green: isSelected
                  ? "bg-green-600 text-white"
                  : "bg-green-900/20 text-green-400 border-green-800",
                yellow: isSelected
                  ? "bg-yellow-600 text-white"
                  : "bg-yellow-900/20 text-yellow-400 border-yellow-800",
                red: isSelected
                  ? "bg-red-600 text-white"
                  : "bg-red-900/20 text-red-400 border-red-800",
                purple: isSelected
                  ? "bg-purple-600 text-white"
                  : "bg-purple-900/20 text-purple-400 border-purple-800",
              };

              return (
                <button
                  key={segment.id}
                  onClick={() => {
                    const newSegments = isSelected
                      ? selectedSegments.filter((s) => s !== segment.id)
                      : [...selectedSegments, segment.id];
                    onSegmentChange(newSegments);
                  }}
                  className={clsx(
                    "px-3 py-1 rounded-md text-sm font-medium border transition-colors",
                    segmentColors[segment.color],
                    !isSelected && "hover:opacity-80",
                  )}
                >
                  {segment.name}
                </button>
              );
            })}
            {selectedSegments.length > 0 && (
              <button
                onClick={() => onSegmentChange([])}
                className="px-3 py-1 rounded-md text-sm font-medium text-slate-400 hover:text-white border border-slate-600 hover:border-slate-500 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
