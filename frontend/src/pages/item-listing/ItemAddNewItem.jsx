import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createItem } from "../../services/item/itemApi";
import AddItemNavbar from "../../components/item-listing/AddItemNavbar";
import AddItemPreview from "../../components/item-listing/AddItemPreview";
import ItemFormSection from "../../components/item-listing/ItemFormSection";
import StatusDialog from "../../components/item-listing/StatusDialog";
import { useItemForm } from "../../hooks/useItemForm";
import { useLocationPicker } from "../../hooks/useLocationPicker";

const ItemAddNewItem = () => {
  const navigate = useNavigate();

  const {
    formData,
    setFormData,
    images,
    imagePreviews,
    status,
    setStatus,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleImageChange,
    removeImage,
    resetForm,
  } = useItemForm();

  useEffect(() => {
    const token = localStorage.getItem("swapnest_token");

    if (!token) {
      setStatus({
        type: "error",
        message:
          "Please log in first. You need an account before adding a new item.",
      });
    }
  }, [setStatus]);

  const token = localStorage.getItem("swapnest_token");
  const showStatusDialog = Boolean(status.message);
  const dialogTitle =
    status.type === "success" ? "Item created successfully" : "Action required";
  const dialogActionLabel =
    status.type === "success"
      ? "View item page"
      : !token
        ? "Go to gallery"
        : "Try again";

  const {
    mapRef,
    locationSearch,
    setLocationSearch,
    selectedAddress,
    locationState,
    handleUseCurrentLocation,
    handleLocationSearch,
  } = useLocationPicker(setFormData);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (!images.length) {
      setStatus({
        type: "error",
        message: "Add at least one image to publish your item.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "") {
          payload.append(key, value);
        }
      });

      images.forEach((file) => {
        payload.append("images", file);
      });

      const response = await createItem(payload);
      const createdItem = response.data;

      setStatus({
        type: "success",
        message: `Item created successfully with ID ${createdItem.itemId}.`,
      });

      resetForm();
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "Unable to create the item right now. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f1ea] text-[#0a3327] font-body antialiased overflow-hidden">
      {/* <StatusDialog
        open={showStatusDialog}
        type={status.type}
        title={dialogTitle}
        message={status.message}
        actionLabel={dialogActionLabel}
        // onAction={() => {
        //   if (status.type === "success") {
        //     navigate("/item/test-api");
        //     return;
        //   }

        //   if (!token) {
        //     navigate("/item/gallery", { replace: true });
        //     return;
        //   }

        //   setStatus({ type: "", message: "" });
        // }}
      /> */}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-[-80px] h-72 w-72 rounded-full bg-[#d7c3a4]/35 blur-3xl" />
        <div className="absolute top-40 right-[-60px] h-80 w-80 rounded-full bg-[#b14716]/12 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#295848]/10 blur-3xl" />
      </div>

      <AddItemNavbar />

      <main className="relative z-10 mx-auto grid max-w-7xl gap-10 px-6 py-8 md:px-10 lg:grid-cols-[0.92fr_1.08fr] lg:py-12">
        <AddItemPreview
          formData={formData}
          imagePreviews={imagePreviews}
          images={images}
          isSubmitting={isSubmitting}
        />

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
