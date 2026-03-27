import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import API from "../../services/api";

const Volunteer = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const progressPct = [20, 40, 60, 80, 100];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const location = useLocation();
  const selectedCenter = location.state?.center;

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", nic: "", dob: "",
    gender: "", emergencyContact: "", address: "",
    district: "", city: "", center: "",
    hasVehicle: false, hasLicense: false, canTravel: false,
    skills: [], experience: "",
    days: [], hoursPerWeek: "",
    agreeTerms: false, agreePrivacy: false,
  });
  const [centers, setCenters] = useState([]);
  const [centersLoading, setCentersLoading] = useState(false);

  useEffect(() => {
    if (!selectedCenter) return;
    const centerValue = selectedCenter.centerName || selectedCenter.name || selectedCenter.center || "";
    console.log("Selected center:", selectedCenter);
    console.log("Center value to set:", centerValue);
    if (!centerValue) return;
    setFormData((prev) => ({ ...prev, center: centerValue }));
  }, [selectedCenter]);

  useEffect(() => {
    let cancelled = false;

    async function loadCenters() {
      setCentersLoading(true);
      try {
        const res = await API.get("/api/centers");
        let centersData = [];
        
        if (Array.isArray(res.data?.data)) {
          centersData = res.data.data;
        } else if (Array.isArray(res.data)) {
          centersData = res.data;
        }

        if (!cancelled) {
          setCenters(centersData);
          setCentersLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error loading centers:", err);
          
          // Fallback to fetch if API fails
          try {
            const response = await fetch("http://localhost:5000/api/centers");
            const data = await response.json();
            const centersData = Array.isArray(data?.data) ? data.data : [];
            setCenters(centersData);
          } catch (fallbackErr) {
            console.error("Failed to load centers:", fallbackErr);
          }
          setCentersLoading(false);
        }
      }
    }

    loadCenters();
    return () => {
      cancelled = true;
    };
  }, []);

  
  const handleInputChange = (e) => {
    const { id, name, value, type, checked } = e.target;
    const fieldName = id || name;
    if (type === "checkbox") {
      if (["days", "skills"].includes(name)) {
        const newList = checked
          ? [...formData[name], value]
          : formData[name].filter((i) => i !== value);
        setFormData({ ...formData, [name]: newList });
      } else {
        setFormData({ ...formData, [fieldName]: checked });
      }
    } else {
      setFormData({ ...formData, [fieldName]: value });
    }
  };

  // Per-step validation — only truly required fields
  const validateStep = () => {
    const missing = [];
    if (currentStep === 1) {
      if (!formData.firstName.trim()) missing.push("First Name");
      if (!formData.lastName.trim()) missing.push("Last Name");
      if (!formData.email.trim()) missing.push("Email");
      if (!formData.phone.trim()) missing.push("Phone Number");
      if (!formData.nic.trim()) missing.push("NIC");
      if (!formData.dob) {
        missing.push("Date of Birth");
      } else {
        // Validate that birthdate is not today or in the future
        const birthDate = new Date(formData.dob);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for comparison
        if (birthDate >= today) {
          setSubmitError("Date of Birth cannot be today or a future date");
          return ["Date of Birth validation"];
        }
      }
    }
    if (currentStep === 2) {
      if (!formData.district) missing.push("District");
      if (!formData.city.trim()) missing.push("City");
      if (!formData.center) missing.push("Preferred Center");
    }
    if (currentStep === 3) {
      if (formData.skills.length === 0) missing.push("At least one skill");
      if (!formData.experience) missing.push("Experience Level");
    }
    if (currentStep === 4) {
      if (formData.days.length === 0) missing.push("At least one available day");
      if (!formData.hoursPerWeek) missing.push("Hours per week");
    }
    if (currentStep === 5) {
      if (!formData.agreeTerms) missing.push("Terms & Conditions agreement");
      if (!formData.agreePrivacy) missing.push("Privacy Policy agreement");
    }
    return missing;
  };

  const goNext = () => {
    setSubmitError("");
    const missing = validateStep();
    if (missing.length > 0) {
      setSubmitError(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    if (currentStep === totalSteps) {
      const toISO = (value) => {
        if (!value) return null;
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? value : d.toISOString();
      };

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        nic: formData.nic,
        dob: toISO(formData.dob),
        gender: formData.gender,
        emergencyContact: formData.emergencyContact,
        address: formData.address,
        district: formData.district,
        city: formData.city,
        center: formData.center,
        hasVehicle: formData.hasVehicle,
        hasLicense: formData.hasLicense,
        canTravel: formData.canTravel,
        skills: formData.skills,
        experience: formData.experience,
        days: formData.days,
        hoursPerWeek: formData.hoursPerWeek,
        agreeTerms: formData.agreeTerms,
        agreePrivacy: formData.agreePrivacy,
      };

      (async () => {
        try {
          setIsSubmitting(true);
          const res = await fetch(`${API_BASE}/api/volunteers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            let errJson = null;
            try { errJson = await res.json(); } catch { errJson = null; }
            const message =
              errJson?.message ||
              (errJson?.errors ? JSON.stringify(errJson.errors) : null) ||
              `Request failed with status ${res.status}`;
            setSubmitError(message);
            return;
          }

          setCurrentStep("success");
        } catch (err) {
          setSubmitError(String(err?.message || err));
        } finally {
          setIsSubmitting(false);
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
      })();

      return;
    }

    setCurrentStep((s) => Math.min(s + 1, totalSteps));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (currentStep === "success") {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl text-center border border-[#D0C9BA]">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold text-[#1A1A1A] mb-4">Application Submitted!</h2>
          <p className="text-gray-600 mb-8">
            Thank you for applying to be a SwapNest volunteer. Our team will review your
            application and contact you within 3–5 business days.
          </p>
          <Link
            to="/dashboard/volunteer"
            className="block w-full py-4 bg-[#2D4A35] text-white rounded-xl font-bold hover:bg-[#1f3325] transition-colors text-center"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] font-sans text-[#1A1A1A]">
      {/* ── FORM CARD ── */}
      <div className="max-w-4xl mx-auto pt-8 px-4 pb-20">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#D0C9BA]">
          <div className="h-2 bg-gray-100">
            <div className="h-full bg-[#C4622D] transition-all duration-500 ease-out" style={{ width: `${progressPct[currentStep - 1]}%` }}></div>
          </div>

          <div className="p-8 md:p-12">

            {/* ── STEP 1: Personal ── */}
            {currentStep === 1 && (
              <div>
                <div className="text-xs font-bold text-[#C4622D] uppercase tracking-widest mb-2">📋 Step 1 of 5</div>
                <h2 className="text-3xl font-bold mb-2">Personal Information</h2>
                <p className="text-gray-500 mb-8">Your basic contact details so we can reach you.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="First Name" required placeholder="Nimal" id="firstName" value={formData.firstName} onChange={handleInputChange} />
                  <InputField label="Last Name" required placeholder="Perera" id="lastName" value={formData.lastName} onChange={handleInputChange} />
                  <InputField label="Email Address" required type="email" placeholder="nimal@email.com" id="email" value={formData.email} onChange={handleInputChange} />
                  <InputField label="Phone Number" required type="tel" placeholder="+94 77 123 4567" id="phone" value={formData.phone} onChange={handleInputChange} />
                  <InputField label="NIC Number" required placeholder="200012345678" id="nic" value={formData.nic} onChange={handleInputChange} />
                  <InputField label="Date of Birth" required type="date" id="dob" value={formData.dob} onChange={handleInputChange} />

                  {/* Optional fields — clearly marked */}
                  <SelectField label="Gender" id="gender" value={formData.gender} onChange={handleInputChange} options={["Male", "Female", "Non-binary", "Prefer not to say"]} />
                  <InputField label="Emergency Contact" type="tel" placeholder="+94 77 987 6543" id="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">Home Address <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
                    <textarea
                      id="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="No. 12, Galle Road, Colombo 03"
                      className="w-full px-4 py-3 rounded-xl border border-[#D0C9BA] focus:ring-2 focus:ring-[#7A9E7E] focus:border-transparent outline-none transition-all h-24"
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Location ── */}
            {currentStep === 2 && (
              <div>
                <div className="text-xs font-bold text-[#C4622D] uppercase tracking-widest mb-2">📍 Step 2 of 5</div>
                <h2 className="text-3xl font-bold mb-2">Center & Location</h2>
                <p className="text-gray-500 mb-8">Choose your preferred SwapNest center.</p>

                <div className="bg-[#E8F0E9] p-4 rounded-xl border border-[#7A9E7E] flex gap-3 mb-8">
                  <span className="text-xl">💡</span>
                  <p className="text-sm text-[#2D4A35]">Selecting a center close to your home makes pickup and sorting tasks much easier.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <SelectField label="District" required id="district" value={formData.district} onChange={handleInputChange} options={["Colombo", "Kandy", "Galle", "Jaffna", "Gampaha", "Kalutara", "Trincomalee", "Kurunegala", "Ratnapura", "Badulla", "Matara"]} />
                  <InputField label="City / Town" required placeholder="Colombo 07" id="city" value={formData.city} onChange={handleInputChange} />
                  <div className="md:col-span-2">
                    <SelectField 
                      label="Preferred Center" 
                      required 
                      id="center" 
                      value={formData.center} 
                      onChange={handleInputChange} 
                      options={centersLoading ? ["Loading centers..."] : centers.length > 0 ? centers.map(c => c.centerName) : ["No centers available"]}
                      disabled={centersLoading || centers.length === 0}
                    />
                  </div>
                </div>

                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Optional extras</p>
                <div className="space-y-4">
                  <ToggleRow id="hasVehicle" title="I have my own vehicle" desc="Car, motorcycle, or three-wheeler" checked={formData.hasVehicle} onChange={handleInputChange} />
                  <ToggleRow id="hasLicense" title="I have a driving license" desc="Valid Sri Lanka driving license" checked={formData.hasLicense} onChange={handleInputChange} />
                  <ToggleRow id="canTravel" title="I can travel to other centers" desc="For special events or urgent requests" checked={formData.canTravel} onChange={handleInputChange} />
                </div>
              </div>
            )}

            {/* ── STEP 3: Skills ── */}
            {currentStep === 3 && (
              <div>
                <div className="text-xs font-bold text-[#C4622D] uppercase tracking-widest mb-2">💪 Step 3 of 5</div>
                <h2 className="text-3xl font-bold mb-2">Skills & Experience</h2>
                <p className="text-gray-500 mb-8">Select at least one skill and your experience level.</p>

                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                  Your Skills <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  <CheckCard icon="🗣️" label="Communication" name="skills" value="communication" checked={formData.skills.includes("communication")} onChange={handleInputChange} />
                  <CheckCard icon="🚗" label="Driving" name="skills" value="driving" checked={formData.skills.includes("driving")} onChange={handleInputChange} />
                  <CheckCard icon="🔧" label="Repair" name="skills" value="repair" checked={formData.skills.includes("repair")} onChange={handleInputChange} />
                  <CheckCard icon="📦" label="Sorting" name="skills" value="sorting" checked={formData.skills.includes("sorting")} onChange={handleInputChange} />
                  <CheckCard icon="💻" label="IT / Tech" name="skills" value="it" checked={formData.skills.includes("it")} onChange={handleInputChange} />
                </div>

                <SelectField label="Experience Level" required id="experience" value={formData.experience} onChange={handleInputChange} options={["No experience", "1–2 years", "3–5 years", "Expert"]} />
              </div>
            )}

            {/* ── STEP 4: Availability ── */}
            {currentStep === 4 && (
              <div>
                <div className="text-xs font-bold text-[#C4622D] uppercase tracking-widest mb-2">🗓️ Step 4 of 5</div>
                <h2 className="text-3xl font-bold mb-2">Your Availability</h2>
                <p className="text-gray-500 mb-8">Pick at least one day and your weekly commitment.</p>

                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">
                  Days Available <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mb-8">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                    <label
                      key={day}
                      className={`flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.days.includes(day.toLowerCase()) ? "border-[#C4622D] bg-[#FDF8F5]" : "border-gray-100 hover:border-[#D0C9BA]"}`}
                    >
                      <input type="checkbox" name="days" value={day.toLowerCase()} className="hidden" checked={formData.days.includes(day.toLowerCase())} onChange={handleInputChange} />
                      <span className="text-sm font-bold">{day.substring(0, 2)}</span>
                    </label>
                  ))}
                </div>

                <SelectField label="Hours per week" required id="hoursPerWeek" value={formData.hoursPerWeek} onChange={handleInputChange} options={["1–3 hours", "4–8 hours", "9–15 hours"]} />
              </div>
            )}

            {/* ── STEP 5: Confirm ── */}
            {currentStep === 5 && (
              <div>
                <div className="text-xs font-bold text-[#C4622D] uppercase tracking-widest mb-2">📎 Step 5 of 5</div>
                <h2 className="text-3xl font-bold mb-2">Almost Done!</h2>
                <p className="text-gray-500 mb-8">Review and agree to submit your application.</p>

                {/* Summary card */}
                <div className="bg-[#F5F0E8] rounded-2xl border border-[#D0C9BA] p-6 mb-8 space-y-3 text-sm">
                  <SummaryRow label="Name" value={`${formData.firstName} ${formData.lastName}`} />
                  <SummaryRow label="Email" value={formData.email} />
                  <SummaryRow label="Phone" value={formData.phone} />
                  <SummaryRow label="NIC" value={formData.nic} />
                  <SummaryRow label="Center" value={formData.center} />
                  <SummaryRow label="Skills" value={formData.skills.join(", ") || "—"} />
                  <SummaryRow label="Availability" value={formData.days.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(", ") || "—"} />
                  <SummaryRow label="Hours/week" value={formData.hoursPerWeek} />
                </div>

                <div className="bg-[#F5F0E8] p-6 rounded-2xl border border-[#D0C9BA]">
                  <h4 className="font-bold mb-4">Volunteer Agreement</h4>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 text-sm cursor-pointer">
                      <input type="checkbox" id="agreeTerms" checked={formData.agreeTerms} onChange={handleInputChange} className="mt-1 w-4 h-4 accent-[#2D4A35]" />
                      <span>I have read and agree to the <span className="underline">Volunteer Terms & Conditions</span> <span className="text-red-500">*</span></span>
                    </label>
                    <label className="flex items-start gap-3 text-sm cursor-pointer">
                      <input type="checkbox" id="agreePrivacy" checked={formData.agreePrivacy} onChange={handleInputChange} className="mt-1 w-4 h-4 accent-[#2D4A35]" />
                      <span>I agree to the <span className="underline">Privacy Policy</span> and data collection practices <span className="text-red-500">*</span></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {submitError && (
              <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                ⚠️ {submitError}
              </div>
            )}

            {/* Navigation */}
            <div className="mt-12 flex items-center justify-between gap-4 border-t border-gray-100 pt-8">
              <button
                onClick={goBack}
                disabled={currentStep === 1}
                className={`px-8 py-3 rounded-xl font-bold transition-all ${currentStep === 1 ? "text-gray-300 cursor-not-allowed" : "text-[#2D4A35] hover:bg-gray-50"}`}
              >
                Back
              </button>
              <button
                onClick={goNext}
                disabled={isSubmitting}
                className="px-10 py-3 bg-[#2D4A35] text-white rounded-xl font-bold hover:bg-[#1f3325] shadow-lg shadow-[#2d4a3544] transition-all transform active:scale-95"
              >
                {isSubmitting ? "Submitting..." : currentStep === totalSteps ? "Submit Application" : "Next Step →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Helper Sub-Components ── */

const InputField = ({ label, required, type = "text", placeholder, id, value, onChange }) => {
  // Get yesterday's date in YYYY-MM-DD format for max date attribute
  const getYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold">
        {label} {required ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal text-xs">(optional)</span>}
      </label>
      <input
        type={type} 
        id={id} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        max={type === "date" ? getYesterday() : undefined}
        className="px-4 py-3 rounded-xl border border-[#D0C9BA] focus:ring-2 focus:ring-[#7A9E7E] focus:border-transparent outline-none transition-all"
      />
    </div>
  );
};

const SelectField = ({ label, required, id, value, onChange, options }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-semibold">
      {label} {required ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal text-xs">(optional)</span>}
    </label>
    <select
      id={id} value={value} onChange={onChange}
      className="px-4 py-3 rounded-xl border border-[#D0C9BA] bg-white focus:ring-2 focus:ring-[#7A9E7E] outline-none transition-all cursor-pointer"
    >
      <option value="">Select option</option>
      {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const ToggleRow = ({ id, title, desc, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#D0C9BA] transition-all">
    <div>
      <h4 className="font-bold text-sm">{title}</h4>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" id={id} className="sr-only peer" checked={checked} onChange={onChange} />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7A9E7E]"></div>
    </label>
  </div>
);

const CheckCard = ({ icon, label, name, value, checked, onChange }) => (
  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${checked ? "border-[#7A9E7E] bg-[#E8F0E9]" : "border-gray-100 hover:border-[#D0C9BA]"}`}>
    <input type="checkbox" name={name} value={value} className="hidden" checked={checked} onChange={onChange} />
    <span className="text-xl">{icon}</span>
    <span className="text-sm font-medium">{label}</span>
  </label>
);

const SummaryRow = ({ label, value }) => (
  <div className="flex justify-between items-start gap-4 border-b border-[#D0C9BA] pb-2 last:border-0 last:pb-0">
    <span className="text-gray-500 font-medium shrink-0">{label}</span>
    <span className="font-semibold text-right">{value || "—"}</span>
  </div>
);

export default Volunteer;