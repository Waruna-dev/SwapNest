import DashboardStatusMessage from "./DashboardStatusMessage";
import ImageUploader from "../item-listing/ImageUploader";
import LocationPicker from "../item-listing/LocationPicker";
import { useLocationPicker } from "../../hooks/useLocationPicker";

function ItemEditForm({
  formData,
  handleChange,
  handleUpdate,
  isSaving,
  editImages,
  handleEditImageChange,
  removeEditImage,
  setEditImages,
  setFormData,
  buildFormFromItem,
  selectedItem,
  setIsEditMode,
  status,
  statusTone,
  categoryOptions,
  conditionOptions,
  modeOptions,
  getLocationLabel,
}) {
  const isSwapOnly = formData.mode === "Swap";
  const selectedCoords = Array.isArray(selectedItem?.location?.coordinates)
    ? selectedItem.location.coordinates
    : [];
  const {
    mapRef,
    locationSearch,
    setLocationSearch,
    selectedAddress,
    locationState,
    handleUseCurrentLocation,
    handleLocationSearch,
  } = useLocationPicker(setFormData, {
    lat: selectedCoords[1] ?? "",
    lng: selectedCoords[0] ?? "",
    address: selectedItem ? getLocationLabel(selectedItem) : "",
  });

  return (
    <form onSubmit={handleUpdate} className="mt-6 space-y-4">
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Item title"
        required
        className="w-full rounded-2xl border border-[#d8cfc3] bg-white px-4 py-3 text-sm outline-none"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full rounded-2xl border border-[#d8cfc3] bg-white px-4 py-3 text-sm outline-none"
        >
          {categoryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          name="condition"
          value={formData.condition}
          onChange={handleChange}
          className="w-full rounded-2xl border border-[#d8cfc3] bg-white px-4 py-3 text-sm outline-none"
        >
          {conditionOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <select
          name="mode"
          value={formData.mode}
          onChange={handleChange}
          className="w-full rounded-2xl border border-[#d8cfc3] bg-white px-4 py-3 text-sm outline-none"
        >
          {modeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        {!isSwapOnly && (
          <input
            type="number"
            min="0"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Price"
            className="w-full rounded-2xl border border-[#d8cfc3] bg-white px-4 py-3 text-sm outline-none"
          />
        )}
      </div>

      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        rows={6}
        placeholder="Description"
        className="w-full rounded-[24px] border border-[#d8cfc3] bg-white px-4 py-3 text-sm outline-none"
      />

      <LocationPicker
        mapRef={mapRef}
        locationSearch={locationSearch}
        setLocationSearch={setLocationSearch}
        selectedAddress={selectedAddress}
        locationState={locationState}
        handleUseCurrentLocation={handleUseCurrentLocation}
        handleLocationSearch={handleLocationSearch}
        lat={formData.lat}
        lng={formData.lng}
      />

      <ImageUploader
        imagePreviews={editImages}
        handleImageChange={handleEditImageChange}
        removeImage={removeEditImage}
      />

      <DashboardStatusMessage status={status} statusTone={statusTone} />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-full bg-[#c1531c] px-7 py-3 text-sm font-semibold text-white disabled:opacity-70"
        >
          {isSaving ? "Updating..." : "Update item"}
        </button>

        <button
          type="button"
          onClick={() => {
            setFormData(buildFormFromItem(selectedItem));
            setEditImages(
              (selectedItem?.images || []).slice(0, 5).map((image, index) => ({
                kind: "existing",
                id: image?.publicId || `existing-${index}`,
                name: `Image ${index + 1}`,
                url: image?.url || "",
                publicId: image?.publicId || "",
              })),
            );
            setIsEditMode(false);
          }}
          className="rounded-full border border-[#d8cfc3] bg-white px-7 py-3 text-sm font-semibold text-[#21463c]"
        >
          Back to view
        </button>
      </div>
    </form>
  );
}

export default ItemEditForm;
