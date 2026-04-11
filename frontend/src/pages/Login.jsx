import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useGoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'volunteer'
  
  const navigate = useNavigate();

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const response = await API.post('/users/google', {
          googleAccessToken: tokenResponse.access_token
        });
        
        localStorage.setItem('swapnest_token', response.data.token);
        
        // Store user data for dashboard access
        if (response.data.user) {
          localStorage.setItem('swapnest_user', JSON.stringify(response.data.user));
        }
        
        navigate('/dashboard');
      } catch (err) {
        setError('Google Authentication failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setError('Google Authentication failed.'),
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = activeTab === 'user' ? '/users/login' : '/volunteers/login';
      const response = await API.post(endpoint, { email, password });
      
      localStorage.setItem('swapnest_token', response.data.token);
      localStorage.setItem('user_email', email);
      
      // Store user data for dashboard access
      if (response.data.user) {
        localStorage.setItem('swapnest_user', JSON.stringify(response.data.user));
      } else if (response.data.firstName || response.data.email) {
        // Volunteer backend returns user fields directly in the root of the response
        const userObj = {
          _id: response.data._id,
          username: response.data.firstName ? `${response.data.firstName} ${response.data.lastName || ''}`.trim() : email.split('@')[0],
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email || email,
          role: response.data.role || (activeTab === 'volunteer' ? 'volunteer' : 'user'),
          centerId: response.data.centerId,
          applicationStatus: response.data.applicationStatus
        };
        localStorage.setItem('swapnest_user', JSON.stringify(userObj));
      } else {
        // Fallback user data if API doesn't return user info
        const fallbackUser = {
          username: email.split('@')[0],
          email: email,
          role: activeTab === 'volunteer' ? 'volunteer' : 'user'
        };
        localStorage.setItem('swapnest_user', JSON.stringify(fallbackUser));
      }
      
      // --- CRITICAL FIX: Changed 'role' to 'activeTab' ---
      if (activeTab === 'volunteer') {
        navigate('/ngo-dashboard');
      } else {
        navigate('/dashboard');
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background font-body text-on-surface antialiased min-h-screen flex flex-col selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      
      <main className="flex-grow flex flex-col md:flex-row min-h-screen overflow-hidden">
        
        <section className="hidden md:flex md:w-1/2 lg:w-[55%] relative overflow-hidden bg-primary-container">
          <div className="absolute inset-0 z-0">
            <img 
              alt="Vintage Camera" 
              className="w-full h-full object-cover grayscale-[20%] contrast-[1.1]" 
              src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent"></div>
          </div>
          
          <div className="relative z-10 p-12 lg:p-16 flex flex-col justify-end w-full h-full pb-20">
            <div className="max-w-xl">
              <span className="font-label text-tertiary-fixed text-[11px] uppercase tracking-[0.3em] mb-6 block">Legacy & Circulation</span>
              <h1 className="font-headline text-stone-50 text-5xl lg:text-7xl font-bold leading-[1.1] mb-8">
                The Art <br/>of the Swap
              </h1>
              <p className="text-stone-50/80 text-lg max-w-md font-medium leading-relaxed">
                Curating a world where every object tells a story and every swap fuels the circular economy.
              </p>
            </div>
            <div className="flex gap-4 mt-12">
              <div className="px-5 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold tracking-widest uppercase">
                Sustainable Choice
              </div>
              <div className="px-5 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold tracking-widest uppercase">
                Verified Objects
              </div>
            </div>
          </div>
        </section>

        <section className="flex-1 flex flex-col justify-center items-center p-6 md:p-10 lg:p-12 bg-surface-container-low relative min-h-screen md:min-h-0 overflow-y-auto">
          
          <Link 
            to="/" 
            className="absolute top-6 right-6 md:top-10 md:right-10 flex items-center gap-2 px-4 py-2.5 bg-white/60 backdrop-blur-md border border-outline-variant/20 rounded-full shadow-sm text-on-surface-variant hover:text-primary hover:bg-white hover:shadow-md font-headline font-bold text-sm transition-all group z-10"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to Home
          </Link>

          <div className="w-full max-w-md flex flex-col gap-6 mt-12 md:mt-8">
            
            <div className="text-center md:text-left space-y-2">
              <h2 className="font-headline text-3xl font-extrabold text-primary tracking-tight">Welcome Back</h2>
              <p className="text-on-surface-variant font-medium text-sm">Continue your journey in curated exchange.</p>
            </div>

            {error && (
              <div className="bg-error-container text-on-error-container p-3 rounded-xl text-sm font-bold text-center border border-error/20 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              
              <div className="flex p-1 bg-surface-container rounded-full shadow-inner">
                <button 
                  type="button"
                  onClick={() => setActiveTab('user')}
                  className={`flex-1 py-2.5 px-6 rounded-full text-sm font-headline font-bold transition-all duration-300 ${
                    activeTab === 'user' 
                      ? 'bg-white text-primary shadow' 
                      : 'text-on-surface-variant/70 hover:text-primary'
                  }`}
                >
                  Standard User
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveTab('volunteer')}
                  className={`flex-1 py-2.5 px-6 rounded-full text-sm font-headline font-bold transition-all duration-300 ${
                    activeTab === 'volunteer' 
                      ? 'bg-white text-primary shadow' 
                      : 'text-on-surface-variant/70 hover:text-primary'
                  }`}
                >
                  Volunteer
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="font-label text-[11px] font-bold uppercase tracking-widest text-primary/70 ml-1">Email Address</label>
                <input 
                  className="w-full h-12 px-5 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-on-surface-variant/40 font-medium outline-none" 
                  placeholder={activeTab === 'user' ? "curator@swapnest.com" : "volunteer@swapnest.com"} 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="font-label text-[11px] font-bold uppercase tracking-widest text-primary/70">Password</label>
                  <Link to="/forgot-password" className="text-[10px] font-headline font-bold text-secondary uppercase tracking-wider hover:underline transition-all">Forgot?</Link>
                </div>
                <div className="relative">
                  <input 
                    className="w-full h-12 pl-5 pr-12 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-on-surface-variant/40 font-medium outline-none" 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant/60 hover:text-primary transition-colors focus:outline-none flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-secondary text-on-secondary rounded-full font-headline font-bold text-base hover:bg-[#822800] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_-15px_rgba(27,28,26,0.2)] flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing In...' : `Sign In as ${activeTab === 'user' ? 'User' : 'Volunteer'}`}
                {!isLoading && <span className="material-symbols-outlined text-[18px]">arrow_right_alt</span>}
              </button>
            </form>

            {activeTab === 'user' && (
              <div className="flex flex-col gap-5">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-full border-t border-outline-variant/30"></div>
                  <span className="relative bg-surface-container-low px-4 text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant/50">
                    Or authenticate via
                  </span>
                </div>

                <button 
                  type="button" 
                  onClick={() => loginWithGoogle()}
                  className="w-full flex items-center justify-center gap-3 h-12 bg-surface-container-lowest border border-outline-variant/20 rounded-xl hover:bg-surface-container transition-colors group shadow-sm"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  <span className="font-headline font-bold text-sm text-primary">Google</span>
                </button>
              </div>
            )}

            <p className="text-center text-sm font-medium text-on-surface-variant">
              New to the community? 
              <Link to="/register" className="text-secondary font-headline font-bold hover:underline ml-1"> Sign Up</Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;