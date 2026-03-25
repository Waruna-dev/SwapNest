import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Interactive state for the interest chips
  const [selectedInterests, setSelectedInterests] = useState(['Vintage Fashion']);
  
  const interestsList = ['Vintage Fashion', 'Home Decor', 'Books', 'Art & Prints', 'Ceramics', 'Tech'];

  const navigate = useNavigate();

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Send the registration request to your backend
      const response = await API.post('/users/register', { 
        name, 
        email, 
        password,
        // You can pass the selectedInterests array to your backend here if your schema supports it!
        // interests: selectedInterests 
      });
      
      // Save token and redirect to Home
      localStorage.setItem('swapnest_token', response.data.token);
      navigate('/');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="bg-background font-body text-on-surface antialiased min-h-screen flex flex-col selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      
      {/* TopAppBar (Minimal for Auth focus) */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm border-b border-outline-variant/10">
        <div className="flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto">
          <Link to="/" className="text-2xl font-extrabold text-primary tracking-tighter font-headline hover:opacity-80 transition-opacity">
            SwapNest
          </Link>
          
          <div className="hidden md:flex items-center space-x-8 font-headline font-bold text-sm tracking-tight">
            <Link to="/" className="text-secondary font-bold border-b-2 border-secondary pb-1">Discover</Link>
            <a className="text-primary/80 hover:text-primary transition-colors" href="#">How it Works</a>
            <a className="text-primary/80 hover:text-primary transition-colors" href="#">Our Story</a>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/login" className="hidden md:block bg-secondary text-on-secondary px-6 py-2.5 rounded-full font-headline font-bold text-sm hover:scale-105 transition-transform duration-200 shadow-md">
              Log In
            </Link>
            <Link to="/" className="text-primary cursor-pointer hover:scale-95 duration-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">close</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow flex flex-col md:flex-row min-h-screen overflow-hidden pt-16 md:pt-0">
        
        {/* Left Side: Editorial Content */}
        <section className="relative w-full md:w-5/12 lg:w-1/2 min-h-[400px] md:min-h-screen overflow-hidden bg-primary-container">
          <div className="absolute inset-0 z-0">
            <img 
              alt="Sustainable fabrics" 
              className="w-full h-full object-cover opacity-60 mix-blend-luminosity scale-105" 
              src="https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1000&q=80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent"></div>
          </div>
          
          <div className="relative z-10 h-full flex flex-col justify-between p-8 md:p-16 lg:p-24 pb-20">
            <div className="flex items-center gap-2 mt-8 md:mt-0">
              <span className="text-stone-50 font-headline font-black text-3xl tracking-tighter">SwapNest</span>
            </div>
            
            <div className="max-w-md">
              <span className="inline-block px-4 py-1.5 rounded-full bg-tertiary-container text-tertiary-fixed text-[10px] uppercase tracking-widest font-bold mb-6 border border-tertiary-fixed/20">Join the Movement</span>
              <h1 className="font-headline font-bold text-5xl lg:text-7xl text-stone-50 leading-[1.05] tracking-tight mb-8">
                The art of <br/><span className="italic text-secondary-fixed-dim font-medium">circular</span> living.
              </h1>
              <p className="text-stone-50/80 text-lg leading-relaxed font-light">
                Exchange premium goods, reduce your footprint, and join a community that values craftsmanship over consumption.
              </p>
            </div>
            
            <div className="flex items-center gap-6 mt-12 md:mt-0">
              <div className="flex -space-x-4">
                <img className="w-12 h-12 rounded-full border-2 border-primary object-cover" alt="User" src="https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?auto=format&fit=crop&w=100&q=80"/>
                <img className="w-12 h-12 rounded-full border-2 border-primary object-cover" alt="User" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80"/>
                <div className="w-12 h-12 rounded-full border-2 border-primary bg-secondary flex items-center justify-center text-[10px] font-bold text-white tracking-tighter">+12k</div>
              </div>
              <p className="text-stone-50/60 text-sm font-medium tracking-wide">
                Swapping today in <br/>Colombo, Kandy, & Galle.
              </p>
            </div>
          </div>
        </section>

        {/* Right Side: Registration Form */}
        <section className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-24 bg-surface-container-low min-h-screen md:min-h-0">
          <div className="w-full max-w-lg pt-12 md:pt-0">
            
            <div className="mb-10">
              <h2 className="font-headline font-bold text-3xl text-on-surface tracking-tight mb-2">Create your account</h2>
              <p className="text-on-surface-variant font-medium">Already have an account? <Link to="/login" className="text-secondary font-bold hover:underline transition-all">Log in</Link></p>
            </div>

            {/* Dynamic Error Message */}
            {error && (
              <div className="bg-error-container text-on-error-container p-4 rounded-2xl text-sm font-bold text-center mb-6 border border-error/20">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">
              
              {/* Input Fields */}
              <div className="space-y-5">
                <div className="relative group">
                  <label className="block text-[11px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 ml-1">Full Name</label>
                  <input 
                    className="w-full bg-surface-container-high border-none rounded-2xl px-6 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40 font-medium outline-none" 
                    placeholder="Evelyn Thorne" 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div className="relative group">
                  <label className="block text-[11px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 ml-1">Email Address</label>
                  <input 
                    className="w-full bg-surface-container-high border-none rounded-2xl px-6 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40 font-medium outline-none" 
                    placeholder="hello@example.com" 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="relative group">
                  <label className="block text-[11px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 ml-1">Password</label>
                  <input 
                    className="w-full bg-surface-container-high border-none rounded-2xl px-6 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40 font-medium outline-none" 
                    placeholder="••••••••••••" 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Interactive Interest Picker */}
              <div className="pt-4">
                <div className="flex justify-between items-center mb-4 ml-1">
                  <label className="block text-[11px] uppercase tracking-widest font-bold text-on-surface-variant">Personalize your feed</label>
                  <span className="text-[9px] font-bold text-on-surface-variant/50 uppercase">Select 1+</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {interestsList.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${
                        selectedInterests.includes(interest)
                          ? 'bg-primary text-stone-50 shadow-md'
                          : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {selectedInterests.includes(interest) && <span className="material-symbols-outlined text-[18px]">check</span>}
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Section */}
              <div className="pt-6">
                <button 
                  type="submit"
                  className="w-full py-4 rounded-full bg-secondary text-on-secondary font-headline font-bold text-lg hover:bg-[#822800] transition-all shadow-lg shadow-secondary/20 hover:scale-[1.01] active:scale-[0.98]"
                >
                  Create Account
                </button>
                <p className="text-center text-[11px] text-on-surface-variant/60 mt-6 px-8 leading-relaxed font-medium">
                  By creating an account, you agree to SwapNest's <a className="underline hover:text-primary transition-colors" href="#">Terms of Service</a> and <a className="underline hover:text-primary transition-colors" href="#">Privacy Policy</a>.
                </p>
              </div>

              {/* Social Login Separator */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/20"></div></div>
                <span className="relative bg-surface-container-low px-4 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold flex justify-center w-fit mx-auto">Or authenticate via</span>
              </div>

              {/* Social Login Cluster */}
              <div className="grid grid-cols-2 gap-4">
                <button type="button" className="flex items-center justify-center gap-3 py-3 px-6 rounded-xl bg-surface-container-lowest border border-outline-variant/20 text-on-surface font-semibold text-sm hover:bg-white transition-all duration-300 shadow-sm group">
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path></svg>
                  <span className="font-headline font-bold text-sm text-primary">Google</span>
                </button>
                <button type="button" className="flex items-center justify-center gap-3 py-3 px-6 rounded-xl bg-surface-container-lowest border border-outline-variant/20 text-on-surface font-semibold text-sm hover:bg-white transition-all duration-300 shadow-sm group">
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.96.95-2.04 1.72-3.15 1.72-1.12 0-1.48-.68-2.83-.68-1.35 0-1.76.66-2.83.66-1.11 0-2.15-.75-3.15-1.72C3.54 18.73 2 15.65 2 12.63c0-3.08 2.01-4.72 3.96-4.72 1.03 0 1.99.64 2.62.64.63 0 1.75-.72 2.97-.72 1.28 0 2.41.48 3.16 1.18-.18.15-1.74 1.54-1.74 3.73 0 2.64 2.29 3.53 2.32 3.54-.03.07-.36 1.21-1.24 2.1zm-3.69-14.8c.55-.66.92-1.58.92-2.5 0-.12-.01-.24-.04-.36-.83.03-1.83.56-2.43 1.26-.54.62-.93 1.57-.93 2.47 0 .14.02.28.05.37.9.07 1.83-.51 2.43-1.24z"></path></svg>
                  <span className="font-headline font-bold text-sm text-primary">Apple</span>
                </button>
              </div>
            </form>
          </div>

          <footer className="absolute bottom-6 w-full flex justify-center px-8 hidden md:flex">
            <p className="font-body text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/40 font-bold">
              © 2026 SwapNest. Circularity by design.
            </p>
          </footer>
        </section>
      </main>
    </div>
  );
};

export default Register;