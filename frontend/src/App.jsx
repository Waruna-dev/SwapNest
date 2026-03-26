import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import the test API component
import ItemAddNewItems from "./pages/item-listing/ItemAddNewItem";
import ItemGalleryPage from "./pages/item-gallery/ItemGalleryPage";
import ItemDashboard1 from "./pages/item-listing/ItemDashboard";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/item/new" element={<ItemAddNewItems />} />
          <Route path="/item/gallery" element={<ItemGalleryPage />} />
          <Route path="/item/dashboard" element={<ItemDashboard1 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
