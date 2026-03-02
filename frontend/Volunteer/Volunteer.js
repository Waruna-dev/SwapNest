import React, { useState, useRef, useEffect } from "react";

const volunteerCss = `
:root { --cream: #F5F0E8; --forest: #2D4A35; --sage: #7A9E7E; --rust: #C4622D; --dark: #1A1A1A; --light-sage: #E8F0E9; --border: #D0C9BA; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body, .volunteer-root { background: var(--cream); font-family: 'DM Sans', sans-serif; color: var(--dark); min-height: 100vh; }
`;

function Volunteer() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const progressPct = [20, 40, 60, 80, 100];

  // Section 1 state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nic, setNic] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!document.getElementById("volunteer-css")) {
      const style = document.createElement("style");
      style.id = "volunteer-css";
      style.innerHTML = volunteerCss;
      document.head.appendChild(style);
    }
  }, []);

  const goNext = () => {
    if (currentStep === totalSteps) {
      submitForm();
      return;
    }
    setCurrentStep((s) => Math.min(s + 1, totalSteps));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const submitForm = () => {
    setCurrentStep("success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderStepsBar = () => (
    <div className="steps-bar">
      {[1, 2, 3, 4, 5].map((step) => (
        <React.Fragment key={step}>
          <div
            className={
              "step" +
              (currentStep === step ? " active" : "") +
              (currentStep > step ? " done" : "")
            }
            id={`step-tab-${step}`}
          >
            <div className="step-num">{step}</div>
            <span>{["Personal", "Center & Location", "Skills & Tasks", "Availability", "Documents"][step - 1]}</span>
          </div>
          {step < 5 && <div className="step-divider"></div>}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="volunteer-root">
      <div className="hero">
        <div className="hero-inner">
          <div className="brand">
            <div className="brand-icon">🔄</div>
            <span className="brand-name">SwapNest</span>
          </div>
          <h1>
            Become a <span>Volunteer</span>
          </h1>
          <p>
            Join our network of changemakers helping communities swap, share, and thrive. Choose your center, share your skills, make a difference.
          </p>
          {renderStepsBar()}
        </div>
      </div>
      <div className="form-wrapper">
        <div className="form-card">
          <div className="progress-bar">
            <div
              className="progress-fill"
              id="progressFill"
              style={{ width: currentStep === "success" ? "100%" : progressPct[currentStep - 1] + "%" }}
            ></div>
          </div>
          {/* Section 1: Personal Info */}
          <div className={"section" + (currentStep === 1 ? " active" : "") } id="section-1">
            <div className="section-label">📋 Step 1 of 5</div>
            <h2 className="section-title">Personal Information</h2>
            <p className="section-desc">Tell us about yourself so we can get to know you better.</p>
            <div className="form-grid">
              <div className="field">
                <label>First Name <span className="req">*</span></label>
                <input type="text" placeholder="Nimal" value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div className="field">
                <label>Last Name <span className="req">*</span></label>
                <input type="text" placeholder="Perera" value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
              <div className="field">
                <label>Email Address <span className="req">*</span></label>
                <input type="email" placeholder="nimal@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="field">
                <label>Phone Number <span className="req">*</span></label>
                <input type="tel" placeholder="+94 77 123 4567" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="field">
                <label>NIC Number <span className="req">*</span></label>
                <input type="text" placeholder="200012345678" value={nic} onChange={e => setNic(e.target.value)} />
              </div>
              <div className="field">
                <label>Date of Birth <span className="req">*</span></label>
                <input type="date" value={dob} onChange={e => setDob(e.target.value)} />
              </div>
              <div className="field">
                <label>Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Non-binary</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
              <div className="field">
                <label>Emergency Contact</label>
                <input type="tel" placeholder="+94 77 987 6543" value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} />
              </div>
              <div className="field span-2">
                <label>Home Address</label>
                <textarea placeholder="No. 12, Galle Road, Colombo 03" value={address} onChange={e => setAddress(e.target.value)}></textarea>
              </div>
            </div>
          </div>
          {/* Section 2: Center & Location */}
          <div
            className={
              "section" +
              (currentStep === 2 ? " active" : "") +
              (currentStep !== 2 ? "" : " show")
            }
            id="section-2"
          >
            <div className="section-label">📍 Step 2 of 5</div>
            <h2 className="section-title">Center & Location</h2>
            <p className="section-desc">Choose your preferred SwapNest center. We'll match you based on your location for the best impact.</p>
            <div className="info-banner">
              💡 <span>Selecting a center close to your home makes pickup and sorting tasks much easier. You can be reassigned later if needed.</span>
            </div>
            <div className="form-grid">
              <div className="field">
                <label>District <span className="req">*</span></label>
                <select id="district">
                  <option value="">Select district</option>
                  <option>Colombo</option>
                  <option>Gampaha</option>
                  <option>Kalutara</option>
                  <option>Kandy</option>
                  <option>Galle</option>
                  <option>Matara</option>
                  <option>Jaffna</option>
                  <option>Trincomalee</option>
                  <option>Kurunegala</option>
                  <option>Ratnapura</option>
                  <option>Badulla</option>
                </select>
              </div>
              <div className="field">
                <label>City / Town <span className="req">*</span></label>
                <input type="text" placeholder="Colombo 07" id="city" />
              </div>
              <div className="field span-2">
                <label>Preferred Center <span className="req">*</span></label>
                <select id="center">
                  <option value="">Select a SwapNest center</option>
                  <option>SwapNest Colombo Central – Borella</option>
                  <option>SwapNest Colombo South – Wellawatte</option>
                  <option>SwapNest Kandy Hub – Peradeniya</option>
                  <option>SwapNest Galle Center – Galle Fort</option>
                  <option>SwapNest Matara Point – Matara Town</option>
                  <option>SwapNest Jaffna Depot – Nallur</option>
                  <option>SwapNest Kurunegala – Dambulla Road</option>
                </select>
              </div>
              <div className="field span-2">
                <label>Why this center? <small>(Optional)</small></label>
                <textarea placeholder="e.g., It's close to my workplace and I can easily attend on weekdays..." id="centerReason"></textarea>
              </div>
            </div>
            <div style="margin-top: 24px;">
              <label style="font-size:12px; font-weight:500; text-transform:uppercase; letter-spacing:0.8px; color:#555; display:block; margin-bottom:12px;">Transport Options</label>
              <div className="toggle-row">
                <div className="toggle-info">
                  <h4>I have my own vehicle</h4>
                  <p>Car, motorcycle, or three-wheeler for pickup runs</p>
                </div>
                <label className="toggle">
                  <input type="checkbox" id="hasVehicle">
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="toggle-row">
                <div className="toggle-info">
                  <h4>I have a driving license</h4>
                  <p>Valid Sri Lanka driving license</p>
                </div>
                <label className="toggle">
                  <input type="checkbox" id="hasLicense">
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="toggle-row">
                <div className="toggle-info">
                  <h4>I can travel to other centers if needed</h4>
                  <p>For special events or urgent requests</p>
                </div>
                <label className="toggle">
                  <input type="checkbox" id="canTravel">
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
          {/* Section 3: Skills & Tasks */}
          <div
            className={
              "section" +
              (currentStep === 3 ? " active" : "") +
              (currentStep !== 3 ? "" : " show")
            }
            id="section-3"
          >
            <div className="section-label">💪 Step 3 of 5</div>
            <h2 className="section-title">Skills & Tasks</h2>
            <p className="section-desc">Tell us what you're good at and which tasks you'd like to handle. Volunteers can be assigned multiple task types.</p>
            <label style="font-size:12px; font-weight:500; text-transform:uppercase; letter-spacing:0.8px; color:#555; display:block; margin-bottom:12px;">Your Skills <span className="req">*</span></label>
            <div className="checkbox-grid" style="margin-bottom: 28px;">
              <div className="check-card">
                <input type="checkbox" id="sk1" name="skills" value="communication">
                <label for="sk1"><span class="icon">🗣️</span>Communication</label>
              </div>
              <div className="check-card">
                <input type="checkbox" id="sk2" name="skills" value="driving">
                <label for="sk2"><span class="icon">🚗</span>Driving / Pickup</label>
              </div>
              <div className="check-card">
                <input type="checkbox" id="sk3" name="skills" value="it">
                <label for="sk3"><span class="icon">💻</span>IT / Tech</label>
              </div>
              <div className="check-card">
                <input type="checkbox" id="sk4" name="skills" value="repair">
                <label for="sk4"><span class="icon">🔧</span>Repair / Fix</label>
              </div>
              <div className="check-card">
                <input type="checkbox" id="sk5" name="skills" value="sorting">
                <label for="sk5"><span class="icon">📦</span>Sorting & Packing</label>
              </div>
              <div className="check-card">
                <input type="checkbox" id="sk6" name="skills" value="photography">
                <label for="sk6"><span class="icon">📸</span>Photography</label>
              </div>
              <div className="check-card">
                <input type="checkbox" id="sk7" name="skills" value="lifting">
                <label for="sk7"><span class="icon">💪</span>Heavy Lifting</label>
              </div>
              <div className="check-card">
                <input type="checkbox" id="sk8" name="skills" value="social">
                <label for="sk8"><span class="icon">📣</span>Social Media</label>
              </div>
              <div className="check-card">
                <input type="checkbox" id="sk9" name="skills" value="management">
                <label for="sk9"><span class="icon">📊</span>Management</label>
              </div>
              <div className="check-card">
                <input type="checkbox" id="sk10" name="skills" value="language">
                <label for="sk10"><span class="icon">🌐</span>Multilingual</label>
              </div>
            </div>
            <label style="font-size:12px; font-weight:500; text-transform:uppercase; letter-spacing:0.8px; color:#555; display:block; margin-bottom:12px;">Preferred Task Types <span className="req">*</span></label>
            <div className="checkbox-grid" style="margin-bottom: 28px;">
              <div className="check-card">
                <input type="checkbox" id="t1" name="tasks" value="pickup">
                <label for="t1"><span class="icon">🚚</span>Pickup & Delivery</label>
              </div>
              <div className="check-card">
                <input type="checkbox" id="t2" name="tasks" value="inspection">
                <label for="t2"><span class="icon">🔍</span>Item Inspection</label>
              </div>
              <div className="check-card">
                <input type="checkbox" id="t3" name="tasks" value="sorting2">
                <label for="t3"><span class="icon">🗂️</span>Sorting & Cataloging</label>
              </div>
              <div className="check-card">
                <input type="checkbox" id="t4" name="tasks" value="moderation">
                <label for="t4"><span class="icon">🛡️</span>Content Moderation</label>
              </div>
              <div className="check-card">
                <input type="checkbox" id="t5" name="tasks" value="support">
                <label for="t5"><span class="icon">🤝</span>User Support</label>
              </div>
              <div className="check-card">
                <input type="checkbox" id="t6" name="tasks" value="events">
                <label for="t6"><span class="icon">🎪</span>Events & Drives</label>
              </div>
            </div>
            <div className="form-grid">
              <div className="field">
                <label>Experience Level</label>
                <select id="experience">
                  <option value="">Select level</option>
                  <option>No experience (first time)</option>
                  <option>Some experience (1–2 years)</option>
                  <option>Experienced (3–5 years)</option>
                  <option>Expert (5+ years)</option>
                </select>
              </div>
              <div className="field">
                <label>Max Tasks Per Week</label>
                <select id="maxTasks">
                  <option value="">How many tasks?</option>
                  <option>1–2 tasks</option>
                  <option>3–5 tasks</option>
                  <option>6–10 tasks</option>
                  <option>As many as needed</option>
                </select>
              </div>
              <div className="field span-2">
                <label>Tell us about your experience</label>
                <textarea placeholder="Briefly describe any relevant experience, past volunteer work, or why you want to join SwapNest..." id="bio"></textarea>
              </div>
            </div>
          </div>
          {/* Section 4: Availability */}
          <div
            className={
              "section" +
              (currentStep === 4 ? " active" : "") +
              (currentStep !== 4 ? "" : " show")
            }
            id="section-4"
          >
            <div className="section-label">🗓️ Step 4 of 5</div>
            <h2 className="section-title">Your Availability</h2>
            <p className="section-desc">Let us know when you're free so we can assign tasks that fit your schedule perfectly.</p>
            <label style="font-size:12px; font-weight:500; text-transform:uppercase; letter-spacing:0.8px; color:#555; display:block; margin-bottom:12px;">Days Available <span className="req">*</span></label>
            <div className="avail-grid" style="margin-bottom: 28px;">
              <div className="avail-card">
                <input type="checkbox" id="mon" name="days" value="monday">
                <label for="mon"><span>Mo</span> Monday</label>
              </div>
              <div className="avail-card">
                <input type="checkbox" id="tue" name="days" value="tuesday">
                <label for="tue"><span>Tu</span> Tuesday</label>
              </div>
              <div className="avail-card">
                <input type="checkbox" id="wed" name="days" value="wednesday">
                <label for="wed"><span>We</span> Wednesday</label>
              </div>
              <div className="avail-card">
                <input type="checkbox" id="thu" name="days" value="thursday">
                <label for="thu"><span>Th</span> Thursday</label>
              </div>
              <div className="avail-card">
                <input type="checkbox" id="fri" name="days" value="friday">
                <label for="fri"><span>Fr</span> Friday</label>
              </div>
              <div className="avail-card">
                <input type="checkbox" id="sat" name="days" value="saturday">
                <label for="sat"><span>Sa</span> Saturday</label>
              </div>
              <div className="avail-card">
                <input type="checkbox" id="sun" name="days" value="sunday">
                <label for="sun"><span>Su</span> Sunday</label>
              </div>
            </div>
            <label style="font-size:12px; font-weight:500; text-transform:uppercase; letter-spacing:0.8px; color:#555; display:block; margin-bottom:12px;">Time of Day <span className="req">*</span></label>
            <div className="avail-grid" style="margin-bottom: 28px;">
              <div className="avail-card">
                <input type="checkbox" id="morning" name="time" value="morning">
                <label for="morning"><span>🌅</span> Morning<br><small>6am – 12pm</small></label>
              </div>
              <div className="avail-card">
                <input type="checkbox" id="afternoon" name="time" value="afternoon">
                <label for="afternoon"><span>☀️</span> Afternoon<br><small>12pm – 5pm</small></label>
              </div>
              <div className="avail-card">
                <input type="checkbox" id="evening" name="time" value="evening">
                <label for="evening"><span>🌆</span> Evening<br><small>5pm – 9pm</small></label>
              </div>
              <div className="avail-card">
                <input type="checkbox" id="flexible" name="time" value="flexible">
                <label for="flexible"><span>🔄</span> Flexible<br><small>Any time</small></label>
              </div>
            </div>
            <div className="form-grid">
              <div className="field">
                <label>Hours per week <span className="req">*</span></label>
                <select id="hoursPerWeek">
                  <option value="">Select hours</option>
                  <option>1–3 hours</option>
                  <option>4–8 hours</option>
                  <option>9–15 hours</option>
                  <option>16–20 hours</option>
                  <option>20+ hours</option>
                </select>
              </div>
              <div className="field">
                <label>Start Date</label>
                <input type="date" id="startDate" />
              </div>
            </div>
            <div style="margin-top:24px">
              <div className="toggle-row">
                <div className="toggle-info">
                  <h4>Available on public holidays</h4>
                  <p>Poya days, national events, etc.</p>
                </div>
                <label className="toggle">
                  <input type="checkbox" id="holidays">
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="toggle-row">
                <div className="toggle-info">
                  <h4>Available for emergency tasks</h4>
                  <p>Short-notice pickups or urgent deliveries</p>
                </div>
                <label className="toggle">
                  <input type="checkbox" id="emergency">
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
          {/* Section 5: Documents */}
          <div
            className={
              "section" +
              (currentStep === 5 ? " active" : "") +
              (currentStep !== 5 ? "" : " show")
            }
            id="section-5"
          >
            <div className="section-label">📎 Step 5 of 5</div>
            <h2 className="section-title">Documents & Agreement</h2>
            <p className="section-desc">Upload required documents and confirm your agreement to volunteer terms.</p>
            <div className="form-grid" style="margin-bottom: 24px;">
              <div className="field">
                <label>NIC Copy <span className="req">*</span></label>
                <label className="file-upload">
                  <input type="file" accept=".jpg,.jpeg,.png,.pdf">
                  <div className="file-icon">🪪</div>
                  <div className="file-text"><strong>Click to upload</strong> or drag & drop<br>JPG, PNG or PDF (max 5MB)</div>
                </label>
              </div>
              <div className="field">
                <label>Driving License <small>(if applicable)</small></label>
                <label className="file-upload">
                  <input type="file" accept=".jpg,.jpeg,.png,.pdf">
                  <div className="file-icon">🚗</div>
                  <div className="file-text"><strong>Click to upload</strong> or drag & drop<br>JPG, PNG or PDF (max 5MB)</div>
                </label>
              </div>
              <div className="field">
                <label>Profile Photo <small>(optional)</small></label>
                <label className="file-upload">
                  <input type="file" accept=".jpg,.jpeg,.png">
                  <div className="file-icon">📸</div>
                  <div className="file-text"><strong>Click to upload</strong> or drag & drop<br>JPG or PNG (max 2MB)</div>
                </label>
              </div>
              <div className="field">
                <label>Reference Letter <small>(optional)</small></label>
                <label className="file-upload">
                  <input type="file" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx">
                  <div className="file-icon">📄</div>
                  <div className="file-text"><strong>Click to upload</strong> or drag & drop<br>Any format (max 5MB)</div>
                </label>
              </div>
            </div>
            <div style="border: 1.5px solid var(--border); border-radius: 12px; padding: 20px; background: var(--cream);">
              <p style="font-size: 13px; font-weight: 600; margin-bottom: 12px; color: var(--dark);">Volunteer Agreement</p>
              <p style="font-size: 13px; color: #777; line-height: 1.7; margin-bottom: 16px;">
                By submitting this form, I confirm that the information provided is accurate. I agree to SwapNest's Code of Conduct and understand my responsibilities as a volunteer, including maintaining confidentiality and acting in the best interests of the community.
              </p>
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; text-transform: none; letter-spacing: 0; font-size: 13px; color: var(--dark); font-weight: 400;">
                  <input type="checkbox" id="agreeTerms" style="width: 16px; height: 16px; accent-color: var(--forest); flex-shrink: 0;">
                  I have read and agree to the Volunteer Terms & Conditions <span className="req">*</span>
                </label>
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; text-transform: none; letter-spacing: 0; font-size: 13px; color: var(--dark); font-weight: 400;">
                  <input type="checkbox" id="agreePrivacy" style="width: 16px; height: 16px; accent-color: var(--forest); flex-shrink: 0;">
                  I agree to the Privacy Policy and data collection practices <span className="req">*</span>
                </label>
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; text-transform: none; letter-spacing: 0; font-size: 13px; color: var(--dark); font-weight: 400;">
                  <input type="checkbox" id="agreeNotif" style="width: 16px; height: 16px; accent-color: var(--forest); flex-shrink: 0;">
                  I'd like to receive email and SMS notifications about my tasks
                </label>
              </div>
            </div>
          </div>
          {/* Success Screen */}
          {currentStep === "success" && (
            <div className="success-screen active" id="successScreen">
              <div className="success-icon">🎉</div>
              <h2>Application Submitted!</h2>
              <p>Thank you for applying to be a SwapNest volunteer. Our team will review your application and contact you within 3–5 business days.</p>
              <button className="btn btn-primary" style={{ margin: "0 auto" }} onClick={() => window.location.reload()}>
                ← Back to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Volunteer;