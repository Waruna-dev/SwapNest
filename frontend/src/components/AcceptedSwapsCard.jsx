import React, { useState, useEffect } from 'react';
import { getUserSwaps, requestCompletion, getCompletionStatus } from '../services/swapService';
import SwapDetailsModal from './swap/SwapDetailsModal1';

const AcceptedSwapsCard = ({ userId }) => {
  const [acceptedSwaps, setAcceptedSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [completionStatuses, setCompletionStatuses] = useState({});

  useEffect(() => {
    if (userId) {
      fetchAcceptedSwaps();
    }
  }, [userId]);

  const fetchAcceptedSwaps = async () => {
    setLoading(true);
    try {
      const response = await getUserSwaps(userId);
      const accepted = response.data.filter(swap => swap.status === 'accepted');
      setAcceptedSwaps(accepted);
      
   
      for (const swap of accepted) {
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
    } catch (error) {
      console.error('Error fetching accepted swaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (swapId, userRole, event) => {
    event.stopPropagation();
    try {
      const result = await requestCompletion(swapId, userId, userRole);
      
      if (result.bothConfirmed) {
        alert('🎉 Swap completed successfully! Both parties have confirmed.');
      } else {
        alert(result.message);
      }
      
      fetchAcceptedSwaps(); // Refresh the list
    } catch (err) {
      alert('Failed to complete swap: ' + err.message);
    }
  };

  const handleViewDetails = (swap) => {
    setSelectedSwap(swap);
    setShowModal(true);
  };

  const getOtherParty = (swap) => {
    if (swap.requesterId === userId || swap.requesterId?._id === userId) {
      return swap.requestedItem?.ownerName || 'Unknown';
    }
    return swap.requesterName || 'Unknown';
  };

  const getUserRole = (swap) => {
    if (swap.requesterId === userId || swap.requesterId?._id === userId) {
      return 'requester';
    }
    return 'owner';
  };

  const getUserRoleText = (swap) => {
    if (swap.requesterId === userId || swap.requesterId?._id === userId) {
      return 'You are the requester';
    }
    return 'You are the owner';
  };

  const getCompletionButtonText = (swap) => {
    const status = completionStatuses[swap._id];
    const userRole = getUserRole(swap);
    
    if (!status) return '✓ Mark as Complete';
    
    if (status.bothConfirmed) {
      return ' Completed';
    }
    
    if (userRole === 'requester') {
      if (status.requesterConfirmed) {
        return ' Waiting for Owner';
      }
      return '✓ Mark as Complete';
    }
    
    if (userRole === 'owner') {
      if (status.ownerConfirmed) {
        return ' Waiting for Requester';
      }
      return '✓ Mark as Complete';
    }
    
    return '✓ Mark as Complete';
  };

  const isCompleteButtonDisabled = (swap) => {
    const status = completionStatuses[swap._id];
    const userRole = getUserRole(swap);
    
    if (!status) return false;
    if (status.bothConfirmed) return true;
    
    if (userRole === 'requester' && status.requesterConfirmed) return true;
    if (userRole === 'owner' && status.ownerConfirmed) return true;
    return false;
  };

  const getButtonColor = (swap) => {
    const status = completionStatuses[swap._id];
    const userRole = getUserRole(swap);
    
    if (!status) return 'bg-blue-600 hover:bg-blue-700 text-white';
    
    if (status.bothConfirmed) {
      return 'bg-green-600 text-white cursor-not-allowed';
    }
    
    if (userRole === 'requester' && status.requesterConfirmed) {
      return 'bg-orange-500 text-white cursor-not-allowed';
    }
    
    if (userRole === 'owner' && status.ownerConfirmed) {
      return 'bg-orange-500 text-white cursor-not-allowed';
    }
    
    return 'bg-blue-600 hover:bg-blue-700 text-white';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (acceptedSwaps.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">🤝</div>
        <p className="text-on-surface-variant">No accepted swaps yet</p>
        <p className="text-sm text-on-surface-variant mt-1">
          When someone accepts your swap request, it will appear here
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {acceptedSwaps.map(swap => {
          const status = completionStatuses[swap._id];
          const userRole = getUserRole(swap);
          const showWaitingMessage = status && 
            ((userRole === 'requester' && status.requesterConfirmed && !status.ownerConfirmed) ||
             (userRole === 'owner' && status.ownerConfirmed && !status.requesterConfirmed));
          
          const bothConfirmed = status?.requesterConfirmed && status?.ownerConfirmed;
          
          return (
            <div 
              key={swap._id} 
              className="bg-gradient-to-r from-green-50 to-white rounded-xl border border-green-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewDetails(swap)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h3 className="font-bold text-green-800">Swap Accepted!</h3>
                    <p className="text-xs text-green-600">{getUserRoleText(swap)}</p>
                  </div>
                </div>
                <span className="text-xs text-green-600 font-mono">{swap.requestId}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Requested Item</p>
                  <p className="font-medium text-gray-800">{swap.requestedItem?.name}</p>
                  <p className="text-xs text-gray-500">Condition: {swap.requestedItem?.condition}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Offered</p>
                  {swap.swapType === 'item-for-item' ? (
                    <>
                      <p className="font-medium text-gray-800">{swap.offeredItem?.name}</p>
                      <p className="text-xs text-gray-500">Condition: {swap.offeredItem?.condition}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-green-600">LKR {swap.cashDetails?.amount}</p>
                      {swap.offeredItem?.name && (
                        <p className="text-xs text-gray-500">+ {swap.offeredItem.name}</p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {showWaitingMessage && (
                <div className="mb-3 p-2 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-xs text-orange-700 flex items-center gap-1">
                    <span>⏳</span> Waiting for {userRole === 'requester' ? 'owner' : 'requester'} to confirm completion
                  </p>
                </div>
              )}

              {bothConfirmed && swap.status === 'accepted' && (
                <div className="mb-3 p-2 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-green-700 flex items-center gap-1 font-semibold">
                    <span>✅</span> Both ready! Click "Complete Swap" to finish!
                  </p>
                </div>
              )}

              {swap.status === 'completed' && (
                <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700 flex items-center gap-1">
                    <span>🎉</span> Swap completed successfully!
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-green-100">
                <div>
                  <p className="text-xs text-gray-500">Swap with</p>
                  <p className="font-medium text-gray-700">{getOtherParty(swap)}</p>
                </div>
                <div className="flex gap-2">
                  {swap.status !== 'completed' && (
                    <button 
                      className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
                        isCompleteButtonDisabled(swap)
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : getButtonColor(swap)
                      }`}
                      onClick={(e) => handleComplete(swap._id, getUserRole(swap), e)}
                      disabled={isCompleteButtonDisabled(swap)}
                    >
                      {getCompletionButtonText(swap)}
                    </button>
                  )}
                  <button 
                    className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(swap);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Swap Details Modal */}
      {showModal && selectedSwap && (
        <SwapDetailsModal 
          swap={selectedSwap} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </>
  );
};

export default AcceptedSwapsCard;