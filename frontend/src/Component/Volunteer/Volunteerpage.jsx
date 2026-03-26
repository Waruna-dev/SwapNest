import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ── Asset Imports ──────────────────────────────────────────────────────────
import voidVideo from "../../pictures/void.mp4";
import teamImg from "../../pictures/93c13d67b36bda544bdff473c7ded9a7.jpg";

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
    volunteersActive: 62,
    itemsSwapped: 1840,
    rating: 4.9,
    emoji: "🏙️",
    tagline: "Heart of the capital network",
    facilities: ["Storage", "Sorting Area", "CCTV"],
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
    volunteersActive: 38,
    itemsSwapped: 1120,
    rating: 4.7,
    emoji: "🌿",
    tagline: "Hill country's swap haven",
    facilities: ["Storage", "Parking"],
  },
];

// ── Helper Components ──────────────────────────────────────────────────────
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

function StatCard({ icon, value, label }) {
  const counted = useCountUp(value);
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-[#F8F9FA] rounded-2xl border border-zinc-100 w-full shadow-sm">
      <span className="text-xl mb-1">{icon}</span>
      <span className="text-2xl font-black text-[#1A1A1A]">
        {counted.toLocaleString()}
      </span>
      <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">
        {label}
      </span>
    </div>
  );
}

function CenterCard({ center, onVolunteer }) {
  const [expanded, setExpanded] = useState(false);
  const isActive = center.status === "Active";
  const fillPct = Math.min((center.volunteersActive / center.capacity) * 100, 100);

  return (
    <motion.div
      layout
      className="bg-white rounded-[24px] border border-zinc-200 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500 text-black"
    >
      <div className="h-[6px] bg-gradient-to-r from-[#2D4A35] to-[#BF5E3D]" />
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F4F0E8] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              {center.emoji}
            </div>
            <div>
              <h3 className="text-[15px] font-bold leading-tight">{center.name}</h3>
              <span className="text-[10px] font-mono text-zinc-400">{center.code}</span>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200 uppercase">
            {center.status}
          </div>
        </div>

        <p className="text-[12px] text-zinc-400 italic mb-4">{center.tagline}</p>
        <div className="flex items-center gap-2 text-[12px] text-zinc-600 mb-5">
          <span>📍</span> <strong>{center.city}</strong> <span className="text-zinc-300">•</span> {center.district}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-[#F9F6F0] rounded-xl py-3 text-center">
            <span className="block text-[14px] font-bold">{center.volunteersActive}</span>
            <span className="text-[9px] uppercase text-zinc-400 font-bold">Volunteers</span>
          </div>
          <div className="bg-[#F9F6F0] rounded-xl py-3 text-center">
            <span className="block text-[14px] font-bold">{center.rating}</span>
            <span className="text-[9px] uppercase text-zinc-400 font-bold">Rating</span>
          </div>
          <div className="bg-[#F9F6F0] rounded-xl py-3 text-center">
            <span className="block text-[14px] font-bold">{center.itemsSwapped}</span>
            <span className="text-[9px] uppercase text-zinc-400 font-bold">Swaps</span>
          </div>
        </div>

        <div className="mb-5">
          <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase mb-1.5">
            <span>Center Capacity</span>
            <span>{Math.round(fillPct)}%</span>
          </div>
          <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fillPct}%` }}
              className="h-full bg-[#2D4A35]"
            />
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-[11px] font-bold text-[#2D4A35] py-2 rounded-lg hover:bg-zinc-50 transition-colors mb-4 uppercase"
        >
          {expanded ? "Collapse Details ▲" : "View Full Details ▼"}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-zinc-100 pt-4 space-y-4 text-[12px] text-zinc-600"
            >
              <p className="font-bold text-zinc-400 text-[10px] uppercase">Contact Details</p>
              <p>{center.address}<br />{center.contact} | {center.email}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => onVolunteer(center)}
          disabled={!isActive}
          className={`w-full py-4 mt-2 rounded-xl font-bold text-sm transition-all ${isActive ? "bg-[#2D4A35] text-white hover:bg-black shadow-lg" : "bg-zinc-100 text-zinc-300"}`}
        >
          BECOME A VOLUNTEER
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function VolunteerPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-sans overflow-x-hidden">
      {/* ── HERO SECTION ───────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center px-6 lg:px-20 py-20">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-12 z-10">
          
          {/* ── LEFT: TEXT CONTENT ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1"
          >
            <div className="inline-flex items-center gap-2 bg-[#F2C94C] text-black text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 shadow-sm">
              ✨ Impacting 9+ Districts
            </div>

            <h1 className="text-[clamp(48px,8vw,90px)] font-black leading-[0.9] tracking-tight mb-8 text-[#1A1A1A]">
              Volunteer <span className="text-[#2D4A35]">SwapNest</span>
            </h1>

            <div className="flex flex-wrap gap-4 mb-12">
              <button
                onClick={() => document.getElementById("browse").scrollIntoView({ behavior: "smooth" })}
                className="bg-[#F2C94C] text-black px-8 py-4 rounded-xl font-black text-sm hover:scale-105 transition-all shadow-md uppercase tracking-tight"
              >
                BROWSE CENTERS
              </button>
              <button
  onClick={() => navigate("/volunteer")}
  className="bg-[#2D4A35] text-white px-8 py-4 rounded-xl font-black text-sm hover:bg-black transition-all shadow-md uppercase tracking-tight"
>
  BECOME VOLUNTEER
</button>
            </div>

            {/* Stats area */}
            <div className="grid grid-cols-3 gap-4 max-w-md mb-12">
              <StatCard icon="🏢" value={5} label="Hubs" />
              <StatCard icon="👥" value={180} label="Members" />
              <StatCard icon="🔄" value={4500} label="Swaps" />
            </div>

            {/* Paragraph horizontally aligned */}
            <div className="text-zinc-500 font-medium text-lg leading-relaxed border-l-4 border-[#BF5E3D] pl-6 space-y-4">
              <p>
                As a SwapNest volunteer, you will play an important role in managing local 
                collection and distribution centers, ensuring that items are properly sorted, 
                organized, and delivered to the right people. This is more than just volunteering 
                — it’s about creating real impact in your community.
              </p>
              <p>
                By joining, you will connect with like-minded individuals, build strong community 
                relationships, and gain valuable experience in teamwork, coordination, and logistics.
              </p>
              <p>
                Whether you assist at a collection hub, help with deliveries, or guide users through 
                the swapping process, your contribution directly helps reduce waste and supports 
                sustainable living.
              </p>
            </div>
          </motion.div>

          {/* ── RIGHT: VIDEO ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="flex-1 relative flex justify-center"
          >
            <div className="relative w-full max-w-[500px] aspect-[4/5] rounded-[4rem] overflow-hidden border-[12px] border-[#F8F9FA] shadow-2xl bg-zinc-100">
              <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                <source src={voidVideo} type="video/mp4" />
              </video>
              <div className="absolute top-10 -right-10 w-40 h-52 bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden border border-zinc-200 rotate-12 hidden md:block shadow-xl">
                <img src={teamImg} alt="team" className="w-full h-full object-cover opacity-90" />
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── BROWSE CENTERS SECTION ──────────────────────────────────── */}
      <section id="browse" className="py-24 px-6 max-w-[1200px] mx-auto">
        <div className="mb-12 border-b border-zinc-100 pb-8">
          <h2 className="text-4xl font-black tracking-tight mb-4 text-[#1A1A1A]">
            Find Your Local <span className="text-[#BF5E3D]">Hub</span>
          </h2>
          <p className="text-zinc-400 font-medium">
            Currently showing our active SwapNest locations across Sri Lanka for delivery and collection.
          </p>
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CENTERS.map((center) => (
            <CenterCard
              key={center.id}
              center={center}
              onVolunteer={(c) => navigate("/dashboard/volunteer/apply", { state: { center: c } })}
            />
          ))}
        </motion.div>
      </section>
    </div>
  );
}