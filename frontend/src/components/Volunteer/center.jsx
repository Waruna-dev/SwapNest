
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

// ── Constants ──────────────────────────────────────────────────────────────
const STEPS = ["Basic Info", "Operations", "Facilities", "Manager", "Review"];
const DISTRICTS = [
  "Colombo","Gampaha","Kalutara","Kandy","Galle",
  "Matara","Jaffna","Trincomalee","Kurunegala","Ratnapura","Badulla",
];
const FACILITIES_LIST = [
  "Storage","Sorting Area","Loading Bay",
  "Parking","CCTV","Weighing Scale","Office Space",
];
const FACILITY_ICONS = {
  Storage:"🗄️","Sorting Area":"🗂️","Loading Bay":"🚛",
  Parking:"🚗",CCTV:"📷","Weighing Scale":"⚖️","Office Space":"🏢",
};
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const DAY_SHORT = {
  Monday:"Mo",Tuesday:"Tu",Wednesday:"We",
  Thursday:"Th",Friday:"Fr",Saturday:"Sa",Sunday:"Su",
};

// ── Input class helper ─────────────────────────────────────────────────────
const inputCls = (hasError) =>
  `w-full px-[14px] py-[11px] border-[1.5px] rounded-[10px] text-[14px] text-[#1A1A1A] bg-white outline-none transition-all duration-200 focus:border-primary focus:ring-[3px] focus:ring-primary/10 font-sans resize-none ${
    hasError ? "border-red-500" : "border-border"
  }`;

// ── Phone number validation ─────────────────────────────────────────────
const validatePhoneNumber = (phone) => {
  if (!phone || !phone.trim()) return false;
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Sri Lankan phone number patterns
  const patterns = [
    /^0[1-9]\d{8}$/,           // 0XX XXXXXXX (10 digits starting with 0)
    /^\+94[1-9]\d{8}$/,        // +94 XX XXXXXXX (12 digits starting with +94)
    /^94[1-9]\d{8}$/,          // 94 XX XXXXXXX (11 digits starting with 94)
    /^[1-9]\d{8}$/             // XX XXXXXXX (9 digits, without prefix)
  ];
  
  return patterns.some(pattern => pattern.test(cleaned));
};

// ── Field Wrapper ──────────────────────────────────────────────────────────
function F({ label, children, req, name, errors }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-[#555] uppercase tracking-[0.7px] mb-2">
        {label}
        {req && <span className="text-accent ml-0.5">*</span>}
      </label>
      {children}
      {errors?.[name] && (
        <p className="text-[11px] text-red-500 mt-1">{errors[name]}</p>
      )}
    </div>
  );
}

// ── Toggle Switch ──────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center w-[42px] h-6 flex-shrink-0 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange}
        className="absolute opacity-0 w-0 h-0" />
      <span className={`absolute inset-0 rounded-full transition-colors duration-300 ${checked ? "bg-primary" : "bg-border"}`}>
        <span className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform duration-300 ${checked ? "translate-x-[21px]" : "translate-x-[3px]"}`} />
      </span>
    </label>
  );
}

// ── Info Banner ────────────────────────────────────────────────────────────
function InfoBanner({ children }) {
  return (
    <div className="flex items-start gap-2.5 bg-light-sage border border-primary/20 rounded-[10px] px-4 py-3 text-[13px] text-primary mb-6 leading-relaxed">
      {children}
    </div>
  );
}

// ── Section Label badge ────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <span className="inline-block bg-light-sage text-primary text-[11px] font-bold tracking-[1px] uppercase px-3 py-1 rounded-full mb-4">
      {children}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function Center() {
  const navigate = useNavigate();
  const [step, setStep]         = useState(1);
  const totalSteps              = 5;

  // Step 1
  const [centerName, setCenterName]       = useState("");
  const [centerCode, setCenterCode]       = useState("");
  const [district, setDistrict]           = useState("");
  const [city, setCity]                   = useState("");
  const [address, setAddress]             = useState("");
  const [email, setEmail]                 = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [description, setDescription]     = useState("");
  const [latitude, setLatitude]           = useState("");
  const [longitude, setLongitude]         = useState("");
  const [mapError, setMapError]           = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Step 2
  const [openTime, setOpenTime]           = useState("08:00");
  const [closeTime, setCloseTime]         = useState("17:00");
  const [operatingDays, setOperatingDays] = useState(["Monday","Tuesday","Wednesday","Thursday","Friday"]);
  const [capacity, setCapacity]           = useState("");
  const [status, setStatus]               = useState("Active");

  // Step 3
  const [facilities, setFacilities]     = useState([]);
  const [hasParking, setHasParking]     = useState(false);
  const [hasCCTV, setHasCCTV]           = useState(false);
  const [isAccessible, setIsAccessible] = useState(false);

  // Step 4
  const [managerName, setManagerName]       = useState("");
  const [managerContact, setManagerContact] = useState("");

  const [errors, setErrors]       = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-generate center code from name
  useEffect(() => {
    if (centerName && !centerCode) {
      const generated =
        centerName.replace(/[^a-zA-Z0-9 ]/g, "").split(" ").filter(Boolean)
          .map((w) => w[0].toUpperCase()).join("") +
        "-" + Date.now().toString().slice(-4);
      setCenterCode(generated);
    }
  }, [centerName]);

  const toggleDay = (day) =>
    setOperatingDays((p) => p.includes(day) ? p.filter((d) => d !== day) : [...p, day]);

  const toggleFacility = (f) =>
    setFacilities((p) => p.includes(f) ? p.filter((x) => x !== f) : [...p, f]);

  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!centerName.trim())    e.centerName    = "Center name is required";
      if (!district)             e.district      = "Please select a district";
      if (!city.trim())          e.city          = "City is required";
      if (!address.trim())       e.address       = "Address is required";
      if (!email.trim())         e.email         = "Email is required";
      else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Invalid email address";
      if (!contactNumber.trim()) e.contactNumber = "Contact number is required";
      else if (!validatePhoneNumber(contactNumber)) e.contactNumber = "Please enter a valid Sri Lankan phone number (e.g., +94 11 234 5678)";
    }
    if (step === 2) {
      if (!capacity)                                     e.capacity      = "Capacity is required";
      else if (isNaN(capacity) || Number(capacity) < 1)  e.capacity      = "Enter a valid capacity";
      if (operatingDays.length === 0)                    e.operatingDays = "Select at least one operating day";
    }
    if (step === 4) {
      if (!managerName.trim())    e.managerName    = "Manager name is required";
      if (!managerContact.trim()) e.managerContact = "Manager contact is required";
      else if (!validatePhoneNumber(managerContact)) e.managerContact = "Please enter a valid Sri Lankan phone number (e.g., +94 77 456 7890)";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (!validate()) return;
    if (step === totalSteps) { handleSubmit(); return; }
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Location functions
  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    setMapError("");

    if (!navigator.geolocation) {
      setMapError("Geolocation is not supported by your browser");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        setLatitude(lat);
        setLongitude(lng);
        setIsLoadingLocation(false);
        console.log("Got current location:", { lat, lng });
      },
      (error) => {
        setMapError("Unable to get your location: " + error.message);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const geocodeAddress = async () => {
    if (!address || !city || !district) {
      setMapError("Please fill in address, city, and district first");
      return;
    }

    setIsLoadingLocation(true);
    setMapError("");

    try {
      const fullAddress = `${address}, ${city}, ${district}, Sri Lanka`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat).toFixed(6);
        const lng = parseFloat(data[0].lon).toFixed(6);
        setLatitude(lat);
        setLongitude(lng);
        console.log("Geocoded address:", { lat, lng, address: fullAddress });
      } else {
        setMapError("Address not found. Please try a more specific address or use current location.");
      }
    } catch (error) {
      setMapError("Failed to geocode address: " + error.message);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const payload = {
      centerName, centerCode, district, city, address, email,
      contactNumber, description,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      capacity: Number(capacity), status,
      operatingHours: { open: openTime, close: closeTime },
      operatingDays, facilities, managerName, managerContact,
    };
    try {
      const res = await API.post("/api/centers", payload);
      const data = res.data;
      if (data.success || data._id) {
        setSubmitted(true);
      } else {
        alert(data.message || "Submission failed. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting center:", error);
      alert(error.response?.data?.message || "Submission failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const progressPct = [20, 40, 60, 80, 100];

  return (
    <div className="bg-cream min-h-screen font-sans text-[#1A1A1A]">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="bg-primary px-6 pt-12 pb-16 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-sage/15 rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-accent/10 rounded-full pointer-events-none" />

        <div className="max-w-[860px] mx-auto relative z-10">
          {/* Brand */}
          <div className="flex items-center gap-2.5 mb-7">
            <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-[18px]">🔄</div>
            <span className="text-[18px] font-bold text-white tracking-[-0.3px]">SwapNest</span>
          </div>

          <h1 className="text-[clamp(26px,4vw,38px)] font-bold text-white mb-3 leading-tight tracking-[-0.5px]">
            Register a <span className="text-[#9DC3A0]">New Center</span>
          </h1>
          <p className="text-[15px] text-white/70 max-w-[520px] leading-[1.65]">
            Add a new SwapNest collection center to expand our community network across Sri Lanka.
          </p>

          {/* Steps bar */}
          <div className="flex items-center flex-wrap gap-1 mt-8">
            {STEPS.map((label, i) => {
              const n        = i + 1;
              const isActive = step === n;
              const isDone   = step > n;
              return (
                <React.Fragment key={label}>
                  <div className={`flex items-center gap-2 transition-opacity duration-300 ${isActive || isDone ? "opacity-100" : "opacity-50"}`}>
                    <div className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0 transition-colors duration-300 ${isActive ? "bg-accent" : isDone ? "bg-sage" : "bg-white/20"}`}>
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

      {/* ── Form Card ────────────────────────────────────────────────────── */}
      <div className="max-w-[860px] mx-auto px-4 -mt-8 mb-16">
        <div className="bg-white rounded-[20px] shadow-[0_4px_40px_rgba(0,0,0,0.10)] overflow-hidden">

          {/* Progress bar */}
          {!submitted && (
            <div className="h-1 bg-[#EDE8DF]">
              <div
                className="h-full bg-gradient-to-r from-primary to-sage rounded-r-full transition-all duration-500"
                style={{ width: `${progressPct[step - 1]}%` }}
              />
            </div>
          )}

          {/* ── Step 1: Basic Info ─────────────────────────────────────── */}
          {step === 1 && (
            <div className="px-10 pt-9 pb-7 max-sm:px-5">
              <SectionLabel>🏢 Step 1 of 5</SectionLabel>
              <h2 className="text-[22px] font-bold mb-2 tracking-[-0.3px]">Basic Information</h2>
              <p className="text-[14px] text-[#888] mb-7 leading-[1.6]">Enter the core details for the new SwapNest center.</p>

              <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-[18px]">
                <F label="Center Name" req name="centerName" errors={errors}>
                  <input type="text" placeholder="SwapNest Colombo Central"
                    value={centerName} onChange={(e) => setCenterName(e.target.value)}
                    className={inputCls(errors.centerName)} />
                </F>

                <F label="Center Code" name="centerCode" errors={errors}>
                  <input type="text" placeholder="Auto-generated"
                    value={centerCode} onChange={(e) => setCenterCode(e.target.value)}
                    className={inputCls(false)} />
                </F>

                <F label="District" req name="district" errors={errors}>
                  <select value={district} onChange={(e) => setDistrict(e.target.value)}
                    className={inputCls(errors.district)}>
                    <option value="">Select district</option>
                    {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </F>

                <F label="City / Town" req name="city" errors={errors}>
                  <input type="text" placeholder="Borella"
                    value={city} onChange={(e) => setCity(e.target.value)}
                    className={inputCls(errors.city)} />
                </F>

                <div className="col-span-2 max-sm:col-span-1">
                  <F label="Full Address" req name="address" errors={errors}>
                    <textarea rows={3} placeholder="No. 45, Baseline Road, Colombo 09"
                      value={address} onChange={(e) => setAddress(e.target.value)}
                      className={`${inputCls(errors.address)} min-h-[90px]`} />
                  </F>
                </div>

                <F label="Email Address" req name="email" errors={errors}>
                  <input type="email" placeholder="center@swapnest.lk"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className={inputCls(errors.email)} />
                </F>

                <F label="Contact Number" req name="contactNumber" errors={errors}>
                  <input type="tel" placeholder="+94 11 234 5678"
                    value={contactNumber} onChange={(e) => setContactNumber(e.target.value)}
                    className={inputCls(errors.contactNumber)} />
                </F>

                <F label="Latitude (optional)" name="latitude" errors={errors}>
                  <input type="number" placeholder="6.9271" step="0.0001"
                    value={latitude} onChange={(e) => setLatitude(e.target.value)}
                    className={inputCls(false)} />
                </F>

                <F label="Longitude (optional)" name="longitude" errors={errors}>
                  <input type="number" placeholder="79.8612" step="0.0001"
                    value={longitude} onChange={(e) => setLongitude(e.target.value)}
                    className={inputCls(false)} />
                </F>

                {/* Location Section */}
                <div className="col-span-2 max-sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-[#555] uppercase tracking-[0.7px] mb-2">
                    📍 Location Detection
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={isLoadingLocation}
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isLoadingLocation ? "📍 Getting Location..." : "📍 Use Current Location"}
                      </button>
                      <button
                        type="button"
                        onClick={geocodeAddress}
                        disabled={isLoadingLocation}
                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isLoadingLocation ? "🔍 Geocoding..." : "🔍 Get from Address"}
                      </button>
                    </div>
                    
                    {mapError && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                        ⚠️ {mapError}
                      </div>
                    )}
                    
                    {(latitude || longitude) && (
                      <div className="mt-3">
                        <div className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-600 mb-2">
                          ✅ Location set: {latitude ? latitude : 'N/A'}, {longitude ? longitude : 'N/A'}
                        </div>
                        
                        {/* Beautiful Location Data Display */}
                        <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-slate-50 to-gray-100 overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-4">
                            <div className="flex items-center justify-between">
                              <div className="text-white">
                                <div className="text-lg font-bold flex items-center gap-2">
                                  📍 Location Details
                                </div>
                                <div className="text-sm text-blue-100 mt-1">
                                  {centerName || 'Center Location'}
                                </div>
                              </div>
                              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🌍</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Latitude</div>
                                <div className="text-sm font-mono font-semibold text-gray-800">
                                  {latitude || 'Not set'}
                                </div>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Longitude</div>
                                <div className="text-sm font-mono font-semibold text-gray-800">
                                  {longitude || 'Not set'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Address</div>
                              <div className="text-sm text-gray-800">
                                {address && <div className="mb-1">{address}</div>}
                                {city && district && (
                                  <div className="text-gray-600">
                                    {city}, {district}, Sri Lanka
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Location coordinates captured
                              </div>
                              <a 
                                href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition-colors inline-flex items-center gap-1"
                              >
                                🗺️ View Maps
                              </a>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-center">
                          📍 {centerName || 'Center Location'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-span-2 max-sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-[#555] uppercase tracking-[0.7px] mb-2">
                    Description{" "}
                    <span className="text-[#aaa] normal-case font-normal tracking-normal">(optional)</span>
                  </label>
                  <textarea rows={3} placeholder="Brief description of this center's purpose, coverage area, or special features..."
                    value={description} onChange={(e) => setDescription(e.target.value)}
                    className={`${inputCls(false)} min-h-[90px]`} />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Operations ─────────────────────────────────────── */}
          {step === 2 && (
            <div className="px-10 pt-9 pb-7 max-sm:px-5">
              <SectionLabel>⏰ Step 2 of 5</SectionLabel>
              <h2 className="text-[22px] font-bold mb-2 tracking-[-0.3px]">Operating Schedule</h2>
              <p className="text-[14px] text-[#888] mb-7 leading-[1.6]">Define when this center is open and how many volunteers it can handle.</p>

              <label className="block text-[11px] font-semibold text-[#555] uppercase tracking-[0.7px] mb-3">
                Operating Days <span className="text-accent">*</span>
              </label>
              {errors.operatingDays && <p className="text-[11px] text-red-500 mb-2">{errors.operatingDays}</p>}

              <div className="flex flex-wrap gap-2 mb-7">
                {DAYS.map((day) => {
                  const sel = operatingDays.includes(day);
                  return (
                    <button key={day} type="button" onClick={() => toggleDay(day)}
                      className={`flex flex-col items-center gap-0.5 w-[72px] py-2.5 px-1.5 border-[1.5px] rounded-[10px] text-[11px] font-semibold uppercase tracking-[0.4px] transition-all duration-200 cursor-pointer ${
                        sel
                          ? "border-primary bg-light-sage text-primary"
                          : "border-border bg-cream text-[#888] hover:border-sage hover:bg-[#f0f5f0]"
                      }`}>
                      <span className={`text-[18px] font-bold tracking-[-0.5px] ${sel ? "text-primary" : "text-[#1A1A1A]"}`}>
                        {DAY_SHORT[day]}
                      </span>
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-[18px]">
                <F label="Opening Time" name="openTime" errors={errors}>
                  <input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)}
                    className={inputCls(false)} />
                </F>
                <F label="Closing Time" name="closeTime" errors={errors}>
                  <input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)}
                    className={inputCls(false)} />
                </F>
                <F label="Volunteer Capacity" req name="capacity" errors={errors}>
                  <input type="number" min="1" placeholder="50"
                    value={capacity} onChange={(e) => setCapacity(e.target.value)}
                    className={inputCls(errors.capacity)} />
                </F>
                <F label="Status" name="status" errors={errors}>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls(false)}>
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Under Maintenance</option>
                  </select>
                </F>
              </div>
            </div>
          )}

          {/* ── Step 3: Facilities ─────────────────────────────────────── */}
          {step === 3 && (
            <div className="px-10 pt-9 pb-7 max-sm:px-5">
              <SectionLabel>🏗️ Step 3 of 5</SectionLabel>
              <h2 className="text-[22px] font-bold mb-2 tracking-[-0.3px]">Facilities & Features</h2>
              <p className="text-[14px] text-[#888] mb-7 leading-[1.6]">
                Select the facilities available at this center. This helps match the right volunteers to the right tasks.
              </p>

              <InfoBanner>
                💡 <span>Facility details help volunteers know what to expect on-site. Select everything that applies.</span>
              </InfoBanner>

              <label className="block text-[11px] font-semibold text-[#555] uppercase tracking-[0.7px] mb-3">
                Available Facilities
              </label>

              <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5 mb-7">
                {FACILITIES_LIST.map((f) => {
                  const checked = facilities.includes(f);
                  return (
                    <label key={f}
                      className={`flex flex-col items-center gap-1.5 py-3.5 px-2.5 border-[1.5px] rounded-[12px] cursor-pointer text-[13px] font-medium text-center transition-all duration-200 ${
                        checked
                          ? "border-primary bg-light-sage text-primary font-semibold"
                          : "border-border bg-cream text-[#666] hover:border-sage hover:bg-[#f0f5f0]"
                      }`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleFacility(f)}
                        className="absolute opacity-0 w-0 h-0" />
                      <span className="text-[20px]">{FACILITY_ICONS[f]}</span>
                      {f}
                    </label>
                  );
                })}
              </div>

              <label className="block text-[11px] font-semibold text-[#555] uppercase tracking-[0.7px] mb-3">
                Additional Features
              </label>
              <div>
                {[
                  { id:"parking",    state:hasParking,   set:setHasParking,   title:"Dedicated Parking Available", desc:"Vehicles can be parked on-site" },
                  { id:"cctv",       state:hasCCTV,      set:setHasCCTV,      title:"24/7 CCTV Surveillance",      desc:"Security cameras monitor the premises" },
                  { id:"accessible", state:isAccessible, set:setIsAccessible, title:"Wheelchair Accessible",       desc:"Ramps and accessible entrances available" },
                ].map(({ id, state, set, title, desc }, idx, arr) => (
                  <div key={id}
                    className={`flex items-center justify-between gap-4 py-3.5 ${idx < arr.length - 1 ? "border-b border-[#F0EBE0]" : ""}`}>
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#1A1A1A] mb-0.5">{title}</h4>
                      <p className="text-[12px] text-[#999]">{desc}</p>
                    </div>
                    <Toggle checked={state} onChange={(e) => set(e.target.checked)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 4: Manager ────────────────────────────────────────── */}
          {step === 4 && (
            <div className="px-10 pt-9 pb-7 max-sm:px-5">
              <SectionLabel>👤 Step 4 of 5</SectionLabel>
              <h2 className="text-[22px] font-bold mb-2 tracking-[-0.3px]">Center Manager</h2>
              <p className="text-[14px] text-[#888] mb-7 leading-[1.6]">
                Assign a manager responsible for overseeing this center's day-to-day operations.
              </p>
              <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-[18px] mb-6">
                <F label="Manager Full Name" req name="managerName" errors={errors}>
                  <input type="text" placeholder="Kamal Bandara"
                    value={managerName} onChange={(e) => setManagerName(e.target.value)}
                    className={inputCls(errors.managerName)} />
                </F>
                <F label="Manager Contact" req name="managerContact" errors={errors}>
                  <input type="tel" placeholder="+94 77 456 7890"
                    value={managerContact} onChange={(e) => setManagerContact(e.target.value)}
                    className={inputCls(errors.managerContact)} />
                </F>
              </div>
              <InfoBanner>
                ℹ️ <span>The manager will receive task notifications and volunteer assignment updates via SMS and email.</span>
              </InfoBanner>
            </div>
          )}

          {/* ── Step 5: Review ─────────────────────────────────────────── */}
          {step === 5 && !submitted && (
            <div className="px-10 pt-9 pb-7 max-sm:px-5">
              <SectionLabel>✅ Step 5 of 5</SectionLabel>
              <h2 className="text-[22px] font-bold mb-2 tracking-[-0.3px]">Review & Submit</h2>
              <p className="text-[14px] text-[#888] mb-7 leading-[1.6]">Review the information below before registering this center.</p>

              <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
                {[
                  ["Center Name",     centerName    || "—"],
                  ["Center Code",     centerCode    || "—"],
                  ["District",        district      || "—"],
                  ["City",            city          || "—"],
                  ["Email",           email         || "—"],
                  ["Contact",         contactNumber || "—"],
                  ["Capacity",        capacity ? `${capacity} volunteers` : "—"],
                  ["Status",          status],
                  ["Operating Days",  operatingDays.length > 0 ? operatingDays.map((d) => d.slice(0, 3)).join(", ") : "—"],
                  ["Hours",           `${openTime} – ${closeTime}`],
                  ["Manager",         managerName    || "—"],
                  ["Manager Contact", managerContact || "—"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-cream rounded-[10px] border border-border px-4 py-3.5">
                    <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-[#999] mb-1">{label}</div>
                    <div className="text-[14px] font-medium text-[#1A1A1A]">{value}</div>
                  </div>
                ))}

                <div className="col-span-2 max-sm:col-span-1 bg-cream rounded-[10px] border border-border px-4 py-3.5">
                  <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-[#999] mb-1">Facilities</div>
                  <div className="text-[14px] font-medium text-[#1A1A1A]">
                    {facilities.length > 0 ? facilities.join(", ") : "None selected"}
                  </div>
                </div>

                {address && (
                  <div className="col-span-2 max-sm:col-span-1 bg-cream rounded-[10px] border border-border px-4 py-3.5">
                    <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-[#999] mb-1">Address</div>
                    <div className="text-[14px] font-medium text-[#1A1A1A]">{address}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Success Screen ─────────────────────────────────────────── */}
          {submitted && (
            <div className="px-10 py-16 text-center max-sm:px-5">
              <div className="text-[64px] mb-5">🎉</div>
              <h2 className="text-[26px] font-bold text-primary mb-3">Center Registered!</h2>
              <p className="text-[15px] text-[#777] max-w-[420px] mx-auto mb-9 leading-[1.65]">
                The new SwapNest center has been successfully registered. The manager will be notified shortly.
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
                  ← Register Another Center
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
              </div>

              <button onClick={goNext} disabled={isLoading}
                className="ml-auto px-7 py-3 rounded-[10px] text-[14px] font-semibold text-white bg-primary shadow-[0_2px_12px_rgba(45,74,53,0.25)] hover:bg-[#24392b] hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(45,74,53,0.3)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
                {isLoading ? "Submitting…" : step === totalSteps ? "Register Center ✓" : "Continue →"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
