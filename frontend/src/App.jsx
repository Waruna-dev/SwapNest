import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// --- AUTH & GENERAL PAGES ---
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AboutUs from "./pages/aboutus";

// --- ITEM MODULE ---
import ItemAddNewItems from "./pages/item-listing/ItemAddNewItem";
import ItemGalleryPage from "./pages/item-gallery/ItemGalleryPage";
import ItemDashboard1 from "./pages/item-listing/ItemDashboard";
import MyItems from "./pages/item-listing/MyItems";
import ItemLocation from "./pages/item-ocation/itemLocation";

// --- VOLUNTEER MODULE ---
import Pickup from "./components/Volunteer/pickup";
import Center from "./components/Volunteer/center";
import Volunteer from "./components/Volunteer/volunteer";
import VolunteerPage from "./components/Volunteer/Volunteerpage";
import DistributionPlan from "./components/Volunteer/distributionPlan";

// --- VOLUNTEER DASHBOARD ---
import VolunteerDashboard from "./components/Volunteerdashboard/volunteerdashboard";
import DashboardOverview from "./components/Volunteerdashboard/dashboardOverview";
import DashboardCenters from "./components/Volunteerdashboard/dashboardcenters";
import CenterEdit from "./components/Volunteerdashboard/centeredit";
import VolunteerDashboardVolunteersTable from "./components/Volunteerdashboard/VolunteerDashboardVolunteersTable";
import VolunteerEdit from "./components/Volunteerdashboard/volunteeredit";

// --- PROTECTED ROUTE ---
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-on-surface">
        <Routes>

          {/* ---------------- PUBLIC ROUTES ---------------- */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* ---------------- ITEM ROUTES ---------------- */}
          <Route path="/item/new" element={<ItemAddNewItems />} />
          <Route path="/item/gallery" element={<ItemGalleryPage />} />
          <Route path="/item/dashboard" element={<ItemDashboard1 />} />
          <Route path="/item/location" element={<ItemLocation />} />

          {/* ---------------- VOLUNTEER PUBLIC ---------------- */}
          <Route path="/pickup" element={<Pickup />} />
          <Route path="/center" element={<Center />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/volunteer-hero" element={<VolunteerPage />} />
          <Route path="/volunteer/apply" element={<Volunteer />} />

          {/* ---------------- PROTECTED ROUTES ---------------- */}
          <Route element={<ProtectedRoute />}>

            {/* Main user */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-list" element={<MyItems />} />

            {/* Volunteer Dashboard (nested) */}
            <Route path="/volunteer-dashboard" element={<VolunteerDashboard />}>
              <Route index element={<DashboardOverview />} />
              <Route path="volunteer" element={<VolunteerDashboardVolunteersTable />} />
              <Route path="volunteer/:id/edit" element={<VolunteerEdit />} />
              <Route path="center" element={<DashboardCenters />} />
              <Route path="center/:id/edit" element={<CenterEdit />} />
              <Route path="add-center" element={<Center />} />
              <Route path="distribution-plan" element={<DistributionPlan />} />
              <Route path="volunteer-hero" element={<VolunteerPage />} />
            </Route>

          </Route>

        </Routes>
      </div>
    </Router>
  );
}

export default App;