// components/swap/SwapCard.jsx
import React, { useState } from 'react';
import { updateSwapStatus, cancelSwapRequest } from '../../services/swapService';
import SwapStatusBadge from '../common/StatusBadge';
import SwapDetailModal from './SwapDetailsModal';
import { getCurrentUser } from '../../services/authService';

const SwapCard = ({ swap, onStatusChange }) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const currentUser = getCurrentUser();
  
  const isRequester = currentUser?._id === swap.requesterId?._id || 
                      currentUser?._id === swap.requesterId;
  const isOwner = currentUser?._id === swap.requestedItem?.ownerId?._id ||
                  currentUser?._id === swap.requestedItem?.ownerId;
  
  const isPending = swap.status === 'pending';
  const canCancel = isRequester && isPending;
  const canAccept = isOwner && isPending;
  const canReject = isOwner && isPending;
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const handleAccept = async () => {
    if (!confirm('Accept this swap request? The item will no longer be available.')) return;
    
    setLoading(true);
    try {
      await updateSwapStatus(swap._id, 'accepted');
      onStatusChange?.(swap._id, 'accepted');
    } catch (err) {
      setError(err.message || 'Failed to accept swap');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  const handleReject = async () => {
    if (!confirm('Reject this swap request? The requester will be notified.')) return;
    
    setLoading(true);
    try {
      await updateSwapStatus(swap._id, 'rejected');
      onStatusChange?.(swap._id, 'rejected');
    } catch (err) {
      setError(err.message || 'Failed to reject swap');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = async () => {
    if (!confirm('Cancel this swap request? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      await cancelSwapRequest(swap._id);
      onStatusChange?.(swap._id, 'cancelled');
    } catch (err) {
      setError(err.message || 'Failed to cancel swap');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  const getSwapPreview = () => {
    if (swap.swapType === 'swap-with-cash') {
      const direction = swap.cashDetails?.whoPays === 'requester-pays-owner' 
        ? `+ LKR ${swap.cashDetails?.amount?.toLocaleString() || 0}`
        : `- LKR ${swap.cashDetails?.amount?.toLocaleString() || 0}`;
      return (
        <div className="text-sm">
          <span className="font-medium">Cash:</span> {direction}
        </div>
      );
    } else {
      return (
        <div className="text-sm">
          <span className="font-medium">Offering:</span>{' '}
          {swap.offeredItem?.name || 'Item'}
          {swap.offeredItem?.condition && (
            <span className="ml-1 text-xs text-gray-500">
              ({swap.offeredItem.condition})
            </span>
          )}
        </div>
      );
    }
  };
  
  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
        {/* Error Banner */}
        {error && (
          <div className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-600">
            {error}
          </div>
        )}
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">
              Request #{swap.requestId || swap._id.slice(-8)}
            </p>
            <h3 className="font-semibold text-gray-900">
              {swap.requestedItem?.title || 'Item'}
            </h3>
          </div>
          <SwapStatusBadge status={swap.status} />
        </div>
        
        {/* Details */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="material-symbols-outlined text-base">person</span>
            {isRequester ? (
              <span>You requested this</span>
            ) : (
              <span>From: <span className="font-medium">{swap.requesterName}</span></span>
            )}
          </div>
          
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <span className="material-symbols-outlined text-base">swap_horiz</span>
            {getSwapPreview()}
          </div>
          
          {swap.messageToOwner && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <span className="material-symbols-outlined text-base">chat</span>
              <p className="line-clamp-2">{swap.messageToOwner}</p>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="material-symbols-outlined text-xs">schedule</span>
            {formatDate(swap.createdAt)}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setShowDetailModal(true)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            View Details
          </button>
          
          {canAccept && (
            <button
              onClick={handleAccept}
              disabled={loading}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              Accept
            </button>
          )}
          
          {canReject && (
            <button
              onClick={handleReject}
              disabled={loading}
              className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Reject
            </button>
          )}
          
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={loading}
              className="rounded-lg border border-orange-300 bg-white px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50"
            >
              Cancel Request
            </button>
          )}
        </div>
      </div>
      
      {/* Detail Modal */}
      {showDetailModal && (
        <SwapDetailModal
          swap={swap}
          onClose={() => setShowDetailModal(false)}
          onStatusChange={onStatusChange}
          isRequester={isRequester}
          isOwner={isOwner}
        />
      )}
    </>
  );
};

export default SwapCard;