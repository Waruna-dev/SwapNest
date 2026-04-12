import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const fallbackApiBase = "http://localhost:5000";

const NgoEdit = () => {
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(true); // Start in edit mode for self-profile

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    district: '',
    center: '',
    status: '',
    skills: '',
    availability: '',
    motivation: '',
    livesImpacted: 1
  });

  // Load current user's profile data on component mount
  useEffect(() => {
    loadCurrentUserProfile();
  }, []);

  const loadCurrentUserProfile = async () => {
    setLoading(true);
    setError('');

    try {
      // Get current user data from localStorage
      const storedUser = localStorage.getItem('swapnest_user');
      const userEmail = localStorage.getItem('user_email');
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        const userId = userData._id || userData.id;

        try {
          let volunteerData = null;

          if (userId) {
            // Fetch by ID
            let response;
            try {
              response = await API.get(`/volunteers/${userId}`);
            } catch (apiError) {
              response = await fetch(`${fallbackApiBase}/volunteers/${userId}`);
              response = await response.json();
            }
            volunteerData = response.data || response;
          } else if (userData.email) {
            // Fallback: Fetch all, find by email from old session missing ID
            let response;
            try {
              response = await API.get(`/volunteers`);
            } catch (apiError) {
              response = await fetch(`${fallbackApiBase}/volunteers`);
              response = await response.json();
            }
            const allVolunteers = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
            volunteerData = allVolunteers.find(v => v.email === userData.email);
          }

          if (volunteerData && (volunteerData._id || volunteerData.id)) {
            setVolunteer(volunteerData);
            
            // Update local storage to have the ID if it was missing
            if (!userId) {
              const updatedUserData = { ...userData, _id: volunteerData._id || volunteerData.id };
              localStorage.setItem('swapnest_user', JSON.stringify(updatedUserData));
            }

            setFormData({
              firstName: volunteerData.firstName || userData.username || '',
              lastName: volunteerData.lastName || '',
              email: volunteerData.email || userData.email || '',
              phone: volunteerData.phone || '',
              district: volunteerData.district || '',
              center: volunteerData.center || '',
              status: volunteerData.status || 'active',
              skills: volunteerData.skills || '',
              availability: volunteerData.availability || '',
              motivation: volunteerData.motivation || '',
              livesImpacted: volunteerData.livesImpacted || 1
            });
          } else {
            throw new Error("Could not fetch volunteer details");
          }
        } catch (fetchError) {
          // If API fails, use localStorage data as fallback
          setVolunteer(userData);
          setFormData({
            firstName: userData.username || '',
            lastName: '',
            email: userData.email || '',
            phone: '',
            district: '',
            center: '',
            status: 'active',
            skills: '',
            availability: '',
            motivation: '',
            livesImpacted: 1
          });
        }
      }
    } catch (err) {
      setError('Failed to load your profile data.');
    } finally {
      setLoading(false);
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
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const volunteerId = volunteer?._id || volunteer?.id;
      if (!volunteerId) {
        setError('Unable to update profile: Missing volunteer ID');
        return;
      }

      let response;
      try {
        response = await API.put(`/volunteers/${volunteerId}`, formData);
      } catch (apiError) {
        response = await fetch(`${fallbackApiBase}/volunteers/${volunteerId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
        response = await response.json();
      }

      if (response.data || response.success) {
        setSuccess('Your profile has been updated successfully!');
        
        // Refresh volunteer data
        const updatedData = response.data || response;
        setVolunteer(updatedData);
        setFormData({
          firstName: updatedData.firstName || '',
          lastName: updatedData.lastName || '',
          email: updatedData.email || '',
          phone: updatedData.phone || '',
          district: updatedData.district || '',
          center: updatedData.center || '',
          status: updatedData.status || 'active',
          skills: updatedData.skills || '',
          availability: updatedData.availability || '',
          motivation: updatedData.motivation || '',
          livesImpacted: updatedData.livesImpacted || 1
        });

        // Update localStorage with new user data
        const updatedUserData = {
          username: updatedData.firstName || formData.firstName,
          email: updatedData.email || formData.email,
          role: 'volunteer'
        };
        localStorage.setItem('swapnest_user', JSON.stringify(updatedUserData));
      } else {
        setError('Failed to update your profile information');
      }
    } catch (err) {
      setError('Failed to update your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    loadCurrentUserProfile(); // Reload current user data
    setError('');
    setSuccess('');
    setEditMode(true);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Edit Your Profile</h2>
        <p className="text-gray-600">Update your personal information and volunteer details</p>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading your profile...</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Your Profile Information */}
      {volunteer && !loading && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Your Profile Information
            </h3>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Reset Changes
            </button>
          </div>

          {editMode ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Center
                  </label>
                  <input
                    type="text"
                    name="center"
                    value={formData.center}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lives Impacted
                  </label>
                  <input
                    type="number"
                    name="livesImpacted"
                    value={formData.livesImpacted}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills
                </label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Teaching, Healthcare, Construction..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <textarea
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Weekends, Evenings, Flexible..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivation
                </label>
                <textarea
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Why do you want to volunteer?"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Your Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Name</h4>
                  <p className="text-gray-900">
                    {volunteer.firstName} {volunteer.lastName}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                  <p className="text-gray-900">{volunteer.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Phone</h4>
                  <p className="text-gray-900">{volunteer.phone || 'Not provided'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">District</h4>
                  <p className="text-gray-900">{volunteer.district || 'Not provided'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Center</h4>
                  <p className="text-gray-900">{volunteer.center || 'Not assigned'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    volunteer.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : volunteer.status === 'inactive'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {volunteer.status || 'Active'}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Lives Impacted</h4>
                  <p className="text-gray-900">{volunteer.livesImpacted || 1}</p>
                </div>
              </div>

              {volunteer.skills && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Skills</h4>
                  <p className="text-gray-900">{volunteer.skills}</p>
                </div>
              )}

              {volunteer.availability && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Availability</h4>
                  <p className="text-gray-900">{volunteer.availability}</p>
                </div>
              )}

              {volunteer.motivation && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Motivation</h4>
                  <p className="text-gray-900">{volunteer.motivation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NgoEdit;