import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import API from '../services/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- NEW: Password Strength Validators ---
  const isLengthValid = password.length >= 8;
  const hasNumber = /\d/.test(password); 
  const hasUppercase = /[A-Z]/.test(password); 
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password); 

  // Check if ALL conditions are met
  const isPasswordStrong = isLengthValid && hasNumber && hasUppercase && hasSpecial;

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // --- NEW: Block submission if password isn't strong ---
    if (!isPasswordStrong) {
      return setError('Please ensure your password meets all the security requirements.');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setIsLoading(true);

    try {
      // NOTE: If your backend route uses PUT instead of POST, change API.post to API.put below!
      await API.post(`/users/reset-password/${token}`, { password });
      
      setMessage('Password reset successfully! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired reset token. Please try requesting a new link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background font-body text-on-surface antialiased min-h-screen flex flex-col selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm border-b border-outline-variant/10">
        <div className="relative flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto">
          <Link to="/" className="text-2xl font-extrabold text-primary tracking-tighter font-headline hover:opacity-80 transition-opacity z-10">
            SwapNest
          </Link>
          <Link to="/login" className="font-headline font-bold text-sm text-primary hover:text-secondary transition-colors">
            Back to Login
          </Link>
        </div>
      </nav>

      <main className="flex-grow flex flex-col md:flex-row min-h-screen overflow-hidden pt-16 md:pt-0">
        
        <section className="hidden md:flex md:w-1/2 lg:w-[55%] relative overflow-hidden bg-primary-container">
          <div className="absolute inset-0 z-0">
            <img 
              alt="Vintage Keys" 
              className="w-full h-full object-cover grayscale-[20%] contrast-[1.1]" 
              src="https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=1000&q=80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent"></div>
          </div>
          
          <div className="relative z-10 p-12 lg:p-16 flex flex-col justify-end w-full h-full pb-20">
            <div className="max-w-xl">
              <span className="font-label text-tertiary-fixed text-[11px] uppercase tracking-[0.3em] mb-6 block">Secure Access</span>
              <h1 className="font-headline text-stone-50 text-5xl lg:text-7xl font-bold leading-[1.1] mb-8">
                A new key <br/>for your nest.
              </h1>
              <p className="text-stone-50/80 text-lg max-w-md font-medium leading-relaxed">
                Choose a strong, secure password. Make sure it is something memorable so you can seamlessly continue swapping.
              </p>
            </div>
          </div>
        </section>

        <section className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 lg:p-24 bg-surface-container-low relative min-h-screen md:min-h-0">
          <div className="w-full max-w-md space-y-10">
            
            <div className="text-center md:text-left space-y-3">
              <h2 className="font-headline text-4xl font-extrabold text-primary tracking-tight">Set New Password</h2>
              <p className="text-on-surface-variant font-medium">Almost done! Create your new password below.</p>
            </div>

            {message && (
              <div className="bg-primary-fixed text-on-primary-fixed p-4 rounded-2xl text-sm font-bold border border-primary-fixed-dim/20 flex items-start gap-3">
                <span className="material-symbols-outlined text-[20px] mt-0.5">check_circle</span>
                <p>{message}</p>
              </div>
            )}

            {error && (
              <div className="bg-error-container text-on-error-container p-4 rounded-2xl text-sm font-bold border border-error/20 flex items-start gap-3">
                <span className="material-symbols-outlined text-[20px] mt-0.5">error</span>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleReset} className="space-y-6">
              
              <div className="space-y-2">
                <label className="font-label text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">New Password</label>
                <div className="relative">
                  <input 
                    className="w-full h-14 pl-6 pr-12 bg-surface-container-highest border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-on-surface-variant/40 font-medium outline-none" 
                    placeholder="••••••••" 
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

              <div className="space-y-2">
                <label className="font-label text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Confirm New Password</label>
                <div className="relative">
                  <input 
                    className="w-full h-14 pl-6 pr-12 bg-surface-container-highest border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-on-surface-variant/40 font-medium outline-none" 
                    placeholder="••••••••" 
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
              <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1 px-2">
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
              
              <button 
                type="submit"
                // --- NEW: Added !isPasswordStrong to the disabled array ---
                disabled={isLoading || message !== '' || !isPasswordStrong} 
                className="w-full h-16 bg-secondary text-on-secondary rounded-full font-headline font-bold text-lg hover:bg-[#822800] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_-15px_rgba(27,28,26,0.2)] flex items-center justify-center gap-2 mt-8 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-secondary"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
                {!isLoading && <span className="material-symbols-outlined text-xl">lock_reset</span>}
              </button>
            </form>
            
          </div>
        </section>
      </main>
    </div>
  );
};

export default ResetPassword;