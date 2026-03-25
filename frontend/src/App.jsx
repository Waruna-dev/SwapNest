import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

// Import our new security wrapper
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-on-surface">
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          {/* Anyone can visit these pages */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* --- PROTECTED ROUTES --- */}
          {/* You MUST have a token to visit anything inside this wrapper */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            {/* When you build the My List page, add it here too! */}
            {/* <Route path="/my-list" element={<MyList />} /> */}
          </Route>
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;