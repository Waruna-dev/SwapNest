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

