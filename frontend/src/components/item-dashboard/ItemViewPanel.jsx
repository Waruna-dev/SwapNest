function ItemViewPanel({
  selectedItem,
  formatPrice,
  getLocationLabel,
  formatRelativeDate,
  setFormData,
  buildFormFromItem,
  setStatus,
  setIsEditMode,
  handleDelete,
}) {
  return (
    <>
      <div className="pr-14">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#889690]">
          {selectedItem.category || "General"}{" "}
          {selectedItem.condition || "Used"} {selectedItem.mode || "Sell"}
        </p>
        <h2 className="mt-3 text-4xl font-black tracking-tight text-[#173f34]">
          {selectedItem.title || "Untitled item"}
        </h2>
        <p className="mt-4 text-2xl font-black text-[#b34d19]">
          {formatPrice(selectedItem.price)}
        </p>
      </div>

      <div className="mt-6 border-t border-[#dfd5c9]" />

      <div className="mt-6 rounded-[28px] bg-[#efe4d6] p-5 text-sm leading-8 text-[#274740]">
        <p>
          {selectedItem.description ||
            "No description available for this listing."}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[20px] bg-white/80 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#889690]">
              Location
            </p>
            <p className="mt-1 text-base font-semibold text-[#274740]">
              {getLocationLabel(selectedItem)}
            </p>
          </div>

          <div className="rounded-[20px] bg-white/80 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#889690]">
              Listed
            </p>
            <p className="mt-1 text-base font-semibold text-[#274740]">
              {formatRelativeDate(selectedItem.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setFormData(buildFormFromItem(selectedItem));
            setStatus({ type: "", message: "" });
            setIsEditMode(true);
          }}
          className="rounded-full bg-[#c1531c] px-7 py-3 text-sm font-semibold text-white"
        >
          Edit item
        </button>

        <button
          type="button"
          onClick={() => handleDelete(selectedItem)}
          className="rounded-full border border-[#dfd5c9] bg-white px-7 py-3 text-sm font-semibold text-[#b34d19]"
        >
          Delete item
        </button>
      </div>
    </>
  );
}

export default ItemViewPanel;
