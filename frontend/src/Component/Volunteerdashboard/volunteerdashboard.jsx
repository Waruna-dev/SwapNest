import React from "react";
import { Outlet } from "react-router-dom";

// Layout for dashboard (sidebar + header)
import VolunteerDashboardLayout from "./VolunteerDashboardLayout";

export default function VolunteerDashboard() {
  return (
    <VolunteerDashboardLayout>
      {/* Nested routes will render here */}
      <Outlet />
    </VolunteerDashboardLayout>
  );
}