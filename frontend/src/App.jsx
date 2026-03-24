import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import all of your beautiful new pages!
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register'; 

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* The different URLs for your application */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;