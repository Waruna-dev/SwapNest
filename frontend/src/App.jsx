import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AboutUs from "./pages/aboutus";

// Volunteer components
import Pickup from "./Component/Volunteer/pickup";
import Center from "./Component/Volunteer/center";
import Volunteer from "./Component/Volunteer/volunteer";
import VolunteerPage from "./Component/Volunteer/Volunteerpage";
import DistributionPlan from "./Component/Volunteer/distributionPlan";

// Volunteer Dashboard components
import VolunteerDashboard from "./Component/Volunteerdashboard/volunteerdashboard";
import DashboardOverview from "./Component/Volunteerdashboard/dashboardOverview";
import DashboardCenters from "./Component/Volunteerdashboard/dashboardcenters";
import CenterEdit from "./Component/Volunteerdashboard/centeredit.jsx";
import VolunteerDashboardVolunteersTable from "./Component/Volunteerdashboard/VolunteerDashboardVolunteersTable";
import VolunteerEdit from "./Component/Volunteerdashboard/volunteeredit";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Public pages */}
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
            <Route path="volunteer/apply" element={<Volunteer />} />
            <Route path="volunteer/:id/edit" element={<VolunteerEdit />} />
            <Route path="center" element={<DashboardCenters />} />
            <Route path="center/:id/edit" element={<CenterEdit />} />
            <Route path="add-center" element={<Center />} />
            <Route path="distribution-plan" element={<DistributionPlan />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;