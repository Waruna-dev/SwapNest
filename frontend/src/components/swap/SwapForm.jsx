import React, { useState } from 'react';
import { createSwap } from '../../services/swapService';

const SwapForm = ({ 
  itemId, 
  itemTitle, 
  ownerName, 
  requesterId,
  requesterName,
  onClose, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    itemId: itemId,
    requesterId: requesterId,
    requesterName: requesterName,
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
    messageToOwner: '',
    agreementAccepted: false
  });
  
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewImages, setPreviewImages] = useState([]);

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
    const remainingSlots = 5 - photos.length;
    
    if (files.length > remainingSlots) {
      setError(`Maximum ${remainingSlots} more photo${remainingSlots !== 1 ? 's' : ''} allowed`);
      return;
    }
    
    const newPhotos = [...photos, ...files];
    if (newPhotos.length > 5) {
      setError('Maximum 5 photos allowed');
      return;
    }
    
    setPhotos(newPhotos);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviews]);
    setError('');
  };

  const removePhoto = (index) => {
    URL.revokeObjectURL(previewImages[index]);
    
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
    
    const newPreviews = [...previewImages];
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Build the data to send
      const dataToSend = { 
        itemId: itemId,
        requesterId: requesterId,
        requesterName: requesterName,
        swapType: formData.swapType,
        messageToOwner: formData.messageToOwner,
        agreementAccepted: formData.agreementAccepted
      };
      
      // Always include offeredItem 
      dataToSend.offeredItem = {
        name: formData.offeredItem.name,
        condition: formData.offeredItem.condition,
        description: formData.offeredItem.description || ''
      };
      
      // For swap-with-cash, include cashDetails
      if (formData.swapType === 'swap-with-cash') {
        dataToSend.cashDetails = {
          amount: parseFloat(formData.cashDetails.amount) || 0,
          whoPays: formData.cashDetails.whoPays
        };
      }
      
      // Photos for BOTH types 
      const photosToSend = photos;
      
      console.log('Sending data:', dataToSend);
      console.log('Photos:', photosToSend.length);
      
      const response = await createSwap(dataToSend, photosToSend);
      
      if (response.success) {
        previewImages.forEach(url => URL.revokeObjectURL(url));
        onSuccess(response.data);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface border-b border-outline-variant px-6 py-5 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-headline font-bold bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
              Swap Request
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">{itemTitle}</p>
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
                <span></span>
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
                <span></span>
                <span className="text-sm font-medium">Item + Cash</span>
              </button>
            </div>
            <p className="text-xs text-on-surface-variant mt-2">
              {formData.swapType === 'item-for-item' 
                ? 'Offer another item in exchange' 
                : 'Offer an item + cash amount'}
            </p>
          </div>

          
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

           
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-on-surface">Photos (Max 5, 5MB each)</label>
                {photos.length > 0 && (
                  <span className="text-xs text-primary font-medium">{photos.length}/5 uploaded</span>
                )}
              </div>

       
              {previewImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {previewImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={url} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-20 object-cover rounded-lg border border-outline-variant"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
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
              )}

            
              {photos.length < 5 && (
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
                        {photos.length === 0 ? 'Click to upload photos' : `Add more photos (${photos.length}/5)`}
                      </p>
                      <p className="text-xs text-on-surface-variant">JPG, PNG, GIF up to 5MB each</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
         
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
                    <span></span>
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
                    <span></span>
                    <span className="text-sm">Owner pays me</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          
        
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">Message to Owner</label>
            <textarea
              name="messageToOwner"
              value={formData.messageToOwner}
              onChange={handleChange}
              rows="2"
              placeholder={`Write a friendly message to ${ownerName}...`}
              className="w-full border border-outline-variant rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-surface text-on-surface placeholder:text-on-surface-variant transition-all resize-none"
            />
          </div>
          
       
          <div className="bg-surface-container-low rounded-xl p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agreementAccepted}
                onChange={(e) => setFormData(prev => ({ ...prev, agreementAccepted: e.target.checked }))}
                required
                className="mt-0.5 w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary focus:ring-offset-0"
              />
              <div className="text-sm text-on-surface-variant">
                I agree to:
                <ul className="list-disc pl-4 mt-1 space-y-0.5 text-xs">
                  <li>Meet in a public place</li>
                  <li>Exchange items in good condition</li>
                  <li>Be respectful to other users</li>
                </ul>
              </div>
            </label>
          </div>
          
       
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
                  <span>Submitting...</span>
                </div>
              ) : (
                'Send Swap Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SwapForm;