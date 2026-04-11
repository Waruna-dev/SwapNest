import React, { useState, useEffect } from 'react';
import API from '../../services/api';

export default function VolunteerPickup() {
  const [loading, setLoading] = useState(true);
  const [pickupRequests, setPickupRequests] = useState([]);
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState('all');
  const [error, setError] = useState('');
  const [volunteers, setVolunteers] = useState([]);
  const [notifying, setNotifying] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState(new Set());
  const [centerAssignments, setCenterAssignments] = useState(new Map()); // Store center assignments for requests
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [nearestCenterForModal, setNearestCenterForModal] = useState(null);
  const [volunteersInNearestCenter, setVolunteersInNearestCenter] = useState([]);

  const handleViewDetails = (request) => {
    // Find nearest center with volunteers for this request
    const userCoords = getLocationCoordinates({
      district: request.userDistrict,
      coordinates: request.userCoordinates
    }, 'user');

    // Calculate distance for each center and find the nearest center
    const centersWithDistance = centers.map(center => {
      const centerCoords = getLocationCoordinates(center, 'center');
      const distance = calculateDistance(userCoords[0], userCoords[1], centerCoords[0], centerCoords[1]);
      
      return {
        ...center,
        distance,
        coordinates: centerCoords
      };
    }).sort((a, b) => a.distance - b.distance);

    // Find the nearest center with volunteers
    let nearestCenterWithVolunteers = null;
    let volunteersInCenter = [];

    for (const center of centersWithDistance) {
      const volunteersInThisCenter = volunteers.filter(volunteer => 
        volunteer.applicationStatus === 'Accepted' && 
        volunteer.phone && 
        volunteer.centerId === center._id
      );

      if (volunteersInThisCenter.length > 0) {
        nearestCenterWithVolunteers = center;
        volunteersInCenter = volunteersInThisCenter;
        break;
      }
    }

    setSelectedRequest(request);
    setNearestCenterForModal(nearestCenterWithVolunteers);
    setVolunteersInNearestCenter(volunteersInCenter);
    setShowDetailsModal(true);
  };

  useEffect(() => {
    loadPickupRequests();
    loadCenters();
    loadVolunteers();
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

  const loadVolunteers = async () => {
    try {
      const response = await API.get('/volunteers');
      const volunteersData = Array.isArray(response.data?.data) ? response.data.data : 
                           Array.isArray(response.data) ? response.data : [];
      setVolunteers(volunteersData);
    } catch (err) {
      console.error('Error loading volunteers:', err);
    }
  };

  const getCenterName = (centerId) => {
    const center = centers.find(c => c._id === centerId);
    return center ? center.name : 'Unknown Center';
  };

  const getStatusBadge = (request) => {
    const status = request.status || 'pending';
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[status] || statusColors.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getDeliveryTypeBadge = (request) => {
    const deliveryType = request.deliveryType || 'pickup';
    const typeColors = {
      pickup: 'bg-orange-100 text-orange-800',
      delivery: 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${typeColors[deliveryType] || typeColors.pickup}`}>
        {deliveryType.charAt(0).toUpperCase() + deliveryType.slice(1)}
      </span>
    );
  };

  const filteredRequests = pickupRequests.filter(request => {
    const matchesCenter = !selectedCenter || request.centerId === selectedCenter;
    const matchesSearch = !searchTerm || 
      request.itemId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDeliveryType = deliveryTypeFilter === 'all' || request.deliveryType === deliveryTypeFilter;
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesCenter && matchesSearch && matchesDeliveryType && matchesStatus;
  });



  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  // Get coordinates for a location (center or user address)
  const getLocationCoordinates = (location, type = 'center') => {
    // Sri Lanka district coordinates (approximate center points) - fallback when precise coordinates not available
    const districtCoordinates = {
      // Districts
      'Colombo':       [6.9271, 79.8612],
      'Gampaha':       [7.0873, 80.0098],
      'Kalutara':      [6.5605, 79.9620],
      'Kandy':         [7.2906, 80.6337],
      'Galle':         [6.0535, 80.2200],
      'Jaffna':        [9.6615, 80.0255],
      'Trincomalee':   [8.5874, 81.2152],
      'Batticaloa':    [7.7102, 81.7067],
      'Ampara':        [7.2964, 81.6884],
      'Kurunegala':    [7.4818, 80.3637],
      'Puttalam':      [7.9823, 79.8338],
      'Anuradhapura':  [8.3114, 80.4037],
      'Polonnaruwa':   [7.9393, 81.0188],
      'Ratnapura':     [6.6828, 80.3984],
      'Kegalle':       [7.2513, 80.3464],
      'Matale':        [7.4675, 80.6234],
      'Nuwara Eliya':  [6.9707, 80.7797],
      'Badulla':       [6.9934, 81.0550],
      'Monaragala':    [6.8703, 81.3524],
      'Hambantota':    [6.1244, 81.1185],
      'Matara':        [5.9548, 80.5550],
      'Mannar':        [8.9790, 79.9043],
      'Kilinochchi':   [9.3803, 80.0982],
      'Vavuniya':      [8.7564, 80.4968],
      'Mullaitivu':    [9.2675, 80.8124],
      // Province name aliases — map to their geographic center
      'Western Province':        [6.9271, 79.8612],  // Colombo
      'Central Province':        [7.2906, 80.6337],  // Kandy
      'Southern Province':       [6.0535, 80.2200],  // Galle
      'Northern Province':       [9.6615, 80.0255],  // Jaffna
      'Eastern Province':        [7.7102, 81.7067],  // Batticaloa
      'North Western Province':  [7.4818, 80.3637],  // Kurunegala
      'North Central Province':  [8.3114, 80.4037],  // Anuradhapura
      'Uva Province':            [6.9934, 81.0550],  // Badulla
      'Sabaragamuwa Province':   [6.6828, 80.3984],  // Ratnapura
    };

    // For centers: try lat/lng fields first, then fall back to district name lookup
    if (type === 'center' && location) {
      const coordinateFields = ['coordinates', 'location', 'latLng', 'latlng', 'geo', 'position'];
      for (const field of coordinateFields) {
        if (location[field]) {
          if (Array.isArray(location[field]) && location[field].length >= 2) return location[field];
          if (typeof location[field] === 'object' && location[field].lat && location[field].lng)
            return [location[field].lat, location[field].lng];
          if (typeof location[field] === 'object' && location[field].latitude && location[field].longitude)
            return [location[field].latitude, location[field].longitude];
        }
      }
      if (location.lat && location.lng)       return [location.lat, location.lng];
      if (location.latitude && location.longitude) return [location.latitude, location.longitude];
      if (location.district) return districtCoordinates[location.district] || [6.9271, 79.8612];
    }

    // For user locations: look up by district name (handles both district and province names)
    const district = location.district || location;
    return districtCoordinates[district] || [6.9271, 79.8612]; // Default to Colombo
  };

  const getNearbyVolunteers = (request) => {

    // Get user location coordinates
    const userCoords = getLocationCoordinates({
      district: request.userDistrict,
      coordinates: request.userCoordinates
    }, 'user');

    console.log('Debug: User coordinates:', userCoords);

    // Calculate distance for each center and find the nearest center
    const centersWithDistance = centers.map(center => {
      const centerCoords = getLocationCoordinates(center, 'center');
      const distance = calculateDistance(userCoords[0], userCoords[1], centerCoords[0], centerCoords[1]);
      return { ...center, distance, coordinates: centerCoords };
    }).sort((a, b) => a.distance - b.distance);

    // Find the nearest center that has accepted volunteers
    // Use String() on both sides to avoid ObjectId vs string mismatch
    for (const center of centersWithDistance) {
      const volunteersInCenter = volunteers.filter(volunteer =>
        volunteer.applicationStatus === 'Accepted' &&
        String(volunteer.centerId) === String(center._id)
      );

      if (volunteersInCenter.length > 0) {
        return {
          volunteers: volunteersInCenter,   // all volunteers — they self-select
          nearestCenter: center,
          maxDistance: center.distance,
          districtsSearched: [center.district]
        };
      }
    }

    return { volunteers: [], nearestCenter: null, maxDistance: 0, districtsSearched: [] };
  };

  const notifyNearbyVolunteers = async (request) => {
    setNotifying(true);
    setError('');

    try {
      const searchResult = getNearbyVolunteers(request);

      if (searchResult.volunteers.length === 0) {
        setError('No centers found with volunteers near this location.');
        return;
      }

      const nearestCenter = searchResult.nearestCenter;
      const centerName = nearestCenter.centerName || nearestCenter._id;
      const centerDistrict = nearestCenter.district;
      const distance = searchResult.maxDistance;

      // Store local UI assignment (center only — volunteers self-select)
      const requestId = request._id || `temp-${request.itemTitle}-${request.userAddress}`;
      setCenterAssignments(prev => new Map(prev).set(requestId, {
        center: nearestCenter,
        volunteerCount: searchResult.volunteers.length,
        volunteerNames: searchResult.volunteers.map(v => `${v.firstName} ${v.lastName}`.trim()),
        distance,
        assignedAt: new Date()
      }));

      // Persist to DB — this makes the item appear in the center's volunteer dashboard
      if (request._id) {
        await API.put(`/simple-volunteer-help/${request._id}/assign-center`, {
          centerId: nearestCenter._id
        });
        setPickupRequests(prev =>
          prev.map(r =>
            r._id === request._id
              ? { ...r, status: 'center_assigned', assignedCenterId: nearestCenter._id }
              : r
          )
        );
      }

      setError(`✅ Request sent to center: ${centerName}, ${centerDistrict} (${distance.toFixed(1)} km away). Volunteers will see it in their dashboard.`);
    } catch (err) {
      setError(`Failed to notify center: ${err.message}`);
    } finally {
      setNotifying(false);
    }
  };

  const handleSelectRequest = (requestId) => {
    const newSelected = new Set(selectedRequests);
    if (newSelected.has(requestId)) {
      newSelected.delete(requestId);
    } else {
      newSelected.add(requestId);
    }
    setSelectedRequests(newSelected);
  };

  const handleSelectAll = () => {
    const pendingRequests = filteredRequests.filter(r => !r.status || r.status === 'pending');
    if (selectedRequests.size === pendingRequests.length) {
      setSelectedRequests(new Set());
    } else {
      setSelectedRequests(new Set(pendingRequests.map(r => r._id || `temp-${r.itemTitle}-${r.userAddress}`)));
    }
  };

  const notifySelectedVolunteers = async () => {
    if (selectedRequests.size === 0) {
      setError('Please select at least one request to notify volunteers');
      return;
    }

    setNotifying(true);
    setError('');

    try {
      let processedCount = 0;
      let skippedCount = 0;
      const centerSummary = {};
      const newAssignments = new Map(centerAssignments);

      for (const requestId of selectedRequests) {
        const request = filteredRequests.find(
          r => (r._id || `temp-${r.itemTitle}-${r.userAddress}`) === requestId
        );
        if (!request) continue;

        const searchResult = getNearbyVolunteers(request);
        if (searchResult.volunteers.length === 0) {
          skippedCount++;
          continue;
        }

        const nearestCenter = searchResult.nearestCenter;
        const centerKey = `${nearestCenter.centerName || nearestCenter._id}, ${nearestCenter.district}`;
        if (!centerSummary[centerKey]) centerSummary[centerKey] = { count: 0, distance: searchResult.maxDistance };
        centerSummary[centerKey].count++;

        // Store in local state
        newAssignments.set(requestId, {
          center: nearestCenter,
          volunteer: searchResult.selectedVolunteer,
          distance: searchResult.maxDistance,
          assignedAt: new Date()
        });

        // Persist to DB
        if (request._id) {
          try {
            await API.put(`/simple-volunteer-help/${request._id}/assign-center`, {
              centerId: nearestCenter._id
            });
            setPickupRequests(prev =>
              prev.map(r =>
                r._id === request._id
                  ? { ...r, status: 'center_assigned', assignedCenterId: nearestCenter._id }
                  : r
              )
            );
            processedCount++;
          } catch (apiErr) {
            console.error('Failed to assign request to center:', apiErr);
          }
        }
      }

      setCenterAssignments(newAssignments);

      if (processedCount > 0) {
        const centerDetails = Object.entries(centerSummary)
          .map(([center, info]) => `${center} (${info.distance.toFixed(1)} km)`)
          .join(', ');
        setError(`✅ ${processedCount} request${processedCount > 1 ? 's' : ''} sent to nearest centers: ${centerDetails}. Volunteers will see them in their dashboards.`);
        setSelectedRequests(new Set());
      } else {
        setError(skippedCount > 0 ? 'No centers with volunteers found near selected requests.' : 'No requests could be processed.');
      }
    } catch (err) {
      setError(`Failed to notify centers: ${err.message}`);
    } finally {
      setNotifying(false);
    }
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        {/* Bulk Actions */}
        {statusFilter === 'all' || statusFilter === 'pending' ? (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedRequests.size === filteredRequests.filter(r => !r.status || r.status === 'pending').length && filteredRequests.filter(r => !r.status || r.status === 'pending').length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-blue-900">
                  Select All ({filteredRequests.filter(r => !r.status || r.status === 'pending').length} pending)
                </span>
                {selectedRequests.size > 0 && (
                  <span className="text-sm text-blue-700">
                    ({selectedRequests.size} selected)
                  </span>
                )}
              </div>
              {selectedRequests.size > 0 && (
                <button
                  onClick={notifySelectedVolunteers}
                  disabled={notifying}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {notifying ? 'Notifying...' : `Notify Selected (${selectedRequests.size})`}
                </button>
              )}
            </div>
          </div>
        ) : null}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Item ID..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Type
            </label>
            <select
              value={deliveryTypeFilter}
              onChange={(e) => setDeliveryTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="pickup">Pickup</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>

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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

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
            <div key={request._id || index} className="relative bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Checkbox for selection */}
              {(!request.status || request.status === 'pending') && (statusFilter === 'all' || statusFilter === 'pending') ? (
                <div className="absolute top-4 left-4">
                  <input
                    type="checkbox"
                    checked={selectedRequests.has(request._id || `temp-${request.itemTitle}-${request.userAddress}`)}
                    onChange={() => handleSelectRequest(request._id || `temp-${request.itemTitle}-${request.userAddress}`)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              ) : null}
              <div className={`flex justify-between items-start mb-4 ${(!request.status || request.status === 'pending') && (statusFilter === 'all' || statusFilter === 'pending') ? 'ml-8' : ''}`}>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {request.itemTitle || 'Unknown Item'}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(request)}
                    {getDeliveryTypeBadge(request)}
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

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    {request.deliveryType === 'delivery' ? 'Delivery Location' : 'Pickup Location'}
                  </h4>
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
                    <div className="flex">
                      <span className="text-gray-500 w-20">Map:</span>
                      <a href={`https://www.google.com/maps/search/?api=1&query=${request.userAddress}`} target="_blank" rel="noopener noreferrer">
                        <span className="text-gray-900">View on Map</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

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

              {/* Center Assignment Display — shown after admin clicks Notify */}
              {(() => {
                const requestId = request._id || `temp-${request.itemTitle}-${request.userAddress}`;
                const assignment = centerAssignments.get(requestId);
                const isCenterAssigned = request.status === 'center_assigned' || !!assignment;
                if (!isCenterAssigned) return null;

                const centerName    = assignment?.center?.centerName || 'Nearest Center';
                const centerDistrict = assignment?.center?.district || '';
                const distance      = assignment?.distance;
                const volNames      = assignment?.volunteerNames || [];
                const volCount      = assignment?.volunteerCount || volNames.length;
                const assignedAt    = assignment?.assignedAt;

                return (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-2 flex-1">
                        <span className="text-base mt-0.5">📢</span>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-blue-800">
                            Sent to center: {centerName}{centerDistrict ? `, ${centerDistrict}` : ''}
                            {distance ? ` (${distance.toFixed(1)} km away)` : ''}
                          </div>

                          {/* Volunteer name list */}
                          {volNames.length > 0 ? (
                            <div className="mt-1.5">
                              <div className="text-xs text-blue-600 font-medium mb-1">
                                {volCount} volunteer{volCount > 1 ? 's' : ''} can see this request:
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {volNames.map((name, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    👤 {name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-blue-600 mt-0.5">
                              {volCount ? `${volCount} volunteer${volCount > 1 ? 's' : ''} can see this request` : 'Volunteers can see this request'}
                            </div>
                          )}

                          <div className="text-xs text-blue-500 mt-1 italic">
                            Waiting for a volunteer to accept…
                          </div>
                        </div>
                      </div>
                      {assignedAt && (
                        <div className="text-xs text-blue-400 flex-shrink-0">
                          {new Date(assignedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {(() => {
                const requestId = request._id || `temp-${request.itemTitle}-${request.userAddress}`;
                const isNotified = request.status === 'center_assigned' || request.status === 'accepted' || centerAssignments.has(requestId);
                return (
                  <div className="flex gap-2 mt-4 pt-4 border-t items-center">
                    {isNotified ? (
                      <button
                        disabled
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg cursor-default font-medium text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Notified
                      </button>
                    ) : (
                      <button
                        onClick={() => notifyNearbyVolunteers(request)}
                        disabled={notifying}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                      >
                        {notifying ? 'Notifying...' : 'Notify Volunteer'}
                      </button>
                    )}
                    <button
                      onClick={() => handleViewDetails(request)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                      View Details
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                      Mark Complete
                    </button>
                  </div>
                );
              })()}
            </div>
          ))
        )}
      </div>

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

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Pickup Request Details</h2>
                  <p className="text-gray-600">Complete information about this pickup request</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Request Information */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-500">Item:</span>
                      <div className="text-gray-900">{selectedRequest.itemTitle || 'N/A'}</div>
                    </div>
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-500">Category:</span>
                      <div className="text-gray-900">{selectedRequest.itemCategory || 'N/A'}</div>
                    </div>
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-500">Type:</span>
                      <div>{getDeliveryTypeBadge(selectedRequest)}</div>
                    </div>
                  </div>
                  <div>
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-500">User Name:</span>
                      <div className="text-gray-900">{selectedRequest.userName || 'N/A'}</div>
                    </div>
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-500">Contact:</span>
                      <div className="text-gray-900">{selectedRequest.userPhone || 'N/A'}</div>
                    </div>
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-500">Email:</span>
                      <div className="text-gray-900">{selectedRequest.userEmail || 'N/A'}</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm font-medium text-gray-500">Location:</span>
                  <div className="text-gray-900">
                    {selectedRequest.userAddress}, {selectedRequest.userCity}, {selectedRequest.userDistrict}
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-sm font-medium text-gray-500">Additional Notes:</span>
                  <div className="text-gray-900">
                    {selectedRequest.pickupNotes || selectedRequest.userNotes || 'No additional notes'}
                  </div>
                </div>
              </div>

              {/* Nearest Center Information */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">
                  Nearest Center with Volunteers
                </h3>
                {nearestCenterForModal ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="mb-3">
                          <span className="text-sm font-medium text-blue-700">Center Name:</span>
                          <div className="text-blue-900 font-semibold">
                            {nearestCenterForModal.centerName || nearestCenterForModal._id}
                          </div>
                        </div>
                        <div className="mb-3">
                          <span className="text-sm font-medium text-blue-700">District:</span>
                          <div className="text-blue-900">{nearestCenterForModal.district}</div>
                        </div>
                        <div className="mb-3">
                          <span className="text-sm font-medium text-blue-700">City:</span>
                          <div className="text-blue-900">{nearestCenterForModal.city || 'N/A'}</div>
                        </div>
                      </div>
                      <div>
                        <div className="mb-3">
                          <span className="text-sm font-medium text-blue-700">Distance:</span>
                          <div className="text-blue-900 font-semibold">
                            {nearestCenterForModal.distance?.toFixed(2)} km away
                          </div>
                        </div>
                        <div className="mb-3">
                          <span className="text-sm font-medium text-blue-700">Contact:</span>
                          <div className="text-blue-900">{nearestCenterForModal.contactNumber || 'N/A'}</div>
                        </div>
                        <div className="mb-3">
                          <span className="text-sm font-medium text-blue-700">Email:</span>
                          <div className="text-blue-900">{nearestCenterForModal.email || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-600">
                    No centers with volunteers found in the area
                  </div>
                )}
              </div>

              {/* Volunteers in Nearest Center */}
              {volunteersInNearestCenter.length > 0 && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">
                    Volunteers at {nearestCenterForModal?.centerName || 'Nearest Center'} 
                    <span className="text-sm font-normal text-green-700 ml-2">
                      ({volunteersInNearestCenter.length} available)
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {volunteersInNearestCenter.map((volunteer, index) => (
                      <div key={volunteer._id || index} className="bg-white rounded-lg p-3 border border-green-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-green-900">
                              {volunteer.firstName} {volunteer.lastName}
                            </div>
                            <div className="text-sm text-green-700">
                              {volunteer.phone}
                            </div>
                            <div className="text-sm text-green-700">
                              {volunteer.email}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-green-600">
                              Status: {volunteer.applicationStatus}
                            </div>
                            <div className="text-xs text-green-600">
                              District: {volunteer.district}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    notifyNearbyVolunteers(selectedRequest);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Notify Volunteer
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
