import React from 'react';
import StatusBadge from '../common/StatusBadge';

const SwapDetailsModal = ({ swap, onClose }) => {
  if (!swap) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        <div className="sticky top-0 bg-white border-b border-outline-variant px-6 py-5 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-headline font-bold bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
              Swap Details
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">Transaction Information</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-3xl hover:bg-surface-container-low w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          >
            &times;
          </button>
        </div>
        
        <div className="p-6 space-y-6">

          <div className="bg-gradient-to-r from-primary-fixed/90 to-transparent p-4 rounded-xl">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-wider text-on-surface-variant">Request ID</p>
                <p className="font-mono text-primary font-semibold text-lg">{swap.requestId}</p>
              </div>
              <StatusBadge status={swap.status} />
            </div>
          </div>

 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-primary-fixed/90 rounded-lg">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-on-surface">Requested Item</h3>
              </div>
              <p className="font-medium text-on-surface">{swap.requestedItem.name}</p>
              <p className="text-sm text-on-surface-variant mt-1">Condition: {swap.requestedItem.condition}</p>
              {swap.requestedItem.description && (
                <p className="text-sm text-on-surface-variant mt-1">{swap.requestedItem.description}</p>
              )}
            </div>

            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-secondary-fixed/90 rounded-lg">
                  <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-on-surface">
                  {swap.swapType === 'item-for-item' ? 'Offered Item' : 'Cash Details'}
                </h3>
              </div>
              {swap.swapType === 'item-for-item' && swap.offeredItem ? (
                <>
                  <p className="font-medium text-on-surface">{swap.offeredItem.name}</p>
                  <p className="text-sm text-on-surface-variant">Condition: {swap.offeredItem.condition}</p>
                  {swap.offeredItem.description && (
                    <p className="text-sm text-on-surface-variant mt-1">{swap.offeredItem.description}</p>
                  )}
                  {swap.offeredItem.photos?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-on-surface-variant mb-2">Photos ({swap.offeredItem.photos.length})</p>
                      <div className="flex gap-2 flex-wrap">
                        {swap.offeredItem.photos.map((photo, i) => (
                          <img 
                            key={i} 
                            src={`http://localhost:5000${photo.url}`} 
                            alt={`Offered item ${i + 1}`} 
                            className="w-16 h-16 object-cover rounded-lg border border-outline-variant"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : swap.cashDetails ? (
                <>
                  <p className="font-medium text-primary text-xl">Rs. {swap.cashDetails.amount}</p>
                  <p className="text-sm text-on-surface-variant mt-1">
                    {swap.cashDetails.whoPays === 'i-pay-owner' 
                      ? '💰 Requester pays owner' 
                      : '💸 Owner pays requester'}
                  </p>
                </>
              ) : (
                <p className="text-on-surface-variant">—</p>
              )}
            </div>

            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-tertiary-fixed/90 rounded-lg">
                  <svg className="w-5 h-5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-on-surface">Requester</h3>
              </div>
              <p className="font-medium text-on-surface">{swap.requesterName}</p>
              <p className="text-sm font-mono text-on-surface-variant mt-1">{swap.requesterId}</p>
            </div>

            {/* Owner Info */}
            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-primary-fixed/90 rounded-lg">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-on-surface">Owner</h3>
              </div>
              <p className="font-medium text-on-surface">{swap.requestedItem.ownerName}</p>
              <p className="text-sm font-mono text-on-surface-variant mt-1">{swap.requestedItem.ownerId}</p>
            </div>
          </div>

          {/* Message to Owner */}
          {swap.messageToOwner && (
            <div className="bg-primary-fixed/10 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="font-semibold text-on-surface">Message to Owner</h3>
              </div>
              <p className="italic text-on-surface">"{swap.messageToOwner}"</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-low p-3 rounded-lg">
              <p className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">Created At</p>
              <p className="text-sm mt-1 text-on-surface">{new Date(swap.createdAt).toLocaleString()}</p>
            </div>
            <div className="bg-surface-container-low p-3 rounded-lg">
              <p className="text-xs uppercase font-bold tracking-wider text-on-surface-variant">Last Updated</p>
              <p className="text-sm mt-1 text-on-surface">{new Date(swap.updateAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Completion Details */}
          {swap.status === 'completed' && swap.completedAt && (
            <div className="bg-tertiary-fixed/20 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-semibold text-tertiary">Completion Details</h3>
              </div>
              <p className="text-on-surface">Completed on: {new Date(swap.completedAt).toLocaleString()}</p>
              {swap.completionNotes && (
                <p className="text-on-surface-variant mt-1">Notes: {swap.completionNotes}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-outline-variant px-6 py-4 flex justify-end">
          <button 
            onClick={onClose} 
            className="bg-primary hover:bg-primary-container text-on-primary px-6 py-2.5 rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwapDetailsModal;