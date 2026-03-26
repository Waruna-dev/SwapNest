import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";

// ── Constants ──────────────────────────────────────────────────────────────
const STEPS = ["Basic Info", "Operations", "Facilities", "Manager"];
const totalSteps = 4;
const DISTRICTS = [
  "Colombo","Gampaha","Kalutara","Kandy","Galle",
  "Matara","Jaffna","Trincomalee","Kurunegala","Ratnapura","Badulla",
];
const FACILITIES_LIST = [
  "Storage","Sorting Area","Loading Bay","Office Space","Parking",
  "Security","Electricity","Water Supply","Internet","Rest Rooms"
];

// ── Helper Components ───────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <span className="inline-block bg-green-100 text-green-800 text-[11px] font-bold tracking-[1px] uppercase px-3 py-1 rounded-full mb-4">
      {children}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function CenterEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [step, setStep] = useState(1);
  const [centerName, setCenterName] = useState("");
  const [centerCode, setCenterCode] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  // Step 2 - Operations
  const [operatingHours, setOperatingHours] = useState("");
  const [capacity, setCapacity] = useState("");
  const [status, setStatus] = useState("Active");

  // Step 3 - Facilities
  const [facilities, setFacilities] = useState([]);

  // Step 4 - Manager
  const [managerName, setManagerName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [managerContact, setManagerContact] = useState("");

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Auto-generate center code from name
  useEffect(() => {
    if (centerName && !centerCode) {
      const code = centerName
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "")
        .toUpperCase()
        .slice(0, 6);
      setCenterCode(code);
    }
  }, [centerName]);

  // Load center data
  useEffect(() => {
    async function loadCenter() {
      try {
        const res = await API.get(`/api/centers/${id}`);
        let center = res.data;
        
        // Handle different response structures
        if (res.data?.data) {
          center = res.data.data;
        }
        
        console.log("Loaded center data:", center);
        
        setCenterName(center.centerName || "");
        setCenterCode(center.centerCode || "");
        setDistrict(center.district || "");
        setCity(center.city || "");
        setAddress(center.address || "");
        setEmail(center.email || "");
        setContactNumber(center.contactNumber || "");
        setOperatingHours(center.operatingHours || "");
        setCapacity(center.capacity || "");
        setStatus(center.status || "Active");
        setFacilities(center.facilities || []);
        setManagerName(center.managerName || "");
        setManagerEmail(center.managerEmail || "");
        setManagerContact(center.managerContact || "");
      } catch (err) {
        console.error("Error loading center:", err);
        alert("Failed to load center data. Please try again.");
        navigate('/dashboard/center');
      } finally {
        setLoading(false);
      }
    }

    loadCenter();
  }, [id, navigate]);

  const validateStep = () => {
    const newErrors = {};

    // Edit mode - no required fields, only validate format if field is filled
    if (step === 1) {
      if (email && !/\S+@\S+\.\S+/.test(email)) newErrors.email = "Please enter a valid email address";
    } else if (step === 2) {
      if (capacity && (isNaN(capacity) || capacity <= 0)) newErrors.capacity = "Capacity must be a positive number";
    } else if (step === 4) {
      if (managerEmail && !/\S+@\S+\.\S+/.test(managerEmail)) newErrors.managerEmail = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (validateStep()) {
      if (step < totalSteps) setStep(step + 1);
      else handleSubmit();
    }
  };

  const goBack = () => {
    setErrors({});
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrors({});

    const payload = {
      centerName,
      centerCode,
      district,
      city,
      address,
      email,
      contactNumber,
      operatingHours,
      capacity: Number(capacity),
      status,
      facilities,
      managerName,
      managerEmail,
      managerContact,
    };

    try {
      const res = await API.put(`/api/centers/${id}`, payload);
      const data = res.data;
      if (data.success || data._id) {
        // Show success message then redirect
        alert("Center updated successfully!");
        navigate('/dashboard/center');
      } else {
        alert(data.message || "Update failed. Please try again.");
      }
    } catch (error) {
      console.error("Error updating center:", error);
      alert(error.response?.data?.message || "Update failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const progressPct = [25, 50, 75, 100];

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen font-sans text-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading center data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen font-sans text-gray-800">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 pt-12 pb-16 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-gray-700/15 rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-gray-600/10 rounded-full pointer-events-none" />

        <div className="max-w-[860px] mx-auto relative z-10">
          {/* Brand */}
          <div className="flex items-center gap-2.5 mb-7">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-[18px]">🔄</div>
            <span className="text-[18px] font-bold text-white tracking-[-0.3px]">SwapNest</span>
          </div>

          <h1 className="text-[clamp(26px,4vw,38px)] font-bold text-white mb-3 leading-tight tracking-[-0.5px]">
            Edit <span className="text-gray-300">Center</span>
          </h1>
          <p className="text-[15px] text-white/80 max-w-[520px] leading-[1.65]">
            Update the details of this SwapNest collection center.
          </p>

          {/* Steps bar */}
          <div className="flex items-center flex-wrap gap-1 mt-8">
            {STEPS.map((label, i) => {
              const n = i + 1;
              const isActive = step === n;
              const isDone = step > n;
              return (
                <React.Fragment key={label}>
                  <div className={`flex items-center gap-2 transition-opacity duration-300 ${isActive || isDone ? "opacity-100" : "opacity-50"}`}>
                    <div className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-[12px] font-bold text-gray-800 flex-shrink-0 transition-colors duration-300 ${isActive ? "bg-white border-2 border-gray-400" : isDone ? "bg-gray-200" : "bg-white/50"}`}>
                      {n}
                    </div>
                    <span className="text-[12px] text-white/90 font-medium whitespace-nowrap">{label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-px bg-white/20 min-w-[16px] max-w-[40px]" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Form Card ─────────────────────────────────────────────────────── */}
      <div className="max-w-[860px] mx-auto -mt-8 relative z-20 px-6 pb-12">

        <div className="bg-white rounded-[20px] shadow-[0_4px_40px_rgba(0,0,0,0.10)] overflow-hidden">

          {/* Progress bar */}
          {!submitted && (
            <div className="h-1 bg-gray-200">
              <div
                className="h-full bg-gradient-to-r from-gray-600 to-gray-800 rounded-r-full transition-all duration-500"
                style={{ width: `${progressPct[step - 1]}%` }}
              />
            </div>
          )}

          {/* ── Step 1: Basic Information ─────────────────────────────────────── */}
          {step === 1 && !submitted && (
            <div className="px-10 pt-9 pb-7 max-sm:px-5">
              <SectionLabel>✏️ Step 1 of 4</SectionLabel>
              <h2 className="text-[22px] font-bold mb-2 tracking-[-0.3px]">Basic Information</h2>
              <p className="text-[15px] text-[#777] mb-7">Update the fundamental details of this center.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-bold text-[#555] mb-2">CENTER NAME</label>
                  <input
                    type="text"
                    value={centerName}
                    onChange={(e) => setCenterName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="e.g., Colombo Central Hub"
                  />
                  {errors.centerName && (
                    <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-xs flex items-center gap-1">
                        <span className="text-red-500">⚠️</span>
                        {errors.centerName}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#555] mb-2">CENTER CODE *</label>
                  <input
                    type="text"
                    value={centerCode}
                    onChange={(e) => setCenterCode(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="e.g., COL001"
                  />
                  {errors.centerCode && <p className="text-red-500 text-xs mt-1">{errors.centerCode}</p>}
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#555] mb-2">DISTRICT *</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="">Select district</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#555] mb-2">CITY / TOWN *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="e.g., Colombo"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[13px] font-bold text-[#555] mb-2">FULL ADDRESS *</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    placeholder="e.g., 123 Main Street, Colombo 01"
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#555] mb-2">EMAIL *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="center@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#555] mb-2">CONTACT NUMBER *</label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="+94 77 123 4567"
                  />
                  {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Operations ─────────────────────────────────────────── */}
          {step === 2 && !submitted && (
            <div className="px-10 pt-9 pb-7 max-sm:px-5">
              <SectionLabel>📅 Step 2 of 4</SectionLabel>
              <h2 className="text-[22px] font-bold mb-2 tracking-[-0.3px]">Operations</h2>
              <p className="text-[15px] text-[#777] mb-7">Define the operational details and capacity.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-[13px] font-bold text-[#555] mb-2">OPERATING HOURS *</label>
                  <input
                    type="text"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="e.g., Mon-Fri: 9AM-5PM, Sat: 9AM-1PM"
                  />
                  {errors.operatingHours && <p className="text-red-500 text-xs mt-1">{errors.operatingHours}</p>}
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#555] mb-2">CAPACITY (Volunteers) *</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="e.g., 50"
                  />
                  {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#555] mb-2">STATUS *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Facilities ─────────────────────────────────────────── */}
          {step === 3 && !submitted && (
            <div className="px-10 pt-9 pb-7 max-sm:px-5">
              <SectionLabel>🏢 Step 3 of 4</SectionLabel>
              <h2 className="text-[22px] font-bold mb-2 tracking-[-0.3px]">Facilities</h2>
              <p className="text-[15px] text-[#777] mb-7">Select the available facilities at this center.</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {FACILITIES_LIST.map(facility => (
                  <label key={facility} className="flex items-center gap-2 cursor-pointer p-3 border border-[#E0E0E0] rounded-[8px] hover:border-primary/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={facilities.includes(facility)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFacilities([...facilities, facility]);
                        } else {
                          setFacilities(facilities.filter(f => f !== facility));
                        }
                      }}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-[13px] text-[#555]">{facility}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 4: Manager ─────────────────────────────────────────── */}
          {step === 4 && !submitted && (
            <div className="px-10 pt-9 pb-7 max-sm:px-5">
              <SectionLabel>👤 Step 4 of 4</SectionLabel>
              <h2 className="text-[22px] font-bold mb-2 tracking-[-0.3px]">Manager Information</h2>
              <p className="text-[15px] text-[#777] mb-7">Update the details of the center manager.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-bold text-[#555] mb-2">MANAGER NAME *</label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="e.g., John Doe"
                  />
                  {errors.managerName && <p className="text-red-500 text-xs mt-1">{errors.managerName}</p>}
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#555] mb-2">MANAGER EMAIL *</label>
                  <input
                    type="email"
                    value={managerEmail}
                    onChange={(e) => setManagerEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="manager@example.com"
                  />
                  {errors.managerEmail && <p className="text-red-500 text-xs mt-1">{errors.managerEmail}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[13px] font-bold text-[#555] mb-2">MANAGER CONTACT *</label>
                  <input
                    type="tel"
                    value={managerContact}
                    onChange={(e) => setManagerContact(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="+94 77 123 4567"
                  />
                  {errors.managerContact && <p className="text-red-500 text-xs mt-1">{errors.managerContact}</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── Success Screen ─────────────────────────────────────────── */}
          {submitted && (
            <div className="px-10 py-16 text-center max-sm:px-5">
              <div className="text-[64px] mb-5">✅</div>
              <h2 className="text-[26px] font-bold text-primary mb-3">Center Updated!</h2>
              <p className="text-[15px] text-[#777] max-w-[420px] mx-auto mb-9 leading-[1.65]">
                The center details have been successfully updated in the system.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/dashboard/center')}
                  className="bg-white text-primary px-7 py-3 rounded-[10px] text-[14px] font-semibold border-[1.5px] border-primary hover:bg-cream hover:-translate-y-px transition-all duration-200"
                >
                  ✕ Close
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-primary text-white px-7 py-3 rounded-[10px] text-[14px] font-semibold shadow-[0_2px_12px_rgba(45,74,53,0.25)] hover:bg-[#24392b] hover:-translate-y-px transition-all duration-200"
                >
                  ← Edit Again
                </button>
              </div>
            </div>
          )}

          {/* ── Navigation ─────────────────────────────────────────────── */}
          {!submitted && (
            <div className="flex items-center justify-between gap-3 px-10 pt-6 pb-8 border-t border-[#F0EBE0] max-sm:px-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/dashboard/center')}
                  className="px-7 py-3 rounded-[10px] text-[14px] font-semibold text-[#888] bg-transparent border-[1.5px] border-[#ddd] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
                >
                  ✕ Close
                </button>
                {step > 1 && (
                  <button onClick={goBack}
                    className="px-7 py-3 rounded-[10px] text-[14px] font-semibold text-[#888] bg-transparent border-[1.5px] border-border hover:bg-cream hover:text-[#1A1A1A] hover:border-[#bbb] transition-all duration-200"
                  >
                    ← Back
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-7 py-3 rounded-[10px] text-[14px] font-semibold text-white bg-green-600 shadow-[0_2px_12px_rgba(34,197,94,0.25)] hover:bg-green-700 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(34,197,94,0.3)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving…" : "💾 Save Changes"}
                </button>
              </div>

              <button onClick={goNext} disabled={isLoading}
                className="ml-auto px-7 py-3 rounded-[10px] text-[14px] font-semibold text-white bg-green-700 shadow-[0_2px_12px_rgba(45,74,53,0.25)] hover:bg-green-800 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(45,74,53,0.3)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
                {isLoading ? "Updating…" : step === totalSteps ? "Update Center ✓" : "Continue →"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}