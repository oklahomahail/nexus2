import clsx from "clsx";
import React, { useEffect, useState, useMemo } from "react";

import {
  DonorProfileCard,
  DonationHistoryTable,
  DonorSearchFilters,
} from "../components/DonorComponents";
import LoadingSpinner from "../components/LoadingSpinner";
import { Button } from "../components/ui-kit/Button";
import { _Donor as Donor } from "../models/donor";
import * as donorService from "../services/donorService";

const DonorsPanel: React.FC = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [view, setView] = useState<"list" | "detail" | "form">("list");
  const [selected, setSelected] = useState<Donor | null>(null);
  const [formData, setFormData] = useState<Partial<Donor>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Mock segments data
  const availableSegments = [
    {
      id: "major",
      name: "Major Donors",
      criteria: "$5,000+",
      color: "green" as const,
    },
    {
      id: "regular",
      name: "Regular Donors",
      criteria: "$1,000-$4,999",
      color: "blue" as const,
    },
    {
      id: "new",
      name: "New Donors",
      criteria: "First time",
      color: "purple" as const,
    },
    {
      id: "lapsed",
      name: "Lapsed Donors",
      criteria: "No recent gifts",
      color: "yellow" as const,
    },
  ];

  // Generate mock stats for donors
  const generateDonorStats = (donor: Donor) => {
    const donationCount = donor.givingHistory?.length || 1;
    const averageGift = donor.totalGiven / donationCount;
    const lastGift = donor.givingHistory?.[0]?.date || donor.lastGiftDate;
    const firstGift =
      donor.givingHistory?.[donationCount - 1]?.date || lastGift;

    return {
      totalDonations: donationCount,
      averageGift,
      lastGiftDate: lastGift,
      firstGiftDate: firstGift,
      frequency:
        donor.totalGiven > 5000
          ? ("high" as const)
          : donor.totalGiven > 1000
            ? ("medium" as const)
            : ("low" as const),
      trend: donationCount > 3 ? ("increasing" as const) : ("stable" as const),
    };
  };

  // Generate donation history from giving history
  const generateDonationHistory = (donor: Donor) => {
    return (
      donor.givingHistory?.map((gift) => ({
        date: gift.date,
        amount: gift.amount,
        campaign: "General Fund", // Mock campaign
        method: "credit_card" as const,
        status: "completed" as const,
      })) || []
    );
  };

  useEffect(() => {
    void loadDonors();
  }, []);

  const loadDonors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await donorService.getDonors();
      setDonors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load donors");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort donors
  const filteredAndSortedDonors = useMemo(() => {
    let filtered = donors.filter((donor) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        donor.name.toLowerCase().includes(searchLower) ||
        donor.email.toLowerCase().includes(searchLower) ||
        (donor.notes && donor.notes.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;

      // Segment filter
      if (selectedSegments.length > 0) {
        const hasSegment = selectedSegments.some((segmentId) => {
          switch (segmentId) {
            case "major":
              return donor.totalGiven >= 5000;
            case "regular":
              return donor.totalGiven >= 1000 && donor.totalGiven < 5000;
            case "new":
              return donor.givingHistory?.length === 1;
            case "lapsed":
              return (
                !donor.lastGiftDate ||
                new Date().getTime() - donor.lastGiftDate.getTime() >
                  365 * 24 * 60 * 60 * 1000
              );
            default:
              return false;
          }
        });
        if (!hasSegment) return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "totalGiven":
          return b.totalGiven - a.totalGiven;
        case "lastGiftDate": {
          const aDate = a.lastGiftDate?.getTime() || 0;
          const bDate = b.lastGiftDate?.getTime() || 0;
          return bDate - aDate;
        }
        case "recentActivity": {
          const aActivity = a.givingHistory?.length || 0;
          const bActivity = b.givingHistory?.length || 0;
          return bActivity - aActivity;
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [donors, searchQuery, selectedSegments, sortBy]);

  const handleCreate = () => {
    setFormData({});
    setSelected(null);
    setView("form");
  };

  const handleEdit = (donor: Donor) => {
    setSelected(donor);
    setFormData(donor);
    setView("form");
  };

  const handleView = (donor: Donor) => {
    setSelected(donor);
    setView("detail");
  };

  const handleDelete = async (donor: Donor) => {
    if (window.confirm(`Delete donor ${donor.name}?`)) {
      await donorService.deleteDonor(donor.id);
      void loadDonors();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) {
      await donorService.updateDonor(selected.id, formData);
    } else {
      await donorService.createDonor(formData);
    }
    await loadDonors();
    setView("list");
    setSelected(null);
    setFormData({});
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-6">
        <div className="flex">
          <div className="mt-0.5">⚠️</div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-300">
              Error Loading Donors
            </h3>
            <p className="text-sm text-red-200 mt-1">{error}</p>
            <button
              onClick={loadDonors}
              className="mt-2 text-sm text-red-200 hover:text-red-100 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "detail" && selected) {
    const stats = generateDonorStats(selected);
    const donationHistory = generateDonationHistory(selected);
    const segments = availableSegments.filter((segment) => {
      switch (segment.id) {
        case "major":
          return selected.totalGiven >= 5000;
        case "regular":
          return selected.totalGiven >= 1000 && selected.totalGiven < 5000;
        case "new":
          return selected.givingHistory?.length === 1;
        case "lapsed":
          return (
            !selected.lastGiftDate ||
            new Date().getTime() - selected.lastGiftDate.getTime() >
              365 * 24 * 60 * 60 * 1000
          );
        default:
          return false;
      }
    });

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={() => setView("list")} variant="outline" size="sm">
            ← Back to Donors
          </Button>
          <h2 className="text-2xl font-bold text-white">Donor Details</h2>
        </div>

        <DonorProfileCard
          donor={selected}
          stats={stats}
          segments={segments}
          onEdit={() => handleEdit(selected)}
          onDelete={() => handleDelete(selected)}
        />

        {donationHistory.length > 0 && (
          <DonationHistoryTable
            donations={donationHistory}
            showPagination={true}
            pageSize={5}
          />
        )}
      </div>
    );
  }

  if (view === "form") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-6">
            {selected ? "Edit Donor" : "New Donor"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Name *
                </label>
                <input
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full name"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email address"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone number"
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Total Given
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  value={formData.totalGiven || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalGiven: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Address
              </label>
              <input
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Full address"
                value={formData.address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Notes
              </label>
              <textarea
                rows={4}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes about this donor..."
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setView("list");
                  setSelected(null);
                  setFormData({});
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {selected ? "Update Donor" : "Create Donor"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Donor Management</h2>
          <p className="text-slate-400">
            {filteredAndSortedDonors.length} of {donors.length} donors
            {selectedSegments.length > 0 &&
              ` (filtered by ${selectedSegments.length} segment${selectedSegments.length !== 1 ? "s" : ""})`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode("cards")}
              className={clsx(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                viewMode === "cards"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white",
              )}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={clsx(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                viewMode === "table"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white",
              )}
            >
              Table
            </button>
          </div>

          <Button onClick={handleCreate} variant="primary">
            Add Donor
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <DonorSearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedSegments={selectedSegments}
        onSegmentChange={setSelectedSegments}
        sortBy={sortBy}
        onSortChange={setSortBy}
        availableSegments={availableSegments}
      />

      {/* Donors Display */}
      {filteredAndSortedDonors.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {searchQuery || selectedSegments.length > 0
              ? "No donors match your filters"
              : "No donors yet"}
          </h3>
          <p className="text-slate-400 mb-4">
            {searchQuery || selectedSegments.length > 0
              ? "Try adjusting your search or filters"
              : "Get started by adding your first donor"}
          </p>
          {!searchQuery && selectedSegments.length === 0 && (
            <Button onClick={handleCreate} variant="primary">
              Add Your First Donor
            </Button>
          )}
        </div>
      ) : (
        <>
          {viewMode === "cards" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAndSortedDonors.map((donor) => {
                const stats = generateDonorStats(donor);
                const segments = availableSegments.filter((segment) => {
                  switch (segment.id) {
                    case "major":
                      return donor.totalGiven >= 5000;
                    case "regular":
                      return (
                        donor.totalGiven >= 1000 && donor.totalGiven < 5000
                      );
                    case "new":
                      return donor.givingHistory?.length === 1;
                    case "lapsed":
                      return (
                        !donor.lastGiftDate ||
                        new Date().getTime() - donor.lastGiftDate.getTime() >
                          365 * 24 * 60 * 60 * 1000
                      );
                    default:
                      return false;
                  }
                });

                return (
                  <DonorProfileCard
                    key={donor.id}
                    donor={donor}
                    stats={stats}
                    segments={segments}
                    onEdit={() => handleEdit(donor)}
                    onDelete={() => handleDelete(donor)}
                    onViewHistory={() => handleView(donor)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="text-left py-3 px-6 text-slate-400 font-medium text-sm">
                        Name
                      </th>
                      <th className="text-left py-3 px-6 text-slate-400 font-medium text-sm">
                        Email
                      </th>
                      <th className="text-left py-3 px-6 text-slate-400 font-medium text-sm">
                        Total Given
                      </th>
                      <th className="text-left py-3 px-6 text-slate-400 font-medium text-sm">
                        Last Gift
                      </th>
                      <th className="text-left py-3 px-6 text-slate-400 font-medium text-sm">
                        Status
                      </th>
                      <th className="text-left py-3 px-6 text-slate-400 font-medium text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedDonors.map((donor) => {
                      const stats = generateDonorStats(donor);

                      return (
                        <tr
                          key={donor.id}
                          className="border-t border-slate-800/50 hover:bg-slate-800/20"
                        >
                          <td className="py-3 px-6">
                            <div>
                              <p className="font-medium text-white">
                                {donor.name}
                              </p>
                              {donor.phone && (
                                <p className="text-sm text-slate-400">
                                  {donor.phone}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-6 text-slate-300">
                            {donor.email}
                          </td>
                          <td className="py-3 px-6 font-semibold text-green-400">
                            ${donor.totalGiven.toLocaleString()}
                          </td>
                          <td className="py-3 px-6 text-slate-300">
                            {stats.lastGiftDate
                              ? stats.lastGiftDate.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </td>
                          <td className="py-3 px-6">
                            <span
                              className={clsx(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                stats.frequency === "high"
                                  ? "bg-green-900/20 text-green-400"
                                  : stats.frequency === "medium"
                                    ? "bg-yellow-900/20 text-yellow-400"
                                    : "bg-red-900/20 text-red-400",
                              )}
                            >
                              {stats.frequency.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleView(donor)}
                                className="text-blue-400 hover:text-blue-300 text-sm"
                                title="View Details"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleEdit(donor)}
                                className="text-green-400 hover:text-green-300 text-sm"
                                title="Edit"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(donor)}
                                className="text-red-400 hover:text-red-300 text-sm"
                                title="Delete"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DonorsPanel;
