import React, { useState } from 'react';
import StatusBadge from '../common/StatusBadge';

const SwapDetailsModal1 = ({ swap, onClose }) => {
  const [imageErrors, setImageErrors] = useState({});
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  
  if (!swap) return null;

  // Helper function to format date safely
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  // get image URL
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    return `http://localhost:5000/uploads/swaps/${url}`;
  };

  const getRequesterName = () => {
    if (swap.requesterName && swap.requesterName !== 'null' && swap.requesterName !== 'undefined') {
      return swap.requesterName;
    }
    if (swap.requesterId && typeof swap.requesterId === 'object') {
      const username = swap.requesterId.username;
      if (username) return username;
    }
    return 'Unknown User';
  };

  const getRequesterId = () => {
    if (swap.requesterId && typeof swap.requesterId === 'object') {
      return swap.requesterId._id || JSON.stringify(swap.requesterId);
    }
    return swap.requesterId || 'No ID';
  };

  const getOwnerName = () => {
    if (swap.requestedItem?.ownerName) return swap.requestedItem.ownerName;
    if (swap.requestedItem?.ownerId && typeof swap.requestedItem.ownerId === 'object') {
      return swap.requestedItem.ownerId.username || 'Unknown';
    }
    return 'Unknown Owner';
  };

  const getOwnerId = () => {
    if (swap.requestedItem?.ownerId && typeof swap.requestedItem.ownerId === 'object') {
      return swap.requestedItem.ownerId._id || JSON.stringify(swap.requestedItem.ownerId);
    }
    return swap.requestedItem?.ownerId || 'No ID';
  };

  const handleImageError = (photoIndex) => {
    setImageErrors(prev => ({ ...prev, [photoIndex]: true }));
  };

  // Get all photos
  const getAllPhotos = () => {
    if (swap.offeredItem?.photos && swap.offeredItem.photos.length > 0) {
      return swap.offeredItem.photos;
    }
    return [];
  };

  const photos = getAllPhotos();

  const openPhotoViewer = (photo) => {
    setSelectedPhoto(photo);
  };

  const closePhotoViewer = () => {
    setSelectedPhoto(null);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-outline-variant px-6 py-5 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-headline font-bold text-primary">Swap Details</h2>
              <p className="text-sm text-on-surface-variant mt-1">Transaction Information</p>
            </div>
            <button onClick={onClose} className="text-3xl hover:bg-surface-container-low w-8 h-8 rounded-full flex items-center justify-center">&times;</button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Request ID & Status */}
            <div className="bg-gradient-to-r from-primary-fixed/10 to-transparent p-4 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs uppercase tracking-wider text-on-surface-variant">Request ID</p>
                  <p className="font-mono text-primary font-semibold text-lg">{swap.requestId}</p>
                </div>
                <StatusBadge status={swap.status} />
              </div>
            </div>

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Requested Item */}
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-primary-fixed/20 rounded-lg">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-on-surface">Requested Item</h3>
                </div>
                <p className="font-medium text-on-surface">{swap.requestedItem?.name || 'N/A'}</p>
                <p className="text-sm text-on-surface-variant mt-1">Condition: {swap.requestedItem?.condition || 'N/A'}</p>
                {swap.requestedItem?.description && (
                  <p className="text-sm text-on-surface-variant mt-1">{swap.requestedItem.description}</p>
                )}
              </div>

              {/* Offered Item / Cash Details WITH PHOTOS */}
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-secondary-fixed/20 rounded-lg">
                    <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-on-surface">
                    {swap.swapType === 'item-for-item' ? 'Offered Item' : 'Offered Item + Cash'}
                  </h3>
                </div>
                
                {/* Item details */}
                {swap.offeredItem && (
                  <>
                    <p className="font-medium text-on-surface">{swap.offeredItem.name}</p>
                    <p className="text-sm text-on-surface-variant">Condition: {swap.offeredItem.condition}</p>
                    {swap.offeredItem.description && (
                      <p className="text-sm text-on-surface-variant mt-1">{swap.offeredItem.description}</p>
                    )}
                  </>
                )}
                
                {/* Cash details for swap-with-cash */}
                {swap.swapType === 'swap-with-cash' && swap.cashDetails && (
                  <div className="mt-2 pt-2 border-t border-outline-variant">
                    <p className="font-medium text-primary text-xl">+ Rs. {swap.cashDetails.amount}</p>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {swap.cashDetails.whoPays === 'i-pay-owner' 
                        ? '💰 Requester pays owner' 
                        : '💸 Owner pays requester'}
                    </p>
                  </div>
                )}
                
                {/* Photos Section */}
                {photos.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-on-surface-variant mb-2">
                      📸 Photos ({photos.length})
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {photos.map((photo, i) => {
                        const imageUrl = getImageUrl(photo.url);
                        const hasError = imageErrors[`photo-${i}`];
                        
                        return (
                          <div 
                            key={i} 
                            className="relative group cursor-pointer"
                            onClick={() => openPhotoViewer(photo)}
                          >
                            {!hasError ? (
                              <img 
                                src={imageUrl} 
                                alt={`Offered item ${i + 1}`} 
                                className="w-full h-24 object-cover rounded-lg border border-outline-variant hover:opacity-90 transition-opacity"
                                onError={() => handleImageError(`photo-${i}`)}
                              />
                            ) : (
                              <div className="w-full h-24 bg-surface-container-high rounded-lg border border-outline-variant flex flex-col items-center justify-center">
                                <span className="text-2xl mb-1">📷</span>
                                <span className="text-xs text-on-surface-variant">No image</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs">Click to enlarge</span>
                            </div>
                            <span className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-full">
                              {i + 1}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Requester Info */}
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-tertiary-fixed/20 rounded-lg">
                    <svg className="w-5 h-5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-on-surface">Requester</h3>
                </div>
                <p className="font-medium text-on-surface">{getRequesterName()}</p>
                
              </div>

              {/* Owner Info */}
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-primary-fixed/20 rounded-lg">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-on-surface">Owner</h3>
                </div>
                <p className="font-medium text-on-surface">{getOwnerName()}</p>
                
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

            {/* Timestamps - FIXED with safe date formatting */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-low p-3 rounded-lg">
                <p className="text-xs uppercase tracking-wider text-on-surface-variant">Created At</p>
                <p className="text-sm mt-1 text-on-surface">{formatDate(swap.createdAt)}</p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg">
                <p className="text-xs uppercase tracking-wider text-on-surface-variant">Last Updated</p>
                <p className="text-sm mt-1 text-on-surface">{formatDate(swap.updatedAt || swap.updateAt)}</p>
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
                <p className="text-on-surface">Completed on: {formatDate(swap.completedAt)}</p>
                {swap.completionNotes && (
                  <p className="text-on-surface-variant mt-1">Notes: {swap.completionNotes}</p>
                )}
              </div>
            )}
          </div>

         
        </div>
      </div>

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-[100] p-4"
          onClick={closePhotoViewer}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={closePhotoViewer}
              className="absolute top-4 right-4 text-white text-4xl hover:opacity-75 transition-opacity z-10"
            >
              &times;
            </button>
            <img
              src={getImageUrl(selectedPhoto.url)}
              alt="Full size"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm bg-black/50 py-2">
              Click anywhere to close
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SwapDetailsModal1;