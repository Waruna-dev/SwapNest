import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const linkClassName = ({ isActive }) =>
  isActive
    ? "inline-block px-4 py-2 font-semibold text-gray-900 border-b-2 border-gray-900"
    : "inline-block px-4 py-2 font-medium text-gray-600 hover:text-gray-900 transition-colors";

export default function VolunteerDashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Horizontal Navigation Bar */}
      <header className="bg-white border-b border-gray-200">
        <nav className="px-6 py-4">
          <div className="flex items-center space-x-8">
            <NavLink to="/volunteer-dashboard" end className={linkClassName}>
              Overview
            </NavLink>
            <NavLink to="/volunteer-dashboard/volunteer" className={linkClassName}>
              Volunteer
            </NavLink>
            <NavLink to="/volunteer-dashboard/center" className={linkClassName}>
              Volunteer Center
            </NavLink>
            <NavLink to="/volunteer-dashboard/pickup" className={linkClassName}>
              Pickup
            </NavLink>
            <NavLink to="/volunteer-dashboard/distribution-plan" className={linkClassName}>
              Center Received
            </NavLink>
            <NavLink to="/volunteer-hero" end className={linkClassName}>
              Volunteer Page
            </NavLink>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

