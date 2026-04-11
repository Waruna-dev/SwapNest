import React, { useEffect, useMemo, useState } from "react";
import API from "../../services/api";

const fallbackApiBase = "http://localhost:5000";

function safeGetCentersArrayFromJson(json) {
  // fetch: { success: true, count, data }
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json)) return json;
  return [];
}

function formatNumber(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return "0";
  return n.toLocaleString();
}

function StatCard({ icon, value, label, tone = "sage" }) {
  const toneCls =
    tone === "sage"
      ? { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" }
      : tone === "amber"
      ? { bg: "bg-amber-50", text: "text-amber-900", border: "border-amber-200" }
      : { bg: "bg-zinc-50", text: "text-zinc-900", border: "border-zinc-200" };

  return (
    <div className={`rounded-2xl border ${toneCls.border} ${toneCls.bg} p-5`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-2xl">{icon}</div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-black ${toneCls.text}`}>{formatNumber(value)}</div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mt-1">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [volunteers, setVolunteers] = useState([]);
  const [centers, setCenters] = useState([]);

  const [activeCentersCount, setActiveCentersCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      // Try API (axios). If base URL/env is missing, fall back to localhost:5000.
      const apiReqs = [
        API.get("/volunteers"),
        API.get("/centers"),
        API.get("/centers", { params: { status: "Active" } }),
      ];

      const [volRes, cenRes, activeRes] = await Promise.allSettled(apiReqs);

      const tryExtractVolunteers = () => {
        if (volRes.status === "fulfilled") {
          return Array.isArray(volRes.value?.data) ? volRes.value.data : volRes.value?.data?.data ?? [];
        }
        return null;
      };

      const tryExtractCenters = () => {
        if (cenRes.status === "fulfilled") {
          // axios: { success:true, data:[...] }
          return Array.isArray(cenRes.value?.data?.data) ? cenRes.value.data.data : cenRes.value?.data?.data ?? [];
        }
        return null;
      };

      const tryExtractActiveCount = () => {
        if (activeRes.status === "fulfilled") {
          if (typeof activeRes.value?.data?.count === "number") return activeRes.value.data.count;
          const arr = Array.isArray(activeRes.value?.data?.data) ? activeRes.value.data.data : [];
          return arr.length;
        }
        return null;
      };

      let nextVolunteers = tryExtractVolunteers();
      let nextCenters = tryExtractCenters();
      let nextActiveCount = tryExtractActiveCount();

      if (nextVolunteers == null || nextCenters == null || nextActiveCount == null) {
        // Fallback using fetch to the backend (works even if axios baseURL is not configured).
        try {
          const [vJson, cJson, aJson] = await Promise.all([
            fetch(`${fallbackApiBase}/api/volunteers`).then((r) => r.json()),
            fetch(`${fallbackApiBase}/api/centers`).then((r) => r.json()),
            fetch(`${fallbackApiBase}/api/centers?status=Active`).then((r) => r.json()),
          ]);

          if (nextVolunteers == null) nextVolunteers = Array.isArray(vJson) ? vJson : [];
          if (nextCenters == null) nextCenters = safeGetCentersArrayFromJson(cJson);
          if (nextActiveCount == null) {
            if (typeof aJson?.count === "number") nextActiveCount = aJson.count;
            else nextActiveCount = safeGetCentersArrayFromJson(aJson).length;
          }
        } catch (e) {
          if (!cancelled) {
            setError("Could not load dashboard report. Is the backend running?");
          }
        }
      }

      if (!cancelled) {
        setVolunteers(nextVolunteers || []);
        setCenters(nextCenters || []);
        setActiveCentersCount(typeof nextActiveCount === "number" ? nextActiveCount : 0);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const totals = useMemo(() => {
    const totalVolunteers = volunteers.length;
    const totalCenters = centers.length;
    const totalCapacity = centers.reduce((sum, c) => sum + (Number(c.capacity) || 0), 0);

    // Compute top district quickly for a "nice" summary.
    const districtMap = new Map();
    centers.forEach((c) => {
      const d = c.district || "Unknown";
      districtMap.set(d, (districtMap.get(d) || 0) + 1);
    });
    const topDistrict = districtMap.size
      ? [...districtMap.entries()].sort((a, b) => b[1] - a[1])[0]
      : null;

    return { totalVolunteers, totalCenters, totalCapacity, topDistrict };
  }, [volunteers, centers]);

  if (loading) {
    return (
      <div className="w-full bg-[#F5F0E8] p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#1A1A1A]">
            Overview
          </h1>
          <p className="text-zinc-500 mt-2">Loading overall report...</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-zinc-200 p-5 animate-pulse">
                <div className="h-6 bg-zinc-100 rounded w-1/2" />
                <div className="h-8 bg-zinc-100 rounded w-2/3 mt-3" />
                <div className="h-3 bg-zinc-100 rounded w-1/3 mt-3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#F5F0E8] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#1A1A1A]">
            Overview
          </h1>
          <p className="text-zinc-500 mt-2 max-w-3xl">
            Overall report of volunteers and centers across the network.
          </p>
          {error ? <p className="text-red-600 mt-3 text-sm font-bold">{error}</p> : null}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon="👥" value={totals.totalVolunteers} label="Total Volunteers" tone="sage" />
          <StatCard icon="🏢" value={totals.totalCenters} label="Total Centers" tone="amber" />
          <StatCard icon="✅" value={activeCentersCount} label="Active Centers" tone="sage" />
          <StatCard icon="🧮" value={totals.totalCapacity} label="Total Capacity" tone="zinc" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
              Top District
            </div>
            <div className="text-2xl font-black text-[#1A1A1A]">
              {totals.topDistrict ? totals.topDistrict[0] : "—"}
            </div>
            <div className="text-zinc-500 mt-1">
              {totals.topDistrict ? `${totals.topDistrict[1]} centers` : "No center data yet."}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
              Network Snapshot
            </div>
            <div className="text-zinc-700 leading-relaxed">
              Use the sidebar to manage volunteer applications, register centers, and create distribution
              plans.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Recent Volunteers
                </div>
                <div className="text-sm text-zinc-500 mt-1">Latest sign-ups (up to 5)</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold text-zinc-500">
                    <th className="py-2 px-1">Name</th>
                    <th className="py-2 px-1">District</th>
                    <th className="py-2 px-1">Center</th>
                  </tr>
                </thead>
                <tbody>
                  {(volunteers || []).slice(0, 5).map((v) => (
                    <tr key={v._id} className="border-t border-zinc-100">
                      <td className="py-3 px-1 font-bold text-[#1A1A1A]">
                        {v.firstName} {v.lastName}
                      </td>
                      <td className="py-3 px-1 text-zinc-600">{v.district || "—"}</td>
                      <td className="py-3 px-1 text-zinc-600">{v.center || "—"}</td>
                    </tr>
                  ))}
                  {volunteers.length === 0 ? (
                    <tr>
                      <td className="py-4 px-1 text-zinc-500" colSpan={3}>
                        No volunteers found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            
            {/* Load More Button */}
            {volunteers.length > 5 && (
              <div className="mt-4 pt-4 border-t border-zinc-200">
                <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium py-2 px-4 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 text-sm">
                  Load More Volunteers →
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Recent Centers
                </div>
                <div className="text-sm text-zinc-500 mt-1">Latest registrations (up to 5)</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold text-zinc-500">
                    <th className="py-2 px-1">Center</th>
                    <th className="py-2 px-1">Status</th>
                    <th className="py-2 px-1">District</th>
                  </tr>
                </thead>
                <tbody>
                  {(centers || []).slice(0, 5).map((c) => (
                    <tr key={c._id} className="border-t border-zinc-100">
                      <td className="py-3 px-1 font-bold text-[#1A1A1A]">{c.centerName}</td>
                      <td className="py-3 px-1 text-zinc-600">{c.status || "—"}</td>
                      <td className="py-3 px-1 text-zinc-600">{c.district || "—"}</td>
                    </tr>
                  ))}
                  {centers.length === 0 ? (
                    <tr>
                      <td className="py-4 px-1 text-zinc-500" colSpan={3}>
                        No centers found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            
            {/* Load More Button */}
            {centers.length > 5 && (
              <div className="mt-4 pt-4 border-t border-zinc-200">
                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm">
                  Load More Centers →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Centers Gallery Section */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <div className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                Centers Gallery
              </div>
              <div className="text-base text-zinc-600 mt-1">Browse centers horizontally</div>
            </div>
          </div>

          {/* Horizontal Scroll Container */}
          <div className="relative">
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {(centers || []).slice(0, 6).map((center) => (
                  <div key={center._id} className="w-80 bg-gradient-to-br from-white via-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-emerald-400 flex-shrink-0">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4 relative">
                      <div className="absolute top-2 right-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-bold text-white ${
                          center.status === 'Active' 
                            ? 'bg-green-500'
                            : center.status === 'Inactive'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                        }`}>
                          {center.status || 'Unknown'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center text-white text-lg font-bold">
                          🏢
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base leading-tight">
                            {center.centerName}
                          </h3>
                          <p className="text-emerald-100 text-xs font-medium">
                            {center.centerCode}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-5 space-y-3">
                      {/* Location Row */}
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center text-emerald-600 flex-shrink-0">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{center.city}</p>
                          <p className="text-xs text-gray-600">{center.district}</p>
                        </div>
                      </div>
                      
                      {/* Email Row */}
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-blue-600 flex-shrink-0">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 truncate">{center.email || 'No email'}</p>
                        </div>
                      </div>
                      
                      {/* Capacity & Manager Row */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-amber-100 rounded flex items-center justify-center text-amber-600 flex-shrink-0">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{center.capacity || 0}</p>
                              <p className="text-xs text-gray-600">Volunteers</p>
                            </div>
                          </div>
                          
                          {center.managerName && (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center text-purple-600 flex-shrink-0">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate max-w-20">{center.managerName}</p>
                                <p className="text-xs text-gray-600">Manager</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Footer */}
                      <div className="bg-gradient-to-r from-emerald-100 to-teal-100 px-5 py-2 border-t border-emerald-200">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-emerald-700 font-medium truncate max-w-48">
                            {center.address ? center.address.substring(0, 25) + '...' : 'No address'}
                          </p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-emerald-700 font-medium">Live</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Scroll Indicators */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10"></div>
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>
            </div>
            
            {centers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🏢</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Centers Found</h3>
                <p className="text-gray-600 mb-4">Start building your network by registering centers</p>
                <button className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                  Add First Center
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

