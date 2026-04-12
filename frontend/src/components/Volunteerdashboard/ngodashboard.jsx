import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import NgoOverview from './ngooverview';
import NgoEdit from './ngoedit';
import DeliveryAll from './DeliveryAll';

export default function NGODashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load user from localStorage (set during login)
  const storedUser = localStorage.getItem('swapnest_user');
  const userData = storedUser ? JSON.parse(storedUser) : {
    username: 'Volunteer User',
    email: 'volunteer@example.com',
    role: 'volunteer',
    centerId: null,
    _id: null,
  };

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);
  const [requestError, setRequestError] = useState('');
  
  // Activity state
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [activityError, setActivityError] = useState('');

  // Centers state
  const [centers, setCenters] = useState([]);

  // Keep centerId in state so it updates when we re-fetch from backend
  const [centerId, setCenterId] = useState(userData.centerId || null);
  const [volunteerId, setVolunteerId] = useState(userData._id || null);
  const [displayName, setDisplayName] = useState(
    userData.username || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Volunteer'
  );
  const [volunteerDistrict, setVolunteerDistrict] = useState(userData.district || null);

  // Load centers data
  const loadCenters = useCallback(async () => {
    try {
      const response = await API.get('/centers');
      const centersData = Array.isArray(response.data?.data) ? response.data.data : 
                         Array.isArray(response.data) ? response.data : [];
      setCenters(centersData);
    } catch (err) {
      console.error('Error loading centers:', err);
    }
  }, []);

  // On mount: always re-fetch volunteer profile from backend
  // so centerId reflects any admin changes made after last login
  useEffect(() => {
    const syncProfile = async () => {
      if (!userData.email) return;
      try {
        const res = await API.get('/volunteers');
        const all = Array.isArray(res.data) ? res.data
                  : Array.isArray(res.data?.data) ? res.data.data : [];
        const me = all.find(v => v.email === userData.email);
        if (me) {
          // centerId can be an ObjectId object or a string
          const newCenterId = me.centerId?._id || me.centerId;
          setCenterId(newCenterId);
          setVolunteerId(me._id);
          setDisplayName(
            me.username || `${me.firstName || ''} ${me.lastName || ''}`.trim() || 'Volunteer'
          );
          // Update localStorage with fresh data
          localStorage.setItem('swapnest_user', JSON.stringify({
            ...userData,
            centerId: newCenterId,
            _id: me._id,
            firstName: me.firstName,
            lastName: me.lastName,
            username: me.username,
            district: me.district,
          }));
          setVolunteerDistrict(me.district);
        }
      } catch (err) {
        console.error('Error syncing volunteer profile:', err);
      }
    };
    
    // Load both profile and centers on mount
    Promise.all([syncProfile(), loadCenters()]);
  }, [userData.email, loadCenters]);

  const loadCenterRequests = useCallback(async () => {
    if (!centerId) {
      setRequestError('Your account is not assigned to a center yet. Please contact your admin.');
      return;
    }
    try {
      setLoadingRequests(true);
      setRequestError('');
      
      // Fetch requests from volunteer's center
      const res = await API.get(`/simple-volunteer-help/center/${centerId}`);
      const centerRequests = Array.isArray(res.data?.data) ? res.data.data : [];
      
      // Fetch all notified items (center_assigned requests from all centers)
      const allRes = await API.get('/simple-volunteer-help');
      const allRequests = Array.isArray(allRes.data?.data) ? allRes.data.data : [];
      
      // Combine center requests and notified items
      const combinedRequests = [...centerRequests, ...allRequests];
      
      // Filter requests from same district and not accepted by others
      const relevantRequests = combinedRequests.filter(request => {
        
        // Get volunteer's assigned center
        const volunteerCenter = centers.find(c => String(c._id) === String(centerId));
        const centerDistrict = volunteerCenter?.district;
        
        // Filter by assigned center's district
        if (centerDistrict && request.userDistrict !== centerDistrict) {
          return false;
        }
        
        // Filter out requests accepted by other volunteers, but keep own accepted requests
        const isAcceptedByOthers = request.status === 'accepted' && 
          request.assignedVolunteerId && 
          String(request.assignedVolunteerId?._id || request.assignedVolunteerId) !== String(volunteerId);
        
        return !isAcceptedByOthers;
      });
      
      // Fetch item details for each request to get images
      const requestsWithImages = await Promise.all(
        relevantRequests.map(async (request) => {
          try {
            if (request.itemId) {
              const itemRes = await API.get(`/items/${request.itemId}`);
              const itemData = itemRes.data;
              return {
                ...request,
                itemDetails: itemData
              };
            }
            return request;
          } catch (err) {
            console.error('Error fetching item details:', err);
            return {
              ...request,
              itemDetails: null
            };
          }
        })
      );
      
      setRequests(requestsWithImages);
    } catch (err) {
      console.error('Error loading center requests:', err);
      setRequestError('Failed to load requests. Please try again.');
    } finally {
      setLoadingRequests(false);
    }
  }, [centerId, centers, volunteerId]);

  const loadActivities = useCallback(async () => {
    if (!volunteerId) {
      setActivityError('Could not identify your volunteer account. Please log out and log in again.');
      return;
    }
    try {
      setLoadingActivities(true);
      setActivityError('');
      const res = await API.get(`/simple-volunteer-help/volunteer/${volunteerId}`);
      const activitiesData = Array.isArray(res.data?.data) ? res.data.data : [];
      
      // Fetch item details for each activity to get images
      const activitiesWithImages = await Promise.all(
        activitiesData.map(async (activity) => {
          try {
            const itemRes = await API.get(`/items/${activity.itemId}`);
            const itemData = itemRes.data;
            return {
              ...activity,
              itemDetails: itemData
            };
          } catch (err) {
            console.error('Error fetching item details:', err);
            return {
              ...activity,
              itemDetails: null
            };
          }
        })
      );
      
      setActivities(activitiesWithImages);
    } catch (err) {
      console.error('Error loading activities:', err);
      setActivityError('Failed to load activities. Please try again.');
    } finally {
      setLoadingActivities(false);
    }
  }, [volunteerId]);

  useEffect(() => {
    if (activeTab === 'my-requests') {
      loadCenterRequests();
    }
  }, [activeTab, loadCenterRequests]);

  useEffect(() => {
    if (activeTab === 'activity') {
      loadActivities();
    }
  }, [activeTab, loadActivities]);

  const handleAcceptRequest = async (requestId) => {
    if (!volunteerId) {
      alert('Could not identify your volunteer account. Please log out and log in again.');
      return;
    }
    try {
      setAcceptingId(requestId);
      await API.put(`/simple-volunteer-help/${requestId}/accept`, { volunteerId });
      setRequests(prev =>
        prev.map(r =>
          r._id === requestId
            ? {
                ...r,
                status: 'accepted',
                assignedVolunteerId: {
                  _id: volunteerId,
                  firstName: userData.firstName || displayName,
                  lastName: userData.lastName || '',
                },
              }
            : r
        )
      );
      // Refresh activities after accepting a request
      if (activeTab === 'activity') {
        loadActivities();
      }
      
      // Send notification
      const requestDetails = requests.find(r => r._id === requestId);
      if (requestDetails) {
        await API.post('/notifications', {
          userId: requestDetails.userId,
          title: 'Volunteer Assigned',
          message: `Your request for "${requestDetails.itemTitle || 'an item'}" has been accepted by our volunteer ${displayName}.`,
          type: 'volunteer_accept'
        }).catch(e => console.error('Notification failed to send', e));
      }
      
      // Show success message
      alert('Request accepted successfully! User has been notified.');
      
      // Refresh data after a short delay to ensure consistency across all volunteers
      setTimeout(() => {
        loadCenterRequests();
      }, 1000);
    } catch (error) {
      console.error('Failed to accept request:', error);
      alert('Failed to accept request. Please try again.');
      // Refresh data on error to restore correct state
      loadCenterRequests();
    } finally {
      setAcceptingId(null);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      setAcceptingId(requestId);
      await API.put(`/simple-volunteer-help/${requestId}/cancel`);
      setRequests(prev =>
        prev.map(r =>
          r._id === requestId
            ? { ...r, status: 'center_assigned', cancelledAt: new Date() }
            : r
        )
      );
      setActivities(prev => prev.filter(a => a._id !== requestId));
      
      // Send notification
      const activityDetails = activities.find(a => a._id === requestId) || requests.find(r => r._id === requestId);
      if (activityDetails) {
        await API.post('/notifications', {
          userId: activityDetails.userId,
          title: 'Volunteer Unassigned',
          message: `The volunteer assigned to your request for "${activityDetails.itemTitle || 'an item'}" has stepped down. Your request is now back in our available pool and will be picked up shortly.`,
          type: 'volunteer_cancel'
        }).catch(e => console.error('Notification failed to send', e));
      }

      // Refresh data after a short delay to ensure consistency across all volunteers
      setTimeout(() => {
        loadCenterRequests();
        loadActivities();
      }, 1000);
      alert('Request closed and returned to available volunteers pool.');
    } catch (error) {
      console.error('Failed to cancel request:', error);
      alert('Failed to close request. Please try again.');
      // Refresh data on error to restore correct state
      loadCenterRequests();
      loadActivities();
    } finally {
      setAcceptingId(null);
    }
  };

  const handleContactUser = async (activity) => {
    try {
      // Send notification/message to user
      const messageData = {
        userId: activity.userId,
        title: 'Volunteer Contact',
        message: `Hi ${activity.userName}, I have accepted your request for "${activity.itemTitle}". I will contact you soon to arrange the ${activity.deliveryType}.`,
        volunteerId: volunteerId,
        volunteerName: displayName,
        itemId: activity.itemId,
        itemTitle: activity.itemTitle,
        type: 'volunteer_contact'
      };

      await API.post('/notifications', messageData);
      alert('Request accepted successfully! User has been notified.');
    } catch (error) {
      console.error('Failed to send message to user:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const getProfileInitial = (name) => (name ? name.charAt(0).toUpperCase() : 'V');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getStatusBadge = (status) => {
    const map = {
      pending:         { bg: 'bg-yellow-100 text-yellow-800',  label: 'Pending' },
      center_assigned: { bg: 'bg-purple-100 text-purple-800',  label: 'Awaiting Acceptance' },
      accepted:        { bg: 'bg-indigo-100 text-indigo-800',  label: 'Accepted' },
      assigned:        { bg: 'bg-blue-100   text-blue-800',    label: 'Assigned' },
      completed:       { bg: 'bg-green-100  text-green-800',   label: 'Completed' },
      cancelled:       { bg: 'bg-red-100    text-red-800',     label: 'Cancelled' },
    };
    const s = map[status] || map.pending;
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${s.bg}`}>{s.label}</span>;
  };

  const getTypeBadge = (type) => {
    const map = {
      pickup:   { bg: 'bg-orange-100 text-orange-800', label: 'Pickup' },
      delivery: { bg: 'bg-teal-100   text-teal-800',   label: 'Delivery' },
    };
    const t = map[type] || map.pickup;
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${t.bg}`}>{t.label}</span>;
  };

  const getCenterName = (centerId) => {
    if (!centerId) return 'Unknown Center';
    const centerObj = centers.find(c => c._id === centerId || c._id === centerId._id);
    return centerObj ? (centerObj.centerName || centerObj.name) : 'Unknown Center';
  };

  const navItems = [
    { id: 'overview',     label: 'Overview',     icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'my-requests',  label: 'My Requests',  icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'delivery-all', label: 'Delivery All',  icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'activity',     label: 'Activity',     icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  const pendingCount = requests.filter(r => r.status === 'center_assigned').length;

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Sidebar ── */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-indigo-900 shadow-lg transition-all duration-300 ease-in-out flex flex-col flex-shrink-0`}>
        <div className="p-4 flex flex-col h-full">

          {/* Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mb-6 p-2 rounded-lg hover:bg-indigo-800 transition-colors self-start"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Profile */}
          <div className="mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-900 font-semibold text-lg flex-shrink-0">
                {getProfileInitial(displayName)}
              </div>
              {sidebarOpen && (
                <div className="overflow-hidden">
                  <h3 className="font-semibold text-white truncate">{displayName}</h3>
                  <p className="text-sm text-indigo-200 truncate">{userData.email}</p>
                  <span className="inline-block px-2 py-0.5 bg-indigo-800 text-indigo-100 rounded-full text-xs mt-1">
                    {userData.role || 'volunteer'}
                  </span>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button
                onClick={() => setActiveTab('edit-profile')}
                className="mt-3 w-full flex items-center justify-center space-x-2 px-3 py-2 bg-indigo-800 text-indigo-100 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {/* Nav */}
          <nav className="space-y-1 flex-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  activeTab === item.id ? 'bg-white text-indigo-900 font-semibold' : 'text-indigo-200 hover:bg-indigo-800'
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {sidebarOpen && <span>{item.label}</span>}
                {sidebarOpen && item.id === 'my-requests' && pendingCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-bold text-gray-900">
                {getGreeting()}, {displayName}
              </h1>
              <div className="flex items-center gap-3">
                <button onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-900 text-sm">
                  Back to Home
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('swapnest_token');
                    localStorage.removeItem('swapnest_user');
                    localStorage.removeItem('user_email');
                    navigate('/login');
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">

          {/* Overview */}
          {activeTab === 'overview' && <NgoOverview />}

          {/* My Requests */}
          {activeTab === 'my-requests' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Nearby Assigments</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Pickup and delivery tasks located near your assigned center. Accept the ones you can handle.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={loadCenterRequests}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>
              </div>

              {requestError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {requestError}
                </div>
              )}

              {loadingRequests ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                      <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : !centerId ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
                  <div className="text-4xl mb-3">🏢</div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-1">No Center Assigned</h3>
                  <p className="text-yellow-700">You are not assigned to any center yet. Contact admin.</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
                  <div className="text-5xl mb-4">?</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Requests Nearby</h3>
                  <p className="text-gray-500 text-sm">
                    There are currently no items that need to be handled near your center's district.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => {
                    const isAccepted    = request.status === 'accepted';
                    const acceptedById  = request.assignedVolunteerId?._id || request.assignedVolunteerId;
                    const isAcceptedByMe = isAccepted && String(acceptedById) === String(volunteerId);
                    const canAccept     = request.status === 'center_assigned';
                    const isAccepting   = acceptingId === request._id;

                    return (
                      <div key={request._id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                        {/* Card Header with Image */}
                        <div className="relative h-48 bg-gradient-to-r from-orange-400 to-orange-600">
                          {/* Item Image */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            {request.itemDetails?.images?.length > 0 ? (
                              <img
                                src={request.itemDetails.images[0]}
                                alt={request.itemTitle}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center text-white">
                                <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <p className="text-sm">No Image Available</p>
                              </div>
                            )}
                          </div>

                          {/* Status Badge Overlay */}
                          <div className="absolute top-4 right-4">
                            {getStatusBadge(request.status)}
                          </div>

                          {/* Price/Mode Badge */}
                          <div className="absolute bottom-4 left-4">
                            <span className="px-3 py-1 bg-white/90 backdrop-blur text-orange-600 rounded-full text-sm font-semibold">
                              {request.itemDetails?.mode === 'Free' ? 'Free' : request.itemDetails?.mode || 'Delivery'}
                            </span>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-6">
                          {/* Item Title and Basic Info */}
                          <div className="mb-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {request.itemTitle || 'Unknown Item'}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                {request.itemCategory || 'Uncategorized'}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(request.createdAt || Date.now()).toLocaleDateString()}
                              </span>
                              <span className="text-xs text-gray-500">
                                ID: {request._id?.slice(-8)}
                              </span>
                            </div>
                          </div>

                          {/* User and Location Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <h4 className="font-semibold text-gray-700 mb-2 text-sm">Customer Information</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  <span className="text-gray-900">{request.userName || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  <span className="text-gray-900">{request.userPhone || 'N/A'}</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-3">
                              <h4 className="font-semibold text-blue-700 mb-2 text-sm">Delivery Location</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-start gap-2">
                                  <svg className="w-4 h-4 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span className="text-gray-900">{request.userAddress || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  <span className="text-gray-900">{request.userCity || 'N/A'}, {request.userDistrict || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Additional Details */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-700 text-sm">Additional Information</h4>
                              <span className="text-xs text-gray-500">
                                Center: {getCenterName(request.centerId || request.assignedCenterId)}
                              </span>
                            </div>
                            {request.pickupNotes || request.userNotes ? (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-gray-700">
                                <svg className="w-4 h-4 inline mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                {request.pickupNotes || request.userNotes}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500 italic">No additional notes</div>
                            )}
                          </div>

                          {/* Accepted-by banner */}
                          {isAccepted && (
                            <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-lg text-sm text-indigo-700">
                              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {isAcceptedByMe
                                ? 'You accepted this request.'
                                : `Accepted by ${request.assignedVolunteerId?.firstName || 'another volunteer'} ${request.assignedVolunteerId?.lastName || ''}`}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-4 border-t border-gray-100">
                            {canAccept ? (
                              <>
                                <button
                                  onClick={() => handleAcceptRequest(request._id)}
                                  disabled={isAccepting}
                                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  {isAccepting ? 'Accepting...' : 'Accept'}
                                </button>
                                <button
                                  onClick={() => handleCancelRequest(request._id)}
                                  disabled={isAccepting}
                                  className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <div className="flex items-center justify-center w-full py-2.5 bg-gray-100 text-gray-600 rounded-lg font-medium">
                                {isAcceptedByMe ? 'Accepted by You' : isAccepted ? 'Taken by another volunteer' : 'Not Available'}
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
          )}

          {/* Edit Profile */}
          {activeTab === 'edit-profile' && <NgoEdit />}

          {/* Delivery All */}
          {activeTab === 'delivery-all' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <DeliveryAll />
              </div>
            </div>
          )}

          {/* Activity */}
          {activeTab === 'activity' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">My Activity</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Items you have accepted for pickup/delivery
                  </p>
                </div>
                <button
                  onClick={loadActivities}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>

              {activityError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {activityError}
                </div>
              )}

              {loadingActivities ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
                  <div className="text-5xl mb-4">📋</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Activity Yet</h3>
                  <p className="text-gray-500 text-sm">
                    When you accept pickup/delivery requests, they will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        {/* Item Image */}
                        <div className="flex-shrink-0">
                          {activity.itemDetails?.coverImage?.url || activity.itemDetails?.images?.[0]?.url ? (
                            <img
                              src={activity.itemDetails.coverImage?.url || activity.itemDetails.images[0].url}
                              alt={activity.itemTitle}
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Activity Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {activity.itemTitle || 'Unknown Item'}
                              </h3>
                              <div className="flex items-center gap-2 mb-2">
                                {activity.status === 'center_received' ? (
                                  <span className="px-3 py-1 bg-gradient-to-r from-yellow-300 to-amber-500 text-yellow-900 border border-amber-500 shadow-sm text-xs font-bold rounded-full flex items-center gap-1 shadow-amber-200">
                                    🌟 Mission Successful!
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                    ✓ Accepted
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  Item ID: {activity.itemId || 'N/A'}
                                </span>
                                <span className="text-xs text-gray-400">
                                  #{activity._id?.slice(-8)}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date(activity.createdAt || Date.now()).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-1">User Information</h4>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500">Name:</span>
                                  <span className="text-gray-900 font-medium">{activity.userName || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500">Phone:</span>
                                  <a href={`tel:${activity.userPhone}`} className="text-indigo-600 hover:underline font-medium">
                                    {activity.userPhone || 'N/A'}
                                  </a>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500">Type:</span>
                                  <span className="text-gray-900 capitalize">{activity.deliveryType || 'N/A'}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-700 mb-1">Location</h4>
                              <div className="space-y-1">
                                <div className="text-gray-900">{activity.userAddress || 'N/A'}</div>
                                <div className="text-gray-600">{activity.userCity || 'N/A'}</div>
                                <div className="text-gray-600">{activity.userDistrict || 'N/A'}</div>
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([activity.userAddress, activity.userCity, activity.userDistrict].filter(Boolean).join(', '))}`}
                                  target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline mt-1"
                                >📍 View on Map</a>
                              </div>
                              <h4 className="font-semibold text-gray-700 mb-1 mt-4 border-t border-gray-100 pt-3">Assignment Details</h4>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-gray-500 font-medium">Center:</span>
                                  <span className="text-gray-900 font-medium">{activity.assignedCenterId?.name || activity.assignedCenterId?.centerName || activity.centerId?.name || activity.centerId?.centerName || 'Unknown Center'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-gray-500 font-medium">Volunteer:</span>
                                  <span className="text-gray-900 font-medium">{activity.assignedVolunteerId ? `${activity.assignedVolunteerId.firstName} ${activity.assignedVolunteerId.lastName}` : 'Unassigned'}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {activity.status === 'center_received' ? (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <div className="flex items-center justify-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-lg">
                                <p className="text-green-800 font-medium text-sm flex items-center gap-2">
                                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  Great job! You securely delivered this item. Thank you for your service!
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                              <button 
                                onClick={() => handleContactUser(activity)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                Contact User
                              </button>
                              <button 
                                onClick={() => handleCancelRequest(activity._id)}
                                disabled={acceptingId === activity._id}
                                className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                {acceptingId === activity._id ? 'Closing...' : 'Close Task'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
