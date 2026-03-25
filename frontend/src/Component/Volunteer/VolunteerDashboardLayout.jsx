import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const linkClassName = ({ isActive }) =>
  isActive
    ? "block rounded-xl bg-white/10 px-4 py-3 font-bold text-white shadow-sm"
    : "block rounded-xl px-4 py-3 font-bold text-white/90 hover:bg-white/5 hover:text-white transition-colors";

export default function VolunteerDashboardLayout() {
  return (
    <div className="min-h-screen flex bg-[#F5F0E8] text-[#1A1A1A]">
      <aside className="w-72 bg-[#012d1d] text-white flex flex-col">
        <div className="p-6 pb-4 flex items-center gap-2">
          <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
            🔄
          </div>
          <div className="text-xl font-serif font-bold tracking-tight">SwapNest</div>
        </div>

        <nav className="flex-1 px-4 pb-4 space-y-2">
          <NavLink to="/dashboard" end className={linkClassName}>
            Overview
          </NavLink>
          <NavLink to="/dashboard/volunteer" className={linkClassName}>
            Volunteer
          </NavLink>
          <NavLink to="/dashboard/center" className={linkClassName}>
            Volunteer Center
          </NavLink>
          <NavLink to="/dashboard/distribution-plan" className={linkClassName}>
            Distribution Plan
          </NavLink>
        </nav>

        <div className="px-4 pb-6 mt-auto">
          <NavLink to="/volunteer-hero" end className={linkClassName}>
            Volunteer Page
          </NavLink>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

