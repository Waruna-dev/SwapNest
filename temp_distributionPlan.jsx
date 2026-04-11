import React, { useState, useEffect } from 'react';
import API from '../../services/api';

export default function DistributionPlan() {
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [statusFilter, setStatusFilter] = useState('all'); // all, to_be_collected, center_received

  useEffect(() => {
    loadDistributions();
  }, []);

  const loadDistributions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await API.get('/simple-volunteer-help');
      const allRequests = res.data?.data || res.data || [];
      
      // Filter for items that volunteers have accepted to collect, or have already brought to the center
      const validRequests = allRequests.filter(r => r.status === 'accepted' || r.status === 'center_received');
      
      const mappedData = validRequests.map(r => ({
        id: r._id,
        centerName: r.assignedCenterId?.name || r.assignedCenterId?.centerName || r.centerId?.name || r.centerId?.centerName || 'Unknown Center',
        volunteerName: r.assignedVolunteerId ? `${r.assignedVolunteerId.firstName} ${r.assignedVolunteerId.lastName}` : 'Unknown Volunteer',
        itemId: r.itemId,
        status: r.status === 'center_received' ? 'center_received' : 'to_be_collected',
        givenDateTime: r.updatedAt ? new Date(r.updatedAt).toLocaleString() : 'Pending'
      }));
      
      setDistributions(mappedData);
    } catch (err) {
      console.error('Error loading distributions:', err);
      setError('Failed to load distribution data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newUIStatus) => {
    try {
      let backendStatus;
      if (newUIStatus === 'to_be_collected') {
        backendStatus = 'accepted';
      } else if (newUIStatus === 'center_received') {
        backendStatus = 'center_received';
      } else if (newUIStatus === 'completed') {
        backendStatus = 'completed';
      }
      
      await API.put(`/simple-volunteer-help/${id}/status`, { status: backendStatus });
      setDistributions(prev => prev.map(d => d.id === id ? { ...d, status: newUIStatus, givenDateTime: new Date().toLocaleString() } : d));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  // Filter distributions based on search term and status
  const filteredDistributions = distributions.filter(distribution => {
    const matchesSearch = searchTerm === '' || distribution.itemId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || distribution.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading distribution data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Center Received
          </h1>
          <p className="text-gray-600 mt-2">
            Items distributed to centers by volunteers
          </p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="w-full max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Item ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 pl-3 pr-8 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="to_be_collected">To be Collected</option>
              <option value="center_received">Center Received</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Center Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volunteer Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDistributions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2" />
                        </svg>
                        <p className="text-lg font-medium">No distribution records found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {searchTerm ? `No results found for "${searchTerm}"` : 'Items distributed to centers will appear here'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDistributions.map((distribution, index) => (
                    <tr key={distribution.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {distribution.centerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {distribution.volunteerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {distribution.itemId}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={distribution.status}
                          onChange={(e) => handleStatusChange(distribution.id, e.target.value)}
                          className={`text-xs font-medium rounded-full px-2.5 py-1 py-1.5 focus:outline-none cursor-pointer border-0 ${
                            distribution.status === 'center_received' 
                            ? 'bg-green-100 text-green-800 focus:ring-green-500'
                            : distribution.status === 'completed'
                            ? 'bg-gray-100 text-gray-800 focus:ring-gray-500'
                            : 'bg-yellow-100 text-yellow-800 focus:ring-yellow-500'
                          }`}
                        >
                          <option value="to_be_collected">To be Collected</option>
                          <option value="center_received">Center Received</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {distribution.status === 'center_received' ? distribution.givenDateTime : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {distributions.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {distributions.length} distribution records
            </p>
            <button
              onClick={loadDistributions}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

