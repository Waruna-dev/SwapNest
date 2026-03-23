import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); 

    try {
      const response = await API.post('/users/login', { email, password });
      localStorage.setItem('swapnest_token', response.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    }
  };

  return (
    /* Background container */
    <div className="flex justify-center items-center min-h-screen bg-swap-bg p-5 font-sans text-swap-text">
      
      {/* Login Card */}
      <div className="bg-white p-10 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] w-full max-w-[400px] border-t-4 border-swap-primary">
        
        <h2 className="text-swap-primary text-center mb-2 text-2xl font-bold">Welcome Back to SwapNest</h2>
        <p className="text-swap-light text-center mb-8 text-sm">Log in to continue swapping with your community.</p>

        {/* Error Box */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-5 text-center text-sm font-bold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 rounded-lg border border-gray-300 text-base outline-none focus:border-swap-primary focus:ring-1 focus:ring-swap-primary transition-all"
              placeholder="neighbor@example.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 rounded-lg border border-gray-300 text-base outline-none focus:border-swap-primary focus:ring-1 focus:ring-swap-primary transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className="bg-swap-accent text-white p-3.5 rounded-lg text-base font-bold mt-2 hover:opacity-90 transition-opacity"
          >
            Log In
          </button>
          
        </form>
      </div>
    </div>
  );
};

export default Login;