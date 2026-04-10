import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

export default function SimpleVolunteerHelp({ 
  isOpen, 
  onClose, 
  itemData, 
  onSuccess 
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userPhone: '',
    userAddress: '',
    userCity: 'Colombo',
    userDistrict: 'Western Province',
    pickupNotes: '',
    userNotes: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadCenters();
      loadUserData();
    }
  }, [isOpen]);

  const loadCenters = async () => {
    try {
      const response = await API.get('/centers');
      const centersData = Array.isArray(response.data?.data) ? response.data.data : 
                         Array.isArray(response.data) ? response.data : [];
      setCenters(centersData);
    } catch (err) {
      console.error('Error loading centers:', err);
      setError('Failed to load centers');
    }
  };

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('swapnest_token');
      if (token) {
        const response = await API.get('/users/me');
        const userData = response.data;
        
        setFormData(prev => ({
          ...prev,
          userName: userData.username || prev.userName,
          userEmail: userData.email || prev.userEmail
        }));
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCenter) {
      setError('Please select a pickup center');
      return;
    }

    // Validate required fields
    if (!formData.userName || !formData.userEmail || !formData.userPhone || !formData.userAddress) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const requestData = {
        itemId: itemData.itemId || itemData._id,
        itemTitle: itemData.title,
        itemCategory: itemData.category,
        ...formData,
        centerId: selectedCenter
      };

      console.log('Submitting volunteer help request:', requestData);

      const response = await API.post('/simple-volunteer-help', requestData);
      
      if (response.data?.success) {
        setSuccess('Volunteer help request submitted successfully!');
        setTimeout(() => {
          onSuccess && onSuccess();
          onClose();
        }, 2000);
      } else {
        throw new Error(response.data?.message || 'Failed to submit request');
      }
    } catch (err) {
      console.error('Error submitting request:', err);
      setError(err.response?.data?.message || err.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Request Volunteer Pickup</h2>
              <p className="text-orange-200">
                Get help with your free item donation
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-orange-300 text-2xl font-bold leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Item Summary */}
        {itemData && (
          <div className="bg-orange-100 border-l-4 border-orange-600 p-4 m-6">
            <h3 className="font-semibold text-orange-900 mb-2">Item Details</h3>
            <div className="text-sm text-orange-800">
              <p><strong>Title:</strong> {itemData.title}</p>
              <p><strong>Category:</strong> {itemData.category}</p>
              <p><strong>Mode:</strong> Free</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User Details */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="userEmail"
                  value={formData.userEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="userPhone"
                  value={formData.userPhone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
                  placeholder="+94 77 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District *
                </label>
                <input
                  type="text"
                  name="userDistrict"
                  value={formData.userDistrict}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
                  placeholder="Western Province"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="userCity"
                  value={formData.userCity}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
                  placeholder="Colombo"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Address *
                </label>
                <textarea
                  name="userAddress"
                  value={formData.userAddress}
                  onChange={handleInputChange}
                  required
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
                  placeholder="123 Main Street, Colombo 01"
                />
              </div>
            </div>
          </div>

          {/* Pickup Details */}
          <div className="bg-orange-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-orange-900">Pickup Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-orange-800 mb-1">
                  Select Pickup Center *
                </label>
                <select
                  value={selectedCenter}
                  onChange={(e) => setSelectedCenter(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
                >
                  <option value="">Choose a center...</option>
                  {centers.map(center => (
                    <option key={center._id} value={center._id}>
                      {center.centerName} - {center.city}, {center.district}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-800 mb-1">
                  Pickup Notes
                </label>
                <textarea
                  name="pickupNotes"
                  value={formData.pickupNotes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
                  placeholder="Any special instructions for pickup"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-800 mb-1">
                  Additional Notes
                </label>
                <textarea
                  name="userNotes"
                  value={formData.userNotes}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-orange-400 rounded-lg focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
                  placeholder="Any additional information"
                />
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-gray-300 bg-white px-6 font-headline font-semibold text-gray-700 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-600 to-orange-700 px-6 font-headline font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
