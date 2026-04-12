// services/swapService.js
import axios from 'axios';

const API_URL = 'https://swapnest-api.onrender.com/api/swaps';

// Create swap request with timeout and optimization
export const createSwap = async (data, photos = null) => {
  try {
    let response;
    
    if (photos && photos.length > 0) {
      const formData = new FormData();
      
      // Add all data to formData
      Object.keys(data).forEach(key => {
        if (key === 'offeredItem') {
          formData.append('offeredItem[name]', data.offeredItem.name);
          formData.append('offeredItem[condition]', data.offeredItem.condition);
          if (data.offeredItem.description) {
            formData.append('offeredItem[description]', data.offeredItem.description);
          }
        } else if (key === 'cashDetails' && data.cashDetails) {
          formData.append('cashDetails[amount]', data.cashDetails.amount);
          formData.append('cashDetails[whoPays]', data.cashDetails.whoPays);
        } else {
          formData.append(key, data[key]);
        }
      });
      
      // Add photos
      photos.forEach(photo => {
        formData.append('photos', photo);
      });
      
      // Increase timeout for image upload (30 seconds)
      response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000, // 30 seconds timeout
      });
    } else {
      response = await axios.post(API_URL, data, {
        timeout: 10000, // 10 seconds timeout
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('Create swap error:', error);
    throw error.response?.data || { message: error.message };
  }
};

// UPDATE SWAP REQUEST (without photos)
export const updateSwap = async (swapId, data) => {
  try {
    const response = await axios.put(`${API_URL}/${swapId}`, data);
    return response.data;
  } catch (error) {
    console.error('Update swap error:', error);
    throw error.response?.data || { message: error.message };
  }
};

// UPDATE SWAP PHOTOS
export const updateSwapPhotos = async (swapId, requesterId, newPhotos, removePhotoIndices = []) => {
  try {
    const formData = new FormData();
    formData.append('requesterId', requesterId);
    
    if (removePhotoIndices.length > 0) {
      formData.append('removePhotoIndices', JSON.stringify(removePhotoIndices));
    }
    
    if (newPhotos && newPhotos.length > 0) {
      newPhotos.forEach(photo => formData.append('photos', photo));
    }
    
    const response = await axios.put(`${API_URL}/${swapId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return response.data;
  } catch (error) {
    console.error('Update swap photos error:', error);
    throw error.response?.data || { message: error.message };
  }
};

// Get user swaps (both as requester and owner)
export const getUserSwaps = async (userId) => {
  try {
    console.log("getUserSwaps called with userId:", userId);
    const response = await axios.get(`${API_URL}/user/${userId}`);
    console.log("getUserSwaps response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user swaps:', error);
    throw error.response?.data || error.message;
  }
};

// Get pending requests for owner
export const getPendingRequests = async (ownerId) => {
  try {
    const response = await axios.get(`${API_URL}/pending/${ownerId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get swap by ID
export const getSwapById = async (swapId) => {
  try {
    const response = await axios.get(`${API_URL}/${swapId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update swap status (accept, reject, complete)
export const updateSwapStatus = async (swapId, status, notes = '') => {
  try {
    const response = await axios.put(`${API_URL}/${swapId}/status`, { status, notes });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Cancel swap request (requester only)
export const cancelSwap = async (swapId) => {
  try {
    const response = await axios.put(`${API_URL}/${swapId}/cancel`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all swaps (admin only)
export const getAllSwaps = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.swapType) params.append('swapType', filters.swapType);
    if (filters.sort) params.append('sort', filters.sort);
    
    const response = await axios.get(`${API_URL}/all?${params}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete swap (admin only)
export const deleteSwap = async (swapId) => {
  try {
    const response = await axios.delete(`${API_URL}/${swapId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Request completion (both parties)
export const requestCompletion = async (swapId, userId, userRole) => {
  try {
    const response = await axios.post(`${API_URL}/${swapId}/complete`, {
      userId,
      userRole
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get completion status
export const getCompletionStatus = async (swapId) => {
  try {
    const response = await axios.get(`${API_URL}/${swapId}/completion-status`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get swaps by item ID
export const getSwapsByItem = async (itemId, status = null) => {
  try {
    const params = status ? { itemId, status } : { itemId };
    const response = await axios.get(`${API_URL}/by-item`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};