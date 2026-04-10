import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";

const parseList = (value) =>
  String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export default function VolunteerEdit({ id: idFromProps, onBack }) {
  const navigate = useNavigate();
  const { id: idFromRoute } = useParams();
  const id = idFromProps ?? idFromRoute;

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
    password: "",
    role: "volunteer",
    agreeTerms: false,
    agreePrivacy: false,
    agreeNotif: false,
    applicationStatus: "Pending",
  });

  const DISTRICT_OPTIONS = [
    "Colombo",
    "Gampaha",
    "Kalutara",
    "Kandy",
    "Galle",
    "Matara",
    "Jaffna",
    "Trincomalee",
    "Kurunegala",
    "Ratnapura",
    "Badulla",
  ];

  const GENDER_OPTIONS = ["", "Male", "Female", "Non-binary", "Prefer not to say"];
  const EXPERIENCE_OPTIONS = ["", "No experience", "1–2 years", "3–5 years", "Expert"];
  const HOURS_OPTIONS = ["", "1–3 hours", "4–8 hours", "9–15 hours"];

  const title = useMemo(() => {
    const name = `${form.firstName} ${form.lastName}`.trim();
    return name ? `Edit Volunteer — ${name}` : "Edit Volunteer";
  }, [form.firstName, form.lastName]);

  const inputCls = "w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";
  const textareaCls = "w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

  const fetchCenters = async () => {
    try {
      const res = await API.get("/centers");
      return Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Missing volunteer ID.");
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        // Load volunteer data
        const res = await API.get(`/volunteers/${id}`);
        const raw = res.data;
        const v = raw?.data ?? raw ?? {};

        const centersData = await fetchCenters();
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
          const next = {
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
            center: findMatchingCenter(v.center, centersData),
            centerReason: v.centerReason || "",
            hasVehicle: !!v.hasVehicle,
            hasLicense: !!v.hasLicense,
            canTravel: !!v.canTravel,
            skillsText: Array.isArray(v.skills) ? v.skills.join(", ") : "",
            tasksText: Array.isArray(v.tasks) ? v.tasks.join(", ") : "",
            experience: v.experience || "",
            maxTasks: v.maxTasks != null ? String(v.maxTasks) : "",
            bio: v.bio || "",
            daysText: Array.isArray(v.days) ? v.days.join(", ") : "",
            timeText: Array.isArray(v.time) ? v.time.join(", ") : "",
            hoursPerWeek: v.hoursPerWeek || "",
            startDate: dateToInput(v.startDate),
            password: "",
            role: "volunteer",
            agreeTerms: !!v.agreeTerms,
            agreePrivacy: !!v.agreePrivacy,
            agreeNotif: !!v.agreeNotif,
            applicationStatus: v.applicationStatus || "Pending",
          };
          setForm((prev) => ({ ...prev, ...next }));
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

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const findMatchingCenter = (volunteerCenter, list) => {
    const centersList = Array.isArray(list) ? list : centers;
    if (!volunteerCenter || !centersList.length) return volunteerCenter || "";

    const exactMatch = centersList.find((c) => c.centerName === volunteerCenter);
    if (exactMatch) return exactMatch.centerName;

    const caseMatch = centersList.find(
      (c) => c.centerName.toLowerCase().trim() === String(volunteerCenter).toLowerCase().trim()
    );
    if (caseMatch) return caseMatch.centerName;

    const partialMatch = centersList.find(
      (c) =>
        c.centerName.toLowerCase().includes(String(volunteerCenter).toLowerCase()) ||
        String(volunteerCenter).toLowerCase().includes(c.centerName.toLowerCase())
    );
    if (partialMatch) return partialMatch.centerName;

    return volunteerCenter;
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const days = parseList(form.daysText);
      const times = parseList(form.timeText);
      const skills = parseList(form.skillsText);
      const tasks = parseList(form.tasksText);

      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        nic: form.nic.trim(),
        dob: form.dob ? new Date(form.dob).toISOString() : undefined,
        gender: form.gender,
        emergencyContact: form.emergencyContact.trim(),
        address: form.address.trim(),
        district: form.district.trim(),
        city: form.city.trim(),
        center: form.center.trim(),
        centerReason: form.centerReason.trim(),
        hasVehicle: !!form.hasVehicle,
        hasLicense: !!form.hasLicense,
        canTravel: !!form.canTravel,
        skills,
        tasks,
        experience: form.experience,
        maxTasks: form.maxTasks.trim(),
        bio: form.bio.trim(),
        days,
        time: times,
        hoursPerWeek: form.hoursPerWeek,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        agreeTerms: !!form.agreeTerms,
        agreePrivacy: !!form.agreePrivacy,
        agreeNotif: !!form.agreeNotif,
        applicationStatus: form.applicationStatus,
        role: "volunteer",
      };

      const pwd = form.password.trim();
      if (pwd.length > 0) {
        if (pwd.length < 8) {
          setError("Password must be at least 8 characters.");
          setSaving(false);
          return;
        }
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(pwd)) {
          setError(
            "Password must include uppercase, lowercase, a number, and a special character (@$!%*?&)."
          );
          setSaving(false);
          return;
        }
        payload.password = pwd;
      }

      Object.keys(payload).forEach((k) => {
        if (payload[k] === undefined) delete payload[k];
      });

      const res = await API.put(`/volunteers/${id}`, payload);
      if (!res.data) throw new Error("Failed to update volunteer");

      setForm((p) => ({ ...p, password: "" }));
      if (onBack) onBack();
      else navigate("/volunteer-dashboard/volunteer");
    } catch (e2) {
      const errBody = e2.response?.data;
      const msg =
        errBody?.message ||
        (Array.isArray(errBody?.errors) ? errBody.errors.map((x) => x.message || x).join(" ") : null) ||
        e2?.message ||
        String(e2);
      setError(String(msg));
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
            to="/volunteer-dashboard/volunteer"
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
              <input name="firstName" value={form.firstName} onChange={onChange} className={inputCls} required />
            </Field>
            <Field label="Last Name">
              <input name="lastName" value={form.lastName} onChange={onChange} className={inputCls} required />
            </Field>
            <Field label="Email">
              <input
                id="volunteer-edit-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={onChange}
                className={inputCls}
                required
              />
            </Field>
            <Field label="Phone">
              <input name="phone" value={form.phone} onChange={onChange} className={inputCls} />
            </Field>
            <Field label="NIC">
              <input name="nic" value={form.nic} onChange={onChange} className={inputCls} required />
            </Field>
            <Field label="Date of Birth">
              <input type="date" name="dob" value={form.dob} onChange={onChange} className={inputCls} required />
            </Field>

            <Field label="Gender">
              <select name="gender" value={form.gender} onChange={onChange} className={inputCls}>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g || "unset"} value={g}>
                    {g === "" ? "— Not specified —" : g}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Emergency Contact">
              <input name="emergencyContact" value={form.emergencyContact} onChange={onChange} className={inputCls} />
            </Field>

            <Field label="District">
              <select name="district" value={form.district} onChange={onChange} className={inputCls}>
                <option value="">— Select —</option>
                {DISTRICT_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="City">
              <input name="city" value={form.city} onChange={onChange} className={inputCls} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Address">
                <input name="address" value={form.address} onChange={onChange} className={inputCls} />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="Preferred center">
                <select name="center" value={form.center} onChange={onChange} className={inputCls}>
                  <option value="">Select a center...</option>
                  {centers.map((c) => (
                    <option key={c._id} value={c.centerName}>
                      {c.centerName} — {c.city}, {c.district}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Center reason / notes">
                <input name="centerReason" value={form.centerReason} onChange={onChange} className={inputCls} />
              </Field>
            </div>

            <Field label="Experience">
              <select name="experience" value={form.experience} onChange={onChange} className={inputCls}>
                {EXPERIENCE_OPTIONS.map((x) => (
                  <option key={x || "unset"} value={x}>
                    {x === "" ? "— Not specified —" : x}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Hours per week">
              <select name="hoursPerWeek" value={form.hoursPerWeek} onChange={onChange} className={inputCls}>
                {HOURS_OPTIONS.map((x) => (
                  <option key={x || "unset"} value={x}>
                    {x === "" ? "— Not specified —" : x}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Max tasks">
              <input name="maxTasks" value={form.maxTasks} onChange={onChange} className={inputCls} />
            </Field>
            <Field label="Start date">
              <input type="date" name="startDate" value={form.startDate} onChange={onChange} className={inputCls} />
            </Field>

            <div className="md:col-span-2">
              <Field label="Skills (comma-separated)">
                <input name="skillsText" value={form.skillsText} onChange={onChange} className={inputCls} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Tasks (comma-separated)">
                <input name="tasksText" value={form.tasksText} onChange={onChange} className={inputCls} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Available days (comma-separated, e.g. monday, tuesday)">
                <input name="daysText" value={form.daysText} onChange={onChange} className={inputCls} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Time slots (comma-separated)">
                <input name="timeText" value={form.timeText} onChange={onChange} className={inputCls} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Bio">
                <textarea name="bio" value={form.bio} onChange={onChange} className={textareaCls} rows={3} />
              </Field>
            </div>

            <Field label="Can travel">
              <Checkbox name="canTravel" checked={form.canTravel} onChange={onChange} />
            </Field>
            <Field label="Has vehicle">
              <Checkbox name="hasVehicle" checked={form.hasVehicle} onChange={onChange} />
            </Field>
            <Field label="Has license">
              <Checkbox name="hasLicense" checked={form.hasLicense} onChange={onChange} />
            </Field>

            <Field label="Application status">
              <select name="applicationStatus" value={form.applicationStatus} onChange={onChange} className={inputCls}>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </Field>
            <Field label="Role">
              <input
                value={form.role}
                readOnly
                aria-readonly="true"
                className={`${inputCls} bg-zinc-100 text-zinc-600 cursor-not-allowed`}
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Password">
                <input
                  id="volunteer-edit-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={onChange}
                  className={inputCls}
                  placeholder="Use saved password from your browser, or type a new one"
                />
              </Field>
              <p className="text-xs text-zinc-500 mt-1">
                The real password cannot be shown (it is stored securely). Leave empty to keep the existing
                password, or use your password manager to fill a saved password / enter a new one (min 8
                characters, uppercase, lowercase, number, and one of @$!%*?&amp;).
              </p>
            </div>

            <Field label="Agree — terms">
              <Checkbox name="agreeTerms" checked={form.agreeTerms} onChange={onChange} />
            </Field>
            <Field label="Agree — privacy">
              <Checkbox name="agreePrivacy" checked={form.agreePrivacy} onChange={onChange} />
            </Field>
            <Field label="Agree — notifications">
              <Checkbox name="agreeNotif" checked={form.agreeNotif} onChange={onChange} />
            </Field>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Link
              to="/volunteer-dashboard/volunteer"
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
