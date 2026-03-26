import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register'; 
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import AdminSwapDashboard from './components/swap/AdminSwapDashboard';
import Swapform from './components/swap/SwapForm';


import SwapList from './components/swap/SwapList';
import Privacy from './pages/PrivacyPolicy';
import Term from './pages/TermsConditions';
function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
        
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> 
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            {/* When you build the My List page, add it here too! */}
            {/* <Route path="/my-list" element={<MyList />} /> */}
          </Route>
      
          <Route path="/swapadmin" element={<AdminSwapDashboard />} />
          <Route path="/swapform" element={<Swapform />} />
         
          <Route path="/swaplist" element={<SwapList />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Term />} />
    

          
        </Routes>
      </div>
    </Router>
  );
}

export default App;