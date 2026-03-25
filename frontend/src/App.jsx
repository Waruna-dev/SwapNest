import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import all of your beautiful new pages!
import Home from "./pages/Home";
import TestApi from "./pages/item-listing/testApi"; // Import the test API component
import ItemAddNewItem from "./pages/item-listing/item-addNewItem";
import ItemGalleryPage from "./pages/item-listing/item-galleryPage";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* The different URLs for your application */}
          <Route path="/" element={<Home />} />
          <Route path="/test-api" element={<TestApi />} />
          <Route path="/items/new" element={<ItemAddNewItem />} />
          <Route path="/items" element={<ItemGalleryPage />} />
          {/* Add the test API route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
