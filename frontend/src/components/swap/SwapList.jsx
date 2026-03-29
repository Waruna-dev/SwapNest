import React, { useState, useEffect } from 'react';
import { getUserSwaps, getPendingRequests, updateSwapStatus, cancelSwap, requestCompletion, getCompletionStatus } from '../../services/swapService';
import SwapDetailsModal from './SwapDetailsModal1';
import SwapUpdateForm from './SwapUpdateForm';

const SwapList = ({ userId }) => {
  const [swaps, setSwaps] = useState([]);
  const [filteredSwaps, setFilteredSwaps] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [swapToUpdate, setSwapToUpdate] = useState(null);
  const [completionStatuses, setCompletionStatuses] = useState({});
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [swapTypeFilter, setSwapTypeFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchSwaps();
  }, [userId, activeTab]);

  // Apply filters whenever swaps, filters, or activeTab changes
  useEffect(() => {
    applyFilters();
  }, [swaps, searchTerm, statusFilter, swapTypeFilter, roleFilter, dateFilter, activeTab]);

  const fetchSwaps = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (activeTab === 'all') {
        response = await getUserSwaps(userId);
        setSwaps(response.data || []);
        
        // Fetch completion status for accepted swaps
        const acceptedSwaps = response.data.filter(swap => swap.status === 'accepted');
        for (const swap of acceptedSwaps) {
          try {
            const statusRes = await getCompletionStatus(swap._id);
            setCompletionStatuses(prev => ({
              ...prev,
              [swap._id]: statusRes.data
            }));
          } catch (err) {
            console.error('Error fetching completion status:', err);
          }
        }
      } else if (activeTab === 'pending') {
        response = await getPendingRequests(userId);
        setSwaps(response.data || []);
      } else if (activeTab === 'my-requests') {
        const allSwaps = await getUserSwaps(userId);
        const myRequests = allSwaps.data.filter(swap => {
          if (typeof swap.requesterId === 'string') {
            return swap.requesterId === userId;
          }
          if (swap.requesterId && swap.requesterId._id) {
            return swap.requesterId._id === userId;
          }
          return false;
        });
        setSwaps(myRequests);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to fetch swaps');
      setSwaps([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...swaps];
    
    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(swap => 
        swap.requestId?.toLowerCase().includes(term) ||
        swap.requestedItem?.name?.toLowerCase().includes(term) ||
        swap.offeredItem?.name?.toLowerCase().includes(term) ||
        swap.requesterName?.toLowerCase().includes(term) ||
        swap.requestedItem?.ownerName?.toLowerCase().includes(term)
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(swap => swap.status === statusFilter);
    }
    
    // Swap type filter
    if (swapTypeFilter !== 'all') {
      filtered = filtered.filter(swap => swap.swapType === swapTypeFilter);
    }
    
    // Role filter
    if (roleFilter !== 'all') {
      if (roleFilter === 'requester') {
        filtered = filtered.filter(swap => isUserRequester(swap));
      } else if (roleFilter === 'owner') {
        filtered = filtered.filter(swap => isUserOwner(swap));
      }
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(swap => {
        const createdDate = new Date(swap.createdAt);
        if (dateFilter === 'today') {
          return createdDate.toDateString() === now.toDateString();
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
          return createdDate >= weekAgo;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
          return createdDate >= monthAgo;
        }
        return true;
      });
    }
    
    setFilteredSwaps(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSwapTypeFilter('all');
    setRoleFilter('all');
    setDateFilter('all');
  };

  const handleAccept = async (swapId) => {
    if (window.confirm('Accept this swap request?')) {
      try {
        await updateSwapStatus(swapId, 'accepted');
        fetchSwaps();
        alert('✅ Swap request accepted');
      } catch (err) {
        alert('Failed to accept swap');
      }
    }
  };

  const handleReject = async (swapId) => {
    if (window.confirm('Reject this swap request?')) {
      try {
        await updateSwapStatus(swapId, 'rejected');
        fetchSwaps();
        alert('❌ Swap request rejected');
      } catch (err) {
        alert('Failed to reject swap');
      }
    }
  };

  const handleComplete = async (swapId, userRole) => {
    try {
      const result = await requestCompletion(swapId, userId, userRole);
      
      if (result.bothConfirmed) {
        alert('🎉 Swap completed successfully! Both parties have confirmed.');
      } else {
        alert(result.message);
      }
      
      fetchSwaps();
    } catch (err) {
      alert('Failed to complete swap: ' + err.message);
    }
  };

  const handleCancel = async (swapId) => {
    if (window.confirm('Are you sure you want to cancel this swap request?')) {
      try {
        await cancelSwap(swapId);
        fetchSwaps();
        alert('✅ Swap request cancelled');
      } catch (err) {
        alert('Failed to cancel swap: ' + err.message);
      }
    }
  };

  const handleUpdate = async (swap) => {
    setSwapToUpdate(swap);
    setShowUpdateForm(true);
  };

  const handleUpdateSuccess = () => {
    setShowUpdateForm(false);
    setSwapToUpdate(null);
    fetchSwaps();
    alert('✅ Swap request updated successfully!');
  };

  const handleViewDetails = (swap) => {
    setSelectedSwap(swap);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRequesterName = (swap) => {
    if (swap.requesterName) return swap.requesterName;
    if (swap.requesterId && typeof swap.requesterId === 'object') {
      return swap.requesterId.username || 'Unknown';
    }
    return 'Unknown';
  };

  const getOwnerName = (swap) => {
    if (swap.requestedItem?.ownerName) return swap.requestedItem.ownerName;
    if (swap.requestedItem?.ownerId && typeof swap.requestedItem.ownerId === 'object') {
      return swap.requestedItem.ownerId.username || 'Unknown';
    }
    return 'Unknown';
  };

  const isUserRequester = (swap) => {
    if (typeof swap.requesterId === 'string') {
      return swap.requesterId === userId;
    }
    if (swap.requesterId && typeof swap.requesterId === 'object') {
      return swap.requesterId._id === userId;
    }
    return false;
  };

  const isUserOwner = (swap) => {
    const ownerId = swap.requestedItem?.ownerId;
    if (typeof ownerId === 'string') {
      return ownerId === userId;
    }
    if (ownerId && typeof ownerId === 'object') {
      return ownerId._id === userId;
    }
    return false;
  };

  const getCompletionButtonText = (swap) => {
    const status = completionStatuses[swap._id];
    if (!status) return '✓ Complete';
    
    const isRequester = isUserRequester(swap);
    const isOwner = isUserOwner(swap);
    
    if (isRequester && status.requesterConfirmed && !status.ownerConfirmed) {
      return '⏳';
    }
    if (isOwner && status.ownerConfirmed && !status.requesterConfirmed) {
      return '⏳';
    }
    if (status.bothConfirmed) {
      return '✅ Completed';
    }
    return 'Complete';
  };

  const isCompleteButtonDisabled = (swap) => {
    const status = completionStatuses[swap._id];
    if (!status) return false;
    
    const isRequester = isUserRequester(swap);
    const isOwner = isUserOwner(swap);
    
    if (status.bothConfirmed) return true;
    if (isRequester && status.requesterConfirmed) return true;
    if (isOwner && status.ownerConfirmed) return true;
    return false;
  };

  // Get filter statistics
  const getFilterStats = () => {
    return {
      total: swaps.length,
      filtered: filteredSwaps.length,
      pending: swaps.filter(s => s.status === 'pending').length,
      accepted: swaps.filter(s => s.status === 'accepted').length,
      completed: swaps.filter(s => s.status === 'completed').length
    };
  };

  const stats = getFilterStats();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="absolute -top-10 -left-10 w-96 h-96 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="fixed -bottom-10 -right-10 w-96 h-96 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none animate-float " style={{ animationDelay: '2s' }}></div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-outline-variant">
        <button
          className={`px-4 py-2 font-headline font-medium transition-colors ${
            activeTab === 'all' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          onClick={() => setActiveTab('all')}
        >
          All Swaps ({stats.total})
        </button>
        <button
          className={`px-4 py-2 font-headline font-medium transition-colors ${
            activeTab === 'pending' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Incoming
        </button>
        <button
          className={`px-4 py-2 font-headline font-medium transition-colors ${
            activeTab === 'my-requests' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          onClick={() => setActiveTab('my-requests')}
        >
          My Requests
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 bg-white rounded-xl shadow-sm border border-outline-variant p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-on-surface-variant">
                🔍
              </span>
              <input
                type="text"
                placeholder=" :Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors"
          >
            <span>⚙️</span>
            <span>Filters</span>
            
          </button>
          
          {/* Clear Filters Button */}
          {(searchTerm || statusFilter !== 'all' || swapTypeFilter !== 'all' || roleFilter !== 'all' || dateFilter !== 'all') && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-error hover:bg-error-container rounded-lg transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-outline-variant">
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Swap Type Filter */}
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">Swap Type</label>
              <select
                value={swapTypeFilter}
                onChange={(e) => setSwapTypeFilter(e.target.value)}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Types</option>
                <option value="item-for-item">Item for Item</option>
                <option value="swap-with-cash">Swap with Cash</option>
              </select>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">My Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Roles</option>
                <option value="requester">I'm Requester</option>
                <option value="owner">I'm Owner</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">Date</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>
        )}

        {/* Filter Results Summary */}
        {(searchTerm || statusFilter !== 'all' || swapTypeFilter !== 'all' || roleFilter !== 'all' || dateFilter !== 'all') && (
          <div className="mt-3 text-sm text-on-surface-variant">
            Found {stats.filtered} result{stats.filtered !== 1 ? 's' : ''} 
          </div>
        )}
      </div>
      
      {error && (
        <div className="bg-error-container border border-error text-on-error-container px-4 py-2 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {filteredSwaps.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-outline-variant">
          <p className="text-on-surface-variant">
            {searchTerm || statusFilter !== 'all' || swapTypeFilter !== 'all' || roleFilter !== 'all' || dateFilter !== 'all'
              ? 'No swaps match your filters'
              : activeTab === 'my-requests' 
                ? "You haven't made any swap requests yet" 
                : activeTab === 'pending'
                ? 'No pending swap requests'
                : 'No swaps found'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow border border-outline-variant">
            <thead className="bg-on-surface-variant border-b border-outline-variant">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Request ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Item</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Offered</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Requester</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Owner</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Created</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredSwaps.map(swap => {
                const isOwner = isUserOwner(swap);
                const isRequester = isUserRequester(swap);
                const isPending = swap.status === 'pending';
                const isAccepted = swap.status === 'accepted';
                const isCompleted = swap.status === 'completed';
                const isRejected = swap.status === 'rejected';
                const isCancelled = swap.status === 'cancelled';
                
                const completionStatus = completionStatuses[swap._id];
                const showWaitingMessage = isAccepted && completionStatus && 
                  ((isRequester && completionStatus.requesterConfirmed && !completionStatus.ownerConfirmed) ||
                   (isOwner && completionStatus.ownerConfirmed && !completionStatus.requesterConfirmed));
                
                return (
                  <tr key={swap._id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-on-surface-variant">{swap.requestId}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-on-surface">{swap.requestedItem?.name || 'N/A'}</p>
                        <p className="text-xs text-on-surface-variant">{swap.requestedItem?.condition || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {swap.swapType === 'item-for-item' && swap.offeredItem ? (
                        <div>
                          <p className="font-medium text-on-surface">{swap.offeredItem.name}</p>
                          <p className="text-xs text-on-surface-variant">{swap.offeredItem.condition}</p>
                        </div>
                      ) : swap.cashDetails ? (
                        <div>
                          <p className="font-medium text-secondary-container">LKR {swap.cashDetails.amount}</p>
                          {swap.offeredItem?.name && (
                            <p className="text-xs text-on-surface-variant">+ {swap.offeredItem.name}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-on-surface-variant">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface">{getRequesterName(swap)}</td>
                    <td className="px-4 py-3 text-sm text-on-surface">{getOwnerName(swap)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(swap.status)}`}>
                        {swap.status}
                      </span>
                      {showWaitingMessage && (
                        <div className="text-xs text-orange-600 mt-1">
                          Waiting for {isRequester ? 'owner' : 'requester'} to confirm
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {new Date(swap.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {/* View Details Button */}
                        <button
                          onClick={() => handleViewDetails(swap)}
                          className="bg-primary-fixed hover:bg-primary-fixed-dim text-on-primary-fixed px-3 py-1 rounded-lg text-sm transition-colors"
                          title="View Full Details"
                        >
                          View
                        </button>
                        
                        {/* Update Button - Only for requester when pending */}
                        {isRequester && isPending && (
                          <button 
                            onClick={() => handleUpdate(swap)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                            title="Update Request"
                          >
                            ✏️
                          </button>
                        )}
                        
                        {/* Accept Button - Only for owner when pending */}
                        {isOwner && isPending && (
                          <button 
                            onClick={() => handleAccept(swap._id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                            title="Accept Request"
                          >
                            ✓
                          </button>
                        )}
                        
                        {/* Reject Button - Only for owner when pending */}
                        {isOwner && isPending && (
                          <button 
                            onClick={() => handleReject(swap._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                            title="Reject Request"
                          >
                            ✗
                          </button>
                        )}
                        
                        {/* Complete Button - For both requester and owner when accepted */}
                        {isAccepted && !isCompleted && (
                          <button 
                            onClick={() => handleComplete(swap._id, isRequester ? 'requester' : 'owner')}
                            disabled={isCompleteButtonDisabled(swap)}
                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                              isCompleteButtonDisabled(swap)
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : completionStatuses[swap._id]?.requesterConfirmed || completionStatuses[swap._id]?.ownerConfirmed
                                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                            title={getCompletionButtonText(swap)}
                          >
                            {getCompletionButtonText(swap)}

                          </button>
                        )}
                        
                        {/* Cancel Button - Only for requester when pending */}
                        {isRequester && isPending && (
                          <button 
                            onClick={() => handleCancel(swap._id)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                            title="Cancel Request"
                          >
                            ✕ 
                          </button>
                        )}
                        
                        {/* Status Messages */}
                        {isRejected && isRequester && (
                          <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-lg">
                            Rejected
                          </span>
                        )}
                        
                        {isCancelled && isOwner && (
                          <span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                            Cancelled by requester
                          </span>
                        )}
                        
                        {isCompleted && (
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                            Completed ✓
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
        </div>
      )}

      {/* View Details Modal */}
      {showModal && selectedSwap && (
        <SwapDetailsModal 
          swap={selectedSwap} 
          onClose={() => setShowModal(false)} 
        />
      )}

      {/* Update Form Modal */}
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