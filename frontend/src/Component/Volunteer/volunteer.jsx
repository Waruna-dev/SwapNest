import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import API from "../../services/api";

const Volunteer = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
      if (!formData.dob) missing.push("Date of Birth");
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

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-white/80 backdrop-blur-xl shadow-sm py-3" : "bg-transparent py-5"}`}>
        <div className="flex justify-between items-center px-6 md:px-12 max-w-[1400px] mx-auto">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-[#012d1d] font-serif">SwapNest</Link>
          <div className="hidden md:flex items-center gap-8 font-semibold text-sm tracking-tight">
            <Link to="/" className="text-[#012d1d]/80 hover:text-[#012d1d] transition-colors">Home</Link>
            <Link to="/volunteer" className="text-[#a43c12] border-b-2 border-[#a43c12] pb-1">Volunteer</Link>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/login" className="text-[#012d1d] font-bold text-sm hover:opacity-70 transition-opacity">Sign In</Link>
            <Link to="/register" className="bg-[#a43c12] text-white px-7 py-2.5 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-transform duration-200 shadow-md shadow-[#a43c12]/20">Sign Up</Link>
          </div>
          <button className="md:hidden text-[#012d1d]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <span className="material-symbols-outlined text-3xl">{isMobileMenuOpen ? "close" : "menu"}</span>
          </button>
        </div>
        <div className={`md:hidden absolute top-full left-0 w-full bg-[#fbf9f5] border-b border-gray-200 shadow-xl transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? "max-h-[400px] py-6" : "max-h-0 py-0"}`}>
          <div className="flex flex-col gap-6 px-6">
            <Link to="/" className="text-[#012d1d] font-bold text-lg">Home</Link>
            <Link to="/volunteer" className="text-[#a43c12] font-bold text-lg">Volunteer</Link>
            <div className="h-px bg-gray-200"></div>
            <Link to="/login" className="text-[#012d1d] font-bold text-lg">Sign In</Link>
            <Link to="/register" className="bg-[#a43c12] text-white px-6 py-3 rounded-xl font-bold text-center">Create Account</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="bg-[#2D4A35] text-white pt-28 pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-8 group cursor-pointer w-fit">
            <div className="text-2xl transition-transform group-hover:rotate-180 duration-500">🔄</div>
            <span className="text-xl font-bold tracking-tight">SwapNest</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Become a <span className="text-[#7A9E7E]">Volunteer</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mb-12">
            Join our network of changemakers helping communities swap, share, and thrive.
          </p>

          {/* Stepper */}
          <div className="hidden md:flex items-center justify-between relative">
            {[1, 2, 3, 4, 5].map((step, idx) => (
              <React.Fragment key={step}>
                <div className={`flex flex-col items-center gap-3 z-10 transition-opacity ${currentStep >= step ? "opacity-100" : "opacity-40"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${currentStep === step ? "bg-[#C4622D] border-[#C4622D]" : currentStep > step ? "bg-[#7A9E7E] border-[#7A9E7E]" : "border-white"}`}>
                    {currentStep > step ? "✓" : step}
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wider">
                    {["Personal", "Location", "Skills", "Availability", "Confirm"][idx]}
                  </span>
                </div>
                {step < 5 && <div className={`flex-1 h-[2px] mb-7 mx-4 ${currentStep > step ? "bg-[#7A9E7E]" : "bg-gray-600"}`}></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── FORM CARD ── */}
      <div className="max-w-4xl mx-auto -mt-20 px-4 pb-20">
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

      {/* ── FOOTER ── */}
      <footer className="bg-[#012d1d] w-full rounded-t-[3rem]">
        <div className="flex flex-col md:flex-row justify-between items-start w-full px-8 md:px-16 py-20 max-w-7xl mx-auto gap-12">
          <div className="mb-8 md:mb-0 max-w-sm">
            <div className="text-3xl font-bold text-white mb-6 font-serif tracking-tighter">SwapNest</div>
            <p className="text-[#86af99] text-base leading-relaxed mb-8 font-medium">Cultivating a circular future for the teardrop island. Join the movement today.</p>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-[#a43c12] hover:border-transparent cursor-pointer transition-all">
                <span className="material-symbols-outlined text-xl">public</span>
              </div>
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-[#a43c12] hover:border-transparent cursor-pointer transition-all">
                <span className="material-symbols-outlined text-xl">chat_bubble</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-12 md:gap-24 w-full md:w-auto">
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold tracking-widest text-xs uppercase mb-2">Navigate</h4>
              <Link to="/" className="text-[#86af99] hover:text-white transition-colors font-medium">Home</Link>
              <Link to="/volunteer" className="text-[#86af99] hover:text-white transition-colors font-medium">Volunteer</Link>
              <Link to="/login" className="text-[#86af99] hover:text-white transition-colors font-medium">Sign In</Link>
              <Link to="/register" className="text-[#86af99] hover:text-white transition-colors font-medium">Sign Up</Link>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold tracking-widest text-xs uppercase mb-2">Company</h4>
              <a className="text-[#86af99] hover:text-white transition-colors font-medium" href="#">Privacy Policy</a>
              <a className="text-[#86af99] hover:text-white transition-colors font-medium" href="#">Community Guidelines</a>
              <a className="text-[#86af99] hover:text-white transition-colors font-medium" href="#">Contact Us</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 md:px-16 pb-12">
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[#86af99] text-sm font-medium">© 2026 SwapNest Sri Lanka. Circularity by design.</p>
            <div className="flex gap-8 text-sm font-medium text-[#86af99]">
              <a className="hover:text-white transition-colors" href="#">Terms of Service</a>
              <a className="hover:text-white transition-colors" href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ── Helper Sub-Components ── */

const InputField = ({ label, required, type = "text", placeholder, id, value, onChange }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-semibold">
      {label} {required ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal text-xs">(optional)</span>}
    </label>
    <input
      type={type} id={id} value={value} onChange={onChange} placeholder={placeholder}
      className="px-4 py-3 rounded-xl border border-[#D0C9BA] focus:ring-2 focus:ring-[#7A9E7E] focus:border-transparent outline-none transition-all"
    />
  </div>
);

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