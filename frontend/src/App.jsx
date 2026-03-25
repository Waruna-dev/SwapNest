import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import all of your beautiful new pages!
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register'; 

import AdminSwapDashboard from './components/swap/AdminSwapDashboard';
import Swapform from './components/swap/SwapForm';
import SwapCard from './components/swap/SwapCard';
import SwapList from './components/swap/SwapList';
import Privacy from './pages/PrivacyPolicy';
import Term from './pages/TermsConditions';
function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* The different URLs for your application */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> 
      
          <Route path="/swapadmin" element={<AdminSwapDashboard />} />
          <Route path="/swapform" element={<Swapform />} />
          <Route path="/swapcard" element={<SwapCard />} />
          <Route path="/swaplist" element={<SwapList />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Term />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;