import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Link } from "react-router-dom";

import TestApi from "./pages/item-listing/testApi"; // Import the test API component
import ItemAddNewItems from "./pages/item-listing/ItemAddNewItem";
import ItemGalleryPage2 from "./pages/item-gallery/ItemGalleryPage";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/test-api" element={<TestApi />} />
          <Route path="/item/new" element={<ItemAddNewItems />} />
          <Route path="/items/gallery" element={<ItemGalleryPage2 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
