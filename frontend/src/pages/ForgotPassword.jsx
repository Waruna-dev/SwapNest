import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  
  // --- NEW: Countdown state for the wait timer ---
  const [countdown, setCountdown] = useState(0);

  // --- NEW: Effect to handle the countdown timer ---
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    // Cleanup the interval when the component unmounts or timer hits 0
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      await API.post('/users/forgot-password', { email });
      setMessage('If an account exists for that email, we have sent password reset instructions.');
      
      // Start the 60-second cooldown timer
      setCountdown(60); 
      
      // Note: We removed setEmail('') here so they don't have to re-type it to resend!
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background font-body text-on-surface antialiased min-h-screen flex flex-col selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      
      {/* Minimal Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm border-b border-outline-variant/10">
        <div className="relative flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto">
          <Link to="/" className="text-2xl font-extrabold text-primary tracking-tighter font-headline hover:opacity-80 transition-opacity z-10">
            SwapNest
          </Link>
        </div>
      </nav>

      <main className="flex-grow flex flex-col md:flex-row min-h-screen overflow-hidden pt-16 md:pt-0">
        
        {/* Left Side: Editorial Image */}
        <section className="hidden md:flex md:w-1/2 lg:w-[55%] relative overflow-hidden bg-primary-container">
          <div className="absolute inset-0 z-0">
            <img 
              alt="Vintage Typewriter" 
              className="w-full h-full object-cover grayscale-[20%] contrast-[1.1]" 
              src="https://images.unsplash.com/photo-1512413914595-df51c39d67bc?auto=format&fit=crop&w=1000&q=80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent"></div>
          </div>
          
          <div className="relative z-10 p-12 lg:p-16 flex flex-col justify-end w-full h-full pb-20">
            <div className="max-w-xl">
              <span className="font-label text-tertiary-fixed text-[11px] uppercase tracking-[0.3em] mb-6 block">Account Recovery</span>
              <h1 className="font-headline text-stone-50 text-5xl lg:text-7xl font-bold leading-[1.1] mb-8">
                Let's get you <br/>back inside.
              </h1>
              <p className="text-stone-50/80 text-lg max-w-md font-medium leading-relaxed">
                Enter your email address and we'll send you a secure link to safely reset your password and rejoin the circular economy.
              </p>
            </div>
          </div>
        </section>

        {/* Right Side: Recovery Form */}
        <section className="flex-1 flex flex-col justify-center items-center p-8 md:p-16 lg:p-24 bg-surface-container-low relative min-h-screen md:min-h-0">
          <div className="w-full max-w-md space-y-10">
            
            <div className="text-center md:text-left space-y-3">
              <h2 className="font-headline text-4xl font-extrabold text-primary tracking-tight">Forgot Password</h2>
              <p className="text-on-surface-variant font-medium">No worries, it happens to the best of us.</p>
            </div>

            {/* Dynamic Success Message */}
            {message && (
              <div className="bg-primary-fixed text-on-primary-fixed p-4 rounded-2xl text-sm font-bold border border-primary-fixed-dim/20 flex items-start gap-3">
                <span className="material-symbols-outlined text-[20px] mt-0.5">mark_email_read</span>
                <p>{message}</p>
              </div>
            )}

            {/* Dynamic Error Message */}
            {error && (
              <div className="bg-error-container text-on-error-container p-4 rounded-2xl text-sm font-bold border border-error/20 flex items-start gap-3">
                <span className="material-symbols-outlined text-[20px] mt-0.5">error</span>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleResetRequest} className="space-y-6">
              <div className="space-y-2">
                <label className="font-label text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-1">Email Address</label>
                <input 
                  className="w-full h-14 px-6 bg-surface-container-highest border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all text-on-surface placeholder:text-on-surface-variant/40 font-medium outline-none" 
                  placeholder="curator@swapnest.com" 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <button 
                type="submit"
                // Disable if loading OR if the countdown is running
                disabled={isLoading || countdown > 0} 
                className="w-full h-16 bg-secondary text-on-secondary rounded-full font-headline font-bold text-lg hover:bg-[#822800] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_-15px_rgba(27,28,26,0.2)] flex items-center justify-center gap-2 mt-8 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-secondary"
              >
                {/* Dynamically update the button text based on state */}
                {isLoading 
                  ? 'Sending Link...' 
                  : countdown > 0 
                    ? `Resend Link in ${countdown}s` 
                    : message 
                      ? 'Resend Reset Link' 
                      : 'Send Reset Link'
                }
                
                {/* Dynamically update the icon based on state */}
                {!isLoading && countdown === 0 && (
                  <span className="material-symbols-outlined text-xl">
                    {message ? 'refresh' : 'send'}
                  </span>
                )}
                {countdown > 0 && (
                  <span className="material-symbols-outlined text-xl">timer</span>
                )}
              </button>
            </form>

            <div className="pt-4 text-center border-t border-outline-variant/20">
              <p className="text-sm font-medium text-on-surface-variant mt-6">
                Remember your password? 
                <Link to="/login" className="text-secondary font-headline font-bold hover:underline ml-1"> Log in here</Link>
              </p>
            </div>
            
          </div>
        </section>
      </main>
    </div>
  );
};

export default ForgotPassword;