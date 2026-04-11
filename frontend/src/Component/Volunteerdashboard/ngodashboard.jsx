import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NgoOverview from './ngooverview';
import NgoEdit from './ngoedit';

export default function NGODashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Mock user data for interface demonstration
  const userData = {
    username: 'John Doe',
    email: 'john.doe@example.com',
    role: 'volunteer'
  };

  // Mock data for demonstration
  const mockStats = {
    totalRequests: 12,
    pendingRequests: 3,
    completedRequests: 8,
    pickupRequests: 7,
    deliveryRequests: 5,
    thisMonth: 4
  };

  const mockRequests = [
    {
      _id: '1',
      itemTitle: 'Old Furniture Set',
      itemCategory: 'Furniture',
      deliveryType: 'pickup',
      status: 'pending',
      createdAt: new Date('2024-01-15'),
      userAddress: '123 Main Street',
      userCity: 'Colombo',
      userDistrict: 'Western Province'
    },
    {
      _id: '2',
      itemTitle: 'Children Books',
      itemCategory: 'Books',
      deliveryType: 'delivery',
      status: 'completed',
      createdAt: new Date('2024-01-10'),
      userAddress: '456 Oak Avenue',
      userCity: 'Kandy',
      userDistrict: 'Central Province'
    }
  ];

  const getProfileInitial = (email) => {
    return email ? email.charAt(0).toUpperCase() : 'U';
  };

  const generateDefaultStats = (requests) => {
    return {
      totalRequests: requests.length,
      pendingRequests: requests.filter(r => !r.status || r.status === 'pending').length,
      completedRequests: requests.filter(r => r.status === 'completed').length,
      pickupRequests: requests.filter(r => r.deliveryType === 'pickup').length,
      deliveryRequests: requests.filter(r => r.deliveryType === 'delivery').length,
      thisMonth: requests.filter(r => {
        const requestDate = new Date(r.createdAt || Date.now());
        const currentDate = new Date();
        return requestDate.getMonth() === currentDate.getMonth() && 
               requestDate.getFullYear() === currentDate.getFullYear();
      }).length
    };
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[status] || statusColors.pending}`}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending'}
      </span>
    );
  };

  const getDeliveryTypeBadge = (type) => {
    const typeColors = {
      pickup: 'bg-orange-100 text-orange-800',
      delivery: 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${typeColors[type] || typeColors.pickup}`}>
        {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Pickup'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Side Panel */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-indigo-900 shadow-lg transition-all duration-300 ease-in-out`}>
        <div className="p-4">
          {/* Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mb-6 p-2 rounded-lg hover:bg-indigo-800 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Profile Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-3">
              {/* Profile Circle with Initial */}
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-900 font-semibold text-lg">
                {getProfileInitial(userData.email)}
              </div>
              {sidebarOpen && (
                <div>
                  <h3 className="font-semibold text-white">{userData.username}</h3>
                  <p className="text-sm text-indigo-200">{userData.email}</p>
                  <span className="inline-block px-2 py-1 bg-indigo-800 text-indigo-100 rounded-full text-xs mt-1">
                    {userData.role}
                  </span>
                </div>
              )}
            </div>
            {/* Edit Profile Button */}
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

          {/* Navigation Menu */}
          {sidebarOpen && (
            <nav className="space-y-2">
              {[
                { id: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                { id: 'edit-volunteer', label: 'Edit Volunteer', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
                { id: 'my-requests', label: 'My Requests', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                { id: 'activity', label: 'Activity', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-white text-indigo-900'
                      : 'text-indigo-200 hover:bg-indigo-800'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          )}

          {/* Logout Button */}
          <div className="mt-auto pt-8">
            <button
              onClick={() => {
                // Simple logout for now
                alert('Logout functionality will be implemented later');
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-300 hover:bg-red-900 hover:text-red-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-full px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Volunteer Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => navigate('/')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 lg:p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && <NgoOverview />}

          {/* My Requests Tab */}
          {activeTab === 'my-requests' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">My Volunteer Requests</h2>
              
              {mockRequests.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                  <div className="text-gray-400 text-lg mb-2">No requests found</div>
                  <p className="text-gray-500 mb-4">You haven't made any volunteer requests yet</p>
                  <button 
                    onClick={() => navigate('/item/gallery')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Browse Items to Help
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {mockRequests.map((request, index) => (
                    <div key={request._id || index} className="bg-white p-6 rounded-lg shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{request.itemTitle}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            {getStatusBadge(request.status)}
                            {getDeliveryTypeBadge(request.deliveryType)}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(request.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Request Details</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>Category: {request.itemCategory || 'N/A'}</div>
                            <div>Type: {request.deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}</div>
                            <div>Status: {request.status || 'Pending'}</div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>{request.userAddress || 'N/A'}</div>
                            <div>{request.userCity || 'N/A'}, {request.userDistrict || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Edit Profile Tab */}
          {activeTab === 'edit-profile' && <NgoEdit />}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
              
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <div className="text-gray-400 text-lg mb-2">No recent activity</div>
                <p className="text-gray-500">Your volunteer activity will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}