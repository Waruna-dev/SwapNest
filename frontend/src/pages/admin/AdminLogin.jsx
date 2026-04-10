// frontend/src/pages/admin/AdminLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Hit the admin login endpoint
      const { data } = await API.post('/admin/login', { email, password });
      
      // 2. Save the full admin object (for name, role, etc. in UI)
      localStorage.setItem('adminInfo', JSON.stringify(data));
      
      // 3. Save the token to the GLOBAL key the API service uses!
      // --- ADD THIS LINE ---
      localStorage.setItem('swapnest_token', data.token); 
      
      // 4. Redirect to the dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md text-white">
        <h2 className="text-3xl font-bold mb-2 text-center text-red-500">Admin Portal</h2>
        <p className="text-gray-400 text-center mb-8">Authorized Personnel Only</p>
        
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-center">{error}</div>}

        <form onSubmit={handleAdminLogin} className="space-y-6">
          <input
            type="email"
            placeholder="Admin Email"
            className="w-full p-3 bg-gray-700 rounded text-white outline-none focus:ring-2 focus:ring-red-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 bg-gray-700 rounded text-white outline-none focus:ring-2 focus:ring-red-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 p-3 rounded font-bold transition">
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;