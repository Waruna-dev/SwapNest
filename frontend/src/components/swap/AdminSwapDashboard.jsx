import React, { useState, useEffect } from "react";
import { getAllSwaps, deleteSwap } from "../../services/swapService";
import StatusBadge from "../common/StatusBadge";
import SwapDetailsModal from "./SwapDetailsModal";
import { 
  RefreshCw, Search, Filter, X, Eye, Trash2, 
  TrendingUp, Clock, CheckCircle, XCircle,
  Package, DollarSign, Calendar, ChevronDown
} from 'lucide-react';

const AdminSwapDashboard = () => {
  const [swaps, setSwaps] = useState([]);
  const [filteredSwaps, setFilteredSwaps] = useState([]);
  const [filters, setFilters] = useState({ status: "", swapType: "", sort: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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
    setCurrentPage(1);
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
    if (window.confirm("Are you sure you want to permanently delete this swap? This action cannot be undone.")) {
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

  const totalPages = Math.ceil(filteredSwaps.length / itemsPerPage);
  const paginatedSwaps = filteredSwaps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    total: swaps.length,
    pending: swaps.filter(s => s.status === "pending").length,
    accepted: swaps.filter(s => s.status === "accepted").length,
    completed: swaps.filter(s => s.status === "completed").length,
  };

  const getOfferedItemDisplay = (swap) => {
    if (swap.swapType === "item-for-item" && swap.offeredItem) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="w-4 h-4 text-gray-600" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 text-sm truncate max-w-[150px]">
              {swap.offeredItem.name}
            </p>
            <span className="text-xs text-gray-500">{swap.offeredItem.condition}</span>
          </div>
        </div>
      );
    }
    if (swap.swapType === "swap-with-cash" && swap.cashDetails) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
        
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 text-sm">
              LKR {swap.cashDetails.amount.toLocaleString()}
            </p>
            {swap.offeredItem?.name && (
              <span className="text-xs text-gray-500">+ {swap.offeredItem.name}</span>
            )}
          </div>
        </div>
      );
    }
    return <span className="text-gray-400 text-sm">—</span>;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-6 max-w-[1600px] mx-auto">
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Manage Swaps</h1>
          <p className="text-gray-500 text-sm">Track and manage all user swap requests in real-time</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
       
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Total Swaps</p>
            <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.pending}</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Pending Review</p>
            <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.accepted}</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Accepted</p>
            <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.completed}</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Completed</p>
            <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>

       
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by request ID, item name, or status..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-900 border border-gray-200 rounded-lg text-sm text-white hover:bg-gray-900 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  {(filters.status || filters.swapType || filters.sort) && (
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  )}
                </button>
                
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700"
                >
                  <option value={10}>10 / page</option>
                  <option value={25}>25 / page</option>
                  <option value={50}>50 / page</option>
                </select>

              </div>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Swap Type</label>
                    <select
                      value={filters.swapType}
                      onChange={(e) => setFilters(p => ({ ...p, swapType: e.target.value }))}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">All Types</option>
                      <option value="item-for-item">Item Swap</option>
                      <option value="swap-with-cash">Cash Swap</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
                    <select
                      value={filters.sort}
                      onChange={(e) => setFilters(p => ({ ...p, sort: e.target.value }))}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="status">Sort by Status</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => setFilters({ status: "", swapType: "", sort: "" })}
                      className="w-full px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            {searchTerm && (
              <div className="mt-3 text-sm text-gray-500">
                Found {filteredSwaps.length} result{filteredSwaps.length !== 1 ? "s" : ""} for "{searchTerm}"
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            </div>
          ) : paginatedSwaps.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No swaps found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offered</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedSwaps.map((swap) => (
                      <tr key={swap._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                            {swap.requestId}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-3.5 h-3.5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{swap.requestedItem.name}</p>
                              <span className="text-xs text-gray-500">{swap.requestedItem.condition}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{getOfferedItemDisplay(swap)}</td>
                        <td className="px-4 py-3"><StatusBadge status={swap.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                  
                            {new Date(swap.createdAt).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 justify-center">
                            <button 
                              onClick={() => handleViewDetails(swap)}
                              className="px-2.5 py-1 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-medium flex items-center gap-1 transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>
                            <button 
                              onClick={() => handleDelete(swap._id)}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

{totalPages > 1 && (
  <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
    <p className="text-xs text-gray-500">
      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredSwaps.length)} of {filteredSwaps.length}
    </p>
    <div className="flex gap-1">
      <button
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1.5 border border-gray-900 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      
      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        let pageNum;
        if (totalPages <= 5) {
          pageNum = i + 1;
        } else if (currentPage <= 3) {
          pageNum = i + 1;
        } else if (currentPage >= totalPages - 2) {
          pageNum = totalPages - 4 + i;
        } else {
          pageNum = currentPage - 2 + i;
        }
        return (
          <button
            key={pageNum}
            onClick={() => setCurrentPage(pageNum)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === pageNum
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {pageNum}
          </button>
        );
      })}
      
      <button
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 border border-gray-900 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  </div>
)}
            </>
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