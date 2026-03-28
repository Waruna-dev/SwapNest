

// Import the test API component
import ItemAddNewItems from "./pages/item-listing/ItemAddNewItem";
import ItemGalleryPage from "./pages/item-gallery/ItemGalleryPage";
import ItemDashboard1 from "./pages/item-listing/ItemDashboard";
import MyItems from "./pages/item-listing/MyItems";
import ItemLocation from "./pages/item-ocation/itemLocation";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Import our new security wrapper
import ProtectedRoute from './components/ProtectedRoute';

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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            {/*Item routes*/}
          <Route path="/item/new" element={<ItemAddNewItems />} />
          <Route path="/item/gallery" element={<ItemGalleryPage />} />
          <Route path="/item/dashboard" element={<ItemDashboard1 />} />
          <Route path="/item/location" element={<ItemLocation />} />

          {/* --- PROTECTED ROUTES --- */}
          {/* You MUST have a token to visit anything inside this wrapper */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-list" element={<MyItems />} />
          </Route>
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
