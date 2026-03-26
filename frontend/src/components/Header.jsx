import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profilePic, setProfilePic] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80');

  // Dynamic navbar background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check login status
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('swapnest_token');
      if (token) {
        setIsLoggedIn(true);
        try {
          const response = await API.get('/users/me');
          if (response.data.profilePic) {
            setProfilePic(response.data.profilePic);
          }
        } catch (error) {
          console.error("Token verification failed", error);
          setIsLoggedIn(false);
          localStorage.removeItem('swapnest_token');
        }
      }
    };
    checkAuthStatus();
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="flex justify-between items-center px-6 md:px-12 max-w-[1400px] mx-auto">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-[#012d1d] font-serif">
          SwapNest
        </Link>
        
        <div className="hidden md:flex items-center gap-8 font-semibold text-sm tracking-tight">
          <a className="text-[#a43c12] border-b-2 border-[#a43c12] pb-1" href="#discover">Discover</a>
          <a className="text-[#012d1d]/80 hover:text-[#012d1d] transition-colors" href="#how-it-works">How it Works</a>
          <a className="text-[#012d1d]/80 hover:text-[#012d1d] transition-colors" href="#impact">Impact</a>
          <a className="text-[#012d1d]/80 hover:text-[#012d1d] transition-colors" href="#community">Community</a>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          {isLoggedIn ? (
            <Link 
              to="/dashboard" 
              className="w-10 h-10 rounded-full border-2 border-[#012d1d]/10 overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#a43c12] transition-all shadow-md"
              title="Go to Dashboard"
            >
              <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-[#012d1d] font-bold text-sm hover:opacity-70 transition-opacity">
                Sign In
              </Link>
              <Link to="/register" className="bg-[#a43c12] text-white px-7 py-2.5 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-transform duration-200 shadow-md shadow-[#a43c12]/20">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-[#012d1d]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <span className="material-symbols-outlined text-3xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-[#fbf9f5] border-b border-gray-200 shadow-xl transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-[400px] py-6' : 'max-h-0 py-0'}`}>
        <div className="flex flex-col gap-6 px-6">
          <a href="#discover" className="text-[#a43c12] font-bold text-lg">Discover</a>
          <a href="#how-it-works" className="text-[#012d1d] font-bold text-lg">How it Works</a>
          <a href="#community" className="text-[#012d1d] font-bold text-lg">Community</a>
          <div className="h-px bg-gray-200"></div>
          
          {isLoggedIn ? (
            <Link to="/dashboard" className="bg-[#012d1d] text-white px-6 py-3 rounded-xl font-bold text-center flex items-center justify-center gap-2">
              <img src={profilePic} alt="Profile" className="w-6 h-6 rounded-full object-cover border border-white/20" />
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-[#012d1d] font-bold text-lg">Sign In</Link>
              <Link to="/register" className="bg-[#a43c12] text-white px-6 py-3 rounded-xl font-bold text-center">Create Account</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;