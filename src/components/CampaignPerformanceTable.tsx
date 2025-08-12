// src/components/CampaignPerformanceTable.tsx
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  DollarSign,
} from "lucide-react";
import React, { useState, useMemo } from "react";

import { Campaign } from "../models/campaign";

interface CampaignPerformanceTableProps {
  campaigns: Campaign[];
  onViewCampaign?: (campaign: Campaign) => void;
  showClientColumn?: boolean;
  className?: string;
}

type SortField =
  | "name"
  | "status"
  | "progress"
  | "raised"
  | "goal"
  | "donorCount"
  | "roi"
  | "conversionRate"
  | "endDate";
type SortDirection = "asc" | "desc";

const CampaignPerformanceTable: React.FC<CampaignPerformanceTableProps> = ({
  campaigns,
  onViewCampaign,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showClientColumn = false,
  className,
}) => {
  const [sortField, setSortField] = useState<SortField>("raised");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [statusFilter, setStatusFilter] = useState<"all" | Campaign["status"]>(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Filtering and sorting logic
  const filteredAndSortedCampaigns = useMemo(() => {
    let filtered = campaigns.filter((campaign) => {
      const matchesStatus =
        statusFilter === "all" || campaign.status === statusFilter;
      const matchesSearch =
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    // Sort campaigns
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "progress":
          aValue = a.progress;
          bValue = b.progress;
          break;
        case "raised":
          aValue = a.raised;
          bValue = b.raised;
          break;
        case "goal":
          aValue = a.goal;
          bValue = b.goal;
          break;
        case "donorCount":
          aValue = a.donorCount;
          bValue = b.donorCount;
          break;
        case "roi":
          aValue = a.roi;
          bValue = b.roi;
          break;
        case "conversionRate":
          aValue = a.conversionRate || 0;
          bValue = b.conversionRate || 0;
          break;
        case "endDate":
          aValue = new Date(a.endDate);
          bValue = new Date(b.endDate);
          break;
        default:
          aValue = a.raised;
          bValue = b.raised;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [campaigns, sortField, sortDirection, statusFilter, searchQuery]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field)
      return <ArrowUpDown className="w-4 h-4 text-slate-400" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 text-blue-400" />
    ) : (
      <ArrowDown className="w-4 h-4 text-blue-400" />
    );
  };

  const getStatusColor = (status: Campaign["status"]) => {
    switch (status) {
      case "Active":
        return "bg-green-900/20 text-green-400 border border-green-800/50";
      case "Draft":
        return "bg-yellow-900/20 text-yellow-400 border border-yellow-800/50";
      case "Completed":
        return "bg-blue-900/20 text-blue-400 border border-blue-800/50";
      case "Paused":
        return "bg-gray-900/20 text-gray-400 border border-gray-800/50";
      default:
        return "bg-slate-900/20 text-slate-400 border border-slate-800/50";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const exportToCSV = () => {
    const headers = [
      "Campaign Name",
      "Status",
      "Progress (%)",
      "Raised",
      "Goal",
      "Donors",
      "ROI (%)",
      "Conversion Rate (%)",
      "End Date",
    ];

    const csvData = filteredAndSortedCampaigns.map((campaign) => [
      campaign.name,
      campaign.status,
      campaign.progress.toString(),
      campaign.raised.toString(),
      campaign.goal.toString(),
      campaign.donorCount.toString(),
      campaign.roi.toString(),
      (campaign.conversionRate || 0).toString(),
      campaign.endDate,
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "campaign-performance.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as typeof statusFilter)
            }
            className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Completed">Completed</option>
            <option value="Paused">Paused</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">
            {filteredAndSortedCampaigns.length} campaign
            {filteredAndSortedCampaigns.length !== 1 ? "s" : ""}
          </span>

          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-blue-400" />
            <span className="text-xs text-slate-400">Total</span>
          </div>
          <p className="text-xl font-bold text-white">
            {filteredAndSortedCampaigns.length}
          </p>
          <p className="text-slate-400 text-sm">Campaigns</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-xs text-slate-400">Raised</span>
          </div>
          <p className="text-xl font-bold text-white">
            {formatCurrency(
              filteredAndSortedCampaigns.reduce((sum, c) => sum + c.raised, 0),
            )}
          </p>
          <p className="text-slate-400 text-sm">Total Revenue</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-slate-400">Donors</span>
          </div>
          <p className="text-xl font-bold text-white">
            {filteredAndSortedCampaigns
              .reduce((sum, c) => sum + c.donorCount, 0)
              .toLocaleString()}
          </p>
          <p className="text-slate-400 text-sm">Total Donors</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            <span className="text-xs text-slate-400">Avg ROI</span>
          </div>
          <p className="text-xl font-bold text-white">
            {filteredAndSortedCampaigns.length > 0
              ? (
                  filteredAndSortedCampaigns.reduce(
                    (sum, c) => sum + c.roi,
                    0,
                  ) / filteredAndSortedCampaigns.length
                ).toFixed(1)
              : 0}
            %
          </p>
          <p className="text-slate-400 text-sm">Return on Investment</p>
        </div>
      </div>

      {/* Campaign Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>Campaign</span>
                    {getSortIcon("name")}
                  </button>
                </th>

                <th className="text-left p-4">
                  <button
                    onClick={() => handleSort("status")}
                    className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
                  >
                    <span>Status</span>
                    {getSortIcon("status")}
                  </button>
                </th>

                <th className="text-right p-4">
                  <button
                    onClick={() => handleSort("progress")}
                    className="flex items-center justify-end space-x-2 text-slate-300 hover:text-white transition-colors w-full"
                  >
                    <span>Progress</span>
                    {getSortIcon("progress")}
                  </button>
                </th>

                <th className="text-right p-4">
                  <button
                    onClick={() => handleSort("raised")}
                    className="flex items-center justify-end space-x-2 text-slate-300 hover:text-white transition-colors w-full"
                  >
                    <span>Raised</span>
                    {getSortIcon("raised")}
                  </button>
                </th>

                <th className="text-right p-4">
                  <button
                    onClick={() => handleSort("goal")}
                    className="flex items-center justify-end space-x-2 text-slate-300 hover:text-white transition-colors w-full"
                  >
                    <span>Goal</span>
                    {getSortIcon("goal")}
                  </button>
                </th>

                <th className="text-right p-4">
                  <button
                    onClick={() => handleSort("donorCount")}
                    className="flex items-center justify-end space-x-2 text-slate-300 hover:text-white transition-colors w-full"
                  >
                    <span>Donors</span>
                    {getSortIcon("donorCount")}
                  </button>
                </th>

                <th className="text-right p-4">
                  <button
                    onClick={() => handleSort("roi")}
                    className="flex items-center justify-end space-x-2 text-slate-300 hover:text-white transition-colors w-full"
                  >
                    <span>ROI</span>
                    {getSortIcon("roi")}
                  </button>
                </th>

                <th className="text-right p-4">
                  <button
                    onClick={() => handleSort("endDate")}
                    className="flex items-center justify-end space-x-2 text-slate-300 hover:text-white transition-colors w-full"
                  >
                    <span>End Date</span>
                    {getSortIcon("endDate")}
                  </button>
                </th>

                <th className="text-right p-4">
                  <span className="text-slate-300">Actions</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredAndSortedCampaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  className="border-t border-slate-700/50 hover:bg-slate-700/25 transition-colors"
                >
                  <td className="p-4">
                    <div>
                      <p className="text-white font-medium">{campaign.name}</p>
                      <p className="text-slate-400 text-sm">
                        {campaign.category}
                      </p>
                    </div>
                  </td>

                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}
                    >
                      {campaign.status}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-white font-medium">
                        {campaign.progress}%
                      </span>
                      <div className="w-16 bg-slate-600 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(campaign.progress, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    <p className="text-white font-semibold">
                      {formatCurrency(campaign.raised)}
                    </p>
                  </td>

                  <td className="p-4 text-right">
                    <p className="text-slate-300">
                      {formatCurrency(campaign.goal)}
                    </p>
                  </td>

                  <td className="p-4 text-right">
                    <p className="text-white">
                      {campaign.donorCount.toLocaleString()}
                    </p>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {campaign.roi > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span
                        className={`font-medium ${campaign.roi > 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {campaign.roi}%
                      </span>
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    <p className="text-slate-300">
                      {formatDate(campaign.endDate)}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {campaign.daysLeft} days left
                    </p>
                  </td>

                  <td className="p-4 text-right">
                    {onViewCampaign && (
                      <button
                        onClick={() => onViewCampaign(campaign)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
                        title="View Campaign Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAndSortedCampaigns.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">
                No campaigns found
              </h3>
              <p className="text-slate-400 text-sm">
                {campaigns.length === 0
                  ? "No campaigns to display"
                  : "Try adjusting your search or filter criteria"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignPerformanceTable;
