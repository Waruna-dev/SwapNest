import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

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
    agreeTerms: false,
    agreePrivacy: false,
    agreeNotif: false,
    applicationStatus: "Pending",
  });

  const title = useMemo(() => {
    const name = `${form.firstName} ${form.lastName}`.trim();
    return name ? `Edit Volunteer — ${name}` : "Edit Volunteer";
  }, [form.firstName, form.lastName]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/volunteers/${id}`);
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(json?.message || `Request failed with status ${res.status}`);
        }

        const v = json || {};
        const dateToInput = (d) => {
          if (!d) return "";
          const dt = new Date(d);
          if (Number.isNaN(dt.getTime())) return "";
          const pad = (n) => String(n).padStart(2, "0");
          return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
        };

        if (!cancelled) {
          setForm({
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
            center: v.center || "",
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
          });
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

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        nic: form.nic,
        dob: form.dob ? new Date(form.dob).toISOString() : undefined,
        gender: form.gender,
        emergencyContact: form.emergencyContact,
        address: form.address,
        district: form.district,
        city: form.city,
        center: form.center,
        centerReason: form.centerReason,
        hasVehicle: form.hasVehicle,
        hasLicense: form.hasLicense,
        canTravel: form.canTravel,
        skills: parseList(form.skillsText),
        tasks: parseList(form.tasksText),
        experience: form.experience,
        maxTasks: form.maxTasks,
        bio: form.bio,
        days: parseList(form.daysText),
        time: parseList(form.timeText),
        hoursPerWeek: form.hoursPerWeek,
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        agreeTerms: form.agreeTerms,
        agreePrivacy: form.agreePrivacy,
        agreeNotif: form.agreeNotif,
        applicationStatus: form.applicationStatus,
      };

      const res = await fetch(`${API_BASE}/api/volunteers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.message || `Request failed with status ${res.status}`);
      }

      navigate("/dashboard/volunteer");
    } catch (e2) {
      setError(String(e2?.message || e2));
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
              <input name="center" value={form.center} onChange={onChange} className={inputCls} />
            </Field>
            <Field label="Application Status">
              <select name="applicationStatus" value={form.applicationStatus} onChange={onChange} className={inputCls}>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
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

