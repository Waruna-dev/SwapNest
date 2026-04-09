import React, { useState, useEffect } from "react";
import {
  getUserSwaps,
  getPendingRequests,
  updateSwapStatus,
  cancelSwap,
  requestCompletion,
  getCompletionStatus,
} from "../../services/swapService";
import SwapDetailsModal from "./SwapDetailsModal1";
import SwapUpdateForm from "./SwapUpdateForm";

const SwapList = ({ userId }) => {
  const [swaps, setSwaps] = useState([]);
  const [filteredSwaps, setFilteredSwaps] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [swapToUpdate, setSwapToUpdate] = useState(null);
  const [completionStatuses, setCompletionStatuses] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [swapTypeFilter, setSwapTypeFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    fetchSwaps();
  }, [userId, activeTab]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [
    swaps,
    searchTerm,
    statusFilter,
    swapTypeFilter,
    roleFilter,
    dateFilter,
    activeTab,
    sortField,
    sortDirection,
  ]);

  const fetchSwaps = async () => {
    setLoading(true);
    setError("");
    try {
      let response;
      if (activeTab === "all") {
        response = await getUserSwaps(userId);
        setSwaps(response.data || []);
        const acceptedSwaps = response.data.filter(
          (s) => s.status === "accepted",
        );
        for (const swap of acceptedSwaps) {
          try {
            const statusRes = await getCompletionStatus(swap._id);
            setCompletionStatuses((prev) => ({
              ...prev,
              [swap._id]: statusRes.data,
            }));
          } catch (err) {
            console.error("Error fetching completion status:", err);
          }
        }
      } else if (activeTab === "pending") {
        response = await getPendingRequests(userId);
        setSwaps(response.data || []);
      } else if (activeTab === "my-requests") {
        const allSwaps = await getUserSwaps(userId);
        const myRequests = allSwaps.data.filter((swap) => {
          if (typeof swap.requesterId === "string")
            return swap.requesterId === userId;
          if (swap.requesterId?._id) return swap.requesterId._id === userId;
          return false;
        });
        setSwaps(myRequests);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch swaps");
      setSwaps([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...swaps];

    // Apply filters
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (swap) =>
          swap.requestId?.toLowerCase().includes(term) ||
          swap.requestedItem?.name?.toLowerCase().includes(term) ||
          swap.offeredItem?.name?.toLowerCase().includes(term) ||
          swap.requesterName?.toLowerCase().includes(term) ||
          swap.requestedItem?.ownerName?.toLowerCase().includes(term),
      );
    }
    if (statusFilter !== "all")
      filtered = filtered.filter((s) => s.status === statusFilter);
    if (swapTypeFilter !== "all")
      filtered = filtered.filter((s) => s.swapType === swapTypeFilter);
    if (roleFilter !== "all") {
      if (roleFilter === "requester")
        filtered = filtered.filter((s) => isUserRequester(s));
      else if (roleFilter === "owner")
        filtered = filtered.filter((s) => isUserOwner(s));
    }
    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((swap) => {
        const d = new Date(swap.createdAt);
        if (dateFilter === "today")
          return d.toDateString() === now.toDateString();
        if (dateFilter === "week")
          return d >= new Date(new Date().setDate(now.getDate() - 7));
        if (dateFilter === "month")
          return d >= new Date(new Date().setMonth(now.getMonth() - 1));
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortField) {
        case "requestId":
          aVal = a.requestId || "";
          bVal = b.requestId || "";
          break;
        case "requestedItem":
          aVal = a.requestedItem?.name || "";
          bVal = b.requestedItem?.name || "";
          break;
        case "status":
          aVal = a.status || "";
          bVal = b.status || "";
          break;
        case "createdAt":
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        default:
          aVal = a[sortField] || "";
          bVal = b[sortField] || "";
      }

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredSwaps(filtered);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSwapTypeFilter("all");
    setRoleFilter("all");
    setDateFilter("all");
  };

  const handleAccept = async (swapId) => {
    if (window.confirm("Accept this swap request?")) {
      try {
        await updateSwapStatus(swapId, "accepted");
        fetchSwaps();
        alert("✅ Swap accepted");
      } catch {
        alert("Failed to accept swap");
      }
    }
  };

  const handleReject = async (swapId) => {
    if (window.confirm("Reject this swap request?")) {
      try {
        await updateSwapStatus(swapId, "rejected");
        fetchSwaps();
        alert("❌ Swap rejected");
      } catch {
        alert("Failed to reject swap");
      }
    }
  };

  const handleComplete = async (swapId, userRole) => {
    try {
      const result = await requestCompletion(swapId, userId, userRole);
      alert(
        result.bothConfirmed
          ? "🎉 Swap completed successfully!"
          : result.message,
      );
      fetchSwaps();
    } catch (err) {
      alert("Failed to complete swap: " + err.message);
    }
  };

  const handleCancel = async (swapId) => {
    if (window.confirm("Cancel this swap request?")) {
      try {
        await cancelSwap(swapId);
        fetchSwaps();
        alert("✅ Swap cancelled");
      } catch (err) {
        alert("Failed to cancel swap: " + err.message);
      }
    }
  };

  const handleUpdate = (swap) => {
    setSwapToUpdate(swap);
    setShowUpdateForm(true);
  };

  const handleUpdateSuccess = () => {
    setShowUpdateForm(false);
    setSwapToUpdate(null);
    fetchSwaps();
    alert("✅ Swap updated!");
  };

  const handleViewDetails = (swap) => {
    setSelectedSwap(swap);
    setShowModal(true);
  };

  const isUserRequester = (swap) => {
    if (typeof swap.requesterId === "string")
      return swap.requesterId === userId;
    return swap.requesterId?._id === userId;
  };

  const isUserOwner = (swap) => {
    const ownerId = swap.requestedItem?.ownerId;
    if (typeof ownerId === "string") return ownerId === userId;
    return ownerId?._id === userId;
  };

  const getRequesterName = (swap) =>
    swap.requesterName ||
    (typeof swap.requesterId === "object"
      ? swap.requesterId?.username
      : null) ||
    "Unknown";

  const getOwnerName = (swap) =>
    swap.requestedItem?.ownerName ||
    (typeof swap.requestedItem?.ownerId === "object"
      ? swap.requestedItem.ownerId?.username
      : null) ||
    "Unknown";

  const getCompletionButtonText = (swap) => {
    const status = completionStatuses[swap._id];
    if (!status) return "Mark Complete";
    if (status.bothConfirmed) return "Completed";
    if (
      (isUserRequester(swap) && status.requesterConfirmed) ||
      (isUserOwner(swap) && status.ownerConfirmed)
    )
      return "Awaiting other party";
    return "Mark Complete";
  };

  const isCompleteButtonDisabled = (swap) => {
    const status = completionStatuses[swap._id];
    if (!status) return false;
    if (status.bothConfirmed) return true;
    if (isUserRequester(swap) && status.requesterConfirmed) return true;
    if (isUserOwner(swap) && status.ownerConfirmed) return true;
    return false;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      rejected: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return colors[status] || colors.pending;
  };

  const stats = {
    total: swaps.length,
    filtered: filteredSwaps.length,
    pending: swaps.filter((s) => s.status === "pending").length,
    accepted: swaps.filter((s) => s.status === "accepted").length,
    completed: swaps.filter((s) => s.status === "completed").length,
  };

  const hasActiveFilters =
    searchTerm ||
    statusFilter !== "all" ||
    swapTypeFilter !== "all" ||
    roleFilter !== "all" ||
    dateFilter !== "all";

  const tabs = [
    { id: "all", label: "All Swaps", count: null },
    { id: "pending", label: "Incoming", count: null },
    { id: "my-requests", label: "My Requests", count: null },
  ];

  const SortIcon = ({ field }) => {
    if (sortField !== field)
      return (
        <svg
          className="w-3 h-3 ml-1 opacity-30"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    return sortDirection === "asc" ? (
      <svg
        className="w-3 h-3 ml-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="w-3 h-3 ml-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-2 border-t-green-600 animate-spin"></div>
        </div>
        <p className="text-sm text-gray-500">Loading swaps…</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed top-0 right-0 w-[600px] h-[600px] rounded-full bg-green-100/20 blur-[120px] -z-10" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-orange-100/10 blur-[100px] -z-10" />

      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-medium">
                Total Swaps
              </span>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.total}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-medium">
                Accepted
              </span>
              <svg
                className="w-5 h-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.accepted}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-medium">
                Completed
              </span>
              <svg
                className="w-5 h-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.completed}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 border border-gray-200 w-fit shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-on-tertiary-fixed-variant text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span
                  className={`ml-2 text-xs ${activeTab === tab.id ? "text-green-100" : "text-gray-400"}`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by item, name, or request ID…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  showFilters || hasActiveFilters
                    ? "bg-on-tertiary-fixed-variant text-white border-green-600"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
                  />
                </svg>
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-white rounded-full" />
                )}
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Type
                  </label>
                  <select
                    value={swapTypeFilter}
                    onChange={(e) => setSwapTypeFilter(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                  >
                    <option value="all">All Types</option>
                    <option value="item-for-item">Item for Item</option>
                    <option value="swap-with-cash">With Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    My Role
                  </label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                  >
                    <option value="all">All Roles</option>
                    <option value="requester">Requester</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    Date
                  </label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>
              </div>
            )}

            {hasActiveFilters && (
              <div className="mt-3 pt-2 text-xs text-gray-500 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-600"></span>
                Showing {stats.filtered} of {stats.total} swap
                {stats.total !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-3 bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200 text-sm">
            <svg
              className="w-4 h-4 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-9.75a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0v-3zm.75 6a.875.875 0 110-1.75.875.875 0 010 1.75z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Table */}
        {filteredSwaps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl">
              {hasActiveFilters ? "🔍" : "📭"}
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900 mb-1">
                {hasActiveFilters
                  ? "No matches found"
                  : activeTab === "my-requests"
                    ? "No requests yet"
                    : activeTab === "pending"
                      ? "All clear!"
                      : "No swaps yet"}
              </p>
              <p className="text-sm text-gray-500">
                {hasActiveFilters
                  ? "Try adjusting your filters"
                  : "New swap activity will appear here"}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-green-600 font-medium hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-200 border-b border-gray-200">
                  <tr>
                    <th
                      onClick={() => handleSort("requestId")}
                      className="px-4 py-3 text-left text-xs font-extrabold text-gray-900 uppercase underline decoration-1 underline-offset-2 tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">Request ID</div>
                    </th>
                    <th
                      onClick={() => handleSort("requestedItem")}
                      className="px-4 py-3 text-left text-xs font-extrabold text-gray-900 uppercase underline decoration-1 underline-offset-2 tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        Requested Item
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-extrabold text-gray-900 uppercase underline decoration-1 underline-offset-2 tracking-wider">
                      Offered
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-extrabold text-gray-900 uppercase underline decoration-1 underline-offset-2 tracking-wider">
                      Parties
                    </th>
                    <th
                      onClick={() => handleSort("status")}
                      className="px-4 py-3 text-left text-xs font-extrabold text-gray-900 uppercase underline decoration-1 underline-offset-2 tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">Status</div>
                    </th>
                    <th
                      onClick={() => handleSort("createdAt")}
                      className="px-4 py-3 text-left text-xs font-extrabold text-gray-900 uppercase underline decoration-1 underline-offset-2 tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">Date</div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-extrabold text-gray-900 uppercase underline decoration-1 underline-offset-2 tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSwaps.map((swap) => {
                    const isOwner = isUserOwner(swap);
                    const isRequester = isUserRequester(swap);
                    const isPending = swap.status === "pending";
                    const isAccepted = swap.status === "accepted";
                    const isCompleted = swap.status === "completed";
                    const isRejected = swap.status === "rejected";
                    const isCancelled = swap.status === "cancelled";
                    const completionStatus = completionStatuses[swap._id];

                    return (
                      <tr
                        key={swap._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Request ID */}
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm text-primary font-medium bg-primary-fixed/30 px-2 py-1 rounded-md">
                            {swap.requestId}
                          </span>
                        </td>

                        {/* Requested Item */}
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {swap.requestedItem?.name || "—"}
                            </p>
                            {swap.requestedItem?.condition && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                ( {swap.requestedItem.condition} )
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Offered Item / Cash */}
                        <td className="px-4 py-3">
                          {swap.swapType === "item-for-item" &&
                          swap.offeredItem ? (
                            <div>
                              <p className="text-sm font-bold text-gray-900">
                                {swap.offeredItem.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                ( {swap.offeredItem.condition} )
                              </p>
                            </div>
                          ) : swap.cashDetails ? (
                            <p className="text-sm font-semibold text-orange-600">
                              LKR {swap.cashDetails.amount}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400">—</p>
                          )}
                          {swap.swapType === "swap-with-cash" && (
                            <span className="inline-block font-bold mt-1 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                              {swap.offeredItem.name}
                            </span>
                          )}
                        </td>

                        {/* Parties */}
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-gray-500">↑</span>
                              <span className="text-gray-900">
                                {getRequesterName(swap)}
                              </span>
                              {isRequester && (
                                <span className="text-xs text-green-600">
                                  (me)
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-gray-500">↓</span>
                              <span className="text-gray-900">
                                {getOwnerName(swap)}
                              </span>
                              {isOwner && (
                                <span className="text-xs text-green-600">
                                  (you)
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(swap.status)}`}
                          >
                            {swap.status.charAt(0).toUpperCase() +
                              swap.status.slice(1)}
                          </span>
                          {isAccepted && completionStatus && (
                            <p className="text-xs text-gray-500 mt-1">
                              {completionStatus.requesterConfirmed &&
                                "✓ Requester• "}
                              {completionStatus.ownerConfirmed && "✓ Owner"}
                            </p>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-600">
                            {new Date(swap.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "2-digit",
                              },
                            )}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(swap.createdAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(swap)}
                              className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                              title="View Details"
                            >
                              View
                            </button>

                            {isRequester && isPending && (
                              <>
                                <button
                                  onClick={() => handleUpdate(swap)}
                                  className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                                  title="Edit"
                                >
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleCancel(swap._id)}
                                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                                  title="Cancel"
                                >
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </>
                            )}

                            {isOwner && isPending && (
                              <>
                                <button
                                  onClick={() => handleAccept(swap._id)}
                                  className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors"
                                  title="Accept"
                                >
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleReject(swap._id)}
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                  title="Reject"
                                >
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </>
                            )}

                            {isAccepted && !isCompleted && (
                              <button
                                onClick={() =>
                                  handleComplete(
                                    swap._id,
                                    isRequester ? "requester" : "owner",
                                  )
                                }
                                disabled={isCompleteButtonDisabled(swap)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                                  isCompleteButtonDisabled(swap)
                                    ? "bg-blue-100 text-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-green-700"
                                }`}
                              >
                                {getCompletionButtonText(swap)}
                              </button>
                            )}

                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-lg">
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                Done
                              </span>
                            )}

                            {(isRejected && isRequester) ||
                              (isCancelled && isOwner && (
                                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                                  {isRejected ? "Rejected" : "Cancelled"}
                                </span>
                              ))}
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
      </div>

      {showModal && selectedSwap && (
        <SwapDetailsModal
          swap={selectedSwap}
          onClose={() => setShowModal(false)}
        />
      )}
      {showUpdateForm && swapToUpdate && (
        <SwapUpdateForm
          swapId={swapToUpdate._id}
          requesterId={userId}
          requesterName={getRequesterName(swapToUpdate)}
          onClose={() => setShowUpdateForm(false)}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
};

export default SwapList;
