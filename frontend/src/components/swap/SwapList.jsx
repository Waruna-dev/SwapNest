import React, { useState, useEffect } from 'react';
import { getUserSwaps, getPendingRequests, updateSwapStatus, cancelSwap } from '../../services/swapService';
import SwapDetailsModal from './SwapDetailsModal1';

const SwapList = ({ userId }) => {
  const [swaps, setSwaps] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSwaps();
  }, [userId, activeTab]);

  const fetchSwaps = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (activeTab === 'all') {
        response = await getUserSwaps(userId);
        setSwaps(response.data || []);
      } else if (activeTab === 'pending') {
        response = await getPendingRequests(userId);
        setSwaps(response.data || []);
      } else if (activeTab === 'my-requests') {
        // Get all swaps and filter where requesterId matches userId
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

  const handleComplete = async (swapId) => {
    if (window.confirm('Mark this swap as completed?')) {
      try {
        await updateSwapStatus(swapId, 'completed');
        fetchSwaps();
        alert('🎉 Swap marked as completed!');
      } catch (err) {
        alert('Failed to mark as completed');
      }
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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
     
      <div className="flex gap-2 mb-6 border-b border-outline-variant">
        <button
          className={`px-4 py-2 font-headline font-medium transition-colors ${
            activeTab === 'all' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          onClick={() => setActiveTab('all')}
        >
          All Swaps
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
      
      {error && (
        <div className="bg-error-container border border-error text-on-error-container px-4 py-2 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {swaps.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-outline-variant">
          <p className="text-on-surface-variant">
            {activeTab === 'my-requests' 
              ? "You haven't made any swap requests yet" 
              : activeTab === 'pending'
              ? 'No pending swap requests'
              : 'No swaps found'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow border border-outline-variant">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-on-surface">Request ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-on-surface">Item</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-on-surface">Offered</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-on-surface">Requester</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-on-surface">Owner</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-on-surface">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-on-surface">Created</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-on-surface">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {swaps.map(swap => {
                const isOwner = isUserOwner(swap);
                const isRequester = isUserRequester(swap);
                const isPending = swap.status === 'pending';
                const isAccepted = swap.status === 'accepted';
                const isCompleted = swap.status === 'completed';
                const isRejected = swap.status === 'rejected';
                const isCancelled = swap.status === 'cancelled';
                
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
                          <p className="font-medium text-primary">LKR {swap.cashDetails.amount}</p>
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
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {new Date(swap.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        
                        <button
                          onClick={() => handleViewDetails(swap)}
                          className="bg-primary-fixed hover:bg-primary-fixed-dim text-on-primary-fixed px-3 py-1 rounded-lg text-sm transition-colors"
                          title="View Full Details"
                        >
                          📋 View
                        </button>
                        
                       
                        {isOwner && isPending && (
                          <button 
                            onClick={() => handleAccept(swap._id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                            title="Accept Request"
                          >
                            ✓ Accept
                          </button>
                        )}
                        
                        
                        {isOwner && isPending && (
                          <button 
                            onClick={() => handleReject(swap._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                            title="Reject Request"
                          >
                            ✗ Reject
                          </button>
                        )}
                        
                    
                        {isOwner && isAccepted && (
                          <button 
                            onClick={() => handleComplete(swap._id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                            title="Mark as Completed"
                          >
                            ✓ Complete
                          </button>
                        )}
                        
                       
                        {isRequester && isPending && (
                          <button 
                            onClick={() => handleCancel(swap._id)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                            title="Cancel Request"
                          >
                            ✕ Cancel
                          </button>
                        )}
                        
                      
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

      {showModal && selectedSwap && (
        <SwapDetailsModal 
          swap={selectedSwap} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
};

export default SwapList;