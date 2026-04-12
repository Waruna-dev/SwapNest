import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';

const fallbackApiBase = "http://localhost:5000";

function safeGetArrayFromJson(json) {
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json)) return json;
  return [];
}

const NgoOverview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [volunteers, setVolunteers] = useState([]);
  const [centers, setCenters] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      const apiReqs = [
        API.get("/volunteers"),
        API.get("/centers"),
      ];

      const [volRes, cenRes] = await Promise.allSettled(apiReqs);

      const tryExtractVolunteers = () => {
        if (volRes.status === "fulfilled") {
          return Array.isArray(volRes.value?.data) ? volRes.value.data : volRes.value?.data?.data ?? [];
        }
        return null;
      };

      const tryExtractCenters = () => {
        if (cenRes.status === "fulfilled") {
          return Array.isArray(cenRes.value?.data?.data) ? cenRes.value.data.data : cenRes.value?.data?.data ?? [];
        }
        return null;
      };

      let nextVolunteers = tryExtractVolunteers();
      let nextCenters = tryExtractCenters();

      if (nextVolunteers == null || nextCenters == null) {
        try {
          const [vJson, cJson] = await Promise.all([
            fetch(`${fallbackApiBase}/volunteers`).then((r) => r.json()),
            fetch(`${fallbackApiBase}/centers`).then((r) => r.json()),
          ]);

          if (nextVolunteers == null) nextVolunteers = Array.isArray(vJson) ? vJson : [];
          if (nextCenters == null) nextCenters = safeGetArrayFromJson(cJson);
        } catch (e) {
          if (!cancelled) {
            setError("Could not load overview data. Is the backend running?");
          }
        }
      }

      if (!cancelled) {
        setVolunteers(nextVolunteers || []);
        setCenters(nextCenters || []);
        setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = {
    activeVolunteers: volunteers.filter(v => v.status === 'active' || !v.status).length,
    communityCenters: centers.length,
    livesImpacted: volunteers.reduce((sum, v) => sum + (Number(v.livesImpacted) || 1), 0)
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-semibold text-gray-800 mb-2">NGO Overview</h2>
          <p className="text-lg text-gray-600">Loading volunteer management dashboard...</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="flex justify-center items-center">
            <div className="w-full max-w-md h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
          </div>
          <div className="flex flex-col gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-semibold text-gray-800 mb-2">NGO Overview</h2>
        <p className="text-lg text-gray-600">Welcome to volunteer management dashboard</p>
        {error && <p className="text-red-600 mt-3 text-sm font-bold">{error}</p>}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="flex justify-center items-center">
          <img 
            src="/src/pictures/bfe39a414f6a4c4d7fac5ee09ad3d734.jpg" 
            alt="NGO Overview" 
            className="w-full max-w-md h-auto rounded-2xl shadow-lg transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-xl animate-fade-in-up"
          />
        </div>
        
        <div className="flex flex-col gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">Dedicated to making a positive impact in our community through volunteer-driven initiatives and sustainable programs.</p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Statistics</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg transition-colors duration-300 hover:bg-gray-100">
                <span className="block text-3xl font-bold text-blue-500 mb-2">{stats.activeVolunteers}+</span>
                <span className="text-sm text-gray-600 font-medium">Active Volunteers</span>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg transition-colors duration-300 hover:bg-gray-100">
                <span className="block text-3xl font-bold text-blue-500 mb-2">{stats.communityCenters}+</span>
                <span className="text-sm text-gray-600 font-medium">Community Centers</span>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg transition-colors duration-300 hover:bg-gray-100">
                <span className="block text-3xl font-bold text-blue-500 mb-2">{stats.livesImpacted}+</span>
                <span className="text-sm text-gray-600 font-medium">Lives Impacted</span>
              </div>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Why SwapNest Matters</h3>
            <ul className="space-y-3">
              <li className="py-2 border-b border-gray-200 text-gray-600 relative pl-6 transition-colors duration-300 hover:text-gray-800 last:border-b-0 before:content-['>'] before:absolute before:left-0 before:text-blue-500 before:font-bold">Empowering communities through resource sharing and collaboration</li>
              <li className="py-2 border-b border-gray-200 text-gray-600 relative pl-6 transition-colors duration-300 hover:text-gray-800 last:border-b-0 before:content-['>'] before:absolute before:left-0 before:text-blue-500 before:font-bold">Connecting volunteers with meaningful opportunities to make impact</li>
              <li className="py-2 border-b border-gray-200 text-gray-600 relative pl-6 transition-colors duration-300 hover:text-gray-800 last:border-b-0 before:content-['>'] before:absolute before:left-0 before:text-blue-500 before:font-bold">Fostering sustainability through collaborative community efforts</li>
              <li className="py-2 border-b border-gray-200 text-gray-600 relative pl-6 transition-colors duration-300 hover:text-gray-800 last:border-b-0 before:content-['>'] before:absolute before:left-0 before:text-blue-500 before:font-bold">Building a stronger, more resilient society together</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NgoOverview;