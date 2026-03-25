import DashboardStatusMessage from "./DashboardStatusMessage";

function ItemEditForm({
  formData,
  handleChange,
  handleUpdate,
  isSaving,
  setFormData,
  buildFormFromItem,
  selectedItem,
  setIsEditMode,
  status,
  statusTone,
  categoryOptions,
  conditionOptions,
  modeOptions,
}) {
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

        <input
          type="number"
          min="0"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="Price"
          className="w-full rounded-2xl border border-[#d8cfc3] bg-white px-4 py-3 text-sm outline-none"
        />
      </div>

      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        rows={6}
        placeholder="Description"
        className="w-full rounded-[24px] border border-[#d8cfc3] bg-white px-4 py-3 text-sm outline-none"
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
