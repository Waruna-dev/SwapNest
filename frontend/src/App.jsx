import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AboutUs from "./pages/aboutus";

// Volunteer components
import Pickup from "./components/Volunteer/pickup";
import Center from "./components/Volunteer/center";
import Volunteer from "./components/Volunteer/volunteer";
import VolunteerPage from "./components/Volunteer/Volunteerpage";
import DistributionPlan from "./components/Volunteer/distributionPlan";

// Volunteer Dashboard components
import VolunteerDashboard from "./components/Volunteerdashboard/volunteerdashboard";
import DashboardOverview from "./components/Volunteerdashboard/dashboardOverview";
import DashboardCenters from "./components/Volunteerdashboard/dashboardcenters";
import CenterEdit from "./components/Volunteerdashboard/centeredit.jsx";
import VolunteerDashboardVolunteersTable from "./components/Volunteerdashboard/VolunteerDashboardVolunteersTable";
import VolunteerEdit from "./components/Volunteerdashboard/volunteeredit";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-on-surface">
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          {/* Anyone can visit these pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/pickup" element={<Pickup />} />
          <Route path="/center" element={<Center />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/volunteer-hero" element={<VolunteerPage />} />

          {/* Volunteer dashboard */}
          <Route path="/dashboard" element={<VolunteerDashboard />}>
            <Route index element={<DashboardOverview />} />
            <Route path="volunteer-hero" element={<VolunteerPage />} />
            <Route path="volunteer" element={<VolunteerDashboardVolunteersTable />} />
            <Route path="volunteer/:id/edit" element={<VolunteerEdit />} />
            <Route path="center" element={<DashboardCenters />} />
            <Route path="center/:id/edit" element={<CenterEdit />} />
            <Route path="add-center" element={<Center />} />
            <Route path="distribution-plan" element={<DistributionPlan />} />
          </Route>

          {/* Volunteer application form - standalone without dashboard layout */}
          <Route path="/volunteer/apply" element={<Volunteer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
