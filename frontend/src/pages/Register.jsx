import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useGoogleLogin } from '@react-oauth/google';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); 

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [selectedInterests, setSelectedInterests] = useState(['Vintage Fashion']);
  const interestsList = ['Vintage Fashion', 'Home Decor', 'Books', 'Art & Prints', 'Ceramics', 'Tech'];

  const navigate = useNavigate();

  // --- NEW: Password Strength Validators ---
  const isLengthValid = password.length >= 8;
  const hasNumber = /\d/.test(password); // Checks for at least one digit
  const hasUppercase = /[A-Z]/.test(password); // Checks for an uppercase letter
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password); // Checks for a special character

  // Check if ALL conditions are met
  const isPasswordStrong = isLengthValid && hasNumber && hasUppercase && hasSpecial;

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const response = await API.post('/users/google', {
          googleAccessToken: tokenResponse.access_token
        });
        
        localStorage.setItem('swapnest_token', response.data.token);
        navigate('/dashboard');
      } catch (err) {
        setError('Google Authentication failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setError('Google Authentication failed.'),
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // --- NEW: Block submission if password isn't strong ---
    if (!isPasswordStrong) {
      return setError('Please ensure your password meets all the security requirements.');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setIsLoading(true);

    try {
      const response = await API.post('/users/register', { 
        username: name, 
        email: email, 
        password: password,
      });
      
      localStorage.setItem('swapnest_token', response.data.token);
      navigate('/dashboard');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background font-body text-on-surface antialiased min-h-screen flex flex-col selection:bg-secondary-fixed selection:text-on-secondary-fixed overflow-hidden">
      
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm border-b border-outline-variant/10">
        <div className="relative flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto">
          
          <Link to="/" className="relative z-10 text-2xl font-extrabold text-primary tracking-tighter font-headline hover:opacity-80 transition-opacity">
            SwapNest
          </Link>
          
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center space-x-8 font-headline font-bold text-sm tracking-tight">
            <Link to="/" className="text-secondary font-bold border-b-2 border-secondary pb-1">Discover</Link>
            <a className="text-primary/80 hover:text-primary transition-colors" href="#">How it Works</a>
            <a className="text-primary/80 hover:text-primary transition-colors" href="#">Our Story</a>
          </div>
                    
        </div>
      </nav>

      <main className="flex-grow flex flex-col md:flex-row h-screen pt-[72px]">
        
        <section className="relative w-full md:w-5/12 lg:w-1/2 h-[400px] md:h-full overflow-hidden bg-primary-container hidden md:block">
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

        <section className="w-full md:w-7/12 lg:w-1/2 flex items-start justify-center px-6 md:px-12 lg:px-16 py-6 md:py-8 bg-surface-container-low h-full overflow-y-auto">
          <div className="w-full max-w-lg pb-4">
            
            <div className="mb-6">
              <h2 className="font-headline font-bold text-4xl text-on-surface tracking-tight mb-2">Create your account</h2>
              <p className="text-on-surface-variant font-medium">Already have an account? <Link to="/login" className="text-secondary font-bold hover:underline transition-all">Log in</Link></p>
            </div>

            {error && (
              <div className="bg-error-container text-on-error-container p-4 rounded-2xl text-sm font-bold text-center mb-6 border border-error/20 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              
              <div className="space-y-4">
                <div className="relative group">
                  <label className="block text-[11px] uppercase tracking-widest font-bold text-on-surface-variant mb-1.5 ml-1">Full Name</label>
                  <input 
                    className="w-full bg-surface-container-high border-none rounded-2xl px-6 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40 font-medium outline-none" 
                    placeholder="Evelyn Thorne" 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div className="relative group">
                  <label className="block text-[11px] uppercase tracking-widest font-bold text-on-surface-variant mb-1.5 ml-1">Email Address</label>
                  <input 
                    className="w-full bg-surface-container-high border-none rounded-2xl px-6 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40 font-medium outline-none" 
                    placeholder="hello@example.com" 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="relative group">
                    <label className="block text-[11px] uppercase tracking-widest font-bold text-on-surface-variant mb-1.5 ml-1">Password</label>
                    <div className="relative">
                      <input 
                        className="w-full bg-surface-container-high border-none rounded-2xl pl-6 pr-12 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40 font-medium outline-none" 
                        placeholder="••••••••••••" 
                        type={showPassword ? "text" : "password"} 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-on-surface-variant/60 hover:text-primary transition-colors focus:outline-none flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPassword ? 'visibility' : 'visibility_off'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="relative group">
                    <label className="block text-[11px] uppercase tracking-widest font-bold text-on-surface-variant mb-1.5 ml-1">Confirm Password</label>
                    <div className="relative">
                      <input 
                        className="w-full bg-surface-container-high border-none rounded-2xl pl-6 pr-12 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40 font-medium outline-none" 
                        placeholder="••••••••••••" 
                        type={showConfirmPassword ? "text" : "password"} 
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-on-surface-variant/60 hover:text-primary transition-colors focus:outline-none flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showConfirmPassword ? 'visibility' : 'visibility_off'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* --- NEW: Visual Password Strength Tracker --- */}
                  <div className="col-span-1 md:col-span-2 flex flex-wrap gap-x-4 gap-y-2 pt-1 px-2">
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isLengthValid ? 'text-green-600' : 'text-on-surface-variant/40'}`}>
                      <span className="material-symbols-outlined text-[14px]">{isLengthValid ? 'check_circle' : 'radio_button_unchecked'}</span>
                      8+ Chars
                    </div>
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${hasUppercase ? 'text-green-600' : 'text-on-surface-variant/40'}`}>
                      <span className="material-symbols-outlined text-[14px]">{hasUppercase ? 'check_circle' : 'radio_button_unchecked'}</span>
                      1 Uppercase
                    </div>
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${hasNumber ? 'text-green-600' : 'text-on-surface-variant/40'}`}>
                      <span className="material-symbols-outlined text-[14px]">{hasNumber ? 'check_circle' : 'radio_button_unchecked'}</span>
                      1 Number
                    </div>
                    <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${hasSpecial ? 'text-green-600' : 'text-on-surface-variant/40'}`}>
                      <span className="material-symbols-outlined text-[14px]">{hasSpecial ? 'check_circle' : 'radio_button_unchecked'}</span>
                      1 Special (!@#)
                    </div>
                  </div>

                </div>
              </div>

              <div className="pt-1">
                <div className="flex justify-between items-center mb-3 ml-1">
                  <label className="block text-[11px] uppercase tracking-widest font-bold text-on-surface-variant">Personalize your feed</label>
                  <span className="text-[9px] font-bold text-on-surface-variant/50 uppercase">Select 1+</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {interestsList.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${
                        selectedInterests.includes(interest)
                          ? 'bg-primary text-stone-50 shadow-md'
                          : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {selectedInterests.includes(interest) && <span className="material-symbols-outlined text-[16px]">check</span>}
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  // --- NEW: Disable the button completely until the password is strong ---
                  disabled={isLoading || !isPasswordStrong}
                  className="w-full py-3.5 rounded-full bg-secondary text-on-secondary font-headline font-bold text-base hover:bg-[#822800] transition-all shadow-lg shadow-secondary/20 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-secondary"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
                <p className="text-center text-[10px] text-on-surface-variant/60 mt-4 px-8 leading-relaxed font-medium">
                  By creating an account, you agree to SwapNest's <a className="underline hover:text-primary transition-colors" href="#">Terms of Service</a> and <a className="underline hover:text-primary transition-colors" href="#">Privacy Policy</a>.
                </p>
              </div>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/20"></div></div>
                <span className="relative bg-surface-container-low px-4 text-[9px] uppercase tracking-widest text-on-surface-variant font-bold flex justify-center w-fit mx-auto">Or authenticate via</span>
              </div>

              <div className="w-full pb-2">
                <button 
                  type="button" 
                  onClick={() => loginWithGoogle()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-surface-container-lowest border border-outline-variant/20 text-on-surface font-semibold text-sm hover:bg-white transition-all duration-300 shadow-sm group"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path></svg>
                  <span className="font-headline font-bold text-sm text-primary">Google</span>
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Register;