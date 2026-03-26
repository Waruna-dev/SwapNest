import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

function safeGetCentersArrayFromJson(json) {
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json)) return json;
  return [];
}

function formatNumber(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return "0";
  return n.toLocaleString();
}

function StatusBadge({ status }) {
  const statusStyles = {
    Active: "bg-green-100 text-green-800 border-green-200",
    Inactive: "bg-red-100 text-red-800 border-red-200",
    "Under Maintenance": "bg-yellow-100 text-yellow-800 border-yellow-200",
  };
  
  const style = statusStyles[status] || "bg-gray-100 text-gray-800 border-gray-200";
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {status || "Unknown"}
    </span>
  );
}

export default function DashboardCenters() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [centers, setCenters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterCapacity, setFilterCapacity] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCenters() {
      setLoading(true);
      setError("");

      try {
        const res = await API.get("/api/centers");
        let centersData = [];
        
        if (Array.isArray(res.data?.data)) {
          centersData = res.data.data;
        } else if (Array.isArray(res.data)) {
          centersData = res.data;
        }

        if (!cancelled) {
          setCenters(centersData);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error loading centers:", err);
          
          // Fallback to fetch if API fails
          try {
            const response = await fetch("http://localhost:5000/api/centers");
            const data = await response.json();
            const centersData = safeGetCentersArrayFromJson(data);
            setCenters(centersData);
          } catch (fallbackErr) {
            setError("Failed to load centers. Please try again later.");
          }
          setLoading(false);
        }
      }
    }

    loadCenters();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCenters = centers.filter(center => {
    const matchesSearch = !searchTerm || 
      center.centerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.managerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || center.status === filterStatus;
    const matchesDistrict = !filterDistrict || center.district === filterDistrict;
    const matchesCapacity = !filterCapacity || 
      (filterCapacity === "small" && center.capacity <= 50) ||
      (filterCapacity === "medium" && center.capacity > 50 && center.capacity <= 100) ||
      (filterCapacity === "large" && center.capacity > 100);
    
    return matchesSearch && matchesStatus && matchesDistrict && matchesCapacity;
  });

  const handleAddCenter = () => {
    navigate('/dashboard/add-center');
  };

  const handleViewCenter = (centerId) => {
    // Navigate to center details or edit page
    console.log("View center:", centerId);
  };

  const handleEditCenter = (centerId) => {
    navigate(`/dashboard/center/${centerId}/edit`);
  };

  const handleDeleteCenter = async (centerId) => {
    if (window.confirm("Are you sure you want to delete this center?")) {
      try {
        await API.delete(`/api/centers/${centerId}`);
        setCenters(centers.filter(c => c._id !== centerId));
      } catch (err) {
        console.error("Error deleting center:", err);
        alert("Failed to delete center. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-[#F5F0E8] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-black tracking-tight text-[#1A1A1A]">
              Centers Management
            </h1>
          </div>
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="animate-pulse">
              <div className="h-4 bg-zinc-200 rounded w-1/4 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-zinc-100 rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F5F0E8] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#1A1A1A] flex items-center gap-3">
              <span className="text-3xl">🏢</span>
              Volunteer Centers
            </h1>
            <p className="text-zinc-500 mt-2">
              Manage all SwapNest centers across the network
            </p>
          </div>
          <button
            onClick={handleAddCenter}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 transform hover:scale-105"
          >
            <span className="text-lg">➕</span>
            Add New Center
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Search Centers
              </label>
              <input
                type="text"
                placeholder="Search by name, district, city, manager, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>
          
          {/* Advanced Search Toggle */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
            >
              <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Advanced Search
            </button>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("");
                setFilterDistrict("");
                setFilterCapacity("");
              }}
              className="text-zinc-500 hover:text-zinc-700 text-sm transition-colors"
            >
              Clear All Filters
            </button>
          </div>
          
          {/* Advanced Search Options */}
          {showAdvanced && (
            <div className="border-t border-zinc-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Filter by District
                </label>
                <select
                  value={filterDistrict}
                  onChange={(e) => setFilterDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">All Districts</option>
                  <option value="Colombo">Colombo</option>
                  <option value="Gampaha">Gampaha</option>
                  <option value="Kalutara">Kalutara</option>
                  <option value="Kandy">Kandy</option>
                  <option value="Galle">Galle</option>
                  <option value="Matara">Matara</option>
                  <option value="Jaffna">Jaffna</option>
                  <option value="Trincomalee">Trincomalee</option>
                  <option value="Kurunegala">Kurunegala</option>
                  <option value="Ratnapura">Ratnapura</option>
                  <option value="Badulla">Badulla</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Filter by Capacity
                </label>
                <select
                  value={filterCapacity}
                  onChange={(e) => setFilterCapacity(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">All Capacities</option>
                  <option value="small">Small (≤ 50 volunteers)</option>
                  <option value="medium">Medium (51-100 volunteers)</option>
                  <option value="large">Large (&gt; 100 volunteers)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Centers Table */}
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-lg">
          <div className="px-6 py-5 border-b border-zinc-200 bg-gradient-to-r from-emerald-50 to-teal-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                  <span className="text-2xl">🏢</span>
                  All Centers ({filteredCenters.length})
                </h2>
                <p className="text-sm text-zinc-600 mt-1">Manage your SwapNest center network</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-zinc-500">
                  {filteredCenters.filter(c => c.status === 'Active').length} active
                </div>
                <div className="w-px h-6 bg-zinc-300"></div>
                <div className="text-sm text-zinc-500">
                  {centers.length - filteredCenters.filter(c => c.status === 'Active').length} inactive
                </div>
              </div>
            </div>
          </div>
          
          {filteredCenters.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-lg font-medium text-zinc-900 mb-2">
                {searchTerm || filterStatus ? "No centers found" : "No centers registered yet"}
              </h3>
              <p className="text-zinc-500 mb-4">
                {searchTerm || filterStatus 
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding your first center"
                }
              </p>
              {!searchTerm && !filterStatus && (
                <button
                  onClick={handleAddCenter}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 mx-auto"
                >
                  Add Your First Center
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Center Name
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Manager
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {filteredCenters.map((center) => (
                    <tr key={center._id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <div className="font-medium text-zinc-900">
                            {center.centerName}
                          </div>
                          <div className="text-sm text-zinc-500">
                            {center.centerCode}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <div className="text-sm text-zinc-900">
                            {center.city}, {center.district}
                          </div>
                          <div className="text-sm text-zinc-500 truncate max-w-xs">
                            {center.address}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <div className="text-sm text-zinc-900">
                            {center.email}
                          </div>
                          <div className="text-sm text-zinc-500">
                            {center.contactNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-zinc-900">
                          {formatNumber(center.capacity)} volunteers
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={center.status} />
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <div className="text-sm text-zinc-900">
                            {center.managerName}
                          </div>
                          <div className="text-sm text-zinc-500">
                            {center.managerContact}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewCenter(center._id)}
                            className="text-emerald-600 hover:text-emerald-900 font-medium text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditCenter(center._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCenter(center._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="text-2xl mb-2">🏢</div>
            <div className="text-3xl font-black text-zinc-900">
              {formatNumber(centers.length)}
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">
              Total Centers
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="text-2xl mb-2">✅</div>
            <div className="text-3xl font-black text-emerald-800">
              {formatNumber(centers.filter(c => c.status === 'Active').length)}
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">
              Active Centers
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="text-2xl mb-2">👥</div>
            <div className="text-3xl font-black text-amber-800">
              {formatNumber(centers.reduce((sum, c) => sum + (Number(c.capacity) || 0), 0))}
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">
              Total Capacity
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="text-2xl mb-2">📍</div>
            <div className="text-3xl font-black text-zinc-900">
              {formatNumber(new Set(centers.map(c => c.district).filter(Boolean)).size)}
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">
              Districts Covered
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}