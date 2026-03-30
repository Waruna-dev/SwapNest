import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchVolunteers } from "../../services/volunteerService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function VolunteerDashboardVolunteersTable() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // VolunteerController.js getVolunteers returns: res.json(volunteers) => array
  const [volunteers, setVolunteers] = useState([]);
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [actionBusyId, setActionBusyId] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportOptions, setReportOptions] = useState({
    includeBasicInfo: true,
    includeContactInfo: true,
    includeSkills: true,
    includeAvailability: true,
    includeStatus: true,
    includeAssignments: true,
    dateRange: 'all',
    statusFilter: 'all',
    centerFilter: 'all'
  });

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
    if (v === "Assigned")
      return "bg-blue-50 text-blue-700 border-blue-200";
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
      const data = await fetchVolunteers();
      setVolunteers(data);
    } catch (err) {
      setError(`Could not load volunteers. ${String(err?.message || err)}`);
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

  const generateReport = () => {
    try {
      let filteredData = [...filteredVolunteers];
      
      // Apply status filter
      if (reportOptions.statusFilter !== 'all') {
        filteredData = filteredData.filter(v => 
          statusLabel(v.applicationStatus) === reportOptions.statusFilter
        );
      }
      
      // Apply center filter
      if (reportOptions.centerFilter !== 'all') {
        filteredData = filteredData.filter(v => 
          v.center === reportOptions.centerFilter
        );
      }
      
      // Apply date range filter
      if (reportOptions.dateRange !== 'all') {
        const now = new Date();
        const cutoffDate = new Date();
        
        switch (reportOptions.dateRange) {
          case '7days':
            cutoffDate.setDate(now.getDate() - 7);
            break;
          case '30days':
            cutoffDate.setDate(now.getDate() - 30);
            break;
          case '90days':
            cutoffDate.setDate(now.getDate() - 90);
            break;
          case '1year':
            cutoffDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        filteredData = filteredData.filter(v => 
          v.createdAt && new Date(v.createdAt) >= cutoffDate
        );
      }
      
      // Create PDF
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add custom font for better appearance
      doc.setFont("helvetica");
      
      // Title
      doc.setFontSize(20);
      doc.setTextColor(45, 74, 53); // #2D4A35
      doc.text("Volunteer Report", 148, 15, { align: "center" });
      
      // Report metadata
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 25);
      doc.text(`Total Volunteers: ${filteredData.length}`, 20, 30);
      
      // Add filters info if applied
      let filterText = [];
      if (reportOptions.statusFilter !== 'all') filterText.push(`Status: ${reportOptions.statusFilter}`);
      if (reportOptions.centerFilter !== 'all') filterText.push(`Center: ${reportOptions.centerFilter}`);
      if (reportOptions.dateRange !== 'all') filterText.push(`Date Range: ${reportOptions.dateRange}`);
      
      if (filterText.length > 0) {
        doc.setFontSize(8);
        doc.text(`Filters: ${filterText.join(', ')}`, 20, 35);
      }
      
      // Prepare table columns based on selected options
      const columns = [];
      if (reportOptions.includeBasicInfo) {
        columns.push({ title: "Name", dataKey: "name" });
        columns.push({ title: "NIC", dataKey: "nic" });
        columns.push({ title: "Gender", dataKey: "gender" });
      }
      
      if (reportOptions.includeContactInfo) {
        columns.push({ title: "Email", dataKey: "email" });
        columns.push({ title: "Phone", dataKey: "phone" });
        columns.push({ title: "District", dataKey: "district" });
      }
      
      if (reportOptions.includeStatus) {
        columns.push({ title: "Status", dataKey: "status" });
        columns.push({ title: "Joined", dataKey: "joined" });
      }
      
      if (reportOptions.includeAssignments) {
        columns.push({ title: "Center", dataKey: "center" });
      }
      
      if (reportOptions.includeSkills) {
        columns.push({ title: "Skills", dataKey: "skills" });
        columns.push({ title: "Experience", dataKey: "experience" });
      }
      
      if (reportOptions.includeAvailability) {
        columns.push({ title: "Days", dataKey: "days" });
        columns.push({ title: "Hours/Week", dataKey: "hoursPerWeek" });
      }
      
      // Prepare table data
      const tableData = filteredData.map(v => {
        const row = {};
        
        if (reportOptions.includeBasicInfo) {
          row.name = `${v.firstName || ''} ${v.lastName || ''}`.trim();
          row.nic = v.nic || '';
          row.gender = v.gender || '';
        }
        
        if (reportOptions.includeContactInfo) {
          row.email = v.email || '';
          row.phone = v.phone || '';
          row.district = v.district || '';
        }
        
        if (reportOptions.includeStatus) {
          row.status = statusLabel(v.applicationStatus);
          row.joined = v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '';
        }
        
        if (reportOptions.includeAssignments) {
          row.center = v.center || '';
        }
        
        if (reportOptions.includeSkills) {
          row.skills = (v.skills || []).join(', ');
          row.experience = v.experience || '';
        }
        
        if (reportOptions.includeAvailability) {
          row.days = (v.days || []).join(', ');
          row.hoursPerWeek = v.hoursPerWeek || '';
        }
        
        return row;
      });
      
      // Add table with styling
      if (columns.length > 0 && tableData.length > 0) {
        // Define column widths for better layout (landscape mode)
        const columnStyles = {};
        const pageWidth = 280; // Usable page width in landscape
        
        // Calculate widths based on content importance
        const widths = {};
        if (reportOptions.includeBasicInfo) {
          widths.name = 35;
          widths.nic = 30;
          widths.gender = 15;
        }
        if (reportOptions.includeContactInfo) {
          widths.email = 45;
          widths.phone = 30;
          widths.district = 25;
        }
        if (reportOptions.includeStatus) {
          widths.status = 25;
          widths.joined = 25;
        }
        if (reportOptions.includeAssignments) {
          widths.center = 30;
        }
        if (reportOptions.includeSkills) {
          widths.skills = 50;
          widths.experience = 35;
        }
        if (reportOptions.includeAvailability) {
          widths.days = 30;
          widths.hoursPerWeek = 20;
        }
        
        // Adjust widths if too many columns
        const totalWidth = Object.values(widths).reduce((sum, w) => sum + w, 0);
        if (totalWidth > pageWidth) {
          const scale = pageWidth / totalWidth;
          Object.keys(widths).forEach(key => {
            widths[key] = widths[key] * scale;
          });
        }
        
        // Create column styles
        columns.forEach(col => {
          if (widths[col.dataKey]) {
            columnStyles[col.dataKey] = {
              cellWidth: widths[col.dataKey],
              fontStyle: col.dataKey === 'name' ? 'bold' : 'normal'
            };
          }
        });

        autoTable(doc, {
          head: [columns.map(col => col.title)],
          body: tableData.map(row => columns.map(col => row[col.dataKey] || '')),
          startY: filterText.length > 0 ? 45 : 40,
          theme: 'grid',
          styles: {
            fontSize: 8,
            cellPadding: 3,
            lineColor: [200, 200, 200],
            textColor: [50, 50, 50],
            overflow: 'linebreak',
            cellWidth: 'auto'
          },
          headStyles: {
            fillColor: [45, 74, 53], // #2D4A35
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: columnStyles,
          margin: { top: 40, left: 10, right: 10 },
          tableWidth: 'auto'
        });
      }
      
      // Add footer
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 50;
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("Generated by SwapNest Volunteer Management System", 105, finalY + 10, { align: "center" });
      
      // Save the PDF
      doc.save(`volunteers_report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      setShowReportModal(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError(`Failed to generate PDF: ${error.message}`);
    }
  };

  const getUniqueCenters = () => {
    const centers = [...new Set(volunteers.map(v => v.center).filter(Boolean))];
    return centers.sort();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8 bg-white rounded-3xl shadow-xl border border-emerald-100 p-8 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-black">
                Volunteers
              </h1>
              <p className="text-slate-500 mt-3 text-lg font-medium">Manage and track volunteer applications</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-center shadow-lg transform hover:scale-105 transition-all duration-300">
              <div className="text-xs font-bold uppercase tracking-widest text-white/80 mb-2">Total</div>
              <div className="text-3xl font-black text-white">{totalVolunteers}</div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-6 bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-bold uppercase tracking-wider text-slate-600 mb-3">
                🔍 Search Volunteers
              </label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email, phone, district, skills..."
                className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 bg-slate-50 outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all duration-200 text-lg"
              />
            </div>
            <div className="lg:col-span-1 flex items-end justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setExpandedId(null);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-4 rounded-xl font-bold text-sm hover:shadow-md transition-all duration-200 border-2 border-slate-200"
              >
                🔄 Clear
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-emerald-400"
          >
            📄 Generate PDF Report
          </button>
          <button
            type="button"
            onClick={() => navigate("/volunteer/apply")}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-blue-400"
          >
            ➕ Become a Volunteer
          </button>
        </div>

        {error ? (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border-2 border-red-200 p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="text-2xl">⚠️</div>
              <p className="text-red-700 font-bold text-lg">{error}</p>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="bg-white rounded-2xl border-2 border-emerald-100 p-8 shadow-lg">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-4 h-4 bg-emerald-500 rounded-full animate-bounce"></div>
              <div className="w-4 h-4 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-4 h-4 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <span className="text-slate-600 font-medium">Loading volunteers...</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-emerald-100 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-emerald-50 to-teal-50 text-xs font-black text-slate-700 border-b-2 border-emerald-200">
                    <th className="px-6 py-4 min-w-[200px]">👤 Name</th>
                    <th className="px-6 py-4 min-w-[220px]">📧 Email</th>
                    <th className="px-6 py-4 min-w-[150px]">📱 Phone</th>
                    <th className="px-6 py-4 min-w-[130px]">📍 District</th>
                    <th className="px-6 py-4 min-w-[210px]">🏢 Center</th>
                    <th className="px-6 py-4 min-w-[130px]">📊 Status</th>
                    <th className="px-6 py-4 min-w-[160px]">💬 WhatsApp</th>
                    <th className="px-6 py-4 min-w-[190px]">✅ Actions</th>
                    <th className="px-6 py-4 min-w-[140px]">⚙️ Manage</th>
                    <th className="px-6 py-4 min-w-[100px]">🎯 Assign</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVolunteers.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="text-6xl">🔍</div>
                          <p className="text-slate-500 font-bold text-lg">No volunteers match your search.</p>
                          <p className="text-slate-400">Try adjusting your search terms or filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredVolunteers.map((v) => {
                      const id = v._id;
                      const status = statusLabel(v.applicationStatus);
                      const expanded = expandedId === id;

                      return (
                        <React.Fragment key={id}>
                          <tr className="border-b border-emerald-100 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-200">
                            <td className="px-6 py-4">
                              <div className="font-black text-slate-900">
                                {v.firstName} {v.lastName}
                              </div>
                              <div className="text-xs text-slate-500 mt-2">
                                🆔 {v.nic || "—"} • 📅 {" "}
                                {v.createdAt
                                  ? new Date(v.createdAt).toLocaleDateString()
                                  : "—"}
                              </div>
                              <button
                                type="button"
                                onClick={() => setExpandedId(expanded ? null : id)}
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline mt-3 transition-colors"
                              >
                                {expanded ? "🔼 Hide details" : "🔽 View details"}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{v.email || "—"}</td>
                            <td className="px-6 py-4 text-slate-600">{v.phone || "—"}</td>
                            <td className="px-6 py-4 text-slate-600">{v.district || "—"}</td>
                            <td className="px-6 py-4 text-slate-600">{v.center || "—"}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-bold ${statusTone(
                                  status
                                )}`}
                              >
                                {status === "Accepted" && "✅ "}
                                {status === "Rejected" && "❌ "}
                                {status === "Pending" && "⏳ "}
                                {status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                type="button"
                                onClick={() => sendWhatsApp(v)}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-xs hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                              >
                                <span className="mr-1">💬</span> Message
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={actionBusyId === id}
                                  onClick={() => updateApplicationStatus(id, "Accepted")}
                                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-3 py-2 rounded-xl font-bold text-xs hover:shadow-lg transform hover:scale-105 disabled:opacity-60 transition-all duration-200"
                                >
                                  ✅ Accept
                                </button>
                                <button
                                  type="button"
                                  disabled={actionBusyId === id}
                                  onClick={() =>
                                    updateApplicationStatus(id, "Rejected")
                                  }
                                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-3 py-2 rounded-xl font-bold text-xs hover:shadow-lg transform hover:scale-105 disabled:opacity-60 transition-all duration-200"
                                >
                                  ❌ Reject
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={actionBusyId === id}
                                  onClick={() => navigate(`/dashboard/volunteer/${id}/edit`)}
                                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-3 py-2 rounded-xl font-bold text-xs hover:shadow-lg transform hover:scale-105 disabled:opacity-60 transition-all duration-200"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  type="button"
                                  disabled={actionBusyId === id}
                                  onClick={() => deleteVolunteer(id)}
                                  className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white px-3 py-2 rounded-xl font-bold text-xs hover:shadow-lg transform hover:scale-105 disabled:opacity-60 transition-all duration-200"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                type="button"
                                disabled={actionBusyId === id}
                                onClick={() => assignVolunteer(id)}
                                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-3 py-2 rounded-xl font-bold text-xs hover:shadow-lg transform hover:scale-105 disabled:opacity-60 transition-all duration-200"
                              >
                                🎯 Assign
                              </button>
                            </td>
                          </tr>

                          {expanded ? (
                            <tr className="bg-gradient-to-r from-emerald-50 to-teal-50">
                              <td colSpan={10} className="px-6 py-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  <div className="bg-white border-2 border-emerald-100 rounded-2xl p-6 shadow-lg">
                                    <div className="text-sm font-bold uppercase tracking-wider text-emerald-700 mb-4 flex items-center gap-2">
                                      👤 Volunteer Profile
                                    </div>
                                    <div className="text-sm text-slate-700 leading-7 space-y-3">
                                      <div className="flex justify-between">
                                        <span className="font-bold text-slate-900">🚻 Gender:</span>
                                        <span>{v.gender || "—"}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-bold text-slate-900">🆘 Emergency:</span>
                                        <span>{v.emergencyContact || "—"}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-bold text-slate-900">📍 Address:</span>
                                        <span>{v.address || "—"}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-bold text-slate-900">🏙️ City:</span>
                                        <span>{v.city || "—"}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-white border-2 border-emerald-100 rounded-2xl p-6 shadow-lg">
                                    <div className="text-sm font-bold uppercase tracking-wider text-emerald-700 mb-4 flex items-center gap-2">
                                      🛠️ Skills & Availability
                                    </div>
                                    <div className="text-sm text-slate-700 leading-7 space-y-3">
                                      <div>
                                        <span className="font-bold text-slate-900">💡 Skills:</span>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                          {(v.skills || []).length ? v.skills.map((skill, i) => (
                                            <span key={i} className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-medium">
                                              {skill}
                                            </span>
                                          )) : <span className="text-slate-400">—</span>}
                                        </div>
                                      </div>
                                      <div>
                                        <span className="font-bold text-slate-900">📋 Tasks:</span>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                          {(v.tasks || []).length ? v.tasks.map((task, i) => (
                                            <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
                                              {task}
                                            </span>
                                          )) : <span className="text-slate-400">—</span>}
                                        </div>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-bold text-slate-900">📅 Days:</span>
                                        <span>{(v.days || []).join(", ") || "—"}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-bold text-slate-900">⏰ Time:</span>
                                        <span>{(v.time || []).join(", ") || "—"}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-bold text-slate-900">⏱️ Hours/week:</span>
                                        <span>{v.hoursPerWeek || "—"}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-white border-2 border-emerald-100 rounded-2xl p-6 shadow-lg">
                                    <div className="text-sm font-bold uppercase tracking-wider text-emerald-700 mb-4 flex items-center gap-2">
                                      📝 Application Notes
                                    </div>
                                    <div className="text-sm text-slate-700 leading-7 space-y-3">
                                      <div>
                                        <span className="font-bold text-slate-900">🌟 Experience:</span>
                                        <div className="mt-1 text-slate-600">{v.experience || "—"}</div>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-bold text-slate-900">📊 Max tasks:</span>
                                        <span>{v.maxTasks || "—"}</span>
                                      </div>
                                      <div>
                                        <span className="font-bold text-slate-900">📄 Bio:</span>
                                        <div className="mt-1 text-slate-600">{v.bio || "—"}</div>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-bold text-slate-900">🚗 Can travel:</span>
                                        <span className={v.canTravel ? "text-emerald-600" : "text-slate-400"}>
                                          {v.canTravel ? "✅ Yes" : "❌ No"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-bold text-slate-900">🚗 Vehicle:</span>
                                        <span className={v.hasVehicle ? "text-emerald-600" : "text-slate-400"}>
                                          {v.hasVehicle ? "✅ Yes" : "❌ No"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-bold text-slate-900">🪪 License:</span>
                                        <span className={v.hasLicense ? "text-emerald-600" : "text-slate-400"}>
                                          {v.hasLicense ? "✅ Yes" : "❌ No"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="bg-white border-2 border-emerald-100 rounded-2xl p-6 shadow-lg">
                                    <div className="text-sm font-bold uppercase tracking-wider text-emerald-700 mb-4 flex items-center gap-2">
                                      ✅ Consent
                                    </div>
                                    <div className="text-sm text-slate-700 leading-7 space-y-3">
                                      <div className="flex justify-between">
                                        <span className="font-bold text-slate-900">📋 Terms:</span>
                                        <span className={v.agreeTerms ? "text-emerald-600" : "text-slate-400"}>
                                          {v.agreeTerms ? "✅ Accepted" : "❌ —"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-bold text-slate-900">🔒 Privacy:</span>
                                        <span className={v.agreePrivacy ? "text-emerald-600" : "text-slate-400"}>
                                          {v.agreePrivacy ? "✅ Accepted" : "❌ —"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="font-bold text-slate-900">🔔 Notifications:</span>
                                        <span className={v.agreeNotif ? "text-emerald-600" : "text-slate-400"}>
                                          {v.agreeNotif ? "✅ Enabled" : "❌ —"}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="font-bold text-slate-900">📎 Documents:</span>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                          {v.documents?.nicCopy || v.documents?.drivingLicense
                                            ? [
                                                v.documents?.nicCopy && (
                                                  <span key="nic" className="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg text-xs font-medium">
                                                    🆔 NIC
                                                  </span>
                                                ),
                                                v.documents?.drivingLicense && (
                                                  <span key="license" className="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg text-xs font-medium">
                                                    🪪 License
                                                  </span>
                                                ),
                                              ]
                                              : <span className="text-slate-400">—</span>}
                                        </div>
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
        
        {/* Report Generation Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-emerald-100">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    📄 Generate PDF Volunteer Report
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-3xl font-bold hover:bg-slate-100 rounded-xl p-2 transition-all duration-200"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-8">
                  {/* Data Selection */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-100">
                    <h3 className="text-lg font-bold uppercase tracking-wider text-emerald-700 mb-6 flex items-center gap-2">
                      📊 Select Data to Include
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={reportOptions.includeBasicInfo}
                          onChange={(e) => setReportOptions({...reportOptions, includeBasicInfo: e.target.checked})}
                          className="w-5 h-5 rounded-lg border-2 border-emerald-300 text-emerald-600 focus:ring-4 focus:ring-emerald-200"
                        />
                        <span className="text-sm font-medium text-slate-700">👤 Basic Information (Name, NIC, Gender)</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={reportOptions.includeContactInfo}
                          onChange={(e) => setReportOptions({...reportOptions, includeContactInfo: e.target.checked})}
                          className="w-5 h-5 rounded-lg border-2 border-emerald-300 text-emerald-600 focus:ring-4 focus:ring-emerald-200"
                        />
                        <span className="text-sm font-medium text-slate-700">📞 Contact Information (Email, Phone, Address)</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={reportOptions.includeSkills}
                          onChange={(e) => setReportOptions({...reportOptions, includeSkills: e.target.checked})}
                          className="w-5 h-5 rounded-lg border-2 border-emerald-300 text-emerald-600 focus:ring-4 focus:ring-emerald-200"
                        />
                        <span className="text-sm font-medium text-slate-700">🛠️ Skills & Experience</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={reportOptions.includeAvailability}
                          onChange={(e) => setReportOptions({...reportOptions, includeAvailability: e.target.checked})}
                          className="w-5 h-5 rounded-lg border-2 border-emerald-300 text-emerald-600 focus:ring-4 focus:ring-emerald-200"
                        />
                        <span className="text-sm font-medium text-slate-700">📅 Availability (Days, Time, Hours)</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={reportOptions.includeStatus}
                          onChange={(e) => setReportOptions({...reportOptions, includeStatus: e.target.checked})}
                          className="w-5 h-5 rounded-lg border-2 border-emerald-300 text-emerald-600 focus:ring-4 focus:ring-emerald-200"
                        />
                        <span className="text-sm font-medium text-slate-700">📊 Application Status & Join Date</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={reportOptions.includeAssignments}
                          onChange={(e) => setReportOptions({...reportOptions, includeAssignments: e.target.checked})}
                          className="w-5 h-5 rounded-lg border-2 border-emerald-300 text-emerald-600 focus:ring-4 focus:ring-emerald-200"
                        />
                        <span className="text-sm font-medium text-slate-700">🏢 Center Assignments</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Filters */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
                    <h3 className="text-lg font-bold uppercase tracking-wider text-blue-700 mb-6 flex items-center gap-2">
                      🔍 Filters
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-blue-900 mb-3">📅 Date Range</label>
                        <select
                          value={reportOptions.dateRange}
                          onChange={(e) => setReportOptions({...reportOptions, dateRange: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 text-sm font-medium focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                        >
                          <option value="all">🌍 All Time</option>
                          <option value="7days">📅 Last 7 Days</option>
                          <option value="30days">📆 Last 30 Days</option>
                          <option value="90days">📈 Last 90 Days</option>
                          <option value="1year">🗓️ Last Year</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-blue-900 mb-3">📊 Application Status</label>
                        <select
                          value={reportOptions.statusFilter}
                          onChange={(e) => setReportOptions({...reportOptions, statusFilter: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 text-sm font-medium focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                        >
                          <option value="all">🌟 All Status</option>
                          <option value="Accepted">✅ Accepted</option>
                          <option value="Rejected">❌ Rejected</option>
                          <option value="Pending">⏳ Pending</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-blue-900 mb-3">🏢 Center</label>
                        <select
                          value={reportOptions.centerFilter}
                          onChange={(e) => setReportOptions({...reportOptions, centerFilter: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 text-sm font-medium focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                        >
                          <option value="all">🌍 All Centers</option>
                          {getUniqueCenters().map(center => (
                            <option key={center} value={center}>{center}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Summary */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-100">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">📊</div>
                      <div>
                        <p className="text-sm font-medium text-purple-700">
                          Report will include <strong className="text-lg font-black text-purple-900">{filteredVolunteers.length}</strong> volunteers 
                          {reportOptions.statusFilter !== 'all' || reportOptions.centerFilter !== 'all' || reportOptions.dateRange !== 'all' 
                            ? ' after applying filters' 
                            : ''}
                        </p>
                        <p className="text-xs text-purple-600 mt-1">Click "Download PDF Report" to generate your report</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-end gap-4 pt-6 border-t-2 border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowReportModal(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold text-sm hover:shadow-lg transition-all duration-200 border-2 border-slate-200"
                    >
                      ❌ Cancel
                    </button>
                    <button
                      type="button"
                      onClick={generateReport}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-bold text-sm hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-emerald-400"
                    >
                      📄 Download PDF Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

