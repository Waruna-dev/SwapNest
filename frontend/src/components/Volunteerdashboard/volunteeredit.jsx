import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const parseList = (value) =>
  String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export default function VolunteerEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [centers, setCenters] = useState([]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nic: "",
    dob: "",
    gender: "",
    emergencyContact: "",
    address: "",
    district: "",
    city: "",
    center: "",
    originalCenter: "", // Store original center value for reference
    centerReason: "",
    hasVehicle: false,
    hasLicense: false,
    canTravel: false,
    skillsText: "",
    tasksText: "",
    experience: "",
    maxTasks: "",
    bio: "",
    daysText: "",
    timeText: "",
    hoursPerWeek: "",
    startDate: "",
    agreeTerms: false,
    agreePrivacy: false,
    agreeNotif: false,
    applicationStatus: "Pending",
  });

  const title = useMemo(() => {
    const name = `${form.firstName} ${form.lastName}`.trim();
    return name ? `Edit Volunteer — ${name}` : "Edit Volunteer";
  }, [form.firstName, form.lastName]);

  const inputCls = "w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";
  const textareaCls = "w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

  const fetchCenters = async () => {
    try {
      const res = await API.get('/api/centers');
      console.log('Centers API response:', res);
      return Array.isArray(res.data?.data) ? res.data.data : 
             Array.isArray(res.data) ? res.data : [];
    } catch (e) {
      console.error('Failed to fetch centers:', e);
      return [];
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        // Load volunteer data
        const res = await API.get(`/api/volunteers/${id}`);
        const v = res.data || {};
        console.log('Volunteer API response:', res);
        console.log('Loaded volunteer data:', v);
        
        // Load centers
        const centersData = await fetchCenters();
        console.log('Loaded centers:', centersData);
        if (!cancelled) {
          setCenters(centersData);
        }
        const dateToInput = (d) => {
          if (!d) return "";
          const dt = new Date(d);
          if (Number.isNaN(dt.getTime())) return "";
          const pad = (n) => String(n).padStart(2, "0");
          return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
        };

        if (!cancelled) {
          const matchedCenter = findMatchingCenter(v.center);
        const formData = {
            firstName: v.firstName || "",
            lastName: v.lastName || "",
            email: v.email || "",
            phone: v.phone || "",
            nic: v.nic || "",
            dob: dateToInput(v.dob),
            gender: v.gender || "",
            emergencyContact: v.emergencyContact || "",
            address: v.address || "",
            district: v.district || "",
            city: v.city || "",
            center: matchedCenter,
            originalCenter: v.center || "", // Store original center
            centerReason: v.centerReason || "",
            hasVehicle: !!v.hasVehicle,
            hasLicense: !!v.hasLicense,
            canTravel: !!v.canTravel,
            skillsText: Array.isArray(v.skills) ? v.skills.join(", ") : "",
            tasksText: Array.isArray(v.tasks) ? v.tasks.join(", ") : "",
            experience: v.experience || "",
            maxTasks: v.maxTasks || "",
            bio: v.bio || "",
            daysText: Array.isArray(v.days) ? v.days.join(", ") : "",
            timeText: Array.isArray(v.time) ? v.time.join(", ") : "",
            hoursPerWeek: v.hoursPerWeek || "",
            startDate: dateToInput(v.startDate),
            agreeTerms: !!v.agreeTerms,
            agreePrivacy: !!v.agreePrivacy,
            agreeNotif: !!v.agreeNotif,
            applicationStatus: v.applicationStatus || "Pending",
          };
          console.log('Setting form data:', formData);
          console.log('Volunteer center:', v.center, 'Matched to:', formData.center);
          setForm(formData);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) setError(String(e?.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Debug: Log centers and form state
  useEffect(() => {
    console.log('Centers state:', centers);
    console.log('Form center value:', form.center);
  }, [centers, form.center]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log('Field changed:', name, value);
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const findMatchingCenter = (volunteerCenter) => {
    if (!volunteerCenter || !centers.length) {
      console.log('No volunteer center or no centers loaded', { volunteerCenter, centersLength: centers.length });
      return volunteerCenter || ''; // Return original center if no centers loaded
    }
    
    console.log('Finding match for:', volunteerCenter);
    console.log('Available centers:', centers.map(c => ({ id: c._id, name: c.centerName })));
    
    // Try exact match first
    const exactMatch = centers.find(c => c.centerName === volunteerCenter);
    if (exactMatch) {
      console.log('Exact match found:', exactMatch.centerName);
      return exactMatch.centerName;
    }
    
    // Try case-insensitive match
    const caseMatch = centers.find(c => 
      c.centerName.toLowerCase().trim() === volunteerCenter.toLowerCase().trim()
    );
    if (caseMatch) {
      console.log('Case match found:', caseMatch.centerName);
      return caseMatch.centerName;
    }
    
    // Try partial match (contains)
    const partialMatch = centers.find(c => 
      c.centerName.toLowerCase().includes(volunteerCenter.toLowerCase()) ||
      volunteerCenter.toLowerCase().includes(c.centerName.toLowerCase())
    );
    if (partialMatch) {
      console.log('Partial match found:', partialMatch.centerName);
      return partialMatch.centerName;
    }
    
    console.log('No match found, returning original center');
    return volunteerCenter; // Return original center so it appears in dropdown
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    
    // Validate center selection - allow any center value (original or new)
    if (!form.center) {
      setError('Please select a center from the dropdown.');
      setSaving(false);
      return;
    }
    
    try {
      // Create a cleaner payload with only defined/valid values
      const payload = {};
      
      // Only include fields that have values
      if (form.firstName) payload.firstName = form.firstName;
      if (form.lastName) payload.lastName = form.lastName;
      if (form.email) payload.email = form.email;
      if (form.phone) payload.phone = form.phone;
      if (form.nic) payload.nic = form.nic;
      if (form.dob) payload.dob = new Date(form.dob).toISOString();
      if (form.gender) payload.gender = form.gender;
      if (form.emergencyContact) payload.emergencyContact = form.emergencyContact;
      if (form.address) payload.address = form.address;
      if (form.district) payload.district = form.district;
      if (form.city) payload.city = form.city;
      if (form.center) payload.center = form.center;
      if (form.centerReason) payload.centerReason = form.centerReason;
      if (form.hasVehicle !== undefined) payload.hasVehicle = form.hasVehicle;
      if (form.hasLicense !== undefined) payload.hasLicense = form.hasLicense;
      if (form.canTravel !== undefined) payload.canTravel = form.canTravel;
      
      const skills = parseList(form.skillsText);
      if (skills.length > 0) payload.skills = skills;
      
      const tasks = parseList(form.tasksText);
      if (tasks.length > 0) payload.tasks = tasks;
      
      if (form.experience) payload.experience = form.experience;
      if (form.maxTasks) payload.maxTasks = form.maxTasks;
      if (form.bio) payload.bio = form.bio;
      
      const days = parseList(form.daysText);
      if (days.length > 0) payload.days = days;
      
      const time = parseList(form.timeText);
      if (time.length > 0) payload.time = time;
      
      if (form.hoursPerWeek) payload.hoursPerWeek = form.hoursPerWeek;
      if (form.startDate) payload.startDate = new Date(form.startDate).toISOString();
      
      if (form.agreeTerms !== undefined) payload.agreeTerms = form.agreeTerms;
      if (form.agreePrivacy !== undefined) payload.agreePrivacy = form.agreePrivacy;
      if (form.agreeNotif !== undefined) payload.agreeNotif = form.agreeNotif;
      // Only include applicationStatus if it's not "Assigned" (backend might not be updated yet)
      if (form.applicationStatus && form.applicationStatus !== "Assigned") {
        payload.applicationStatus = form.applicationStatus;
      } else if (form.applicationStatus === "Assigned") {
        // Temporarily use "Accepted" as fallback for "Assigned" until backend is updated
        payload.applicationStatus = "Accepted";
      }

      console.log('Payload being sent:', payload);
      const res = await API.put(`/api/volunteers/${id}`, payload);
      console.log('Save API response:', res);
      if (!res.data) {
        throw new Error('Failed to update volunteer');
      }

      navigate("/volunteer-dashboard/volunteer");
    } catch (e2) {
      console.error('Save error details:', e2);
      console.error('Error response:', e2.response?.data);
      console.error('Full error:', e2);
      console.error('Error status:', e2.response?.status);
      console.error('Error headers:', e2.response?.headers);
      const errorMessage = e2.response?.data?.message || e2.response?.data?.error || e2?.message || e2;
      console.error('Extracted error message:', errorMessage);
      setError(String(errorMessage));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-zinc-200 p-6">
          <div className="text-zinc-500 font-bold">Loading volunteer...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#1A1A1A]">{title}</h1>
            <p className="text-zinc-500 mt-1">Update details and save to database.</p>
          </div>
          <Link
            to="/dashboard/volunteer"
            className="border border-zinc-200 text-zinc-800 px-4 py-2 rounded-xl font-bold text-sm hover:bg-zinc-50 transition-colors"
          >
            ← Back
          </Link>
        </div>

        {error ? (
          <div className="mb-4 bg-white rounded-2xl border border-red-200 p-4">
            <p className="text-red-600 font-bold">{error}</p>
          </div>
        ) : null}

        <form onSubmit={onSave} className="bg-white rounded-2xl border border-zinc-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="First Name">
              <input name="firstName" value={form.firstName} onChange={onChange} className={inputCls} />
            </Field>
            <Field label="Last Name">
              <input name="lastName" value={form.lastName} onChange={onChange} className={inputCls} />
            </Field>
            <Field label="Email">
              <input name="email" value={form.email} onChange={onChange} className={inputCls} />
            </Field>
            <Field label="Phone">
              <input name="phone" value={form.phone} onChange={onChange} className={inputCls} />
            </Field>
            <Field label="NIC">
              <input name="nic" value={form.nic} onChange={onChange} className={inputCls} />
            </Field>
            <Field label="Date of Birth">
              <input type="date" name="dob" value={form.dob} onChange={onChange} className={inputCls} />
            </Field>

            <Field label="District">
              <input name="district" value={form.district} onChange={onChange} className={inputCls} />
            </Field>
            <Field label="City">
              <input name="city" value={form.city} onChange={onChange} className={inputCls} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Address">
                <input name="address" value={form.address} onChange={onChange} className={inputCls} />
              </Field>
            </div>

            <Field label="Center">
              <select name="center" value={form.center} onChange={onChange} className={inputCls}>
                <option value="">Select a center...</option>
                {centers.map(center => (
                  <option key={center._id} value={center.centerName}>
                    {center.centerName} - {center.city}, {center.district}
                  </option>
                ))}
                {/* Add original center as option if it doesn't match any available centers */}
                {form.originalCenter && !centers.find(c => c.centerName === form.originalCenter) && (
                  <option value={form.originalCenter} style={{color: '#dc2626', fontWeight: 'bold'}}>
                    {form.originalCenter} (Original - Not in Available List)
                  </option>
                )}
              </select>
              <div className="text-xs text-zinc-500 mt-1">
                Available centers: {centers.length} | Current: {form.center || 'None'}
              </div>
              {form.originalCenter && !form.center && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                  ⚠️ Original center "{form.originalCenter}" not found in available centers. You can keep the original or select a new one.
                </div>
              )}
              {centers.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    console.log('Setting center to first available:', centers[0].centerName);
                    setForm(p => ({ ...p, center: centers[0].centerName }));
                  }}
                  className="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Set First Center
                </button>
              )}
            </Field>
            <Field label="Application Status">
              <select name="applicationStatus" value={form.applicationStatus} onChange={onChange} className={inputCls}>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Assigned">Assigned</option>
              </select>
            </Field>

            <div className="md:col-span-2">
              <Field label="Skills (comma separated)">
                <input name="skillsText" value={form.skillsText} onChange={onChange} className={inputCls} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Tasks (comma separated)">
                <input name="tasksText" value={form.tasksText} onChange={onChange} className={inputCls} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Bio">
                <textarea name="bio" value={form.bio} onChange={onChange} className={textareaCls} rows={3} />
              </Field>
            </div>

            <Field label="Can Travel">
              <Checkbox name="canTravel" checked={form.canTravel} onChange={onChange} />
            </Field>
            <Field label="Has Vehicle">
              <Checkbox name="hasVehicle" checked={form.hasVehicle} onChange={onChange} />
            </Field>
            <Field label="Has License">
              <Checkbox name="hasLicense" checked={form.hasLicense} onChange={onChange} />
            </Field>
            <Field label="Emergency Contact">
              <input name="emergencyContact" value={form.emergencyContact} onChange={onChange} className={inputCls} />
            </Field>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Link
              to="/dashboard/volunteer"
              className="border border-zinc-200 text-zinc-800 px-5 py-2 rounded-xl font-bold text-sm hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#2D4A35] text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-black transition-colors disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">{label}</div>
      {children}
    </div>
  );
}

function Checkbox({ name, checked, onChange }) {
  return (
    <label className="inline-flex items-center gap-2">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} className="w-4 h-4 accent-[#2D4A35]" />
      <span className="text-sm text-zinc-700 font-bold">{checked ? "Yes" : "No"}</span>
    </label>
  );
}

const inputCls =
  "w-full px-4 py-2 rounded-xl border border-zinc-200 bg-white outline-none focus:ring-2 focus:ring-[#2D4A35]/20";

const textareaCls =
  "w-full px-4 py-2 rounded-xl border border-zinc-200 bg-white outline-none focus:ring-2 focus:ring-[#2D4A35]/20";

