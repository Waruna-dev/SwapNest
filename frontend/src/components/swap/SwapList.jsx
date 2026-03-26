import React, { useState, useEffect } from 'react';
import { getUserSwaps, getPendingRequests, updateSwapStatus, cancelSwap } from '../../services/swapService';
import SwapDetailsModal from './SwapDetailsModal1';

const SwapList = ({ userId }) => {
  const [swaps, setSwaps] = useState([]);
  const [activeTab, setActiveTab] = useState('my-swaps');
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
      if (activeTab === 'my-swaps') {
        response = await getUserSwaps(userId);
      } else {
        response = await getPendingRequests(userId);
      }
      setSwaps(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch swaps');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (swapId) => {
    try {
      await updateSwapStatus(swapId, 'accepted');
      fetchSwaps();
    } catch (err) {
      alert('Failed to accept swap');
    }
  };

  const handleReject = async (swapId) => {
    try {
      await updateSwapStatus(swapId, 'rejected');
      fetchSwaps();
    } catch (err) {
      alert('Failed to reject swap');
    }
  };

  const handleComplete = async (swapId) => {
    try {
      await updateSwapStatus(swapId, 'completed');
      fetchSwaps();
    } catch (err) {
      alert('Failed to mark as completed');
    }
  };

  const handleCancel = async (swapId) => {
    if (window.confirm('Are you sure you want to cancel this swap request?')) {
      try {
        await cancelSwap(swapId);
        fetchSwaps();
      } catch (err) {
        alert('Failed to cancel swap');
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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-outline-variant">
        <button
          className={`px-4 py-2 font-headline font-medium transition-colors ${
            activeTab === 'my-swaps' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          onClick={() => setActiveTab('my-swaps')}
        >
          All My Swaps
        </button>
        <button
          className={`px-4 py-2 font-headline font-medium transition-colors ${
            activeTab === 'pending' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Requests
        </button>
      </div>
      
      {error && (
        <div className="bg-error-container border border-error text-on-error-container px-4 py-2 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {swaps.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-outline-variant">
          <p className="text-on-surface-variant">No swaps found</p>
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
                const isOwner = swap.requestedItem.ownerId === userId;
                const isRequester = swap.requesterId === userId;
                const isPending = swap.status === 'pending';
                const isAccepted = swap.status === 'accepted';
                
                return (
                  <tr key={swap._id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-on-surface-variant">{swap.requestId}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-on-surface">{swap.requestedItem.name}</p>
                        <p className="text-xs text-on-surface-variant">{swap.requestedItem.condition}</p>
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
                          <p className="text-xs text-on-surface-variant">{swap.cashDetails.whoPays === 'i-pay-owner' ? 'I pay' : 'Owner pays'}</p>
                        </div>
                      ) : (
                        <span className="text-on-surface-variant">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface">{swap.requesterName}</td>
                    <td className="px-4 py-3 text-sm text-on-surface">{swap.requestedItem.ownerName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(swap.status)}`}>
                        {swap.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {new Date(swap.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(swap)}
                          className="bg-primary-fixed hover:bg-primary-fixed-dim text-on-primary-fixed px-3 py-1 rounded-lg text-sm transition-colors"
                          title="View Full Details"
                        >
                          📋 View
                        </button>
                        {isPending && isOwner && (
                          <>
                            <button 
                              onClick={() => handleAccept(swap._id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                            >
                              ✓
                            </button>
                            <button 
                              onClick={() => handleReject(swap._id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                            >
                              ✗
                            </button>
                          </>
                        )}
                        {isAccepted && isOwner && (
                          <button 
                            onClick={() => handleComplete(swap._id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                          >
                            ✔ Complete
                          </button>
                        )}
                        {isPending && isRequester && (
                          <button 
                            onClick={() => handleCancel(swap._id)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                          >
                            ✕ Cancel
                          </button>
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
    </div>
  );
};

export default SwapList;