import React, { useState, useEffect } from 'react';
import API from '../../services/api';

export default function VolunteerPickup() {
  const [loading, setLoading] = useState(true);
  const [pickupRequests, setPickupRequests] = useState([]);
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    loadPickupRequests();
    loadCenters();
  }, []);

  const loadPickupRequests = async () => {
    try {
      setLoading(true);
      const response = await API.get('/simple-volunteer-help');
      const requests = Array.isArray(response.data?.data) ? response.data.data : 
                      Array.isArray(response.data) ? response.data : [];
      setPickupRequests(requests);
    } catch (err) {
      console.error('Error loading pickup requests:', err);
      setError('Failed to load pickup requests');
    } finally {
      setLoading(false);
    }
  };

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

  const getCenterName = (centerId) => {
    const center = centers.find(c => c._id === centerId);
    return center ? center.name : 'Unknown Center';
  };

  const filteredRequests = pickupRequests.filter(request => {
    const matchesCenter = !selectedCenter || request.centerId === selectedCenter;
    const matchesSearch = !searchTerm || 
      request.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.itemTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userAddress?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCenter && matchesSearch;
  });

  const getStatusBadge = (request) => {
    // You can add status logic here based on your backend data
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
        Pending
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Volunteer Pickup Requests</h1>
        <p className="text-gray-600">Manage and organize volunteer pickup requests</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, item, or address..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Center Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Center
            </label>
            <select
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Centers</option>
              {centers.map(center => (
                <option key={center._id} value={center._id}>
                  {center.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Pickup Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-400 text-lg mb-2">No pickup requests found</div>
            <p className="text-gray-500">
              {searchTerm || selectedCenter ? 'Try adjusting your filters' : 'No requests have been submitted yet'}
            </p>
          </div>
        ) : (
          filteredRequests.map((request, index) => (
            <div key={request._id || index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {request.itemTitle || 'Unknown Item'}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(request)}
                    <span className="text-sm text-gray-500">
                      Request ID: {request._id?.slice(-8) || `#${index + 1}`}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {new Date(request.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* User Information */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">User Information</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex">
                      <span className="text-gray-500 w-20">Name:</span>
                      <span className="text-gray-900">{request.userName || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-20">Email:</span>
                      <span className="text-gray-900">{request.userEmail || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-20">Phone:</span>
                      <span className="text-gray-900">{request.userPhone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Pickup Location</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex">
                      <span className="text-gray-500 w-20">Address:</span>
                      <span className="text-gray-900">{request.userAddress || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-20">City:</span>
                      <span className="text-gray-900">{request.userCity || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 w-20">District:</span>
                      <span className="text-gray-900">{request.userDistrict || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Item Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex">
                        <span className="text-gray-500 w-20">Category:</span>
                        <span className="text-gray-900">{request.itemCategory || 'N/A'}</span>
                      </div>
                      <div className="flex">
                        <span className="text-gray-500 w-20">Center:</span>
                        <span className="text-gray-900">{getCenterName(request.centerId)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
                    <div className="text-sm text-gray-600">
                      {request.pickupNotes || request.userNotes || 'No additional notes'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Assign Volunteer
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  View Details
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Mark Complete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{pickupRequests.length}</div>
            <div className="text-sm text-gray-500">Total Requests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {pickupRequests.filter(r => !r.status || r.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {pickupRequests.filter(r => r.status === 'assigned').length}
            </div>
            <div className="text-sm text-gray-500">Assigned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {pickupRequests.filter(r => r.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
}