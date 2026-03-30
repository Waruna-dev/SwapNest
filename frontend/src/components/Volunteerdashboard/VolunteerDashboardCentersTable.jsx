import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE_FALLBACK = "http://localhost:5000";

export default function VolunteerCentersTable() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [centers, setCenters] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportOptions, setReportOptions] = useState({
    includeBasicInfo: true,
    includeContactInfo: true,
    includeCapacity: true,
    includeStatus: true,
    dateRange: 'all',
    statusFilter: 'all',
    districtFilter: 'all'
  });

  const activeCentersCount = useMemo(() => centers.length, [centers]);
  const totalCentersCount = useMemo(() => centers.length, [centers]);
  const totalCapacity = useMemo(() => centers.reduce((sum, c) => sum + (c.capacity || 0), 0), [centers]);
  const districtsCovered = useMemo(() => {
    const districts = new Set(centers.map(c => c.district).filter(Boolean));
    return districts.size;
  }, [centers]);

  const generateReport = () => {
    try {
      let filteredData = [...centers];
      
      // Apply status filter
      if (reportOptions.statusFilter !== 'all') {
        filteredData = filteredData.filter(c => 
          c.status === reportOptions.statusFilter
        );
      }
      
      // Apply district filter
      if (reportOptions.districtFilter !== 'all') {
        filteredData = filteredData.filter(c => 
          c.district === reportOptions.districtFilter
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
      doc.text("Centers Report", 148, 15, { align: "center" });
      
      // Report metadata
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 25);
      doc.text(`Total Centers: ${filteredData.length}`, 20, 30);
      
      // Add filters info if applied
      let filterText = [];
      if (reportOptions.statusFilter !== 'all') filterText.push(`Status: ${reportOptions.statusFilter}`);
      if (reportOptions.districtFilter !== 'all') filterText.push(`District: ${reportOptions.districtFilter}`);
      
      if (filterText.length > 0) {
        doc.setFontSize(8);
        doc.text(`Filters: ${filterText.join(', ')}`, 20, 35);
      }
      
      // Prepare table columns based on selected options
      const columns = [];
      if (reportOptions.includeBasicInfo) {
        columns.push({ title: "Center Name", dataKey: "centerName" });
        columns.push({ title: "Center Code", dataKey: "centerCode" });
      }
      
      if (reportOptions.includeContactInfo) {
        columns.push({ title: "District", dataKey: "district" });
      }
      
      if (reportOptions.includeCapacity) {
        columns.push({ title: "Capacity", dataKey: "capacity" });
      }
      
      if (reportOptions.includeStatus) {
        columns.push({ title: "Status", dataKey: "status" });
      }
      
      // Prepare table data
      const tableData = filteredData.map(c => {
        const row = {};
        
        if (reportOptions.includeBasicInfo) {
          row.centerName = c.centerName || '';
          row.centerCode = c.centerCode || '';
        }
        
        if (reportOptions.includeContactInfo) {
          row.district = c.district || '';
        }
        
        if (reportOptions.includeCapacity) {
          row.capacity = c.capacity || 0;
        }
        
        if (reportOptions.includeStatus) {
          row.status = c.status || 'Active';
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
          widths.centerName = 60;
          widths.centerCode = 30;
        }
        if (reportOptions.includeContactInfo) {
          widths.district = 40;
        }
        if (reportOptions.includeCapacity) {
          widths.capacity = 30;
        }
        if (reportOptions.includeStatus) {
          widths.status = 30;
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
              fontStyle: col.dataKey === 'centerName' ? 'bold' : 'normal'
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
      doc.text("Generated by SwapNest Center Management System", 105, finalY + 10, { align: "center" });
      
      // Save the PDF
      doc.save(`centers_report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      setShowReportModal(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError(`Failed to generate PDF: ${error.message}`);
    }
  };

  const getUniqueDistricts = () => {
    const districts = [...new Set(centers.map(c => c.district).filter(Boolean))];
    return districts.sort();
  };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Statistics Cards - Moved to Top */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-emerald-700 mb-2">
                  🏢 Total Centers
                </p>
                <p className="text-3xl font-black text-emerald-900">{totalCentersCount}</p>
              </div>
              <div className="text-4xl text-emerald-600">🏢</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-green-700 mb-2">
                  ✅ Active Centers
                </p>
                <p className="text-3xl font-black text-green-900">{activeCentersCount}</p>
              </div>
              <div className="text-4xl text-green-600">✅</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-amber-700 mb-2">
                  👥 Total Capacity
                </p>
                <p className="text-3xl font-black text-amber-900">{totalCapacity}</p>
              </div>
              <div className="text-4xl text-amber-600">👥</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-blue-700 mb-2">
                  📍 Districts Covered
                </p>
                <p className="text-3xl font-black text-blue-900">{districtsCovered}</p>
              </div>
              <div className="text-4xl text-blue-600">📍</div>
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="mb-8 bg-white rounded-3xl shadow-xl border border-emerald-100 p-8 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-black">
                Volunteer Centers
              </h1>
              <p className="text-slate-500 mt-3 text-lg font-medium">
                Choose a center and apply as a volunteer.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-emerald-400"
              >
                📄 Generate Report
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border-2 border-emerald-100 p-8 shadow-lg">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-4 h-4 bg-emerald-500 rounded-full animate-bounce"></div>
              <div className="w-4 h-4 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-4 h-4 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <span className="text-slate-600 font-medium">Loading centers...</span>
            </div>
          </div>
        ) : error ? (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border-2 border-red-200 p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="text-2xl">⚠️</div>
              <p className="text-red-700 font-bold text-lg">{error}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border-2 border-emerald-100 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-emerald-50 to-teal-50 text-xs font-black text-slate-700 border-b-2 border-emerald-200">
                    <th className="px-6 py-4 min-w-[200px]">🏢 Center</th>
                    <th className="px-6 py-4 min-w-[150px]">📍 District</th>
                    <th className="px-6 py-4 min-w-[120px]">🔢 Code</th>
                    <th className="px-6 py-4 min-w-[120px]">👥 Capacity</th>
                    <th className="px-6 py-4 min-w-[120px]">📊 Status</th>
                    <th className="px-6 py-4 min-w-[180px]">🎯 Action</th>
                  </tr>
                </thead>
                <tbody>
                  {centers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="text-6xl">🏢</div>
                          <p className="text-slate-500 font-bold text-lg">No active centers found.</p>
                          <p className="text-slate-400">Check back later for available centers</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    centers.map((c) => (
                      <tr key={c._id} className="border-b border-emerald-100 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-200">
                        <td className="px-6 py-4">
                          <div className="font-black text-slate-900">
                            {c.centerName || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{c.district || "—"}</td>
                        <td className="px-6 py-4 text-slate-600">{c.centerCode || "—"}</td>
                        <td className="px-6 py-4 text-slate-600">{c.capacity ?? 0}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full border-2 border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                            {c.status || "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              navigate("/volunteer/apply", {
                                state: { center: c },
                              })
                            }
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2 rounded-xl font-bold text-sm hover:shadow-lg transform hover:scale-105 transition-all duration-300 border border-emerald-400"
                          >
                            ➕ Become a Volunteer
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
        
        {/* Report Generation Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-emerald-100">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    📄 Generate PDF Centers Report
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
                        <span className="text-sm font-medium text-slate-700">🏢 Basic Information (Name, Code)</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={reportOptions.includeContactInfo}
                          onChange={(e) => setReportOptions({...reportOptions, includeContactInfo: e.target.checked})}
                          className="w-5 h-5 rounded-lg border-2 border-emerald-300 text-emerald-600 focus:ring-4 focus:ring-emerald-200"
                        />
                        <span className="text-sm font-medium text-slate-700">📍 Location Information (District)</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={reportOptions.includeCapacity}
                          onChange={(e) => setReportOptions({...reportOptions, includeCapacity: e.target.checked})}
                          className="w-5 h-5 rounded-lg border-2 border-emerald-300 text-emerald-600 focus:ring-4 focus:ring-emerald-200"
                        />
                        <span className="text-sm font-medium text-slate-700">👥 Capacity Information</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          checked={reportOptions.includeStatus}
                          onChange={(e) => setReportOptions({...reportOptions, includeStatus: e.target.checked})}
                          className="w-5 h-5 rounded-lg border-2 border-emerald-300 text-emerald-600 focus:ring-4 focus:ring-emerald-200"
                        />
                        <span className="text-sm font-medium text-slate-700">📊 Status Information</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Filters */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
                    <h3 className="text-lg font-bold uppercase tracking-wider text-blue-700 mb-6 flex items-center gap-2">
                      🔍 Filters
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-blue-900 mb-3">📊 Center Status</label>
                        <select
                          value={reportOptions.statusFilter}
                          onChange={(e) => setReportOptions({...reportOptions, statusFilter: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 text-sm font-medium focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                        >
                          <option value="all">🌟 All Status</option>
                          <option value="Active">✅ Active</option>
                          <option value="Inactive">❌ Inactive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-blue-900 mb-3">📍 District</label>
                        <select
                          value={reportOptions.districtFilter}
                          onChange={(e) => setReportOptions({...reportOptions, districtFilter: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 text-sm font-medium focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                        >
                          <option value="all">🌍 All Districts</option>
                          {getUniqueDistricts().map(district => (
                            <option key={district} value={district}>{district}</option>
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
                          Report will include <strong className="text-lg font-black text-purple-900">{centers.length}</strong> centers 
                          {reportOptions.statusFilter !== 'all' || reportOptions.districtFilter !== 'all' 
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

