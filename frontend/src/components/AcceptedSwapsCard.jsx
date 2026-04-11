import React, { useState, useEffect } from 'react';
import { getUserSwaps, requestCompletion, getCompletionStatus } from '../services/swapService';
import SwapDetailsModal from './swap/SwapDetailsModal1';

const AcceptedSwapsCard = ({ userId }) => {
  const [acceptedSwaps, setAcceptedSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [completionStatuses, setCompletionStatuses] = useState({});
  
  // Popup states
  const [showCompletePopup, setShowCompletePopup] = useState(false);
  const [showWaitingPopup, setShowWaitingPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [pendingSwap, setPendingSwap] = useState(null);
  const [pendingUserRole, setPendingUserRole] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completionResult, setCompletionResult] = useState(null);
  const [completedSwapDetails, setCompletedSwapDetails] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchAcceptedSwaps();
    }
  }, [userId]);

  const fetchAcceptedSwaps = async () => {
    setLoading(true);
    try {
      const response = await getUserSwaps(userId);
      // Only show accepted swaps, NOT completed ones
      const accepted = response.data.filter(swap => swap.status === 'accepted');
      console.log('Accepted swaps:', accepted.length);
      setAcceptedSwaps(accepted);
      
      // Refresh completion status for all accepted swaps
      for (const swap of accepted) {
        try {
          const statusRes = await getCompletionStatus(swap._id);
          console.log(`Completion status for ${swap.requestId}:`, statusRes.data);
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

  const handleCompleteClick = (swap, userRole, event) => {
    event.stopPropagation();
    setPendingSwap(swap);
    setPendingUserRole(userRole);
    setShowCompletePopup(true);
  };

  const handleConfirmComplete = async () => {
    setIsProcessing(true);
    try {
      const result = await requestCompletion(pendingSwap._id, userId, pendingUserRole);
      console.log('Completion result:', result);
      setCompletionResult(result);
      
      if (result.bothConfirmed === true) {
        console.log('✅ BOTH CONFIRMED! Showing success popup');
        // Set success popup details
        setCompletedSwapDetails({
          swap: pendingSwap,
          userRole: pendingUserRole,
          otherParty: pendingUserRole === 'requester' 
            ? pendingSwap.requestedItem?.ownerName 
            : pendingSwap.requesterName,
          itemName: pendingSwap.requestedItem?.name,
        });
        setShowSuccessPopup(true);
      } else {
        console.log('⏳ Waiting for other party - refreshing status');
        // Refresh the completion status immediately to show waiting message
        await fetchAcceptedSwaps();
        setShowWaitingPopup(true);
      }
      
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to complete swap: ' + err.message);
    } finally {
      setIsProcessing(false);
      setShowCompletePopup(false);
    }
  };

  const handleCloseSuccessPopup = () => {
    console.log('Closing success popup');
    setShowSuccessPopup(false);
    setCompletedSwapDetails(null);
    setCompletionResult(null);
    setPendingSwap(null);
    // Refresh the list to remove completed swap AFTER popup is closed
    fetchAcceptedSwaps();
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
      return '✓ Complete Swap';
    }
    
    if (userRole === 'requester') {
      if (status.requesterConfirmed) {
        return '⏳ Waiting for Owner';
      }
      return '✓ Mark as Complete';
    }
    
    if (userRole === 'owner') {
      if (status.ownerConfirmed) {
        return '⏳ Waiting for Requester';
      }
      return '✓ Mark as Complete';
    }
    
    return '✓ Mark as Complete';
  };

  const isCompleteButtonDisabled = (swap) => {
    const status = completionStatuses[swap._id];
    const userRole = getUserRole(swap);
    
    if (!status) return false;
    if (status.bothConfirmed) return false;
    
    if (userRole === 'requester' && status.requesterConfirmed) return true;
    if (userRole === 'owner' && status.ownerConfirmed) return true;
    return false;
  };

  const getButtonColor = (swap) => {
    const status = completionStatuses[swap._id];
    const userRole = getUserRole(swap);
    
    if (!status) return 'bg-blue-600 hover:bg-blue-700 text-white';
    
    if (status.bothConfirmed) {
      return 'bg-green-600 hover:bg-green-700 text-white animate-pulse';
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
        <p className="text-on-surface-variant">No accepted swaps yet</p>
        <p className="text-sm text-on-surface-variant mt-1">When someone accepts your swap request, it will appear here</p>
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
              className="bg-gradient-to-r from-green-50 to-white rounded border border-green-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewDetails(swap)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✓</span>
                  <div>
                    <h3 className="font-bold text-green-800">Swap Accepted!</h3>
                    <p className="text-xs text-green-600">{getUserRoleText(swap)}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-mono">{swap.requestId}</span>
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

              {bothConfirmed && (
                <div className="mb-3 p-2 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-green-700 flex items-center gap-1 font-semibold">
                    <span>✅</span> Both ready! Click "Complete Swap" to finish!
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-green-100">
                <div>
                  <p className="text-xs text-gray-500">Swap with</p>
                  <p className="font-medium text-gray-700">{getOtherParty(swap)}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${
                      isCompleteButtonDisabled(swap)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : getButtonColor(swap)
                    }`}
                    onClick={(e) => handleCompleteClick(swap, getUserRole(swap), e)}
                    disabled={isCompleteButtonDisabled(swap)}
                  >
                    {getCompletionButtonText(swap)}
                  </button>
                  <button 
                    className="px-4 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
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

      {showCompletePopup && pendingSwap && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                Mark Swap as Complete?
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to mark this swap as complete? 
                {completionStatuses[pendingSwap._id]?.bothConfirmed 
                  ? " Both parties are ready! This will finalize the swap."
                  : " The other party will need to confirm as well."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCompletePopup(false)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmComplete}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Yes, Mark Complete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Waiting for Other Party Popup */}
      {showWaitingPopup && completionResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                Waiting for Confirmation
              </h3>
              <p className="text-gray-600 text-center mb-4">
                {completionResult.message}
              </p>
              <div className="bg-orange-50 rounded-lg p-3 mb-4 border border-orange-200">
                <p className="text-sm text-orange-700 text-center">
                  ⏳ The other party will be notified and needs to confirm to complete the swap.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowWaitingPopup(false);
                  setCompletionResult(null);
                  // Refresh to update the waiting message status
                  fetchAcceptedSwaps();
                }}
                className="w-full px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessPopup && completedSwapDetails && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform scale-100">
            <div className="p-6 relative">
              {/* Close button at top right */}
              <button
                onClick={handleCloseSuccessPopup}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <div className="text-center mb-4">
                <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold mb-3">
                   SWAP SUCCESSFUL 
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Swap Completed Successfully!
                </h3>
                <p className="text-gray-600">
                  Congratulations! Your swap has been successfully completed.
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4 border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Swapped with</p>
                    <p className="font-semibold text-gray-800">{completedSwapDetails.otherParty}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Item swapped</p>
                    <p className="font-semibold text-gray-800">{completedSwapDetails.itemName}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3 mb-4 border border-green-200">
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium">Both parties have confirmed the swap!</p>
                </div>
              </div>

            
              <button
                onClick={handleCloseSuccessPopup}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all"
              >
               OK, Got it!
              </button>
            </div>
          </div>
        </div>
      )}

    
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