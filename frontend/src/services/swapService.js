// src/services/swapService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/swaps';

// Create swap request
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
      photos.forEach(photo => formData.append('photos', photo));
      
      response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      response = await axios.post(API_URL, data);
    }
    
    return response.data;
  } catch (error) {
    console.error('Create swap error:', error);
    throw error.response?.data || { message: error.message };
  }
};

// Get user swaps
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

// Update swap status
export const updateSwapStatus = async (swapId, status, notes = '') => {
  try {
    const response = await axios.put(`${API_URL}/${swapId}/status`, { status, notes });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Cancel swap
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

// Mark swap as complete
export const markSwapComplete = async (swapId, userId) => {
  try {
    const response = await axios.put(
      `${API_URL}/${swapId}/status`,
      { status: 'completed', notes: 'Swap completed successfully' },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('swapnest_token')}`
        }
      }
    );
    return response;
  } catch (error) {
    console.error('Error marking swap complete:', error);
    throw error;
  }
};