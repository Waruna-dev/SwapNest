import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Placeholder pages (We will build real ones next!)
const Home = () => <h1 style={{ padding: '20px' }}>Welcome to SwapNest</h1>;
const Login = () => <h1 style={{ padding: '20px' }}>Login Page</h1>;
const Profile = () => <h1 style={{ padding: '20px' }}>User Profile</h1>;

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;