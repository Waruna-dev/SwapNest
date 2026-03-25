// src/components/swap/SwapCard.jsx
import React from 'react';
import StatusBadge from '../common/StatusBadge';

const SwapCard = ({ swap, userId, onAccept, onReject, onComplete, onCancel }) => {
  const isOwner = swap.requestedItem.ownerId === userId;
  const isRequester = swap.requesterId === userId;
  const isPending = swap.status === 'pending';
  const isAccepted = swap.status === 'accepted';

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-outline-variant">

      <div className="flex justify-between items-start mb-3">
        <h3 className="font-headline font-semibold text-on-surface">{swap.requestedItem.name}</h3>
        <StatusBadge status={swap.status} />
      </div>
      
      <div className="space-y-2 text-sm text-on-surface-variant font-body">
        <p><span className="font-medium">From:</span> {swap.requesterName}</p>
        <p><span className="font-medium">Request ID:</span> <span className="font-mono">{swap.requestId}</span></p>
        <p><span className="font-medium">Type:</span> {swap.swapType === 'item-for-item' ? '🔄 Item Swap' : '💰 Cash Swap'}</p>
        <p><span className="font-medium">Created:</span> {new Date(swap.createdAt).toLocaleDateString()}</p>
        

        {swap.swapType === 'item-for-item' && swap.offeredItem && (
          <div className="bg-surface-container-low p-2 rounded mt-2">
            <p><span className="font-medium">Offers:</span> {swap.offeredItem.name}</p>
            <p><span className="font-medium">Condition:</span> {swap.offeredItem.condition}</p>
            {swap.offeredItem.description && (
              <p><span className="font-medium">Description:</span> {swap.offeredItem.description}</p>
            )}
            {swap.offeredItem.photos?.length > 0 && (
              <div className="flex gap-1 mt-2">
                {swap.offeredItem.photos.slice(0, 3).map((photo, i) => (
                  <img key={i} src={`http://localhost:5000${photo.url}`} alt="Offered" className="w-12 h-12 object-cover rounded" />
                ))}
                {swap.offeredItem.photos.length > 3 && (
                  <span className="w-12 h-12 bg-surface-container-high rounded flex items-center justify-center text-xs text-on-surface-variant">
                    +{swap.offeredItem.photos.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {swap.swapType === 'swap-with-cash' && swap.cashDetails && (
          <div className="bg-surface-container-low p-2 rounded mt-2">
            <p><span className="font-medium">Cash:</span> LKR {swap.cashDetails.amount}</p>
            <p><span className="font-medium">Payer:</span> {swap.cashDetails.whoPays === 'i-pay-owner' ? 'Requester pays owner' : 'Owner pays requester'}</p>
          </div>
        )}

        {swap.messageToOwner && (
          <p className="mt-2 bg-surface-container-low p-2 rounded text-on-surface-variant">
            <span className="font-medium">💬 Message:</span> {swap.messageToOwner}
          </p>
        )}
      </div>
      
      <div className="flex gap-2 mt-4 pt-3 border-t border-outline-variant">
        {isPending && isOwner && (
          <>
            <button 
              onClick={() => onAccept(swap._id)}
              className="flex-1 bg-primary hover:bg-primary-container text-on-primary font-medium py-1.5 rounded-lg transition-colors"
            >
              Accept
            </button>
            <button 
              onClick={() => onReject(swap._id)}
              className="flex-1 bg-error hover:bg-error-container text-on-error font-medium py-1.5 rounded-lg transition-colors"
            >
              Reject
            </button>
          </>
        )}
        
        {isAccepted && isOwner && (
          <button 
            onClick={() => onComplete(swap._id)}
            className="flex-1 bg-tertiary hover:bg-tertiary-container text-on-tertiary font-medium py-1.5 rounded-lg transition-colors"
          >
            Mark Complete
          </button>
        )}
        
        {isPending && isRequester && (
          <button 
            onClick={() => onCancel(swap._id)}
            className="flex-1 bg-outline hover:bg-surface-container-high text-white font-medium py-1.5 rounded-lg transition-colors"
          >
            Cancel Request
          </button>
        )}
      </div>
    </div>
  );
};

export default SwapCard;