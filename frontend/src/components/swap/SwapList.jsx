import React, { useState, useEffect } from 'react';
import { getUserSwaps, getPendingRequests, updateSwapStatus, cancelSwap } from '../../services/swapService';
import SwapCard from './SwapCard';

const SwapList = ({ userId }) => {
  const [swaps, setSwaps] = useState([]);
  const [activeTab, setActiveTab] = useState('my-swaps');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSwaps();
  }, [userId, activeTab]);

  const fetchSwaps = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (activeTab === 'my-swaps') {
        response = await getUserSwaps(userId);
      } else {
        response = await getPendingRequests(userId);
      }
      setSwaps(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch swaps');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (swapId) => {
    try {
      await updateSwapStatus(swapId, 'accepted');
      fetchSwaps();
    } catch (err) {
      alert('Failed to accept swap');
    }
  };

  const handleReject = async (swapId) => {
    try {
      await updateSwapStatus(swapId, 'rejected');
      fetchSwaps();
    } catch (err) {
      alert('Failed to reject swap');
    }
  };

  const handleComplete = async (swapId) => {
    try {
      await updateSwapStatus(swapId, 'completed');
      fetchSwaps();
    } catch (err) {
      alert('Failed to mark as completed');
    }
  };

  const handleCancel = async (swapId) => {
    if (window.confirm('Are you sure you want to cancel this swap request?')) {
      try {
        await cancelSwap(swapId);
        fetchSwaps();
      } catch (err) {
        alert('Failed to cancel swap');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>

      <div className="flex gap-2 mb-6 border-b border-outline-variant">
        <button
          className={`px-4 py-2 font-headline font-medium transition-colors ${
            activeTab === 'my-swaps' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          onClick={() => setActiveTab('my-swaps')}
        >
          All My Swaps
        </button>
        <button
          className={`px-4 py-2 font-headline font-medium transition-colors ${
            activeTab === 'pending' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Requests
        </button>
      </div>
      
      {error && (
        <div className="bg-error-container border border-error text-on-error-container px-4 py-2 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {swaps.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow border border-outline-variant">
          <p className="text-on-surface-variant">No swaps found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {swaps.map(swap => (
            <SwapCard
              key={swap._id}
              swap={swap}
              userId={userId}
              onAccept={handleAccept}
              onReject={handleReject}
              onComplete={handleComplete}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SwapList;