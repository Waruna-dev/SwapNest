import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import all of your beautiful new pages!
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Pickup from "./Component/Volunteer/pickup";
import Center from "./Component/Volunteer/center";
import Volunteer from "./Component/Volunteer/volunteer";
import VolunteerPage from "./Component/Volunteer/Volunteerpage";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* The different URLs for your application */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/pickup" element={<Pickup />} />
          <Route path="/center" element={<Center />} />
          <Route path="/volunteer-hero" element={<VolunteerPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
