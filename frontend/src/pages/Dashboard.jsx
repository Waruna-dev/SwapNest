import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import SwapList from '../components/swap/SwapList';
import SwapForm from '../components/swap/SwapForm';
import NotificationBell from '../components/NotificationBell';
import SwapDetailsModal from '../components/swap/SwapDetailsModal1';
import AcceptedSwapsCard from '../components/AcceptedSwapsCard'; 
import { getSwapById } from '../services/swapService';

const Dashboard = () => {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('requests');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [profilePic, setProfilePic] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80');
  
  // State for Swap components
  const [showSwapForm, setShowSwapForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [user, setUser] = useState(null);
  
  // State for Notification Modal
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Handle notification click - fetch swap details and open modal
  const handleNotificationClick = async (swapId) => {
    try {
      const response = await getSwapById(swapId);
      setSelectedSwap(response.data);
      setShowSwapModal(true);
    } catch (error) {
      console.error('Error fetching swap details:', error);
      alert('Failed to load swap details');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('swapnest_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Fetch user data
  useEffect(() => {
    const authenticateAndFetchUser = async () => {
      const token = localStorage.getItem('swapnest_token');
      if (!token) {
        navigate('/login');
        return; 
      }

      try {
        const response = await API.get('/users/me');
        const userData = response.data;
        setUserName(userData.username);
        setUserId(userData._id);
        setUser(userData);
        if (userData.profilePic) {
          setProfilePic(userData.profilePic);
        }
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (error) {
        console.error("Authentication failed:", error);
        localStorage.removeItem('swapnest_token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    };

    authenticateAndFetchUser();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProposeSwap = (item) => {
    setSelectedItem(item);
    setShowSwapForm(true);
  };

  const handleSwapCreated = () => {
    setShowSwapForm(false);
    setSelectedItem(null);
    alert('✅ Swap request sent successfully!');
  };

  // Render content based on activeNav
  const renderContent = () => {
    // My Swaps View
    if (activeNav === 'my-swaps') {
      return (
        <div className="bg-white rounded-[2.5rem] p-6 md:p- border border-outline-variant/20 shadow-sm">
          <h2 className="text-2xl font-headline font-bold text-primary mb-6">My Swaps</h2>
          <SwapList userId={userId} />
        </div>
      );
    }

    // Dashboard View (Default)
    return (
      <>
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-headline font-extrabold text-primary tracking-tight">
              Welcome back, {userName || 'Curator'}.
            </h1>
            <p className="text-on-surface-variant font-medium mt-2">
              Manage your swaps and requests here.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Accepted Swaps Section - NEW CARD */}
            {userId && (
              <section className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-outline-variant/20 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-2xl"></span>
                  <h2 className="text-2xl font-headline font-bold text-primary">Accepted Swaps</h2>
                </div>
                <AcceptedSwapsCard userId={userId} />
              </section>
            )}

           
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-1 space-y-6">
            <Link to="/my-list" className="block relative bg-primary text-white rounded-[2.5rem] p-8 shadow-xl overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 right-0 w-40 h-40 bg-secondary rounded-full blur-[50px] -mr-10 -mt-10 opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative z-10 flex justify-between items-start mb-8">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-secondary">inventory_2</span>
                </div>
                <span className="material-symbols-outlined text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all">arrow_forward</span>
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl font-headline font-black mb-2">My List</h2>
                <p className="text-primary-fixed-dim text-sm font-medium leading-relaxed mb-6">Manage your active listings, update item details, or add new treasures.</p>
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-white">Manage Items</span>
                </div>
              </div>
            </Link>

            <div className="bg-white rounded-[2.5rem] p-10 border border-outline-variant/20 shadow-sm text-center flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-secondary mb-4">handshake</span>
              <h3 className="font-headline font-bold text-2xl text-primary leading-tight">Swap Responsibly</h3>
              <p className="text-on-surface-variant text-sm mt-2">Always meet in public places</p>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="bg-background text-on-surface font-body min-h-screen antialiased">
      
      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm border-b border-outline-variant/10 py-3">
        <div className="flex justify-between items-center px-6 md:px-12 max-w-7xl mx-auto">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-primary font-serif">
            SwapNest
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 font-semibold text-sm tracking-tight">
            <button
              onClick={() => setActiveNav('dashboard')}
              className={`transition-colors ${activeNav === 'dashboard' ? 'text-secondary border-b-2 border-secondary pb-1' : 'text-primary/80 hover:text-primary'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveNav('my-swaps')}
              className={`transition-colors ${activeNav === 'my-swaps' ? 'text-secondary border-b-2 border-secondary pb-1' : 'text-primary/80 hover:text-primary'}`}
            >
              My Swaps
            </button>
            <Link to="/item/gallery" className="text-primary/80 hover:text-primary transition-colors">Marketplace</Link>
            <Link to="/item/form" className="text-primary/80 hover:text-primary transition-colors">Messages</Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/item/form" className="hidden md:flex bg-secondary text-white px-5 py-2 rounded-full font-bold text-xs hover:scale-105 transition-transform shadow-md items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">add</span> List Item
            </Link>
            
       
            <NotificationBell 
              userId={userId} 
              onNotificationClick={handleNotificationClick}
            />
            
            {/* Profile Menu */}
            <div className="relative" ref={profileMenuRef}>
              <div onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="w-10 h-10 rounded-full border-2 border-primary/10 overflow-hidden cursor-pointer hover:ring-2 hover:ring-secondary transition-all">
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              </div>
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-outline-variant/20 py-2 z-50">
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-primary hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-[20px]">manage_accounts</span> Account Settings
                  </Link>
                  <div className="h-px bg-outline-variant/20 my-1"></div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-error hover:bg-error-container/30 transition-colors text-left">
                    <span className="material-symbols-outlined text-[20px]">logout</span> Log Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden relative" ref={mobileMenuRef}>
              <button className="text-primary p-1 flex items-center" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <span className="material-symbols-outlined text-2xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
              </button>
              {isMobileMenuOpen && (
                <div className="absolute right-0 top-full mt-4 w-64 bg-white border border-outline-variant/20 rounded-2xl shadow-xl py-4 px-4 flex flex-col gap-4 z-50">
                  <button onClick={() => { setActiveNav('dashboard'); setIsMobileMenuOpen(false); }} className="text-primary font-headline font-bold text-lg text-left">Dashboard</button>
                  <button onClick={() => { setActiveNav('my-swaps'); setIsMobileMenuOpen(false); }} className="text-primary font-headline font-bold text-lg text-left">My Swaps</button>
                  <Link to="/item/gallery" className="text-primary font-headline font-bold text-lg">Marketplace</Link>
                  <Link to="/messages" className="text-primary font-headline font-bold text-lg">Messages</Link>
                  <Link to="/item/form" className="w-full bg-secondary text-white px-4 py-3 rounded-xl font-bold text-sm mt-2 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">add</span> List Item
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        
        {/* --- HEADER --- */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-headline font-extrabold text-primary tracking-tight">
              Welcome back, {userName || 'Curator'}.
            </h1>
            <p className="text-on-surface-variant font-medium mt-2">You have <span className="text-secondary font-bold">2 new swap requests</span> waiting.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT COLUMN: MAIN ACTION CENTER --- */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-outline-variant/20 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-headline font-bold text-primary">Active Requests</h2>
                <button className="text-sm font-bold text-secondary hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                {swapRequests.map((request) => (
                  <div key={request.id} className="p-4 md:p-5 rounded-2xl bg-surface-container-low border border-outline-variant/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <img src={request.userImg} alt={request.user} className="w-12 h-12 rounded-full object-cover border border-outline-variant/20" />
                      <div>
                        <p className="font-bold text-primary text-sm">{request.user} <span className="text-on-surface-variant font-normal">proposed a swap</span></p>
                        <p className="text-xs font-medium text-on-surface-variant mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">location_on</span> {request.location} • {request.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center bg-white px-4 py-2 rounded-xl border border-outline-variant/20 w-full md:w-auto justify-between md:justify-start gap-4">
                      <div className="text-center">
                        <p className="text-[9px] uppercase font-bold text-on-surface-variant/60">They Offer</p>
                        <p className="text-xs font-bold text-primary truncate max-w-[80px] md:max-w-[100px]">{request.offering}</p>
                      </div>
                      <span className="material-symbols-outlined text-secondary text-[16px]">swap_horiz</span>
                      <div className="text-center">
                        <p className="text-[9px] uppercase font-bold text-on-surface-variant/60">For Your</p>
                        <p className="text-xs font-bold text-primary truncate max-w-[80px] md:max-w-[100px]">{request.wanting}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <button className="flex-1 md:flex-none bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-headline font-bold hover:bg-primary-container transition-colors shadow-sm">Review</button>
                      <button className="flex-1 md:flex-none bg-white text-primary border border-outline-variant/30 px-4 py-2 rounded-xl text-xs font-headline font-bold hover:bg-surface-container transition-colors">Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-headline font-bold text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">auto_awesome</span> Curated Matches For You
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {curatedMatches.map((match) => (
                  <div key={match.id} className="min-w-[200px] md:min-w-[240px] bg-white rounded-[1.5rem] p-3 border border-outline-variant/20 shadow-sm group cursor-pointer snap-center">
                    <div className="h-32 md:h-40 rounded-xl overflow-hidden mb-3 relative">
                      <img src={match.img} alt={match.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest text-primary shadow-sm">{match.location}</div>
                    </div>
                    <h3 className="font-headline font-bold text-primary text-sm truncate px-1">{match.title}</h3>
                    <button className="w-full mt-3 bg-surface-container-low text-primary py-2 rounded-xl text-xs font-headline font-bold group-hover:bg-secondary group-hover:text-on-secondary transition-colors">Propose Swap</button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* --- RIGHT COLUMN: CONTROL PANEL --- */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* 1. The 'My List' Portal Card */}
            <Link 
              to="/my-list" 
              className="block relative bg-primary text-on-primary rounded-[2.5rem] p-8 shadow-xl overflow-hidden group hover:-translate-y-1 transition-all duration-300"
            >
              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-secondary rounded-full blur-[50px] -mr-10 -mt-10 opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              
              <div className="relative z-10 flex justify-between items-start mb-8">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-secondary">inventory_2</span>
                </div>
                <span className="material-symbols-outlined text-on-primary/50 group-hover:text-on-primary group-hover:translate-x-1 transition-all">arrow_forward</span>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-3xl font-headline font-black mb-2">My List</h2>
                <p className="text-primary-fixed-dim text-sm font-medium leading-relaxed mb-6">
                  Manage your active listings, update item details, or add new treasures to the marketplace.
                </p>
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest text-on-primary">2 Active Items</span>
                </div>
              </div>
            </Link>

            {/* 2. Mini Impact/Trust Widget */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-outline-variant/20 shadow-sm text-center flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-secondary mb-4">handshake</span>
              <h3 className="font-headline font-bold text-2xl text-primary leading-tight">4 Successful<br/>Swaps</h3>
            </div>

          </div>

        </div>
      
        {renderContent()}
      </main>

      {/* Swap Form Modal */}
      {showSwapForm && selectedItem && userId && (
        <SwapForm
          itemId={selectedItem.id}
          itemTitle={selectedItem.title}
          ownerName={selectedItem.ownerName || "Item Owner"}
          requesterId={userId}
          requesterName={userName}
          onClose={() => setShowSwapForm(false)}
          onSuccess={handleSwapCreated}
        />
      )}

      {/* Swap Details Modal */}
      {showSwapModal && selectedSwap && (
        <SwapDetailsModal 
          swap={selectedSwap} 
          onClose={() => setShowSwapModal(false)} 
        />
      )}
    </div>

  );
};

export default Dashboard;