// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, LayoutDashboard, Package, Settings, 
  LogOut, Menu, X, Bell, RefreshCw, Flag 
} from 'lucide-react';
import ManageUsers from './ManageUsers';
import AdminSwapDashboard from '../../components/swap/AdminSwapDashboard';

// Placeholders for your future admin components
const DashboardOverview = () => <div className="p-6">Overview Metrics Coming Soon</div>;
const ManageItems = () => <div className="p-6">Swap Items Grid Coming Soon</div>;
const ReportedListings = () => <div className="p-6">Reported Content Coming Soon</div>;
const SystemSettings = () => <div className="p-6">Platform Settings Coming Soon</div>;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 1. Authentication Check (Updated to match our AdminLogin logic)
  useEffect(() => {
    const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));

    if (adminInfo && adminInfo.role === 'admin') {
      setAdminUser(adminInfo);
    } else {
      navigate('/admin/login');
    }
  }, [navigate]);

  // 2. Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };

  // 3. SwapNest Sidebar Navigation Links
  const navLinks = [
    { id: 'overview', label: 'Platform Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'users', label: 'Manage Users', icon: <Users size={20} /> },
    { id: 'items', label: 'Manage Items', icon: <Package size={20} /> },
    { id: 'reports', label: 'Reported Listings', icon: <Flag size={20} /> }, 
    { id: 'settings', label: 'System Settings', icon: <Settings size={20} /> },
    {id: 'swaps', label: 'Manage Swaps', icon: <RefreshCw size={20} />, component: <AdminSwapDashboard /> },

  ];

  if (!adminUser) return null; // Prevent flickering before redirect

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      
      {/* --- MOBILE OVERLAY --- */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800">
          <div className="flex items-center gap-3 text-white">
            <RefreshCw size={28} className="text-red-500" />
            <span className="text-xl font-bold tracking-wide">SwapNest <span className="text-red-500 font-normal">Admin</span></span>
          </div>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Command Center</p>
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setActiveTab(link.id);
                setIsMobileMenuOpen(false); 
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all ${
                activeTab === link.id
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {link.icon}
              {link.label}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer (Admin Profile & Logout) */}
        <div className="p-4 border-t border-gray-800">
          <div className="bg-gray-800 rounded-xl p-4 flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center font-bold uppercase">
              {adminUser.name ? adminUser.name.charAt(0) : 'A'}
            </div>
            <div className="overflow-hidden text-left">
              <p className="font-bold text-sm text-white truncate">{adminUser.name || 'Admin'}</p>
              <p className="text-xs text-red-400 truncate uppercase tracking-wider">{adminUser.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-gray-400 font-medium rounded-xl hover:bg-red-600/10 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} /> Secure Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-800 hidden sm:block">
              {navLinks.find(link => link.id === activeTab)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {activeTab === 'overview' && <DashboardOverview />}
          {activeTab === 'users' && <ManageUsers />}
          {activeTab === 'items' && <ManageItems />}
          {activeTab === 'reports' && <ReportedListings />}
          {activeTab === 'settings' && <SystemSettings />}
          {activeTab === 'swaps' && <AdminSwapDashboard />}
        </div>
      </main>

    </div>
  );
};

export default AdminDashboard;