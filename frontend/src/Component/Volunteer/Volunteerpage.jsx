import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ── Hardcoded Centers ──────────────────────────────────────────────────────
const CENTERS = [
  {
    id: 1,
    name: "SwapNest Colombo Central",
    code: "SCC-1042",
    district: "Colombo",
    city: "Borella",
    address: "No. 45, Baseline Road, Colombo 09",
    email: "colombo@swapnest.lk",
    contact: "+94 11 234 5678",
    status: "Active",
    capacity: 80,
    openTime: "08:00",
    closeTime: "18:00",
    operatingDays: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
    facilities: ["Storage","Sorting Area","Loading Bay","CCTV","Office Space"],
    manager: "Kamal Bandara",
    hasParking: true,
    hasCCTV: true,
    isAccessible: true,
    volunteersActive: 62,
    itemsSwapped: 1840,
    rating: 4.9,
    emoji: "🏙️",
    tagline: "Heart of the capital network",
  },
  {
    id: 2,
    name: "SwapNest Kandy Hub",
    code: "SKH-2018",
    district: "Kandy",
    city: "Peradeniya",
    address: "12/B, Peradeniya Road, Kandy",
    email: "kandy@swapnest.lk",
    contact: "+94 81 456 7890",
    status: "Active",
    capacity: 50,
    openTime: "09:00",
    closeTime: "17:00",
    operatingDays: ["Monday","Wednesday","Friday","Saturday"],
    facilities: ["Storage","Sorting Area","Weighing Scale","Parking"],
    manager: "Nirosha Perera",
    hasParking: true,
    hasCCTV: false,
    isAccessible: true,
    volunteersActive: 38,
    itemsSwapped: 1120,
    rating: 4.7,
    emoji: "🌿",
    tagline: "Hill country's swap haven",
  },
  {
    id: 3,
    name: "SwapNest Galle Shore",
    code: "SGS-3055",
    district: "Galle",
    city: "Galle Fort",
    address: "08, Pedlar Street, Galle 80000",
    email: "galle@swapnest.lk",
    contact: "+94 91 223 4455",
    status: "Active",
    capacity: 40,
    openTime: "08:30",
    closeTime: "16:30",
    operatingDays: ["Tuesday","Thursday","Saturday","Sunday"],
    facilities: ["Storage","Loading Bay","Office Space","CCTV"],
    manager: "Thilini Jayawardena",
    hasParking: false,
    hasCCTV: true,
    isAccessible: false,
    volunteersActive: 29,
    itemsSwapped: 760,
    rating: 4.8,
    emoji: "🌊",
    tagline: "Southern coastline community",
  },
  {
    id: 4,
    name: "SwapNest Jaffna North",
    code: "SJN-4007",
    district: "Jaffna",
    city: "Nallur",
    address: "77, Hospital Road, Jaffna",
    email: "jaffna@swapnest.lk",
    contact: "+94 21 222 3344",
    status: "Active",
    capacity: 35,
    openTime: "07:30",
    closeTime: "15:30",
    operatingDays: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
    facilities: ["Storage","Sorting Area","Weighing Scale"],
    manager: "Arun Krishnamurthy",
    hasParking: true,
    hasCCTV: false,
    isAccessible: true,
    volunteersActive: 24,
    itemsSwapped: 590,
    rating: 4.6,
    emoji: "🏛️",
    tagline: "Northern heritage exchange",
  },
  {
    id: 5,
    name: "SwapNest Ratnapura Gem",
    code: "SRG-5013",
    district: "Ratnapura",
    city: "Ratnapura Town",
    address: "34, Main Street, Ratnapura",
    email: "ratnapura@swapnest.lk",
    contact: "+94 45 222 6677",
    status: "Under Maintenance",
    capacity: 30,
    openTime: "09:00",
    closeTime: "17:00",
    operatingDays: ["Monday","Wednesday","Friday"],
    facilities: ["Storage","Parking","Sorting Area"],
    manager: "Pradeep Silva",
    hasParking: true,
    hasCCTV: false,
    isAccessible: false,
    volunteersActive: 0,
    itemsSwapped: 430,
    rating: 4.4,
    emoji: "💎",
    tagline: "Gem province swap point",
  },
  {
    id: 6,
    name: "SwapNest Kurunegala Connect",
    code: "SKC-6029",
    district: "Kurunegala",
    city: "Kurunegala",
    address: "22, Colombo Road, Kurunegala",
    email: "kurunegala@swapnest.lk",
    contact: "+94 37 224 5566",
    status: "Active",
    capacity: 45,
    openTime: "08:00",
    closeTime: "17:30",
    operatingDays: ["Monday","Tuesday","Thursday","Friday","Saturday"],
    facilities: ["Storage","Sorting Area","Loading Bay","Parking","Weighing Scale"],
    manager: "Chamara Wickrama",
    hasParking: true,
    hasCCTV: true,
    isAccessible: true,
    volunteersActive: 41,
    itemsSwapped: 980,
    rating: 4.8,
    emoji: "🌾",
    tagline: "North-western rural connector",
  },
];

const FACILITY_ICONS = {
  Storage: "🗄️",
  "Sorting Area": "🗂️",
  "Loading Bay": "🚛",
  Parking: "🚗",
  CCTV: "📷",
  "Weighing Scale": "⚖️",
  "Office Space": "🏢",
};

const ALL_DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const DAY_SHORT = {
  Monday:"Mo", Tuesday:"Tu", Wednesday:"We",
  Thursday:"Th", Friday:"Fr", Saturday:"Sa", Sunday:"Su",
};

// ── Animated counter ───────────────────────────────────────────────────────
function useCountUp(end, duration = 1400) {
  const [count, setCount] = useState(0);
  const rafRef = useRef();
  useEffect(() => {
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [end, duration]);
  return count;
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ icon, value, label }) {
  const counted = useCountUp(value);
  return (
    <div className="flex flex-col items-center gap-1 px-5 py-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300">
      <span className="text-2xl mb-0.5">{icon}</span>
      <span className="text-[26px] font-black text-white tracking-tight leading-none">
        {counted.toLocaleString()}
      </span>
      <span className="text-[10px] text-white/60 uppercase tracking-widest font-semibold">{label}</span>
    </div>
  );
}

// ── Center Card ────────────────────────────────────────────────────────────
function CenterCard({ center, index, onVolunteer }) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig = {
    Active:              { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
    Inactive:            { bg: "bg-orange-50",  text: "text-orange-700",  dot: "bg-orange-400",  border: "border-orange-200" },
    "Under Maintenance": { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400",   border: "border-amber-200" },
  };
  const sc = statusConfig[center.status] || statusConfig.Active;
  const fillPct = Math.min((center.volunteersActive / center.capacity) * 100, 100);
  const isActive = center.status === "Active";

  return (
    <div
      className="bg-white rounded-[20px] border border-[#EDE8DF] shadow-[0_2px_20px_rgba(0,0,0,0.06)] overflow-hidden group hover:shadow-[0_8px_40px_rgba(45,74,53,0.14)] hover:-translate-y-1 transition-all duration-300"
    >
      {/* Top accent bar */}
      <div className="h-[5px] bg-gradient-to-r from-[#2D4A35] via-[#5E8B6A] to-[#9DC3A0]" />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#F4F0E8] flex items-center justify-center text-[22px] flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              {center.emoji}
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#1A1A1A] leading-tight tracking-[-0.2px]">
                {center.name}
              </h3>
              <span className="text-[10px] font-mono text-[#bbb] tracking-wider">{center.code}</span>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border flex-shrink-0 ${sc.bg} ${sc.text} ${sc.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${isActive ? "animate-pulse" : ""}`} />
            {center.status}
          </div>
        </div>

        {/* Tagline */}
        <p className="text-[12px] text-[#aaa] italic mb-3">{center.tagline}</p>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-[12px] text-[#666] mb-4">
          <span>📍</span>
          <span className="font-semibold text-[#444]">{center.city}</span>
          <span className="text-[#ddd]">·</span>
          <span>{center.district} District</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { icon: "👥", val: center.volunteersActive, label: "Active" },
            { icon: "🔄", val: center.itemsSwapped.toLocaleString(), label: "Swaps" },
            { icon: "⭐", val: center.rating, label: "Rating" },
          ].map(({ icon, val, label }) => (
            <div key={label} className="flex flex-col items-center gap-0.5 bg-[#F9F6F0] rounded-xl py-2">
              <span className="text-sm">{icon}</span>
              <span className="text-[13px] font-bold text-[#1A1A1A]">{val}</span>
              <span className="text-[10px] text-[#bbb] uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>

        {/* Capacity bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-[10px] text-[#bbb] mb-1">
            <span className="font-bold uppercase tracking-widest">Capacity</span>
            <span className="font-mono text-[#888]">{center.volunteersActive}/{center.capacity}</span>
          </div>
          <div className="h-1.5 bg-[#EDE8DF] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2D4A35] to-[#9DC3A0] transition-all duration-700"
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>

        {/* Hours + manager */}
        <div className="flex items-center gap-2 text-[11px] text-[#999] mb-4 flex-wrap">
          <span>🕐 {center.openTime} – {center.closeTime}</span>
          <span className="text-[#ddd]">|</span>
          <span>👤 {center.manager}</span>
        </div>

        {/* Operating day chips */}
        <div className="flex flex-wrap gap-1 mb-4">
          {ALL_DAYS.map((day) => {
            const active = center.operatingDays.includes(day);
            return (
              <span
                key={day}
                className={`text-[9px] font-black px-1.5 py-0.5 rounded-md tracking-wider transition-all ${
                  active
                    ? "bg-[#2D4A35] text-white"
                    : "bg-[#F4F0E8] text-[#ccc]"
                }`}
              >
                {DAY_SHORT[day]}
              </span>
            );
          })}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-[11px] font-bold text-[#2D4A35] flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-[#F4F0E8] transition-colors duration-200 mb-3"
        >
          {expanded ? "Hide details ▲" : "Show details ▼"}
        </button>

        {/* Expanded details */}
        {expanded && (
          <div className="border-t border-[#F0EBE0] pt-4 space-y-3 text-[12px]">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#ccc] mb-1">Address</div>
              <div className="text-[#555]">{center.address}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#ccc] mb-1">Email</div>
                <div className="text-[#555] break-all">{center.email}</div>
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#ccc] mb-1">Phone</div>
                <div className="text-[#555]">{center.contact}</div>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#ccc] mb-2">Facilities</div>
              <div className="flex flex-wrap gap-1.5">
                {center.facilities.map((f) => (
                  <span key={f} className="text-[11px] bg-[#F4F0E8] text-[#555] px-2.5 py-1 rounded-full font-medium">
                    {FACILITY_ICONS[f]} {f}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {center.hasParking && (
                <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-semibold">🚗 Parking</span>
              )}
              {center.hasCCTV && (
                <span className="text-[11px] bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full font-semibold">📷 CCTV</span>
              )}
              {center.isAccessible && (
                <span className="text-[11px] bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full font-semibold">♿ Accessible</span>
              )}
            </div>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={() => onVolunteer(center)}
          disabled={!isActive}
          className={`mt-4 w-full py-3 rounded-[12px] text-[13px] font-bold tracking-[-0.1px] flex items-center justify-center gap-2 transition-all duration-300 ${
            isActive
              ? "bg-[#2D4A35] text-white shadow-[0_4px_14px_rgba(45,74,53,0.28)] hover:bg-[#24392b] hover:-translate-y-0.5 hover:shadow-[0_6px_22px_rgba(45,74,53,0.38)] active:scale-95"
              : "bg-[#F4F0E8] text-[#ccc] cursor-not-allowed"
          }`}
        >
          {isActive ? (
            <>
              <span>🙋</span> Become a Volunteer
            </>
          ) : (
            <>
              <span>🔧</span> Currently Unavailable
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function VolunteerPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleVolunteer = (center) => {
    // Navigates to volunteer.jsx form, passing selected center as state
    navigate("/volunteer/register", { state: { center } });
  };

  const districts = ["All", ...Array.from(new Set(CENTERS.map((c) => c.district))).sort()];

  const filtered = CENTERS.filter((c) => {
    const matchDistrict = filter === "All" || c.district === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.district.toLowerCase().includes(q);
    return matchDistrict && matchSearch;
  });

  const totalSwaps      = CENTERS.reduce((a, c) => a + c.itemsSwapped, 0);
  const totalVolunteers = CENTERS.reduce((a, c) => a + c.volunteersActive, 0);
  const activeCenters   = CENTERS.filter((c) => c.status === "Active").length;

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans text-[#1A1A1A]">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <div className="relative bg-[#2D4A35] overflow-hidden">

        {/* Background decorative circles */}
        <div className="absolute -top-28 -right-28 w-[480px] h-[480px] bg-[#9DC3A0]/10 rounded-full pointer-events-none" />
        <div className="absolute -bottom-36 -left-20 w-80 h-80 bg-[#E8C547]/8 rounded-full pointer-events-none" />
        <div className="absolute top-0 left-1/3 w-px h-full bg-white/5 pointer-events-none" />

        {/* Animated ping dots */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-[#9DC3A0]/30 animate-ping"
              style={{
                left: `${8 + i * 9}%`,
                top: `${15 + (i % 5) * 16}%`,
                animationDelay: `${i * 0.45}s`,
                animationDuration: `${2.2 + i * 0.28}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-[1100px] mx-auto px-6 pt-14 pb-20">

          {/* Brand bar */}
          <div className={`flex items-center gap-2.5 mb-10 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="w-9 h-9 bg-[#E8C547] rounded-lg flex items-center justify-center text-[18px]">🔄</div>
            <span className="text-[18px] font-bold text-white tracking-[-0.3px]">SwapNest</span>
            <span className="ml-2 text-[10px] font-bold text-[#9DC3A0] bg-[#9DC3A0]/15 px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-[#9DC3A0]/25">
              Volunteer Portal
            </span>
          </div>

          {/* Heading */}
          <div className={`transition-all duration-700 delay-100 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="inline-flex items-center gap-2 bg-[#9DC3A0]/15 border border-[#9DC3A0]/25 rounded-full px-4 py-1.5 text-[11px] font-bold text-[#9DC3A0] uppercase tracking-[1.5px] mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9DC3A0] animate-pulse" />
              Applications Open · Join Now
            </div>
            <h1 className="text-[clamp(30px,5vw,58px)] font-black text-white leading-[1.08] tracking-[-1.5px] mb-5 max-w-[660px]">
              Make a Difference,
              <br />
              <span className="text-[#9DC3A0]">One Swap at a Time</span>
            </h1>
            <p className="text-[15px] text-white/60 max-w-[500px] leading-[1.75] mb-10">
              Join Sri Lanka's fastest-growing community swap network. Volunteer at a center near you — sort, connect, and help items find new homes instead of landfills.
            </p>
          </div>

          {/* Hero CTA */}
          <div className={`flex flex-wrap gap-3 mb-14 transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <button
              onClick={() => document.getElementById("centers-section").scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-2 bg-[#E8C547] text-[#1A1A1A] px-7 py-3.5 rounded-[12px] text-[14px] font-black shadow-[0_4px_20px_rgba(232,197,71,0.40)] hover:bg-[#d4b03c] hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(232,197,71,0.50)] transition-all duration-200 active:scale-95"
            >
              🙋 Become a Volunteer
            </button>
            <button
              onClick={() => document.getElementById("centers-section").scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-7 py-3.5 rounded-[12px] text-[14px] font-semibold hover:bg-white/18 transition-all duration-200"
            >
              🏢 Browse Centers →
            </button>
          </div>

          {/* Stats row */}
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 transition-all duration-700 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <StatCard icon="🏢" value={activeCenters}   label="Active Centers" />
            <StatCard icon="👥" value={totalVolunteers} label="Volunteers" />
            <StatCard icon="🔄" value={totalSwaps}      label="Items Swapped" />
            <StatCard icon="🌍" value={9}               label="Districts" />
          </div>
        </div>
      </div>

      {/* ── WHAT VOLUNTEERS DO ────────────────────────────────────────── */}
      <div className="max-w-[1100px] mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <span className="inline-block bg-[#EDF5EE] text-[#2D4A35] text-[10px] font-black tracking-[1.5px] uppercase px-4 py-1.5 rounded-full mb-4">
            Your Volunteer Tasks
          </span>
          <h2 className="text-[26px] font-black text-[#1A1A1A] tracking-[-0.5px] mb-2">
            What You'll Do at a SwapNest Center
          </h2>
          <p className="text-[13px] text-[#aaa] max-w-[440px] mx-auto leading-[1.7]">
            Every task you do directly reduces waste and strengthens community bonds across Sri Lanka.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: "🗂️", title: "Sort Items",       desc: "Categorise donated items by type, condition and suitability for swapping." },
            { icon: "🚛", title: "Load & Unload",    desc: "Help move items at loading bays efficiently and safely with the team." },
            { icon: "🤝", title: "Assist Swappers",  desc: "Guide community members to find the right items for their needs." },
            { icon: "📦", title: "Pack & Store",     desc: "Keep storage areas tidy and organised for quick and easy retrieval." },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-white border border-[#EDE8DF] rounded-[16px] p-5 text-center hover:shadow-[0_4px_24px_rgba(45,74,53,0.09)] hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div className="w-11 h-11 bg-[#EDF5EE] rounded-xl flex items-center justify-center text-[22px] mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                {icon}
              </div>
              <h4 className="text-[13px] font-bold text-[#1A1A1A] mb-1.5">{title}</h4>
              <p className="text-[11px] text-[#aaa] leading-[1.65]">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CENTERS ───────────────────────────────────────────────────── */}
      <div id="centers-section" className="max-w-[1100px] mx-auto px-6 pb-20">

        {/* Section header + filters */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="inline-block bg-[#EDF5EE] text-[#2D4A35] text-[10px] font-black tracking-[1.5px] uppercase px-4 py-1.5 rounded-full mb-3">
              🏢 Our Centers
            </span>
            <h2 className="text-[26px] font-black text-[#1A1A1A] tracking-[-0.5px]">
              Find a Center Near You
            </h2>
            <p className="text-[13px] text-[#aaa] mt-1">
              {filtered.length} center{filtered.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* Search */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ccc] text-sm pointer-events-none">🔍</span>
              <input
                type="text"
                placeholder="Search centers…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-[210px] pl-9 pr-4 py-2.5 border-[1.5px] border-[#EDE8DF] rounded-[10px] text-[13px] outline-none focus:border-[#2D4A35] focus:ring-[3px] focus:ring-[#2D4A35]/10 bg-white transition-all"
              />
            </div>
            {/* District filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3.5 py-2.5 border-[1.5px] border-[#EDE8DF] rounded-[10px] text-[13px] outline-none focus:border-[#2D4A35] focus:ring-[3px] focus:ring-[#2D4A35]/10 bg-white text-[#555] font-medium transition-all"
            >
              {districts.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Cards grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((center, i) => (
              <CenterCard
                key={center.id}
                center={center}
                index={i}
                onVolunteer={handleVolunteer}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[20px] border border-[#EDE8DF]">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-[17px] font-bold text-[#1A1A1A] mb-2">No centers found</h3>
            <p className="text-[13px] text-[#bbb]">Try a different district or clear the search.</p>
          </div>
        )}
      </div>

      {/* ── BOTTOM CTA BANNER ─────────────────────────────────────────── */}
      <div className="max-w-[1100px] mx-6 lg:mx-auto mb-14 bg-[#2D4A35] rounded-[24px] overflow-hidden relative">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#9DC3A0]/10 rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#E8C547]/10 rounded-full pointer-events-none" />
        <div className="relative z-10 px-10 py-12 flex flex-col sm:flex-row items-center justify-between gap-6 max-sm:text-center">
          <div>
            <h3 className="text-[22px] font-black text-white tracking-tight mb-2">
              Ready to start your volunteer journey?
            </h3>
            <p className="text-[13px] text-white/55 max-w-[440px] leading-[1.7]">
              Pick any active center above and click <strong className="text-white/85">Become a Volunteer</strong> — registration takes under 3 minutes.
            </p>
          </div>
          <button
            onClick={() => document.getElementById("centers-section").scrollIntoView({ behavior: "smooth" })}
            className="flex-shrink-0 flex items-center gap-2 bg-[#E8C547] text-[#1A1A1A] px-8 py-4 rounded-[14px] text-[14px] font-black shadow-[0_4px_20px_rgba(232,197,71,0.35)] hover:bg-[#d4b03c] hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(232,197,71,0.45)] transition-all duration-200 active:scale-95 whitespace-nowrap"
          >
            🙋 Become a Volunteer
          </button>
        </div>
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <div className="text-center py-8 text-[12px] text-[#ccc]">
        © {new Date().getFullYear()} SwapNest Sri Lanka · Together we swap, together we thrive 🌱
      </div>

    </div>
  );
}