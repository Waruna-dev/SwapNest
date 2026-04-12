import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AboutUs from "./pages/aboutus";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Privacy from "./pages/PrivacyPolicy";
import Term from "./pages/TermsConditions";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import AdminSwapDashboard from "./components/swap/AdminSwapDashboard";
import Swapform from "./components/swap/SwapForm";
import SwapList from "./components/swap/SwapList";

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
import VolunteerPickup from "./Component/Volunteerdashboard/volunteerpickup";
import DeliveryAll from "./Component/Volunteerdashboard/DeliveryAll";
import NGODashboard from "./Component/Volunteerdashboard/ngodashboard";

// Item components
import ItemAddNewItems from "./pages/item-listing/ItemAddNewItem";
import ItemGalleryPage from "./pages/item-gallery/ItemGalleryPage";
import ItemDashboard1 from "./pages/item-listing/ItemDashboard";
import MyItems from "./pages/item-listing/MyItems";
import ItemLocation from "./pages/item-ocation/itemLocation";
import ContactUs from './pages/ContactUs';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>

          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<AboutUs />} />

          <Route path="/pickup" element={<Pickup />} />
          <Route path="/center" element={<Center />} />
          <Route path="/volunteer" element={<VolunteerPage />} />
          <Route path="/volunteer-hero" element={<VolunteerPage />} />

          {/* Auth */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/contact" element={<ContactUs />} />
            
            {/*Item routes*/}
          <Route path="/item/new" element={<ItemAddNewItems />} />
          <Route path="/item/gallery" element={<ItemGalleryPage />} />
          <Route path="/item/dashboard" element={<ItemDashboard1 />} />
          <Route path="/item/location" element={<ItemLocation />} />

          {/* Protected main dashboard */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
<Route path="/my-list" element={<MyItems />} />
          </Route>

          {/* Volunteer Dashboard */}
          <Route path="/volunteer-dashboard" element={<VolunteerDashboard />}>
            <Route index element={<DashboardOverview />} />
            <Route path="volunteer-hero" element={<VolunteerPage />} />
            <Route path="volunteer" element={<VolunteerDashboardVolunteersTable />} />
            <Route path="volunteer/apply" element={<Volunteer />} />
            <Route path="volunteer/:id/edit" element={<VolunteerEdit />} />
            <Route path="center" element={<DashboardCenters />} />
            <Route path="center/:id/edit" element={<CenterEdit />} />
            <Route path="add-center" element={<Center />} />
            <Route path="pickup" element={<VolunteerPickup />} />
            <Route path="distribution-plan" element={<DistributionPlan />} />
            <Route path="delivery-all" element={<DeliveryAll />} />
          </Route>

          {/* NGO Volunteer Dashboard */}
          <Route path="/ngo-dashboard" element={<NGODashboard />} />

          {/* Swap module */}
          <Route path="/swapadmin" element={<AdminSwapDashboard />} />
          <Route path="/swapform" element={<Swapform />} />
          <Route path="/swaplist" element={<SwapList />} />

          {/* Items module */}
          <Route path="/item/form" element={<ItemAddNewItems />} />
          <Route path="/item/gallery" element={<ItemGalleryPage />} />
          <Route path="/item/dashboard" element={<ItemDashboard1 />} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Legal */}
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Term />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;