function ItemTableRow({
  item,
  openItemModal,
  handleDelete,
  getItemId,
  getPrimaryImage,
  formatPrice,
  getLocationLabel,
  formatRelativeDate,
}) {
  return (
    <tr className="border-t border-[#edf1ef] text-sm transition hover:bg-[#fafcfc]">
      <td className="px-4 py-3">
        <div className="flex min-w-[220px] items-center gap-3">
          <img
            src={getPrimaryImage(item)}
            alt={item.title}
            className="h-11 w-11 rounded-xl bg-[#ece3d6] object-cover"
          />
          <div>
            <p className="font-semibold text-[#102f28]">
              {item.title || "Untitled item"}
            </p>
            <p className="mt-1 text-xs text-[#6a7d77]">
              ID: {getItemId(item) || "N/A"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 text-[#46615a]">{item.category || "General"}</td>
      <td className="px-4 py-3 text-[#46615a]">{item.condition || "Used"}</td>
      <td className="px-4 py-3 text-[#46615a]">{item.mode || "Sell"}</td>
      <td className="px-4 py-3 font-semibold text-[#b1461a]">
        {formatPrice(item.price)}
      </td>
      <td className="px-4 py-3 text-[#46615a]">{getLocationLabel(item)}</td>
      <td className="px-4 py-3 text-[#46615a]">
        {formatRelativeDate(item.createdAt)}
      </td>

      <td className="px-4 py-3">
        <div className="flex min-w-[220px] items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => openItemModal(item, "view")}
            className="rounded-full bg-[#ecfdf3] px-3 py-1.5 text-xs font-semibold text-[#0f9f57]"
          >
            View
          </button>
          <button
            type="button"
            onClick={() => openItemModal(item, "edit")}
            className="rounded-full bg-[#eef2ff] px-3 py-1.5 text-xs font-semibold text-[#4f46e5]"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDelete(item)}
            className="rounded-full bg-[#fff1f2] px-3 py-1.5 text-xs font-semibold text-[#e11d48]"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export default ItemTableRow;
