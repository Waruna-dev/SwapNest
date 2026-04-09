import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminSwapDashboard from "./components/swap/AdminSwapDashboard";
import Swapform from "./components/swap/SwapForm";


import ItemAddNewItems from "./pages/item-listing/ItemAddNewItem";
import ItemGalleryPage from "./pages/item-gallery/ItemGalleryPage";
import ItemDashboard1 from "./pages/item-listing/ItemDashboard";
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';


import SwapList from "./components/swap/SwapList";
import Privacy from "./pages/PrivacyPolicy";
import Term from "./pages/TermsConditions";
function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />


          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-list" element={<MyItems />} />
          </Route>


        

          <Route path="/swapadmin" element={<AdminSwapDashboard />} />
          <Route path="/swapform" element={<Swapform />} />

          <Route path="/swaplist" element={<SwapList />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Term />} />
          
          <Route path="/item/form" element={<ItemAddNewItems />} />
          <Route path="/item/gallery" element={<ItemGalleryPage />} />
          <Route path="/item/dashboard" element={<ItemDashboard1 />} />
            <Route path="/item/location" element={<ItemLocation />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
