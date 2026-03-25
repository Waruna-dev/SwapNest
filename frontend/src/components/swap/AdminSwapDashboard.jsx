import React, { useState, useEffect } from "react";
import { getAllSwaps, deleteSwap } from "../../services/swapService";
import StatusBadge from "../common/StatusBadge";
import SwapDetailsModal from "./SwapDetailsModal";

const AdminSwapDashboard = () => {
  const [swaps, setSwaps] = useState([]);
  const [filteredSwaps, setFilteredSwaps] = useState([]);
  const [filters, setFilters] = useState({ status: "", swapType: "", sort: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    fetchSwaps();
  }, [filters]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSwaps(swaps);
      return;
    }
    const term = searchTerm.toLowerCase().trim();
    setFilteredSwaps(swaps.filter(swap => 
      [swap.requestId, swap.requestedItem?.name, swap.requesterName, 
       swap.requestedItem?.ownerName, swap.status, swap.swapType, 
       swap.offeredItem?.name].some(field => field?.toLowerCase().includes(term))
    ));
  }, [searchTerm, swaps]);

  const fetchSwaps = async () => {
    setLoading(true);
    try {
      const { data } = await getAllSwaps(filters);
      setSwaps(data);
      setFilteredSwaps(data);
    } catch (error) {
      console.error("Error fetching swaps:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Permanently delete this swap?")) {
      try {
        await deleteSwap(id);
        fetchSwaps();
      } catch (error) {
        alert("Failed to delete swap");
      }
    }
  };

  const handleViewDetails = (swap) => {
    setSelectedSwap(swap);
    setShowModal(true);
  };

  const stats = {
    total: swaps.length,
    pending: swaps.filter(s => s.status === "pending").length,
    accepted: swaps.filter(s => s.status === "accepted").length,
    completed: swaps.filter(s => s.status === "completed").length,
    filtered: filteredSwaps.length,
  };

  const FilterSelect = ({ value, onChange, options, placeholder }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none pr-10 cursor-pointer ${
          value ? "border-primary bg-primary-fixed/10 text-primary font-medium" : "border-outline-variant text-on-surface hover:border-primary"
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );

  const getOfferedItemDisplay = (swap) => {
    if (swap.swapType === "item-for-item" && swap.offeredItem) {
      return (
        <div className="flex items-center gap-1">
          <span>🔄</span>
          <span className="font-medium">{swap.offeredItem.name}</span>
          <span className="text-xs text-on-surface-variant">({swap.offeredItem.condition})</span>
        </div>
      );
    }
    if (swap.swapType === "swap-with-cash" && swap.cashDetails) {
      return (
        <div className="flex items-center gap-1">
          <span>💰</span>
          <span className="font-medium">LKR {swap.cashDetails.amount}</span>
        </div>
      );
    }
    return <span className="text-on-surface-variant">—</span>;
  };

  return (
    <div className="min-h-screen bg-surface p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
     
        <div className="mb-8">
          <h1 className="text-4xl font-headline font-bold bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
            Swap Transaction
          </h1>
          <p className="text-on-surface-variant mt-3">Track and manage all user swap requests in real-time</p>
        </div>

     
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-outline-variant">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed/50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary-fixed/30 rounded-xl">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-primary">{stats.total}</span>
              </div>
              <p className="text-on-surface-variant font-bold">Total Swaps</p>
              <div className="mt-2 h-1 bg-primary-fixed/70 rounded-full">
                <div className="h-full w-full bg-primary rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Pending Reviews Card */}
          <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-outline-variant">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-yellow-600">{stats.pending}</span>
              </div>
              <p className="text-on-surface-variant font-bold">Pending Reviews</p>
              <div className="mt-2 h-1 bg-yellow-100 rounded-full">
                <div className="h-full w-full bg-yellow-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Accepted Card */}
          <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-outline-variant">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-green-600">{stats.accepted}</span>
              </div>
              <p className="text-on-surface-variant font-bold">Accepted</p>
              <div className="mt-2 h-1 bg-green-100 rounded-full">
                <div className="h-full w-full bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Completed Card */}
          <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-outline-variant">
            <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary-fixed/20 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-tertiary-fixed/30 rounded-xl">
                  <svg className="w-6 h-6 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-3xl font-bold text-tertiary">{stats.completed}</span>
              </div>
              <p className="text-on-surface-variant font-bold">Completed</p>
              <div className="mt-2 h-1 bg-tertiary-fixed/30 rounded-full">
                <div className="h-full w-full bg-tertiary rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-outline-variant p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className={`relative transition-all ${searchFocused ? "ring-2 ring-primary ring-opacity-50" : ""}`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder=" : Search "
                  className="w-full pl-11 pr-11 py-3 border border-outline-variant rounded-xl bg-surface focus:outline-none"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {searchTerm && <p className="text-sm text-on-surface-variant mt-2">Found {stats.filtered} result{stats.filtered !== 1 ? "s" : ""} for "{searchTerm}"</p>}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <FilterSelect value={filters.status} onChange={(v) => setFilters(p => ({ ...p, status: v }))}
              placeholder="📊 All Status" options={[
                { value: "pending", label: "Pending" }, { value: "accepted", label: "Accepted" },
                { value: "rejected", label: "Rejected" }, { value: "completed", label: "Completed" },
                { value: "cancelled", label: "Cancelled" }
              ]} />
            <FilterSelect value={filters.swapType} onChange={(v) => setFilters(p => ({ ...p, swapType: v }))}
              placeholder="🔄 All Types" options={[
                { value: "item-for-item", label: "Item Swap" }, { value: "swap-with-cash", label: "Cash Swap" }
              ]} />
            <FilterSelect value={filters.sort} onChange={(v) => setFilters(p => ({ ...p, sort: v }))}
              placeholder="📅 Newest First" options={[
                { value: "oldest", label: "Oldest First" }, { value: "status", label: "Sort by Status" }
              ]} />
            
            <button onClick={() => setFilters({ status: "", swapType: "", sort: "" })}
              className="bg-error-container hover:bg-error hover:text-white text-on-surface px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </button>
            
            
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-outline-variant">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredSwaps.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-surface-container-low rounded-full mb-4">
                <svg className="w-10 h-10 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-on-surface-variant text-lg">No swaps found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary text-white">
                  <tr>
                    {["Request ID", "Requested Item", "Offered Item / Cash", "Requester", "Owner", "Status", "Created", "Actions"].map(h => 
                      <th key={h} className="px-6 py-4 text-left text-sm font-semibold">{h}</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filteredSwaps.map(swap => (
                    <tr key={swap._id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-primary font-medium bg-primary-fixed/50 px-2 py-1 rounded-md">{swap.requestId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{swap.requestedItem.name}</p>
                        <span className="text-xs text-on-surface-variant">{swap.requestedItem.condition}</span>
                      </td>
                      <td className="px-6 py-4">{getOfferedItemDisplay(swap)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-secondary-fixed/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-secondary">{swap.requesterName?.charAt(0)}</span>
                          </div>
                          <span className="text-sm">{swap.requesterName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary-fixed/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">{swap.requestedItem.ownerName?.charAt(0)}</span>
                          </div>
                          <span className="text-sm">{swap.requestedItem.ownerName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={swap.status} /></td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">
                        {new Date(swap.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleViewDetails(swap)}
                            className="bg-primary-fixed hover:bg-primary-fixed-dim text-primary px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
                          >
                            📋 Details
                          </button>
                          <button 
                            onClick={() => handleDelete(swap._id)}
                            className="bg-error-container hover:bg-error hover:text-white text-on-error-container px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showModal && selectedSwap && (
          <SwapDetailsModal 
            swap={selectedSwap} 
            onClose={() => setShowModal(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default AdminSwapDashboard;