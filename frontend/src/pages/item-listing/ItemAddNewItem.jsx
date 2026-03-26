import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createItem } from "../../services/item/itemApi";

// UI Components
import AddItemNavbar from "../../components/item-listing/AddItemNavbar";
import AddItemPreview from "../../components/item-listing/AddItemPreview";
import ItemFormSection from "../../components/item-listing/ItemFormSection";
import StatusDialog from "../../components/item-listing/StatusDialog";

// Custom Hooks
import { useItemForm } from "../../hooks/useItemForm";
import { useLocationPicker } from "../../hooks/useLocationPicker";

const ItemAddNewItem = () => {
  const navigate = useNavigate(); // used for page navigation

  // ===========================
  // FORM STATE (Custom Hook)
  // ===========================
  const {
    formData, // all form input values
    setFormData, // update form data
    images, // uploaded image files
    imagePreviews, // preview URLs
    status, // success/error status
    setStatus, // update status
    isSubmitting, // loading state
    setIsSubmitting, // update loading state
    handleChange, // handle input change
    handleImageChange, // handle image upload
    removeImage, // remove image
    resetForm, // reset form after success
  } = useItemForm();

  // ===========================
  // CHECK USER LOGIN (TOKEN)
  // ===========================
  useEffect(() => {
    const token = localStorage.getItem("swapnest_token");

    // If user is NOT logged in → show error message
    if (!token) {
      setStatus({
        type: "error",
        message:
          "Please log in first. You need an account before adding a new item.",
      });
    }
  }, [setStatus]);

  const token = localStorage.getItem("swapnest_token");

  // ===========================
  // STATUS DIALOG SETTINGS
  // ===========================
  const showStatusDialog = Boolean(status.message); // show dialog if message exists

  const dialogTitle =
    status.type === "success" ? "Item created successfully" : "Action required";

  const dialogActionLabel =
    status.type === "success"
      ? "View item page"
      : !token
        ? "Go to gallery"
        : "Try again";

  // ===========================
  // LOCATION PICKER (MAP)
  // ===========================
  const {
    mapRef, // map reference
    locationSearch, // search input
    setLocationSearch, // update search
    selectedAddress, // selected location text
    locationState, // lat/lng
    handleUseCurrentLocation, // get user's current location
    handleLocationSearch, // search location
  } = useLocationPicker(setFormData);

  // ===========================
  // FORM SUBMIT FUNCTION
  // ===========================
  const handleSubmit = async (event) => {
    event.preventDefault(); // prevent page reload

    // clear previous status
    setStatus({ type: "", message: "" });

    // VALIDATION → at least 1 image required
    if (!images.length) {
      setStatus({
        type: "error",
        message: "Add at least one image to publish your item.",
      });
      return;
    }

    setIsSubmitting(true); // start loading

    try {
      // create FormData (for file upload)
      const payload = new FormData();

      // append form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "") {
          payload.append(key, value);
        }
      });

      // append images
      images.forEach((file) => {
        payload.append("images", file);
      });

      // API call to create item
      const response = await createItem(payload);
      const createdItem = response.data;

      // SUCCESS MESSAGE
      setStatus({
        type: "success",
        message: `Item created successfully with ID ${createdItem.itemId}.`,
      });

      // reset form after success
      resetForm();
    } catch (error) {
      // ERROR HANDLING
      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "Unable to create the item right now. Please try again.",
      });
    } finally {
      setIsSubmitting(false); // stop loading
    }
  };

  // ===========================
  // UI RENDER
  // ===========================
  return (
    <div className="min-h-screen bg-[#f5f1ea] text-[#0a3327] font-body antialiased overflow-hidden">
      {/* STATUS POPUP DIALOG */}
      <StatusDialog
        open={showStatusDialog}
        type={status.type}
        title={dialogTitle}
        message={status.message}
        actionLabel={dialogActionLabel}
        onAction={() => {
          if (status.type === "success") {
            navigate("/item/gallery"); // go to gallery after success
            return;
          }

          if (!token) {
            navigate("/item/gallery", { replace: true }); // redirect if not logged in
            return;
          }

          setStatus({ type: "", message: "" }); // reset dialog
        }}
      />

      {/* BACKGROUND DECORATION */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-[-80px] h-72 w-72 rounded-full bg-[#d7c3a4]/35 blur-3xl" />
        <div className="absolute top-40 right-[-60px] h-80 w-80 rounded-full bg-[#b14716]/12 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#295848]/10 blur-3xl" />
      </div>

      {/* NAVBAR */}
      <AddItemNavbar />

      {/* MAIN CONTENT */}
      <main className="relative z-10 mx-auto grid max-w-7xl gap-10 px-6 py-8 md:px-10 lg:grid-cols-[0.92fr_1.08fr] lg:py-12">
        {/* LEFT SIDE → PREVIEW CARD */}
        <AddItemPreview
          formData={formData}
          imagePreviews={imagePreviews}
          images={images}
          isSubmitting={isSubmitting}
        />

        {/* RIGHT SIDE → FORM */}
        <ItemFormSection
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          imagePreviews={imagePreviews}
          handleImageChange={handleImageChange}
          removeImage={removeImage}
          mapRef={mapRef}
          locationSearch={locationSearch}
          setLocationSearch={setLocationSearch}
          selectedAddress={selectedAddress}
          locationState={locationState}
          handleUseCurrentLocation={handleUseCurrentLocation}
          handleLocationSearch={handleLocationSearch}
        />
      </main>
    </div>
  );
};

export default ItemAddNewItem;
