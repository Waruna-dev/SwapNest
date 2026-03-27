import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

const API_BASE_FALLBACK = "http://localhost:5000";
const API_BASE = import.meta.env.VITE_API_URL || API_BASE_FALLBACK;

export default function VolunteerDashboardVolunteersTable() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // VolunteerController.js getVolunteers returns: res.json(volunteers) => array
  const [volunteers, setVolunteers] = useState([]);
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [actionBusyId, setActionBusyId] = useState(null);

  const totalVolunteers = useMemo(() => volunteers.length, [volunteers]);

  const normalizePhoneForWhatsApp = (phone) => {
    // WhatsApp wa.me uses digits only, without '+'.
    const digits = String(phone || "").replace(/\D/g, "");
    // If number is local like 0XXXXXXXX, drop the leading 0.
    if (digits.length > 9 && digits.startsWith("0")) return digits.slice(1);
    return digits;
  };

  const statusLabel = (s) => (s ? String(s) : "Pending");

  const statusTone = (s) => {
    const v = statusLabel(s);
    if (v === "Accepted")
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (v === "Rejected")
      return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-zinc-50 text-zinc-700 border-zinc-200";
  };

  const filteredVolunteers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return volunteers;

    const buildHaystack = (v) => {
      const parts = [];
      const walk = (val) => {
        if (val === null || val === undefined) return;
        if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
          parts.push(String(val));
          return;
        }
        if (Array.isArray(val)) {
          val.forEach(walk);
          return;
        }
        if (typeof val === "object") {
          Object.values(val).forEach(walk);
        }
      };
      walk(v);
      return parts.join(" ").toLowerCase();
    };

    return (volunteers || []).filter((v) => buildHaystack(v).includes(q));
  }, [query, volunteers]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const axiosRes = await API.get("/volunteers");
      const data = Array.isArray(axiosRes.data)
        ? axiosRes.data
        : axiosRes.data?.data ?? [];
      setVolunteers(data);
    } catch (e) {
      // Retry with direct fetch + show error reason.
      try {
        const res = await fetch(`${API_BASE_FALLBACK}/api/volunteers`);
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText || ""}`.trim());
        }
        const data = Array.isArray(json) ? json : json?.data ?? [];
        setVolunteers(data);
      } catch (err) {
        setError(`Could not load volunteers. ${String(err?.message || err)}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, []);

  const updateApplicationStatus = async (id, newStatus) => {
    setActionBusyId(id);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/volunteers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationStatus: newStatus }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        const message =
          json?.message || `Request failed with status ${res.status}`;
        throw new Error(message);
      }
      await reload();
      return true;
    } catch (e) {
      setError(String(e?.message || e));
      return false;
    } finally {
      setActionBusyId(null);
    }
  };

  const deleteVolunteer = async (id) => {
    const ok = window.confirm("Delete this volunteer permanently?");
    if (!ok) return;
    setActionBusyId(id);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/volunteers/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const json = await res.json().catch(() => null);
        const message = json?.message || `Request failed with status ${res.status}`;
        throw new Error(message);
      }
      await reload();
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setActionBusyId(null);
    }
  };

  const sendWhatsApp = (v, customText) => {
    const waNumber = normalizePhoneForWhatsApp(v.phone);
    if (!waNumber) {
      setError("This volunteer has no phone number for WhatsApp.");
      return;
    }

    const fullName = `${v.firstName || ""} ${v.lastName || ""}`.trim() || "there";
    const text =
      customText ||
      `Hi ${fullName} 👋\n\nThank you for volunteering with SwapNest. We received your application for ${v.center || "a center"}.\n\nWe will contact you soon with next steps.`;
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const assignVolunteer = async (volunteerId) => {
    try {
      setActionBusyId(volunteerId);

      // Find the volunteer to get their center information
      const volunteer = volunteers.find(v => v._id === volunteerId);
      if (!volunteer || !volunteer.center) {
        setError('Volunteer has no center assigned. Please assign a center first.');
        return;
      }

      // Find the center by name to get its ID
      const centers = await fetchCenters();
      const assignedCenter = centers.find(c =>
        c.centerName.toLowerCase().trim() === volunteer.center.toLowerCase().trim()
      );

      if (!assignedCenter) {
        setError(`Center "${volunteer.center}" not found. Please create the center first.`);
        return;
      }

      const res = await API.post(`/api/volunteers/${volunteerId}/assign`, {
        centerId: assignedCenter._id,
        assignedAt: new Date().toISOString()
      });

      if (!res.data?.success && !res.data?._id) {
        throw new Error(res.data?.message || 'Assignment failed');
      }

      await reload();
      setError(`Volunteer assigned to ${assignedCenter.centerName} successfully`);
    } catch (e) {
      setError(`Failed to assign volunteer: ${String(e?.message || e)}`);
    } finally {
      setActionBusyId(null);
    }
  };

  const fetchCenters = async () => {
    try {
      const res = await API.get('/api/centers');
      return Array.isArray(res.data?.data) ? res.data.data : 
             Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      console.error('Failed to fetch centers:', e);
      return [];
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#1A1A1A]">
              Volunteers
            </h1>
            <p className="text-zinc-500 mt-2">List of volunteers retrieved from the backend.</p>
          </div>

          <div className="text-right">
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">Total</div>
            <div className="text-2xl font-black text-[#1A1A1A]">{totalVolunteers}</div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
              Search
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by anything (name, email, phone, district, skills...)"
              className="w-full px-4 py-2 rounded-xl border border-zinc-200 bg-white outline-none"
            />
          </div>
          <div className="md:col-span-1 flex items-end justify-end">
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setExpandedId(null);
              }}
              className="border border-zinc-200 text-zinc-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-zinc-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-end">
          <button
            type="button"
            onClick={() => navigate("/dashboard/volunteer/apply")}
            className="bg-[#2D4A35] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-black transition-colors"
          >
            Become a Volunteer
          </button>
        </div>

        {error ? (
          <div className="mb-4 bg-white rounded-2xl border border-red-200 p-4">
            <p className="text-red-600 font-bold">{error}</p>
          </div>
        ) : null}

        {loading ? (
          <div className="bg-white rounded-2xl border border-zinc-200 p-6">
            <div className="h-4 bg-zinc-100 rounded w-1/2 mb-4 animate-pulse" />
            <div className="h-12 bg-zinc-50 rounded animate-pulse" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold text-zinc-500">
                    <th className="px-4 py-3 min-w-[200px]">Name</th>
                    <th className="px-4 py-3 min-w-[220px]">Email</th>
                    <th className="px-4 py-3 min-w-[150px]">Phone</th>
                    <th className="px-4 py-3 min-w-[130px]">District</th>
                    <th className="px-4 py-3 min-w-[210px]">Center</th>
                    <th className="px-4 py-3 min-w-[130px]">Status</th>
                    <th className="px-4 py-3 min-w-[160px]">WhatsApp</th>
                    <th className="px-4 py-3 min-w-[190px]">Accept / Reject</th>
                    <th className="px-4 py-3 min-w-[140px]">Actions</th>
                    <th className="px-4 py-3 min-w-[100px]">Assign</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVolunteers.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-zinc-500 font-bold">
                        No volunteers match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredVolunteers.map((v) => {
                      const id = v._id;
                      const status = statusLabel(v.applicationStatus);
                      const expanded = expandedId === id;

                      return (
                        <React.Fragment key={id}>
                          <tr className="border-t border-zinc-100">
                            <td className="px-4 py-3">
                              <div className="font-bold text-[#1A1A1A]">
                                {v.firstName} {v.lastName}
                              </div>
                              <div className="text-xs text-zinc-500 mt-1">
                                {v.nic || "—"} • Joined{" "}
                                {v.createdAt
                                  ? new Date(v.createdAt).toLocaleDateString()
                                  : "—"}
                              </div>
                              <button
                                type="button"
                                onClick={() => setExpandedId(expanded ? null : id)}
                                className="text-xs font-bold text-[#2D4A35] hover:underline mt-2"
                              >
                                {expanded ? "Hide details" : "View details"}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-zinc-600">{v.email || "—"}</td>
                            <td className="px-4 py-3 text-zinc-600">{v.phone || "—"}</td>
                            <td className="px-4 py-3 text-zinc-600">{v.district || "—"}</td>
                            <td className="px-4 py-3 text-zinc-600">{v.center || "—"}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${statusTone(
                                  status
                                )}`}
                              >
                                {status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => sendWhatsApp(v)}
                                className="border border-zinc-200 text-zinc-800 px-3 py-2 rounded-xl font-bold text-xs hover:bg-zinc-50 transition-colors"
                              >
                                <span className="mr-1">💬</span> Message
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={actionBusyId === id}
                                  onClick={() => updateApplicationStatus(id, "Accepted")}
                                  className="bg-emerald-600 text-white px-3 py-2 rounded-xl font-bold text-xs hover:bg-emerald-700 disabled:opacity-60"
                                >
                                  Accept
                                </button>
                                <button
                                  type="button"
                                  disabled={actionBusyId === id}
                                  onClick={() =>
                                    updateApplicationStatus(id, "Rejected")
                                  }
                                  className="bg-rose-600 text-white px-3 py-2 rounded-xl font-bold text-xs hover:bg-rose-700 disabled:opacity-60"
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={actionBusyId === id}
                                  onClick={() => navigate(`/dashboard/volunteer/${id}/edit`)}
                                  className="border border-zinc-200 text-zinc-800 px-3 py-2 rounded-xl font-bold text-xs hover:bg-zinc-50 transition-colors disabled:opacity-60"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  disabled={actionBusyId === id}
                                  onClick={() => deleteVolunteer(id)}
                                  className="border border-rose-200 text-rose-700 px-3 py-2 rounded-xl font-bold text-xs hover:bg-rose-50 transition-colors disabled:opacity-60"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                disabled={actionBusyId === id}
                                onClick={() => assignVolunteer(id)}
                                className="bg-blue-600 text-white px-3 py-2 rounded-xl font-bold text-xs hover:bg-blue-700 disabled:opacity-60 transition-colors"
                              >
                                Assign to Center
                              </button>
                            </td>
                          </tr>

                          {expanded ? (
                            <tr className="bg-[#F5F0E8]">
                              <td colSpan={10} className="px-4 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-white border border-zinc-200 rounded-2xl p-4">
                                    <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                                      Volunteer Profile
                                    </div>
                                    <div className="text-sm text-zinc-700 leading-7">
                                      <div>
                                        <span className="font-bold text-zinc-900">Gender:</span>{" "}
                                        {v.gender || "—"}
                                      </div>
                                      <div>
                                        <span className="font-bold text-zinc-900">Emergency:</span>{" "}
                                        {v.emergencyContact || "—"}
                                      </div>
                                      <div>
                                        <span className="font-bold text-zinc-900">Address:</span>{" "}
                                        {v.address || "—"}
                                      </div>
                                      <div>
                                        <span className="font-bold text-zinc-900">City:</span>{" "}
                                        {v.city || "—"}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-white border border-zinc-200 rounded-2xl p-4">
                                    <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                                      Skills & Availability
                                    </div>
                                    <div className="text-sm text-zinc-700 leading-7">
                                      <div>
                                        <span className="font-bold text-zinc-900">Skills:</span>{" "}
                                        {(v.skills || []).length ? v.skills.join(", ") : "—"}
                                      </div>
                                      <div>
                                        <span className="font-bold text-zinc-900">Tasks:</span>{" "}
                                        {(v.tasks || []).length ? v.tasks.join(", ") : "—"}
                                      </div>
                                      <div>
                                        <span className="font-bold text-zinc-900">Days:</span>{" "}
                                        {(v.days || []).length ? v.days.join(", ") : "—"}
                                      </div>
                                      <div>
                                        <span className="font-bold text-zinc-900">Time:</span>{" "}
                                        {(v.time || []).length ? v.time.join(", ") : "—"}
                                      </div>
                                      <div>
                                        <span className="font-bold text-zinc-900">Hours/week:</span>{" "}
                                        {v.hoursPerWeek || "—"}
                                      </div>
                                      <div>
                                        <span className="font-bold text-zinc-900">Start date:</span>{" "}
                                        {v.startDate ? new Date(v.startDate).toLocaleDateString() : "—"}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-white border border-zinc-200 rounded-2xl p-4">
                                    <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                                      Application Notes
                                    </div>
                                    <div className="text-sm text-zinc-700 leading-7">
                                      <div>
                                        <span className="font-bold text-zinc-900">Experience:</span>{" "}
                                        {v.experience || "—"}
                                      </div>
                                      <div>
                                        <span className="font-bold text-zinc-900">Max tasks:</span>{" "}
                                        {v.maxTasks || "—"}
                                      </div>
                                      <div>
                                        <span className="font-bold text-zinc-900">Bio:</span>{" "}
                                        {v.bio || "—"}
                                      </div>
                                      <div>
                                        <span className="font-bold text-zinc-900">Can travel:</span>{" "}
                                        {v.canTravel ? "Yes" : "No"}
                                      </div>
                                      <div>
                                        <span className="font-bold text-zinc-900">Vehicle:</span>{" "}
                                        {v.hasVehicle ? "Yes" : "No"}
                                      </div>
                                      <div>
                                        <span className="font-bold text-zinc-900">License:</span>{" "}
                                        {v.hasLicense ? "Yes" : "No"}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-white border border-zinc-200 rounded-2xl p-4">
                                    <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                                      Consent
                                    </div>
                                    <div className="text-sm text-zinc-700 leading-7">
                                      <div>
                                        <span className="font-bold text-zinc-900">Terms:</span>{" "}
                                        {v.agreeTerms ? "Accepted" : "—"}
                                      </div>
                                      <div>
                                        <span className="font-bold text-zinc-900">Privacy:</span>{" "}
                                        {v.agreePrivacy ? "Accepted" : "—"}
                                      </div>
                                      <div>
                                        <span className="font-bold text-zinc-900">Notifications:</span>{" "}
                                        {v.agreeNotif ? "Enabled" : "—"}
                                      </div>
                                      <div>
                                        <span className="font-bold text-zinc-900">Documents:</span>{" "}
                                        {v.documents?.nicCopy || v.documents?.drivingLicense
                                          ? [
                                              v.documents?.nicCopy ? "NIC" : null,
                                              v.documents?.drivingLicense ? "License" : null,
                                            ]
                                              .filter(Boolean)
                                              .join(", ")
                                          : "—"}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ) : null}
                        </React.Fragment>
                      );
                    })
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

