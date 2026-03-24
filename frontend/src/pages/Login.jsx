import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear any old errors

    try {
      // 1. Send the login request to your Node.js backend
      const response = await API.post('/users/login', { email, password });
      
      // 2. Save the secure JWT token to local storage
      localStorage.setItem('swapnest_token', response.data.token);
      
      // 3. Redirect them to the Home page
      navigate('/');
      
    } catch (err) {
      // If your backend catches a bad password, it displays your clean error message here!
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="bg-background font-body text-on-background antialiased min-h-screen">
      
      {/* TopAppBar - Clean and Minimal */}
      <nav className="fixed top-0 w-full z-50 bg-[#fbf9f5]/70 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Link to="/" className="text-2xl font-extrabold text-[#012d1d] tracking-tight font-headline">
              SwapNest
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-[#1b4332] opacity-80 font-headline font-bold text-lg hover:opacity-100 transition-opacity">Explore</Link>
            <a className="text-[#1b4332] opacity-80 font-headline font-bold text-lg hover:opacity-100 transition-opacity" href="#community">Community</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-[#012d1d] font-headline font-bold text-lg hover:opacity-100 transition-opacity">Help</button>
          </div>
        </div>
      </nav>

      <main className="relative min-h-screen flex items-center justify-center pt-20 pb-12 px-4 overflow-hidden">
        
        {/* Artistic Radial Gradient Background */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-primary-fixed rounded-full blur-[120px]"></div>
          <div className="absolute bottom-20 -right-20 w-96 h-96 bg-secondary-fixed rounded-full blur-[120px]"></div>
        </div>

        {/* Left Decorative Column (Web Only) */}
        <div className="hidden lg:flex fixed left-0 top-0 h-full w-1/3 p-12 flex-col justify-end z-10 pointer-events-none">
          <div className="space-y-6 max-w-sm">
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 shadow-sm backdrop-blur-md">
              <p className="text-primary font-headline font-bold text-xl leading-snug">Give items a second life. Curate your community's future.</p>
            </div>
            <div className="flex -space-x-4">
              <img className="w-16 h-16 rounded-full border-4 border-background object-cover shadow-md" alt="sustainable clothing" src="https://picsum.photos/100/100?random=1"/>
              <img className="w-16 h-16 rounded-full border-4 border-background object-cover shadow-md" alt="plant" src="https://picsum.photos/100/100?random=2"/>
              <img className="w-16 h-16 rounded-full border-4 border-background object-cover shadow-md" alt="watch" src="https://picsum.photos/100/100?random=3"/>
              <div className="w-16 h-16 rounded-full border-4 border-background bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xs shadow-md">
                +2k
              </div>
            </div>
          </div>
        </div>

        {/* Login Card - Soft Shadows & Clean Lines */}
        <div className="relative z-20 w-full max-w-md bg-surface-container-lowest rounded-xl shadow-[0_20px_50px_rgba(27,28,26,0.06)] p-8 md:p-10 border border-outline-variant/10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-headline font-extrabold text-primary tracking-tight mb-2">Welcome Back</h1>
            <p className="text-on-surface-variant font-medium">Continue your sustainable journey</p>
          </div>

          {/* Dynamic Error Message (Styles integrated) */}
          {error && (
            <div className="bg-error-container text-on-error-container p-4 rounded-lg text-sm font-bold text-center mb-6 border border-error/20">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            
            {/* Email Field - Clean Borderless style */}
            <div className="space-y-2">
              <label className="block text-sm font-label font-bold text-primary ml-1" htmlFor="email">Email Address</label>
              <div className="relative">
                <input 
                  className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline transition-all duration-200 outline-none" 
                  id="email" 
                  placeholder="hello@nest.com" 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-label font-bold text-primary ml-1" htmlFor="password">Password</label>
              <div className="relative">
                <input 
                  className="w-full bg-surface-container-high border-none rounded-lg px-4 py-3.5 focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline transition-all duration-200 outline-none" 
                  id="password" 
                  placeholder="••••••••" 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Remember & Forgot Controls */}
            <div className="flex items-center justify-between mt-8">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input className="peer appearance-none w-5 h-5 rounded border-2 border-outline-variant checked:bg-primary checked:border-primary transition-all cursor-pointer" type="checkbox"/>
                  <span className="material-symbols-outlined absolute text-white scale-0 peer-checked:scale-75 transition-transform left-0.5 top-0.5 pointer-events-none" style={{ fontSize: '16px' }}>check</span>
                </div>
                <span className="text-sm font-medium text-on-surface-variant group-hover:text-primary transition-colors">Remember Me</span>
              </label>
              <a className="text-sm font-bold text-secondary hover:underline underline-offset-4 decoration-2" href="#forgot">Forgot Password?</a>
            </div>

            {/* Main CTA Button - Connected to your Login logic */}
            <button className="w-full bg-secondary text-on-secondary py-4 rounded-full font-headline font-bold text-lg shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all duration-200" type="submit">
              Sign In to Swap
            </button>

            {/* Social Logins Section */}
            <div className="relative py-4 flex items-center mt-4">
              <div className="flex-grow border-t border-outline-variant/30"></div>
              <span className="flex-shrink mx-4 text-xs font-bold text-outline uppercase tracking-widest">Or login with</span>
              <div className="flex-grow border-t border-outline-variant/30"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-container-low border border-outline-variant/20 rounded-lg hover:bg-surface-container-high transition-colors active:scale-95 duration-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span className="text-sm font-bold text-primary">Google</span>
              </button>
              <button type="button" className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-container-low border border-outline-variant/20 rounded-lg hover:bg-surface-container-high transition-colors active:scale-95 duration-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.96.95-2.04 1.95-3.23 1.95-1.16 0-1.56-.71-2.92-.71-1.38 0-1.83.69-2.92.71-1.15.02-2.34-1.08-3.32-2.04-2.01-1.97-3.54-5.55-3.54-8.87 0-3.34 2.1-5.11 4.12-5.11 1.07 0 1.9.68 2.64.68.72 0 1.76-.74 3.01-.74 1.05 0 2.4.38 3.28 1.5-2.69 1.48-2.26 5.28.46 6.5-.59 1.49-1.38 2.97-2.58 4.13zM13.03 5.07c.56-.69.94-1.64.94-2.59 0-.13-.02-.27-.04-.41-.87.04-1.93.59-2.55 1.32-.51.58-.96 1.55-.96 2.47 0 .15.02.29.05.38.97.08 1.91-.53 2.56-1.17z"></path>
                </svg>
                <span className="text-sm font-bold text-primary">Apple</span>
              </button>
            </div>
          </form>

          {/* Footer Link to Register */}
          <div className="mt-10 text-center">
            <p className="text-on-surface-variant font-medium">
              New to the nest?
              {/* This is now linked directly to your Register route! */}
              <Link to="/register" className="text-primary font-bold hover:text-secondary ml-1 transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Floating Community Pulse Chip (Signature Component) */}
        <div className="hidden md:flex absolute bottom-8 right-8 bg-tertiary-container text-tertiary-fixed px-5 py-2.5 rounded-full items-center gap-2 shadow-xl z-30">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>bolt</span>
          <span className="text-[10px] font-bold uppercase tracking-widest font-label">428 swaps active nearby</span>
        </div>
      </main>

      {/* Footer for Mobile View */}
      <footer className="md:hidden py-8 px-6 text-center text-outline text-xs">
        © 2026 SwapNest. Elevated Sustainability.
      </footer>
    </div>
  );
};

export default Login;