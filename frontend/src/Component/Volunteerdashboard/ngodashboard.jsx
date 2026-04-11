import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import NgoOverview from './ngooverview';
import NgoEdit from './ngoedit';

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

  // Keep centerId in state so it updates when we re-fetch from backend
  const [centerId, setCenterId] = useState(userData.centerId || null);
  const [volunteerId, setVolunteerId] = useState(userData._id || null);
  const [displayName, setDisplayName] = useState(
    userData.username || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Volunteer'
  );

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
          const cid = me.centerId
            ? (typeof me.centerId === 'object' ? (me.centerId._id || String(me.centerId)) : me.centerId)
            : null;
          if (cid) setCenterId(cid);
          if (me._id) setVolunteerId(me._id);
          const name = `${me.firstName || ''} ${me.lastName || ''}`.trim() || userData.email;
          setDisplayName(name);

          // Refresh localStorage so next page load is instant
          const updated = {
            ...userData,
            centerId: cid,
            _id: me._id,
            firstName: me.firstName,
            lastName: me.lastName,
            username: name,
          };
          localStorage.setItem('swapnest_user', JSON.stringify(updated));
        }
      } catch (err) {
        console.error('Could not sync volunteer profile:', err);
      }
    };
    syncProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCenterRequests = useCallback(async () => {
    if (!centerId) {
      setRequestError('Your account is not assigned to a center yet. Please contact your admin.');
      return;
    }
    try {
      setLoadingRequests(true);
      setRequestError('');
      const res = await API.get(`/simple-volunteer-help/center/${centerId}`);
      setRequests(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error('Error loading center requests:', err);
      setRequestError('Failed to load requests. Please try again.');
    } finally {
      setLoadingRequests(false);
    }
  }, [centerId]);

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
    } catch (error) {
      console.error('Failed to accept request:', error);
      alert('Failed to accept request. Please try again.');
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
      alert('Message sent to user successfully!');
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

  const navItems = [
    { id: 'overview',     label: 'Overview',     icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'my-requests',  label: 'My Requests',  icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
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
                  <h2 className="text-2xl font-bold text-gray-900">My Center Requests</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Requests sent to your center. Accept the ones you can handle.
                  </p>
                </div>
                <button
                  onClick={loadCenterRequests}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
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
                  <p className="text-yellow-700 text-sm">You are not assigned to any center yet. Contact admin.</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
                  <div className="text-5xl mb-4">📭</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Requests Yet</h3>
                  <p className="text-gray-500 text-sm">
                    When an admin notifies your center, pickup/delivery requests will appear here.
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
                      <div
                        key={request._id}
                        className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all ${
                          canAccept ? 'border-purple-200 shadow-purple-50' : 'border-gray-200'
                        }`}
                      >
                        {/* Card header */}
                        <div className={`px-6 py-3 flex items-center justify-between ${
                          canAccept ? 'bg-purple-50' : isAccepted ? 'bg-indigo-50' : 'bg-gray-50'
                        }`}>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(request.status)}
                            {getTypeBadge(request.deliveryType)}
                            <span className="text-xs text-gray-400">#{request._id?.slice(-8)}</span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(request.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        {/* Card body */}
                        <div className="p-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">{request.itemTitle || 'Unknown Item'}</h3>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">

                            {/* User */}
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">User Information</h4>
                              <div className="space-y-1.5 text-sm">
                                <div className="flex gap-2"><span className="text-gray-500 w-14 flex-shrink-0">Name:</span><span className="text-gray-800 font-medium">{request.userName || 'N/A'}</span></div>
                                <div className="flex gap-2"><span className="text-gray-500 w-14 flex-shrink-0">Phone:</span><a href={`tel:${request.userPhone}`} className="text-indigo-600 hover:underline font-medium">{request.userPhone || 'N/A'}</a></div>
                                <div className="flex gap-2"><span className="text-gray-500 w-14 flex-shrink-0">Email:</span><a href={`mailto:${request.userEmail}`} className="text-indigo-600 hover:underline text-xs">{request.userEmail || 'N/A'}</a></div>
                              </div>
                            </div>

                            {/* Location */}
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">
                                {request.deliveryType === 'delivery' ? 'Delivery' : 'Pickup'} Location
                              </h4>
                              <div className="space-y-1 text-sm">
                                <div className="text-gray-800">{request.userAddress || 'N/A'}</div>
                                <div className="text-gray-600">{request.userCity || 'N/A'}</div>
                                <div className="text-gray-600">{request.userDistrict || 'N/A'}</div>
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([request.userAddress, request.userCity, request.userDistrict].filter(Boolean).join(', '))}`}
                                  target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline mt-1"
                                >📍 View on Map</a>
                              </div>
                            </div>

                            {/* Item */}
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Item Details</h4>
                              <div className="space-y-1.5 text-sm">
                                <div className="flex gap-2"><span className="text-gray-500 w-20 flex-shrink-0">Category:</span><span className="text-gray-800">{request.itemCategory || 'N/A'}</span></div>
                                <div className="flex gap-2"><span className="text-gray-500 w-20 flex-shrink-0">Type:</span><span className="text-gray-800 capitalize">{request.deliveryType || 'N/A'}</span></div>
                                {(request.pickupNotes || request.userNotes) && (
                                  <div className="mt-2 p-2 bg-gray-50 rounded-lg text-xs text-gray-600">
                                    📝 {request.pickupNotes || request.userNotes}
                                  </div>
                                )}
                              </div>
                            </div>
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

                          {/* Action row */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <span className="text-xs text-gray-400">
                              {canAccept && '⚡ Action required — accept if you can handle this.'}
                            </span>
                            <div className="flex gap-2">
                              {canAccept && (
                                <button
                                  onClick={() => handleAcceptRequest(request._id)}
                                  disabled={isAccepting}
                                  className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm text-white transition-all ${
                                    isAccepting ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg'
                                  }`}
                                >
                                  {isAccepting ? (
                                    <><svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>Accepting...</>
                                  ) : <>✅ Accept Request</>}
                                </button>
                              )}
                              {isAcceptedByMe && (
                                <span className="flex items-center gap-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                                  ✓ Accepted by You
                                </span>
                              )}
                              {isAccepted && !isAcceptedByMe && (
                                <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm">
                                  Taken by another volunteer
                                </span>
                              )}
                            </div>
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
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                  ✓ Accepted
                                </span>
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
                            </div>
                          </div>

                          {/* Action Buttons */}
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
                          </div>
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
