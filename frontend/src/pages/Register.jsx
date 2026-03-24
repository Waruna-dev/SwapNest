import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  
  // State to handle the interactive interest chips
  const [selectedInterests, setSelectedInterests] = useState(['Fashion', 'Plants']); 

  const navigate = useNavigate();

  // List of interests for the UI
  const interestsList = ['Home Decor', 'Fashion', 'Electronics', 'Plants', 'Books', 'Art'];

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
      // Send the registration request to your backend. 
      // Adjust the fields here if your MongoDB schema requires different names!
      const response = await API.post('/users/register', { 
        name, 
        email, 
        password,
        // location, // Uncomment these if your backend schema accepts them!
        // interests: selectedInterests 
      });
      
      // Save the token and redirect to Home
      localStorage.setItem('swapnest_token', response.data.token);
      navigate('/');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen font-body">
      <main className="flex min-h-screen overflow-hidden">
        
        {/* Left Section: Visual & Impact (Split Screen - Hidden on Mobile) */}
        <section className="hidden md:flex relative w-1/2 flex-col justify-between p-12 overflow-hidden">
          
          {/* Background Image Layer */}
          <div className="absolute inset-0 z-0">
            <img 
              className="w-full h-full object-cover" 
              alt="Sustainable interior" 
              src="https://picsum.photos/800/1200?random=20"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/40 to-primary/80"></div>
          </div>
          
          {/* Content over background */}
          <nav className="relative z-10">
            <Link to="/" className="text-2xl font-bold text-surface tracking-tight font-headline">SwapNest</Link>
          </nav>
          
          <div className="relative z-10 max-w-lg mb-20">
            <h1 className="text-6xl font-extrabold text-surface leading-[1.1] mb-6 font-headline">
              Cultivate your space, <span className="text-primary-fixed">sustainably.</span>
            </h1>
            <p className="text-xl text-surface/90 leading-relaxed mb-10 font-medium">
              Join a mindful collective where every item finds a new story. Curate your life without the footprint.
            </p>
            
            {/* Impact Stat Card */}
            <div className="inline-flex items-center gap-4 bg-surface/10 backdrop-blur-xl p-6 rounded-3xl border border-surface/20">
              <div className="flex -space-x-3">
                <img className="w-12 h-12 rounded-full border-2 border-primary object-cover" alt="user" src="https://picsum.photos/100/100?random=21"/>
                <img className="w-12 h-12 rounded-full border-2 border-primary object-cover" alt="user" src="https://picsum.photos/100/100?random=22"/>
                <div className="w-12 h-12 rounded-full border-2 border-primary bg-primary-fixed flex items-center justify-center text-primary text-xs font-bold">+10k</div>
              </div>
              <div>
                <p className="text-surface font-bold text-lg font-headline">Join 10,000+ neighbors</p>
                <p className="text-surface/70 text-sm">swapping items locally this month</p>
              </div>
            </div>
          </div>
          
          <footer className="relative z-10">
            <p className="text-surface/60 text-sm">© 2026 SwapNest. For the mindful curator.</p>
          </footer>
        </section>

        {/* Right Section: Registration Form */}
        <section className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 bg-surface relative overflow-y-auto">
          <div className="w-full max-w-md my-auto">
            
            {/* Mobile Header */}
            <div className="md:hidden mb-12 flex justify-between items-center">
              <Link to="/" className="text-2xl font-bold text-primary tracking-tight font-headline">SwapNest</Link>
              <Link to="/login" className="text-sm font-bold text-secondary">Log In</Link>
            </div>
            
            <header className="mb-10">
              <h2 className="text-4xl font-bold text-primary mb-3 font-headline">Create Account</h2>
              <p className="text-on-surface-variant font-medium">Begin your journey into circular living.</p>
            </header>

            {/* Dynamic Error Message */}
            {error && (
              <div className="bg-error-container text-on-error-container p-4 rounded-lg text-sm font-bold text-center mb-6 border border-error/20">
                {error}
              </div>
            )}

            {/* Social Sign Up (Visual Only for now) */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button type="button" className="flex items-center justify-center gap-3 py-3 px-4 rounded-full border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container-high transition-colors duration-300">
                <span className="text-sm font-bold text-on-surface">Google</span>
              </button>
              <button type="button" className="flex items-center justify-center gap-3 py-3 px-4 rounded-full border border-outline-variant/30 bg-surface-container-low hover:bg-surface-container-high transition-colors duration-300">
                <span className="text-sm font-bold text-on-surface">Apple</span>
              </button>
            </div>
            
            <div className="relative flex items-center gap-4 mb-8">
              <div className="flex-grow h-px bg-outline-variant/20"></div>
              <span className="text-xs font-bold text-outline uppercase tracking-widest">or email</span>
              <div className="flex-grow h-px bg-outline-variant/20"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-primary uppercase tracking-widest ml-1 font-label">Full Name</label>
                  <input 
                    className="w-full px-6 py-4 rounded-2xl bg-surface-container-high border-none focus:ring-1 focus:ring-primary/20 placeholder:text-outline/50 transition-all outline-none" 
                    placeholder="Eleanor Woods" 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-primary uppercase tracking-widest ml-1 font-label">Email Address</label>
                  <input 
                    className="w-full px-6 py-4 rounded-2xl bg-surface-container-high border-none focus:ring-1 focus:ring-primary/20 placeholder:text-outline/50 transition-all outline-none" 
                    placeholder="eleanor@example.com" 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Password */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-primary uppercase tracking-widest ml-1 font-label">Password</label>
                    <input 
                      className="w-full px-6 py-4 rounded-2xl bg-surface-container-high border-none focus:ring-1 focus:ring-primary/20 placeholder:text-outline/50 transition-all outline-none" 
                      placeholder="••••••••" 
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  
                  {/* Location */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-primary uppercase tracking-widest ml-1 font-label">Location</label>
                    <div className="relative">
                      <input 
                        className="w-full px-6 py-4 rounded-2xl bg-surface-container-high border-none focus:ring-1 focus:ring-primary/20 placeholder:text-outline/50 transition-all outline-none" 
                        placeholder="Portland, OR" 
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 text-lg">location_on</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interests Selection (Interactive Bento Style Chips) */}
              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-xs font-bold text-primary uppercase tracking-widest font-label">Personalize Your Feed</label>
                  <span className="text-[10px] font-bold text-outline uppercase">Select 3+</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {interestsList.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                        selectedInterests.includes(interest)
                          ? 'bg-primary-fixed text-on-primary-fixed'
                          : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 space-y-6">
                <button 
                  className="w-full py-5 bg-secondary text-on-secondary font-bold font-headline rounded-full shadow-lg shadow-secondary/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-lg" 
                  type="submit"
                >
                  Create My Account
                </button>
                <p className="text-center text-sm font-medium text-on-surface-variant">
                  Already have an account? 
                  <Link to="/login" className="text-secondary font-bold hover:underline decoration-2 underline-offset-4 ml-1">
                    Log In
                  </Link>
                </p>
              </div>
            </form>
            
            <footer className="mt-12 pt-8 border-t border-outline-variant/10">
              <p className="text-[11px] text-outline text-center leading-relaxed font-medium">
                By joining, you agree to our <a className="underline" href="#">Terms of Service</a> and <a className="underline" href="#">Privacy Policy</a>. We value your data as much as your items.
              </p>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Register;