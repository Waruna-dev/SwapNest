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
            fetch(`${fallbackApiBase}/volunteers`).then((r) => r.json()),
            fetch(`${fallbackApiBase}/centers`).then((r) => r.json()),
            fetch(`${fallbackApiBase}/centers?status=Active`).then((r) => r.json()),
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
              Use the Volunteer, Centers, and Distribution Plan sections to manage applications, register
              centers, and create distribution plans.
            </div>
          </div>
        </div>

        {/* Center Details Cards */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 mb-2">
                Active Centers
              </div>
              <div className="text-sm text-zinc-500">Discover and manage volunteer centers across the network</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                {centers.filter(c => c.status === 'Active').length} Active
              </div>
              <div className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                {centers.filter(c => c.status !== 'Active').length} Pending
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {(centers || []).slice(0, 6).map((center, index) => (
              <div key={center._id} className="group relative">
                {/* Gradient Border Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                
                {/* Main Card */}
                <div className="relative bg-white rounded-3xl border border-zinc-100 p-6 hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-1">
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                          {center.centerName?.charAt(0) || 'C'}
                        </div>
                        <h3 className="text-lg font-bold text-[#1A1A1A]">{center.centerName}</h3>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        center.status === 'Active' 
                          ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200'
                      }`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          center.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                        }`}></span>
                        {center.status || 'Unknown'}
                      </span>
                    </div>
                    <div className="text-3xl opacity-80 group-hover:scale-110 transition-transform duration-300">🏢</div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-100">
                      <div className="text-xs text-emerald-600 font-medium mb-1">Capacity</div>
                      <div className="text-lg font-bold text-emerald-900">{center.capacity || 0}</div>
                      <div className="text-xs text-emerald-600">volunteers</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
                      <div className="text-xs text-blue-600 font-medium mb-1">District</div>
                      <div className="text-sm font-bold text-blue-900 truncate">{center.district || 'N/A'}</div>
                      <div className="text-xs text-blue-600">location</div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-2 mb-4">
                    {center.contactNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 bg-zinc-100 rounded-lg flex items-center justify-center text-xs">📞</div>
                        <span className="text-zinc-600">{center.contactNumber}</span>
                      </div>
                    )}
                    {center.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 bg-zinc-100 rounded-lg flex items-center justify-center text-xs">✉️</div>
                        <span className="text-zinc-600 truncate flex-1" title={center.email}>{center.email}</span>
                      </div>
                    )}
                    {center.address && (
                      <div className="flex items-start gap-2 text-sm">
                        <div className="w-6 h-6 bg-zinc-100 rounded-lg flex items-center justify-center text-xs mt-0.5">📍</div>
                        <span className="text-zinc-600 text-xs leading-relaxed flex-1">{center.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                    <div className="text-xs text-zinc-400 font-mono">
                      ID: {center._id?.slice(-8).toUpperCase() || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {centers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <div className="text-3xl">🏢</div>
              </div>
              <div className="text-xl font-bold text-zinc-700 mb-2">No Centers Found</div>
              <div className="text-zinc-500 mb-6">Start by registering your first volunteer center</div>
              <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Add Your First Center
              </button>
            </div>
          ) : centers.length > 6 ? (
            <div className="text-center mt-8">
              <button className="group inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-zinc-200 text-zinc-700 rounded-xl font-semibold hover:border-emerald-300 hover:text-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md">
                <span>View All {centers.length} Centers</span>
                <span className="transform group-hover:translate-x-1 transition-transform duration-200">→</span>
              </button>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
          </div>
        </div>
      </div>
    </div>
  );
}

