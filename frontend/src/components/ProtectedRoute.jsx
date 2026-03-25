// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('swapnest_token');
  
  // Let's add a console log just to see what the bouncer is doing!
  console.log("Bouncer checking token:", token);

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;