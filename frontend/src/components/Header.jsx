import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import API from '../services/api';

const Header = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // --- NEW STATES FOR DYNAMIC AVATAR & ROLE ---
  const [profilePic, setProfilePic] = useState(null); 
  const [userName, setUserName] = useState(''); 
  const [userRole, setUserRole] = useState('user'); // Default to standard user

  const userInitial = userName ? userName.charAt(0).toUpperCase() : 'U';
  const navTarget = (sectionId) => (location.pathname === '/' ? sectionId : `/${sectionId}`);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('swapnest_token');
      if (token) {
        try {
          const response = await API.get('/users/me');
          
          setUserName(response.data.username || '');
          setUserRole(response.data.role || 'user'); // Save the role from the backend
          setIsLoggedIn(true);
          
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

  // --- DYNAMIC ROUTING HELPER ---
  // Returns the correct dashboard link based on who is logged in
  const getDashboardLink = () => {
    if (userRole === 'admin') return '/admin/dashboard'; // Change this if your admin route is different
    if (userRole === 'volunteer') return '/ngo-dashboard';
    return '/dashboard';
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 font-body ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-outline-variant/10 py-3' : 'bg-transparent py-5'}`}>
      <div className="flex justify-between items-center px-6 md:px-12 max-w-[1400px] mx-auto">
        
        <Link to="/" className="text-2xl font-extrabold tracking-tighter text-primary font-headline hover:opacity-80 transition-opacity">
          SwapNest
        </Link>
        
        <div className="hidden md:flex items-center gap-8 font-headline font-bold text-sm tracking-tight">
          <a className="text-secondary border-b-2 border-secondary pb-1" href={navTarget("#discover")}>Discover</a>
          <a className="text-primary/80 hover:text-primary transition-colors" href={navTarget("#how-it-works")}>How it Works</a>
          <a className="text-primary/80 hover:text-primary transition-colors" href={navTarget("#impact")}>Impact</a>
          <a className="text-primary/80 hover:text-primary transition-colors" href={navTarget("#community")}>Community</a>
          <Link className="text-primary/80 hover:text-primary transition-colors" to="/contact">Contact</Link>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          {isLoggedIn ? (
            <Link 
              to={getDashboardLink()} // Uses the dynamic link helper
              className={`w-10 h-10 rounded-full border-2 overflow-hidden cursor-pointer hover:ring-2 hover:ring-secondary transition-all shadow-md flex items-center justify-center text-white font-bold font-headline ${
                userRole === 'admin' ? 'bg-error border-error/20' : 'bg-primary border-primary/10'
              }`}
              title={userRole === 'admin' ? "Admin Portal" : "Go to Dashboard"}
            >
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{userInitial}</span>
              )}
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-primary font-headline font-bold text-sm hover:opacity-70 transition-opacity">
                Sign In
              </Link>
              <Link to="/register" className="bg-secondary text-on-secondary px-7 py-2.5 rounded-full font-headline font-bold text-sm hover:scale-105 active:scale-95 transition-transform duration-200 shadow-md shadow-secondary/20">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-primary" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <span className="material-symbols-outlined text-3xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      <div className={`md:hidden absolute top-full left-0 w-full bg-surface-container-low border-b border-outline-variant/20 shadow-xl transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-[400px] py-6' : 'max-h-0 py-0'}`}>
        <div className="flex flex-col gap-6 px-6">
          <a href={navTarget("#discover")} className="text-secondary font-headline font-bold text-lg">Discover</a>
          <a href={navTarget("#how-it-works")} className="text-primary font-headline font-bold text-lg">How it Works</a>
          <a href={navTarget("#community")} className="text-primary font-headline font-bold text-lg">Community</a>
          <Link to="/contact" className="text-primary font-headline font-bold text-lg">Contact</Link>
          <div className="h-px bg-outline-variant/20"></div>
          
          {isLoggedIn ? (
            <Link to={getDashboardLink()} className="bg-primary text-on-primary px-6 py-3 rounded-xl font-headline font-bold text-center flex items-center justify-center gap-3">
              <div className={`w-6 h-6 rounded-full border border-white/20 overflow-hidden flex items-center justify-center text-[10px] text-white ${
                userRole === 'admin' ? 'bg-error' : 'bg-secondary'
              }`}>
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{userInitial}</span>
                )}
              </div>
              {userRole === 'admin' ? "Admin Portal" : "Go to Dashboard"}
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-primary font-headline font-bold text-lg">Sign In</Link>
              <Link to="/register" className="bg-secondary text-on-secondary px-6 py-3 rounded-xl font-headline font-bold text-center">Create Account</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
