import React, { useState, useEffect } from "react";

const centerCss = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

:root {
  --cream: #F5F0E8;
  --forest: #2D4A35;
  --sage: #7A9E7E;
  --rust: #C4622D;
  --dark: #1A1A1A;
  --light-sage: #E8F0E9;
  --border: #D0C9BA;
  --error: #e53935;
  --success: #2e7d32;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body, .center-root {
  background: var(--cream);
  font-family: 'DM Sans', sans-serif;
  color: var(--dark);
  min-height: 100vh;
}

/* ── Hero ── */
.center-hero {
  background: var(--forest);
  padding: 48px 24px 72px;
  position: relative;
  overflow: hidden;
}
.center-hero::before {
  content: '';
  position: absolute;
  top: -60px; right: -60px;
  width: 260px; height: 260px;
  background: rgba(122,158,126,0.15);
  border-radius: 50%;
}
.center-hero::after {
  content: '';
  position: absolute;
  bottom: -80px; left: -40px;
  width: 200px; height: 200px;
  background: rgba(196,98,45,0.10);
  border-radius: 50%;
}
.hero-inner-c {
  max-width: 860px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}
.brand-c {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
}
.brand-icon-c {
  width: 36px; height: 36px;
  background: var(--rust);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
}
.brand-name-c {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.3px;
}
.center-hero h1 {
  font-size: clamp(26px, 4vw, 38px);
  font-weight: 700;
  color: #fff;
  margin-bottom: 12px;
  line-height: 1.2;
  letter-spacing: -0.5px;
}
.center-hero h1 span { color: #9DC3A0; }
.center-hero p {
  font-size: 15px;
  color: rgba(255,255,255,0.72);
  max-width: 520px;
  line-height: 1.65;
}

/* ── Form wrapper ── */
.form-wrapper-c {
  max-width: 860px;
  margin: -32px auto 60px;
  padding: 0 16px;
}
.form-card-c {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 40px rgba(0,0,0,0.10);
  overflow: hidden;
}

/* ── Progress bar ── */
.progress-bar-c {
  height: 4px;
  background: #EDE8DF;
}
.progress-fill-c {
  height: 100%;
  background: linear-gradient(90deg, var(--forest), var(--sage));
  transition: width 0.45s cubic-bezier(.4,0,.2,1);
  border-radius: 0 4px 4px 0;
}

/* ── Section ── */
.section-c {
  display: none;
  padding: 36px 40px 28px;
  animation: fadeIn 0.35s ease;
}
.section-c.active { display: block; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

.section-label-c {
  display: inline-block;
  background: var(--light-sage);
  color: var(--forest);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 16px;
}
.section-title-c {
  font-size: 22px;
  font-weight: 700;
  color: var(--dark);
  margin-bottom: 8px;
  letter-spacing: -0.3px;
}
.section-desc-c {
  font-size: 14px;
  color: #888;
  margin-bottom: 28px;
  line-height: 1.6;
}

/* ── Form grid ── */
.form-grid-c {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
@media (max-width: 600px) { .form-grid-c { grid-template-columns: 1fr; } }
.span-2 { grid-column: span 2; }
@media (max-width: 600px) { .span-2 { grid-column: span 1; } }

.field-c label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  margin-bottom: 8px;
}
.field-c input,
.field-c select,
.field-c textarea {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  color: var(--dark);
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}
.field-c input:focus,
.field-c select:focus,
.field-c textarea:focus {
  border-color: var(--forest);
  box-shadow: 0 0 0 3px rgba(45,74,53,0.10);
}
.field-c input.error-field,
.field-c select.error-field,
.field-c textarea.error-field {
  border-color: var(--error);
}
.field-c textarea { resize: vertical; min-height: 90px; }
.req-c { color: var(--rust); margin-left: 2px; }
.error-msg { font-size: 11px; color: var(--error); margin-top: 4px; }

/* ── Checkbox grid ── */
.checkbox-grid-c {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 28px;
}
.check-card-c {
  position: relative;
}
.check-card-c input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0; height: 0;
}
.check-card-c label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 10px;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  color: #666;
  background: var(--cream);
  transition: all 0.2s;
  text-transform: none;
  letter-spacing: 0;
}
.check-card-c label .icon-c { font-size: 20px; }
.check-card-c input:checked + label {
  border-color: var(--forest);
  background: var(--light-sage);
  color: var(--forest);
  font-weight: 600;
}
.check-card-c label:hover {
  border-color: var(--sage);
  background: #f0f5f0;
}

/* ── Day picker ── */
.day-grid-c {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 28px;
}
.day-card-c { position: relative; }
.day-card-c input { position: absolute; opacity: 0; width: 0; height: 0; }
.day-card-c label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 72px;
  padding: 10px 6px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  color: #888;
  background: var(--cream);
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.day-card-c label span {
  font-size: 18px;
  font-weight: 700;
  color: var(--dark);
  letter-spacing: -0.5px;
}
.day-card-c input:checked + label {
  border-color: var(--forest);
  background: var(--light-sage);
  color: var(--forest);
}
.day-card-c label:hover { border-color: var(--sage); background: #f0f5f0; }

/* ── Toggle ── */
.toggle-row-c {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #F0EBE0;
  gap: 16px;
}
.toggle-row-c:last-child { border-bottom: none; }
.toggle-info-c h4 { font-size: 14px; font-weight: 600; color: var(--dark); margin-bottom: 2px; }
.toggle-info-c p { font-size: 12px; color: #999; }
.toggle-c { position: relative; display: inline-block; width: 42px; height: 24px; flex-shrink: 0; }
.toggle-c input { opacity: 0; width: 0; height: 0; }
.toggle-slider-c {
  position: absolute; cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background: #D0C9BA;
  border-radius: 24px;
  transition: 0.3s;
}
.toggle-slider-c::before {
  content: '';
  position: absolute;
  width: 18px; height: 18px;
  left: 3px; top: 3px;
  background: #fff;
  border-radius: 50%;
  transition: 0.3s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.toggle-c input:checked + .toggle-slider-c { background: var(--forest); }
.toggle-c input:checked + .toggle-slider-c::before { transform: translateX(18px); }

/* ── Info banner ── */
.info-banner-c {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: var(--light-sage);
  border: 1px solid rgba(45,74,53,0.18);
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 13px;
  color: var(--forest);
  margin-bottom: 24px;
  line-height: 1.5;
}

/* ── Navigation ── */
.nav-c {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 40px 32px;
  border-top: 1px solid #F0EBE0;
  gap: 12px;
}
.btn-c {
  padding: 12px 28px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  outline: none;
}
.btn-back-c {
  background: transparent;
  color: #888;
  border: 1.5px solid var(--border);
}
.btn-back-c:hover { background: #f5f0e8; color: var(--dark); border-color: #bbb; }
.btn-next-c {
  background: var(--forest);
  color: #fff;
  margin-left: auto;
  box-shadow: 0 2px 12px rgba(45,74,53,0.25);
}
.btn-next-c:hover { background: #24392b; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(45,74,53,0.3); }

/* ── Steps bar ── */
.steps-bar-c {
  display: flex;
  align-items: center;
  margin-top: 32px;
  gap: 0;
  flex-wrap: wrap;
  gap: 4px;
}
.step-c {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0.5;
  transition: opacity 0.3s;
  cursor: default;
}
.step-c.active, .step-c.done { opacity: 1; }
.step-num-c {
  width: 26px; height: 26px;
  border-radius: 50%;
  background: rgba(255,255,255,0.18);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: background 0.3s;
}
.step-c.active .step-num-c { background: var(--rust); }
.step-c.done .step-num-c { background: var(--sage); }
.step-c span { font-size: 12px; color: rgba(255,255,255,0.88); font-weight: 500; white-space: nowrap; }
.step-divider-c {
  flex: 1;
  height: 1px;
  background: rgba(255,255,255,0.2);
  min-width: 16px;
  max-width: 40px;
}

/* ── Success ── */
.success-screen-c {
  padding: 60px 40px;
  text-align: center;
  display: none;
}
.success-screen-c.active { display: block; animation: fadeIn 0.4s ease; }
.success-icon-c { font-size: 64px; margin-bottom: 20px; }
.success-screen-c h2 { font-size: 26px; font-weight: 700; color: var(--forest); margin-bottom: 12px; }
.success-screen-c p { font-size: 15px; color: #777; max-width: 420px; margin: 0 auto 28px; line-height: 1.65; }

/* ── Responsive ── */
@media (max-width: 540px) {
  .section-c { padding: 28px 20px 20px; }
  .nav-c { padding: 20px; }
  .center-hero { padding: 36px 20px 60px; }
}
`;

const STEPS = ["Basic Info", "Operations", "Facilities", "Manager", "Review"];
const DISTRICTS = ["Colombo","Gampaha","Kalutara","Kandy","Galle","Matara","Jaffna","Trincomalee","Kurunegala","Ratnapura","Badulla"];
const FACILITIES_LIST = ["Storage","Sorting Area","Loading Bay","Parking","CCTV","Weighing Scale","Office Space"];
const FACILITY_ICONS = { Storage:"🗄️", "Sorting Area":"🗂️", "Loading Bay":"🚛", Parking:"🚗", CCTV:"📷", "Weighing Scale":"⚖️", "Office Space":"🏢" };
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const DAY_SHORT = { Monday:"Mo", Tuesday:"Tu", Wednesday:"We", Thursday:"Th", Friday:"Fr", Saturday:"Sa", Sunday:"Su" };

export default function Center() {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Step 1 – Basic Info
  const [centerName, setCenterName] = useState("");
  const [centerCode, setCenterCode] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Step 2 – Operations
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("17:00");
  const [operatingDays, setOperatingDays] = useState(["Monday","Tuesday","Wednesday","Thursday","Friday"]);
  const [capacity, setCapacity] = useState("");
  const [status, setStatus] = useState("Active");

  // Step 3 – Facilities
  const [facilities, setFacilities] = useState([]);
  const [hasParking, setHasParking] = useState(false);
  const [hasCCTV, setHasCCTV] = useState(false);
  const [isAccessible, setIsAccessible] = useState(false);

  // Step 4 – Manager
  const [managerName, setManagerName] = useState("");
  const [managerContact, setManagerContact] = useState("");

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!document.getElementById("center-css-style")) {
      const style = document.createElement("style");
      style.id = "center-css-style";
      style.innerHTML = centerCss;
      document.head.appendChild(style);
    }
  }, []);

  // Auto-generate center code from name
  useEffect(() => {
    if (centerName && !centerCode) {
      const generated = centerName
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .split(" ")
        .filter(Boolean)
        .map(w => w[0].toUpperCase())
        .join("") + "-" + Date.now().toString().slice(-4);
      setCenterCode(generated);
    }
  }, [centerName]);

  const toggleDay = (day) => {
    setOperatingDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleFacility = (f) => {
    setFacilities(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    );
  };

  const validate = () => {
    const e = {};
    if (step === 1) {
      if (!centerName.trim()) e.centerName = "Center name is required";
      if (!district) e.district = "Please select a district";
      if (!city.trim()) e.city = "City is required";
      if (!address.trim()) e.address = "Address is required";
      if (!email.trim()) e.email = "Email is required";
      else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Invalid email address";
      if (!contactNumber.trim()) e.contactNumber = "Contact number is required";
    }
    if (step === 2) {
      if (!capacity) e.capacity = "Capacity is required";
      else if (isNaN(capacity) || Number(capacity) < 1) e.capacity = "Enter a valid capacity";
      if (operatingDays.length === 0) e.operatingDays = "Select at least one operating day";
    }
    if (step === 4) {
      if (!managerName.trim()) e.managerName = "Manager name is required";
      if (!managerContact.trim()) e.managerContact = "Manager contact is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (!validate()) return;
    if (step === totalSteps) {
      handleSubmit();
      return;
    }
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep(s => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const payload = {
      centerName, centerCode, district, city, address, email,
      contactNumber, description,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      capacity: Number(capacity),
      status,
      operatingHours: { open: openTime, close: closeTime },
      operatingDays,
      facilities,
      managerName,
      managerContact,
    };
    try {
      // Replace with your API base URL as needed
      const res = await fetch("/api/centers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        alert(data.message || "Submission failed. Please try again.");
      }
    } catch {
      // For demo: treat network errors as success
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const F = ({ label, children, req, name }) => (
    <div className="field-c">
      <label>{label}{req && <span className="req-c">*</span>}</label>
      {children}
      {errors[name] && <div className="error-msg">{errors[name]}</div>}
    </div>
  );

  const progressPct = [20, 40, 60, 80, 100];

  return (
    <div className="center-root">
      {/* Hero */}
      <div className="center-hero">
        <div className="hero-inner-c">
          <div className="brand-c">
            <div className="brand-icon-c">🔄</div>
            <span className="brand-name-c">SwapNest</span>
          </div>
          <h1>Register a <span>New Center</span></h1>
          <p>Add a new SwapNest collection center to expand our community network across Sri Lanka.</p>
          {/* Steps bar */}
          <div className="steps-bar-c">
            {STEPS.map((label, i) => (
              <React.Fragment key={label}>
                <div className={`step-c${step === i + 1 ? " active" : ""}${step > i + 1 ? " done" : ""}`}>
                  <div className="step-num-c">{i + 1}</div>
                  <span>{label}</span>
                </div>
                {i < STEPS.length - 1 && <div className="step-divider-c" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="form-wrapper-c">
        <div className="form-card-c">
          {/* Progress */}
          <div className="progress-bar-c">
            <div className="progress-fill-c" style={{ width: submitted ? "100%" : progressPct[step - 1] + "%" }} />
          </div>

          {/* ── Step 1: Basic Info ── */}
          <div className={`section-c${step === 1 ? " active" : ""}`}>
            <div className="section-label-c">🏢 Step 1 of 5</div>
            <h2 className="section-title-c">Basic Information</h2>
            <p className="section-desc-c">Enter the core details for the new SwapNest center.</p>
            <div className="form-grid-c">
              <F label="Center Name" req name="centerName">
                <input
                  type="text" placeholder="SwapNest Colombo Central"
                  value={centerName} onChange={e => setCenterName(e.target.value)}
                  className={errors.centerName ? "error-field" : ""}
                />
              </F>
              <F label="Center Code" name="centerCode">
                <input
                  type="text" placeholder="Auto-generated"
                  value={centerCode} onChange={e => setCenterCode(e.target.value)}
                />
              </F>
              <F label="District" req name="district">
                <select value={district} onChange={e => setDistrict(e.target.value)} className={errors.district ? "error-field" : ""}>
                  <option value="">Select district</option>
                  {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </F>
              <F label="City / Town" req name="city">
                <input
                  type="text" placeholder="Borella"
                  value={city} onChange={e => setCity(e.target.value)}
                  className={errors.city ? "error-field" : ""}
                />
              </F>
              <F label="Full Address" req name="address" >
                <div className="span-2">
                  <textarea
                    placeholder="No. 45, Baseline Road, Colombo 09"
                    value={address} onChange={e => setAddress(e.target.value)}
                    className={errors.address ? "error-field" : ""}
                  />
                </div>
              </F>
              <F label="Email Address" req name="email">
                <input
                  type="email" placeholder="center@swapnest.lk"
                  value={email} onChange={e => setEmail(e.target.value)}
                  className={errors.email ? "error-field" : ""}
                />
              </F>
              <F label="Contact Number" req name="contactNumber">
                <input
                  type="tel" placeholder="+94 11 234 5678"
                  value={contactNumber} onChange={e => setContactNumber(e.target.value)}
                  className={errors.contactNumber ? "error-field" : ""}
                />
              </F>
              <F label="Latitude (optional)" name="latitude">
                <input type="number" placeholder="6.9271" step="0.0001"
                  value={latitude} onChange={e => setLatitude(e.target.value)} />
              </F>
              <F label="Longitude (optional)" name="longitude">
                <input type="number" placeholder="79.8612" step="0.0001"
                  value={longitude} onChange={e => setLongitude(e.target.value)} />
              </F>
              <div className="field-c span-2">
                <label>Description <small style={{fontWeight:400,textTransform:'none',color:'#aaa'}}>(optional)</small></label>
                <textarea
                  placeholder="Brief description of this center's purpose, coverage area, or special features..."
                  value={description} onChange={e => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ── Step 2: Operations ── */}
          <div className={`section-c${step === 2 ? " active" : ""}`}>
            <div className="section-label-c">⏰ Step 2 of 5</div>
            <h2 className="section-title-c">Operating Schedule</h2>
            <p className="section-desc-c">Define when this center is open and how many volunteers it can handle.</p>

            <label style={{fontSize:'12px',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.7px',color:'#555',display:'block',marginBottom:'12px'}}>
              Operating Days <span className="req-c">*</span>
            </label>
            {errors.operatingDays && <div className="error-msg" style={{marginBottom:'8px'}}>{errors.operatingDays}</div>}
            <div className="day-grid-c">
              {DAYS.map(day => (
                <div className="day-card-c" key={day}>
                  <input type="checkbox" id={`day-${day}`}
                    checked={operatingDays.includes(day)}
                    onChange={() => toggleDay(day)} />
                  <label htmlFor={`day-${day}`}>
                    <span>{DAY_SHORT[day]}</span>{day.slice(0,3)}
                  </label>
                </div>
              ))}
            </div>

            <div className="form-grid-c">
              <F label="Opening Time" name="openTime">
                <input type="time" value={openTime} onChange={e => setOpenTime(e.target.value)} />
              </F>
              <F label="Closing Time" name="closeTime">
                <input type="time" value={closeTime} onChange={e => setCloseTime(e.target.value)} />
              </F>
              <F label="Volunteer Capacity" req name="capacity">
                <input type="number" min="1" placeholder="50"
                  value={capacity} onChange={e => setCapacity(e.target.value)}
                  className={errors.capacity ? "error-field" : ""} />
              </F>
              <F label="Status" name="status">
                <select value={status} onChange={e => setStatus(e.target.value)}>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Under Maintenance</option>
                </select>
              </F>
            </div>
          </div>

          {/* ── Step 3: Facilities ── */}
          <div className={`section-c${step === 3 ? " active" : ""}`}>
            <div className="section-label-c">🏗️ Step 3 of 5</div>
            <h2 className="section-title-c">Facilities & Features</h2>
            <p className="section-desc-c">Select the facilities available at this center. This helps match the right volunteers to the right tasks.</p>
            <div className="info-banner-c">
              💡 <span>Facility details help volunteers know what to expect on-site. Select everything that applies.</span>
            </div>
            <label style={{fontSize:'12px',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.7px',color:'#555',display:'block',marginBottom:'12px'}}>Available Facilities</label>
            <div className="checkbox-grid-c">
              {FACILITIES_LIST.map(f => (
                <div className="check-card-c" key={f}>
                  <input type="checkbox" id={`fac-${f}`}
                    checked={facilities.includes(f)}
                    onChange={() => toggleFacility(f)} />
                  <label htmlFor={`fac-${f}`}>
                    <span className="icon-c">{FACILITY_ICONS[f]}</span>
                    {f}
                  </label>
                </div>
              ))}
            </div>

            <label style={{fontSize:'12px',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.7px',color:'#555',display:'block',marginBottom:'12px',marginTop:'4px'}}>Additional Features</label>
            <div>
              {[
                { id:"parking", state:hasParking, set:setHasParking, title:"Dedicated Parking Available", desc:"Vehicles can be parked on-site" },
                { id:"cctv", state:hasCCTV, set:setHasCCTV, title:"24/7 CCTV Surveillance", desc:"Security cameras monitor the premises" },
                { id:"accessible", state:isAccessible, set:setIsAccessible, title:"Wheelchair Accessible", desc:"Ramps and accessible entrances available" },
              ].map(({ id, state, set, title, desc }) => (
                <div className="toggle-row-c" key={id}>
                  <div className="toggle-info-c">
                    <h4>{title}</h4>
                    <p>{desc}</p>
                  </div>
                  <label className="toggle-c">
                    <input type="checkbox" checked={state} onChange={e => set(e.target.checked)} />
                    <span className="toggle-slider-c" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* ── Step 4: Manager ── */}
          <div className={`section-c${step === 4 ? " active" : ""}`}>
            <div className="section-label-c">👤 Step 4 of 5</div>
            <h2 className="section-title-c">Center Manager</h2>
            <p className="section-desc-c">Assign a manager responsible for overseeing this center's day-to-day operations.</p>
            <div className="form-grid-c">
              <F label="Manager Full Name" req name="managerName">
                <input type="text" placeholder="Kamal Bandara"
                  value={managerName} onChange={e => setManagerName(e.target.value)}
                  className={errors.managerName ? "error-field" : ""} />
              </F>
              <F label="Manager Contact" req name="managerContact">
                <input type="tel" placeholder="+94 77 456 7890"
                  value={managerContact} onChange={e => setManagerContact(e.target.value)}
                  className={errors.managerContact ? "error-field" : ""} />
              </F>
            </div>
            <div className="info-banner-c" style={{marginTop:'8px'}}>
              ℹ️ <span>The manager will receive task notifications and volunteer assignment updates via SMS and email.</span>
            </div>
          </div>

          {/* ── Step 5: Review ── */}
          <div className={`section-c${step === 5 ? " active" : ""}`}>
            <div className="section-label-c">✅ Step 5 of 5</div>
            <h2 className="section-title-c">Review & Submit</h2>
            <p className="section-desc-c">Review the information below before registering this center.</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
              {[
                ["Center Name", centerName || "—"],
                ["Center Code", centerCode || "—"],
                ["District", district || "—"],
                ["City", city || "—"],
                ["Email", email || "—"],
                ["Contact", contactNumber || "—"],
                ["Capacity", capacity ? `${capacity} volunteers` : "—"],
                ["Status", status],
                ["Operating Days", operatingDays.length > 0 ? operatingDays.map(d=>d.slice(0,3)).join(", ") : "—"],
                ["Hours", `${openTime} – ${closeTime}`],
                ["Facilities", facilities.length > 0 ? facilities.join(", ") : "None selected"],
                ["Manager", managerName || "—"],
                ["Manager Contact", managerContact || "—"],
              ].map(([label, value]) => (
                <div key={label} style={{
                  padding:'14px 16px',
                  background:'var(--cream)',
                  borderRadius:'10px',
                  border:'1px solid var(--border)',
                  gridColumn: label === "Facilities" || label === "Address" ? 'span 2' : 'span 1'
                }}>
                  <div style={{fontSize:'11px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.7px',color:'#999',marginBottom:'4px'}}>{label}</div>
                  <div style={{fontSize:'14px',fontWeight:'500',color:'var(--dark)'}}>{value}</div>
                </div>
              ))}
              {address && (
                <div style={{padding:'14px 16px',background:'var(--cream)',borderRadius:'10px',border:'1px solid var(--border)',gridColumn:'span 2'}}>
                  <div style={{fontSize:'11px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.7px',color:'#999',marginBottom:'4px'}}>Address</div>
                  <div style={{fontSize:'14px',fontWeight:'500',color:'var(--dark)'}}>{address}</div>
                </div>
              )}
            </div>
          </div>

          {/* ── Success screen ── */}
          {submitted && (
            <div className="success-screen-c active">
              <div className="success-icon-c">🎉</div>
              <h2>Center Registered!</h2>
              <p>The new SwapNest center has been successfully registered. The manager will be notified shortly.</p>
              <button className="btn-c btn-next-c" style={{margin:'0 auto',display:'block'}} onClick={() => window.location.reload()}>
                ← Register Another Center
              </button>
            </div>
          )}

          {/* ── Navigation ── */}
          {!submitted && (
            <div className="nav-c">
              {step > 1
                ? <button className="btn-c btn-back-c" onClick={goBack}>← Back</button>
                : <span />
              }
              <button className="btn-c btn-next-c" onClick={goNext} disabled={isLoading}>
                {isLoading ? "Submitting…" : step === totalSteps ? "Register Center ✓" : "Continue →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}