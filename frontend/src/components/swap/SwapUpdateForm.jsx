import React, { useState, useEffect } from 'react';
import { updateSwap, updateSwapPhotos, getSwapById } from '../../services/swapService';

const SwapUpdateForm = ({ 
  swapId, 
  requesterId,
  requesterName,
  onClose, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [swap, setSwap] = useState(null);
  const [formData, setFormData] = useState({
    swapType: 'item-for-item',
    offeredItem: {
      name: '',
      condition: 'Good',
      description: ''
    },
    cashDetails: {
      amount: '',
      whoPays: 'i-pay-owner'
    },
    messageToOwner: ''
  });
  
  const [newPhotos, setNewPhotos] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [photosToRemove, setPhotosToRemove] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [existingPreviews, setExistingPreviews] = useState([]);

  // Fetch existing swap data
  useEffect(() => {
    const fetchSwap = async () => {
      try {
        const response = await getSwapById(swapId);
        const swapData = response.data;
        setSwap(swapData);
        
        // Populate form with existing data
        setFormData({
          swapType: swapData.swapType,
          offeredItem: {
            name: swapData.offeredItem?.name || '',
            condition: swapData.offeredItem?.condition || 'Good',
            description: swapData.offeredItem?.description || ''
          },
          cashDetails: {
            amount: swapData.cashDetails?.amount || '',
            whoPays: swapData.cashDetails?.whoPays || 'i-pay-owner'
          },
          messageToOwner: swapData.messageToOwner || ''
        });
        
        // Set existing photos
        if (swapData.offeredItem?.photos) {
          setExistingPhotos(swapData.offeredItem.photos);
          setExistingPreviews(swapData.offeredItem.photos.map(p => p.url));
        }
        
      } catch (err) {
        setError('Failed to load swap data');
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    
    fetchSwap();
  }, [swapId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOfferedItemChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      offeredItem: { ...prev.offeredItem, [name]: value }
    }));
  };

  const handleCashChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      cashDetails: { ...prev.cashDetails, [name]: value }
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const totalPhotos = existingPhotos.length + newPhotos.length - photosToRemove.length;
    const remainingSlots = 5 - totalPhotos;
    
    if (files.length > remainingSlots) {
      setError(`Maximum ${remainingSlots} more photo${remainingSlots !== 1 ? 's' : ''} allowed`);
      return;
    }
    
    const newPhotosList = [...newPhotos, ...files];
    if (newPhotosList.length > 5) {
      setError('Maximum 5 photos allowed');
      return;
    }
    
    setNewPhotos(newPhotosList);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviews]);
    setError('');
  };

  const removeExistingPhoto = (index) => {
    setPhotosToRemove([...photosToRemove, index]);
  };

  const removeNewPhoto = (index) => {
    URL.revokeObjectURL(previewImages[index]);
    
    const newPhotosList = [...newPhotos];
    newPhotosList.splice(index, 1);
    setNewPhotos(newPhotosList);
    
    const newPreviews = [...previewImages];
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Update basic info
      const updateData = {
        requesterId: requesterId,
        swapType: formData.swapType,
        offeredItem: {
          name: formData.offeredItem.name,
          condition: formData.offeredItem.condition,
          description: formData.offeredItem.description
        },
        messageToOwner: formData.messageToOwner
      };
      
      // Add cash details if swap-with-cash
      if (formData.swapType === 'swap-with-cash') {
        updateData.cashDetails = {
          amount: parseFloat(formData.cashDetails.amount) || 0,
          whoPays: formData.cashDetails.whoPays
        };
      }
      
      // Update swap basic info
      await updateSwap(swapId, updateData);
      
      // Update photos if any changes
      if (photosToRemove.length > 0 || newPhotos.length > 0) {
        await updateSwapPhotos(swapId, requesterId, newPhotos, photosToRemove);
      }
      
      // Clean up preview URLs
      previewImages.forEach(url => URL.revokeObjectURL(url));
      
      onSuccess();
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to update swap request');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-on-surface-variant">Loading swap details...</p>
        </div>
      </div>
    );
  }

  const totalPhotos = existingPhotos.length + newPhotos.length - photosToRemove.length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface border-b border-outline-variant px-6 py-5 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-headline font-bold bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
              Update Swap Request
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">Request ID: {swap?.requestId}</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-error-container border-l-4 border-error p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-on-error-container">{error}</p>
              </div>
            </div>
          )}

          {/* Swap Type Selection */}
          <div>
            <label className="block text-sm font-medium text-on-surface font-headline mb-2">Swap Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, swapType: 'item-for-item' }))}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                  formData.swapType === 'item-for-item'
                    ? 'bg-primary border-primary text-on-primary shadow-md'
                    : 'bg-surface border-outline-variant text-on-surface-variant hover:border-primary hover:bg-primary-fixed/10'
                }`}
              >
                <span>🔄</span>
                <span className="text-sm font-medium">Item for Item</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, swapType: 'swap-with-cash' }))}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                  formData.swapType === 'swap-with-cash'
                    ? 'bg-primary border-primary text-on-primary shadow-md'
                    : 'bg-surface border-outline-variant text-on-surface-variant hover:border-primary hover:bg-primary-fixed/10'
                }`}
              >
                <span>💰</span>
                <span className="text-sm font-medium">Item + Cash</span>
              </button>
            </div>
          </div>

          {/* Offered Item Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-on-surface font-headline flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded-full"></span>
              What are you offering?
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Item Name *</label>
              <input
                type="text"
                name="name"
                value={formData.offeredItem.name}
                onChange={handleOfferedItemChange}
                required
                placeholder="e.g. Wooden Chair"
                className="w-full border border-outline-variant rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-surface text-on-surface placeholder:text-on-surface-variant transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Condition *</label>
              <select
                name="condition"
                value={formData.offeredItem.condition}
                onChange={handleOfferedItemChange}
                className="w-full border border-outline-variant rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-surface text-on-surface transition-all appearance-none"
              >
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5">Description</label>
              <textarea
                name="description"
                value={formData.offeredItem.description}
                onChange={handleOfferedItemChange}
                rows="2"
                placeholder="Describe your item..."
                className="w-full border border-outline-variant rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-surface text-on-surface placeholder:text-on-surface-variant transition-all resize-none"
              />
            </div>

            {/* Photo Management */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-on-surface">Photos (Max 5)</label>
                <span className="text-xs text-primary font-medium">{totalPhotos}/5 uploaded</span>
              </div>

              {/* Existing Photos */}
              {existingPhotos.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-on-surface-variant mb-2">Current Photos:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {existingPhotos.map((photo, index) => (
                      !photosToRemove.includes(index) && (
                        <div key={index} className="relative group">
                          <img 
                            src={photo.url.startsWith('http') ? photo.url : `http://localhost:5000${photo.url}`} 
                            alt={`Existing ${index + 1}`} 
                            className="w-full h-20 object-cover rounded-lg border border-outline-variant"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingPhoto(index)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-error rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                            title="Remove photo"
                          >
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* New Photos Preview */}
              {previewImages.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-on-surface-variant mb-2">New Photos:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {previewImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={url} 
                          alt={`New ${index + 1}`} 
                          className="w-full h-20 object-cover rounded-lg border border-outline-variant"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewPhoto(index)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-error rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                          title="Remove photo"
                        >
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              {totalPhotos < 5 && (
                <div className="relative border-2 border-dashed border-outline-variant rounded-xl hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-2xl">📸</span>
                      <p className="text-sm text-on-surface-variant">
                        {totalPhotos === 0 ? 'Click to upload photos' : `Add more photos (${totalPhotos}/5)`}
                      </p>
                      <p className="text-xs text-on-surface-variant">JPG, PNG, GIF up to 5MB each</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Cash Section */}
          {formData.swapType === 'swap-with-cash' && (
            <div className="space-y-4 bg-surface-container-low rounded-xl p-4">
              <h3 className="font-medium text-on-surface font-headline flex items-center gap-2">
                <span className="w-1 h-5 bg-secondary rounded-full"></span>
                Cash Offer
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">Amount (Rs.) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">Rs.</span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.cashDetails.amount}
                    onChange={handleCashChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-12 pr-4 py-2.5 border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-surface text-on-surface transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5">Who Pays?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, cashDetails: { ...prev.cashDetails, whoPays: 'i-pay-owner' } }))}
                    className={`flex items-center justify-center gap-2 p-2 rounded-xl border transition-all ${
                      formData.cashDetails.whoPays === 'i-pay-owner'
                        ? 'bg-primary border-primary text-on-primary'
                        : 'bg-surface border-outline-variant text-on-surface-variant hover:border-primary'
                    }`}
                  >
                    <span>💰</span>
                    <span className="text-sm">I pay owner</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, cashDetails: { ...prev.cashDetails, whoPays: 'owner-pays-me' } }))}
                    className={`flex items-center justify-center gap-2 p-2 rounded-xl border transition-all ${
                      formData.cashDetails.whoPays === 'owner-pays-me'
                        ? 'bg-primary border-primary text-on-primary'
                        : 'bg-surface border-outline-variant text-on-surface-variant hover:border-primary'
                    }`}
                  >
                    <span>💸</span>
                    <span className="text-sm">Owner pays me</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">Message to Owner</label>
            <textarea
              name="messageToOwner"
              value={formData.messageToOwner}
              onChange={handleChange}
              rows="2"
              placeholder="Update your message to the owner..."
              className="w-full border border-outline-variant rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-surface text-on-surface placeholder:text-on-surface-variant transition-all resize-none"
            />
          </div>
          
          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 border border-outline-variant hover:bg-surface-container-high text-on-surface font-medium py-2.5 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 bg-primary hover:bg-primary-container text-on-primary font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                'Update Swap Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SwapUpdateForm;