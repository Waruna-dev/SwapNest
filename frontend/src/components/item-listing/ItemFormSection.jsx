import { useState } from "react";
import ImageUploader from "./ImageUploader";
import LocationPicker from "./LocationPicker";

const categoryOptions = [
  "Fashion",
  "Electronics",
  "Furniture",
  "Books",
  "Art",
  "Collectibles",
  "Home Decor",
  "Sports",
];

const modeOptions = ["Swap", "Sell", "Swap + Sell"];
const conditionOptions = ["New", "Like New", "Used", "Vintage", "Refurbished"];

const ItemFormSection = ({
  formData,
  handleChange,
  handleSubmit,
  status,
  isSubmitting,
  imagePreviews,
  handleImageChange,
  removeImage,
  mapRef,
  locationSearch,
  setLocationSearch,
  selectedAddress,
  locationState,
  handleUseCurrentLocation,
  handleLocationSearch,
}) => {
  const isSwapOnly = formData.mode === "Swap";
  const [invalidFields, setInvalidFields] = useState({});

  const getFieldClassName = (fieldName, baseClassName) =>
    `${baseClassName} ${
      invalidFields[fieldName]
        ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-100"
        : "border-[#0a3327]/8 bg-[#efebe4] focus:border-[#b14716]/25 focus:ring-[#b14716]/10"
    }`;

  const handleFieldChange = (event) => {
    const { name, value } = event.target;

    handleChange(event);

    setInvalidFields((current) => ({
      ...current,
      [name]: !value.trim(),
    }));
  };

  const handleFieldInvalid = (event) => {
    const { name } = event.target;

    setInvalidFields((current) => ({
      ...current,
      [name]: true,
    }));
  };

  return (
    <section className="rounded-[36px] border border-[#0a3327]/8 bg-[rgba(255,252,247,0.82)] p-6 shadow-[0_28px_70px_-38px_rgba(10,51,39,0.38)] backdrop-blur-xl md:p-8 lg:p-10">
      <div className="mb-8 flex flex-col gap-3 border-b border-[#0a3327]/10 pb-6">
        <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#0a3327]/45">
          New Listing
        </span>

        <h2 className="font-headline text-4xl font-extrabold tracking-tight text-[#0a3327]">
          New Listing Form
        </h2>
      </div>

      {status.message && (
        <div
          className={`mb-6 rounded-[24px] border px-5 py-4 text-sm font-semibold ${
            status.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {status.message}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="ml-1 text-[11px] font-bold uppercase tracking-[0.28em] text-[#0a3327]/55">
              Item Title
            </label>
            <input
              required
              name="title"
              type="text"
              value={formData.title}
              onChange={handleFieldChange}
              onInvalid={handleFieldInvalid}
              placeholder="Handwoven cane lounge chair"
              className={getFieldClassName(
                "title",
                "h-16 w-full rounded-[24px] border px-6 text-[#0a3327] outline-none transition placeholder:text-[#0a3327]/32 focus:ring-4",
              )}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="ml-1 text-[11px] font-bold uppercase tracking-[0.28em] text-[#0a3327]/55">
              Description
            </label>
            <textarea
              required
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleFieldChange}
              onInvalid={handleFieldInvalid}
              placeholder="Describe material, story, era, texture, and why this item deserves a second life."
              className={getFieldClassName(
                "description",
                "w-full rounded-[24px] border px-6 py-5 text-[#0a3327] outline-none transition placeholder:text-[#0a3327]/32 focus:ring-4",
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-[11px] font-bold uppercase tracking-[0.28em] text-[#0a3327]/55">
              Category
            </label>
            <select
              required
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="h-16 w-full rounded-[24px] border border-[#0a3327]/8 bg-[#efebe4] px-6 text-[#0a3327] outline-none transition focus:border-[#b14716]/25 focus:ring-4 focus:ring-[#b14716]/10"
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-[11px] font-bold uppercase tracking-[0.28em] text-[#0a3327]/55">
              Exchange Mode
            </label>
            <select
              required
              name="mode"
              value={formData.mode}
              onChange={handleChange}
              className="h-16 w-full rounded-[24px] border border-[#0a3327]/8 bg-[#efebe4] px-6 text-[#0a3327] outline-none transition focus:border-[#b14716]/25 focus:ring-4 focus:ring-[#b14716]/10"
            >
              {modeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-[11px] font-bold uppercase tracking-[0.28em] text-[#0a3327]/55">
              Condition
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="h-16 w-full rounded-[24px] border border-[#0a3327]/8 bg-[#efebe4] px-6 text-[#0a3327] outline-none transition focus:border-[#b14716]/25 focus:ring-4 focus:ring-[#b14716]/10"
            >
              {conditionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {!isSwapOnly && (
            <div className="space-y-2">
              <label className="ml-1 text-[11px] font-bold uppercase tracking-[0.28em] text-[#0a3327]/55">
                Price
              </label>
              <input
                min="0"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="120"
                className="h-16 w-full rounded-[24px] border border-[#0a3327]/8 bg-[#efebe4] px-6 text-[#0a3327] outline-none transition placeholder:text-[#0a3327]/32 focus:border-[#b14716]/25 focus:ring-4 focus:ring-[#b14716]/10"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="ml-1 text-[11px] font-bold uppercase tracking-[0.28em] text-[#0a3327]/55">
              Contact
            </label>
            <input
              required
              name="contact"
              type="text"
              value={formData.contact}
              onChange={handleFieldChange}
              onInvalid={handleFieldInvalid}
              placeholder="077 123 4567 or curator@swapnest.com"
              className={getFieldClassName(
                "contact",
                "h-16 w-full rounded-[24px] border px-6 text-[#0a3327] outline-none transition placeholder:text-[#0a3327]/32 focus:ring-4",
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-[11px] font-bold uppercase tracking-[0.28em] text-[#0a3327]/55">
              Owner ID
            </label>
            <input
              required
              name="ownerId"
              type="text"
              value={formData.ownerId}
              onChange={handleChange}
              placeholder="Auto-filled from login token"
              className="h-16 w-full rounded-[24px] border border-[#0a3327]/8 bg-[#efebe4] px-6 text-[#0a3327] outline-none transition placeholder:text-[#0a3327]/32 focus:border-[#b14716]/25 focus:ring-4 focus:ring-[#b14716]/10"
            />
          </div>

          <ImageUploader
            imagePreviews={imagePreviews}
            handleImageChange={handleImageChange}
            removeImage={removeImage}
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
        </div>

        <div className="flex flex-col gap-4 border-t border-[#0a3327]/10 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-sm leading-6 text-[#0a3327]/56">
            Location is selected through the map flow, and the form submits
            hidden latitude and longitude values for your backend. Images are
            required too.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-16 items-center justify-center gap-3 rounded-full bg-[#b14716] px-8 font-headline text-lg font-bold text-white shadow-[0_22px_45px_-20px_rgba(177,71,22,0.95)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Publishing..." : "Create Item"}
            <span className="material-symbols-outlined text-xl">
              arrow_right_alt
            </span>
          </button>
        </div>
      </form>
    </section>
  );
};

export default ItemFormSection;
