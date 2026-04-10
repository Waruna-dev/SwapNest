import ItemTableRow from "./ItemTableRow";

function ItemTable({
  loading,
  filteredItems,
  openItemModal,
  handleDelete,
  handleToggleHidden,
  getItemId,
  getPrimaryImage,
  formatPrice,
  getLocationLabel,
  formatRelativeDate,
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-[22px] border border-[#d7dfdc] bg-[#f8faf9]">
      {/* ✅ Added height limit + vertical scroll */}
      <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
        <table className="min-w-full bg-white">
          {/* ✅ Sticky header added */}
          <thead className="bg-[#303030] text-left sticky top-0 z-10">
            <tr className="text-[11px] uppercase tracking-[0.18em] text-white/80">
              <th className="px-4 py-3 font-semibold">Item Name</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Condition</th>
              <th className="px-4 py-3 font-semibold">Mode</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Location</th>
              <th className="px-4 py-3 font-semibold">Created</th>
              <th className="px-4 py-3 font-semibold">Visibility</th>
              <th className="px-4 py-3 font-semibold text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              // 🔄 Loading skeleton rows
              Array.from({ length: 6 }, (_, index) => (
                <tr key={index} className="border-t border-[#edf1ef]">
                  {Array.from({ length: 9 }, (_, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3">
                      <div className="h-5 animate-pulse rounded-full bg-[#ece4d8]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filteredItems.length ? (
              // 📦 Show items
              filteredItems.map((item) => (
                <ItemTableRow
                  key={getItemId(item)}
                  item={item}
                  openItemModal={openItemModal}
                  handleDelete={handleDelete}
                  handleToggleHidden={handleToggleHidden}
                  getItemId={getItemId}
                  getPrimaryImage={getPrimaryImage}
                  formatPrice={formatPrice}
                  getLocationLabel={getLocationLabel}
                  formatRelativeDate={formatRelativeDate}
                />
              ))
            ) : (
              // ❌ No data
              <tr>
                <td
                  colSpan="9"
                  className="px-6 py-14 text-center text-sm text-[#5d726c]"
                >
                  No items found for the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ItemTable;
