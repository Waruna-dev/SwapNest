import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_FALLBACK = "http://localhost:5000";

export default function VolunteerCentersTable() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [centers, setCenters] = useState([]);

  const activeCentersCount = useMemo(() => centers.length, [centers]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        // Backend returns: { success: true, count, data: [...] }
        const res = await fetch(`${API_BASE_FALLBACK}/api/centers?status=Active`);
        const json = await res.json();
        const data = Array.isArray(json?.data) ? json.data : [];
        if (!cancelled) setCenters(data);
      } catch (e) {
        if (!cancelled) setError("Could not load centers. Is the backend running?");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#1A1A1A]">
              Volunteer Centers
            </h1>
            <p className="text-zinc-500 mt-2">
              Choose a center and apply as a volunteer.
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Active centers
            </div>
            <div className="text-2xl font-black text-[#1A1A1A]">{activeCentersCount}</div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-zinc-200 p-6">
            <div className="h-4 bg-zinc-100 rounded w-1/2 mb-4" />
            <div className="h-4 bg-zinc-100 rounded w-1/3 mb-4" />
            <div className="h-12 bg-zinc-50 rounded" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-200 p-6">
            <p className="text-red-600 font-bold">{error}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-xs font-bold text-zinc-500">
                    <th className="px-4">Center</th>
                    <th className="px-4">District</th>
                    <th className="px-4">Code</th>
                    <th className="px-4">Capacity</th>
                    <th className="px-4">Status</th>
                    <th className="px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {centers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-zinc-500 font-bold">
                        No active centers found.
                      </td>
                    </tr>
                  ) : (
                    centers.map((c) => (
                      <tr key={c._id} className="bg-[#F5F0E8]">
                        <td className="px-4 py-3 font-bold text-[#1A1A1A]">
                          {c.centerName || "—"}
                        </td>
                        <td className="px-4 py-3 text-zinc-600">{c.district || "—"}</td>
                        <td className="px-4 py-3 text-zinc-600">{c.centerCode || "—"}</td>
                        <td className="px-4 py-3 text-zinc-600">{c.capacity ?? 0}</td>
                        <td className="px-4 py-3 text-zinc-600">{c.status || "—"}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              navigate("/dashboard/volunteer/apply", {
                                state: { center: c },
                              })
                            }
                            className="bg-[#2D4A35] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-black transition-colors"
                          >
                            Become a Volunteer
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

