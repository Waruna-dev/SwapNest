import React, { useState, useEffect } from 'react';
import API from "../../services/api";

export default function VolunteerViewModal({ centerId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [error, setError] = useState("");

  const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Get center details
        const centerRes = await API.get(`/api/centers/${centerId}`);
        console.log("Center API response:", centerRes.data);
        
        // Handle different response structures
        let centerData = centerRes.data;
        if (centerRes.data?.data) {
          centerData = centerRes.data.data;
        }
        
        console.log("Center data set:", centerData);
        setCenter(centerData);

        // Get assigned volunteers
        console.log("Fetching volunteers for centerId:", centerId);
        const volunteerRes = await API.get(`/api/volunteers/center?centerId=${centerId}`);
        console.log("API response:", volunteerRes);
        
        const volunteerData = Array.isArray(volunteerRes.data?.data) ? volunteerRes.data.data : 
                             Array.isArray(volunteerRes.data) ? volunteerRes.data : [];
        console.log("Volunteers array:", volunteerData);
        
        setVolunteers(volunteerData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load volunteer information. Please try again.");
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (centerId) {
      fetchData();
    }
  }, [centerId]);

  // Add refresh function
  const refreshData = () => {
    if (centerId) {
      fetchData();
    }
  };

  const assignedCount = volunteers.length;
  const capacity = center?.capacity || 0;
  const availableSlots = capacity - assignedCount;
  const capacityPercentage = capacity > 0 ? (assignedCount / capacity) * 100 : 0;
  
  console.log("Capacity calculation:", {
    center,
    capacity,
    assignedCount,
    availableSlots,
    capacityPercentage
  });

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🏢 {center?.centerName}</h2>
            <p className="text-gray-600">📍 {center?.city}, {center?.district}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        {/* Capacity Overview */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Capacity Overview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">{capacity}</div>
              <div className="text-sm text-gray-600">Total Capacity</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{assignedCount}</div>
              <div className="text-sm text-gray-600">Currently Assigned</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{availableSlots}</div>
              <div className="text-sm text-gray-600">Available Slots</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className={`text-2xl font-bold ${availableSlots > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {availableSlots > 0 ? '✅ Open' : '🔴 Full'}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Capacity Usage</span>
              <span>{capacityPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  capacityPercentage < 50 ? 'bg-green-500' : 
                  capacityPercentage < 80 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Volunteers Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">👥 Assigned Volunteers ({assignedCount})</h3>
            <div className="text-sm text-gray-600">
              {assignedCount === 0 ? 'No volunteers assigned yet' : `${assignedCount} volunteers`}
            </div>
          </div>

          {volunteers.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Ready for Volunteers!</h4>
              <p className="text-gray-600">This center is ready to accept volunteers. Assign volunteers from the volunteer dashboard to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {volunteers.map((volunteer, index) => (
                <div key={volunteer._id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {index + 1}. {volunteer.firstName} {volunteer.lastName}
                      </h4>
                      <div className="text-sm text-gray-600 mt-1">
                        <div>📧 {volunteer.email}</div>
                        <div>📱 {volunteer.phone || 'No phone'}</div>
                        <div>📍 {volunteer.city}, {volunteer.district}</div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        volunteer.applicationStatus === 'Accepted' ? 'bg-green-100 text-green-800' :
                        volunteer.applicationStatus === 'Assigned' ? 'bg-blue-100 text-blue-800' :
                        volunteer.applicationStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {volunteer.applicationStatus || 'Pending'}
                      </span>
                    </div>
                  </div>
                  
                  {volunteer.skills && volunteer.skills.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-600 mb-1">Skills:</div>
                      <div className="flex flex-wrap gap-1">
                        {volunteer.skills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                        {volunteer.skills.length > 3 && (
                          <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            +{volunteer.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={refreshData}
            disabled={loading}
            className="px-6 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Refreshing..." : "🔄 Refresh Data"}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
