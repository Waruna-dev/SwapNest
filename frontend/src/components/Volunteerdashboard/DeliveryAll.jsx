import React, { useState, useEffect } from 'react';
import API from '../../services/api';

export default function DeliveryAll() {
  const [notifiedItems, setNotifiedItems] = useState([]);
  const [loadingNotifiedItems, setLoadingNotifiedItems] = useState(false);
  const [centers, setCenters] = useState([]);
  const [acceptingId, setAcceptingId] = useState(null);

  const storedUser = localStorage.getItem('swapnest_user');
  const userData = storedUser ? JSON.parse(storedUser) : null;
  const volunteerId = userData?._id;
  const displayName = userData?.firstName || userData?.username || 'Volunteer';

  useEffect(() => {
    loadCenters();
    loadNotifiedItems();
  }, []);

  const loadCenters = async () => {
    try {
      const response = await API.get('/centers');
      const centersData = Array.isArray(response.data?.data) ? response.data.data : 
                         Array.isArray(response.data) ? response.data : [];
      setCenters(centersData);
    } catch (err) {
      console.error('Error loading centers:', err);
    }
  };

  const loadNotifiedItems = async () => {
    try {
      setLoadingNotifiedItems(true);
      const response = await API.get('/simple-volunteer-help');
      const allRequests = Array.isArray(response.data?.data) ? response.data.data : 
                         Array.isArray(response.data) ? response.data : [];
      
      // Filter for notified items (center_assigned requests) for any center
      const notified = allRequests.filter(request => 
        request.assignedCenterId && request.status === 'center_assigned'
      );
      
      // Fetch item details for each notified item
      const itemsWithImages = await Promise.all(
        notified.map(async (request) => {
          try {
            if (request.itemId) {
              const itemRes = await API.get(`/items/${request.itemId}`);
              const itemData = itemRes.data;
              return {
                ...request,
                itemDetails: itemData
              };
            }
          } catch (err) {
            console.error('Error fetching item details:', err);
          }
          return {
            ...request,
            itemDetails: null
          };
        })
      );
      
      setNotifiedItems(itemsWithImages);
    } catch (err) {
      console.error('Error loading notified items:', err);
    } finally {
      setLoadingNotifiedItems(false);
    }
  };

  const getCenterName = (centerId) => {
    const center = centers.find(c => c._id === centerId);
    return center ? center.centerName || center.name : 'Unknown Center';
  };

  const handleAcceptRequest = async (requestId) => {
    if (!volunteerId) {
      alert('Could not identify your volunteer account. Please log in again.');
      return;
    }
    
    try {
      setAcceptingId(requestId);
      await API.put(`/simple-volunteer-help/${requestId}/accept`, { volunteerId });
      
      const requestDetails = notifiedItems.find(r => r._id === requestId);
      if (requestDetails) {
        await API.post('/notifications', {
          userId: requestDetails.userId,
          title: 'Volunteer Assigned',
          message: `Your request for "${requestDetails.itemTitle || 'an item'}" has been accepted by our volunteer ${displayName}.`,
          type: 'volunteer_accept'
        }).catch(e => console.error('Notification failed to send', e));
      }

      // Remove the item from the list entirely
      setNotifiedItems(prev => prev.filter(r => r._id !== requestId));
      alert('Request accepted successfully! You can find it in your Activity tab.');
    } catch (error) {
      console.error('Failed to accept request:', error);
      alert('Failed to accept request. Please try again.');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleCloseItem = (requestId) => {
    setNotifiedItems(prev => prev.filter(r => r._id !== requestId));
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Delivery All</h1>
        <p className="text-gray-600">View and manage all items notified and assigned to centers</p>
      </div>

      <div className="bg-white rounded-lg p-2 flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notified Items</h3>
        
        {loadingNotifiedItems ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600 text-lg">Loading notified items...</span>
          </div>
        ) : notifiedItems.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 className="text-xl font-medium text-gray-700 mb-1">No Notified Items</h3>
            <p className="text-gray-500">Currently, there are no items notified for delivery.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notifiedItems.map((item, index) => {
              const acceptedById = item.assignedVolunteerId?._id || item.assignedVolunteerId;
              const isAccepted = item.status === 'accepted';
              const isAcceptedByMe = isAccepted && String(acceptedById) === String(volunteerId);
              
              return (
                <div key={item._id || index} className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden">
                  {/* Item Image Header */}
                  <div className="relative h-56 bg-gray-100">
                    {item.itemDetails?.images && item.itemDetails.images.length > 0 ? (
                      <img 
                        src={item.itemDetails.images[0]?.url || item.itemDetails.images[0]} 
                        alt={item.itemTitle || 'Item image'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gradient-to-br from-indigo-50 to-blue-50">
                        <svg className="w-16 h-16 opacity-50 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>No Image</span>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                        item.status === 'accepted' 
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                          : 'bg-green-100 text-green-800 border border-green-200'
                      }`}>
                        {item.status === 'accepted' ? 'Accepted' : 'Available'}
                      </span>
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="p-5 flex-grow flex flex-col">
                    <h4 className="text-xl font-bold text-gray-900 mb-1 truncate">{item.itemTitle || 'Unknown Item'}</h4>
                    <div className="text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                      ID: {item.itemId || 'N/A'}
                    </div>

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 rounded p-2.5">
                        <span className="block text-xs font-medium text-gray-500 mb-1">Center</span>
                        <span className="block text-sm font-semibold text-gray-800 truncate">
                          {getCenterName(item.assignedCenterId)}
                        </span>
                      </div>
                      <div className="bg-indigo-50 rounded p-2.5">
                        <span className="block text-xs font-medium text-indigo-400 mb-1">Delivery To</span>
                        <span className="block text-sm font-semibold text-indigo-900 truncate">
                          {item.userCity || 'N/A'}, {item.userDistrict || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Location Address */}
                    <div className="mb-4">
                      <div className="flex items-start gap-2 text-sm text-gray-700 bg-white border border-gray-200 rounded p-3">
                        <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="break-words leading-relaxed">{item.userAddress || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Spacer to push buttons to bottom */}
                    <div className="flex-grow"></div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-gray-100 mt-2 flex gap-3">
                      {!isAccepted ? (
                        <>
                          <button
                            onClick={() => handleAcceptRequest(item._id)}
                            disabled={acceptingId === item._id}
                            className="flex-1 bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition font-medium flex justify-center items-center gap-2 shadow-sm disabled:opacity-70"
                          >
                            {acceptingId === item._id ? (
                              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Accept
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleCloseItem(item._id)}
                            className="px-4 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium rounded-lg flex items-center shadow-sm"
                          >
                            Close
                          </button>
                        </>
                      ) : (
                        <div className="w-full">
                          <button
                            disabled
                            className="w-full bg-gray-100 text-gray-500 py-2.5 px-4 rounded-lg font-medium cursor-not-allowed border border-gray-200"
                          >
                            {isAcceptedByMe ? 'Accepted by You' : 'Accepted by another Volunteer'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
