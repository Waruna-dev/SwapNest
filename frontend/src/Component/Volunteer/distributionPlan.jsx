import React, { useMemo, useState } from "react";

const CENTERS = [
  { id: 1, name: "SwapNest Colombo Central", code: "SCC-1042", district: "Colombo" },
  { id: 2, name: "SwapNest Kandy Hub", code: "SKH-2018", district: "Kandy" },
  { id: 3, name: "SwapNest Galle Center", code: "SGC-3310", district: "Galle" },
];

const PLAN_TEMPLATES = [
  { id: 1, type: "Pickup + Sorting", hours: "08:00 - 12:00", volunteersNeeded: 6 },
  { id: 2, type: "Delivery + Handover", hours: "13:00 - 16:00", volunteersNeeded: 4 },
  { id: 3, type: "Warehouse Maintenance", hours: "10:00 - 14:00", volunteersNeeded: 2 },
];

export default function DistributionPlan() {
  const todayISO = useMemo(() => {
    const d = new Date();
    // YYYY-MM-DD (local)
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }, []);

  const [centerCode, setCenterCode] = useState(CENTERS[0].code);
  const [planDate, setPlanDate] = useState(todayISO);
  const [templateId, setTemplateId] = useState(PLAN_TEMPLATES[0].id);

  const selectedCenter = CENTERS.find((c) => c.code === centerCode) || CENTERS[0];
  const selectedTemplate = PLAN_TEMPLATES.find((t) => t.id === templateId) || PLAN_TEMPLATES[0];

  // Simple deterministic "sample schedule" based on the chosen center.
  const schedule = useMemo(() => {
    const baseVolunteers = selectedTemplate.volunteersNeeded;
    const seed = selectedCenter.id * 17 + selectedTemplate.id * 31;
    const volunteers = Array.from({ length: baseVolunteers }, (_, i) => ({
      id: `${selectedCenter.code}-${seed}-${i}`,
      name: `Volunteer ${String(i + 1).padStart(2, "0")}`,
      role: i % 2 === 0 ? "Sorting" : "Delivery",
      status: i === 0 ? "Assigned" : "Pending",
    }));
    return volunteers;
  }, [selectedCenter.code, selectedCenter.id, selectedTemplate.id, selectedTemplate.volunteersNeeded]);

  return (
    <div className="min-h-screen bg-[#F5F0E8] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#1A1A1A]">
            Distribution Plan
          </h1>
          <p className="text-zinc-500 mt-2 max-w-3xl">
            Create a quick schedule for a center and see which volunteer roles are needed.
            (Demo UI - wire to backend when ready.)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-zinc-200 p-4">
            <label className="block text-sm font-bold text-zinc-600 mb-2">Center</label>
            <select
              value={centerCode}
              onChange={(e) => setCenterCode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white outline-none"
            >
              {CENTERS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="text-xs text-zinc-400 mt-2">
              {selectedCenter.district} • {selectedCenter.code}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-4">
            <label className="block text-sm font-bold text-zinc-600 mb-2">Date</label>
            <input
              type="date"
              value={planDate}
              onChange={(e) => setPlanDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white outline-none"
            />
            <div className="text-xs text-zinc-400 mt-2">Planning for {planDate}</div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-4">
            <label className="block text-sm font-bold text-zinc-600 mb-2">Plan Template</label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white outline-none"
            >
              {PLAN_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.type} ({t.hours})
                </option>
              ))}
            </select>
            <div className="text-xs text-zinc-400 mt-2">
              {selectedTemplate.volunteersNeeded} volunteers needed
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Scheduled roles
                </div>
                <div className="text-lg font-black text-[#1A1A1A] mt-1">
                  {selectedTemplate.type}
                </div>
                <div className="text-sm text-zinc-500 mt-1">{selectedTemplate.hours}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Center
                </div>
                <div className="text-sm font-bold text-[#1A1A1A] mt-1">{selectedCenter.name}</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-xs font-bold text-zinc-400">
                    <th className="px-3">Volunteer</th>
                    <th className="px-3">Role</th>
                    <th className="px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((v) => (
                    <tr key={v.id} className="bg-[#F5F0E8]">
                      <td className="px-3 py-3 rounded-l-xl">{v.name}</td>
                      <td className="px-3 py-3">{v.role}</td>
                      <td className="px-3 py-3 rounded-r-xl">
                        <span
                          className={
                            v.status === "Assigned"
                              ? "inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-bold"
                              : "inline-flex items-center rounded-full bg-zinc-100 text-zinc-600 px-3 py-1 text-xs font-bold"
                          }
                        >
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
              Quick actions
            </div>

            <button
              type="button"
              className="w-full bg-[#2D4A35] text-white py-3 rounded-xl font-bold hover:bg-black transition-colors shadow-sm"
              onClick={() => alert("Demo: distribution plan saved (no backend wired).")}
            >
              Save Plan
            </button>

            <button
              type="button"
              className="w-full mt-3 border border-zinc-200 text-zinc-700 py-3 rounded-xl font-bold hover:bg-zinc-50 transition-colors"
              onClick={() => alert("Demo: notifications sent (no backend wired).")}
            >
              Notify Volunteers
            </button>

            <div className="mt-4 text-sm text-zinc-600 leading-relaxed">
              When you connect this to the backend, you can persist the schedule per center and automatically
              assign volunteers based on skills, availability, and center capacity.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

