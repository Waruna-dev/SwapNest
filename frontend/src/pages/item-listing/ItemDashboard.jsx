import { useEffect, useMemo, useState } from "react";
import { deleteItem, getItems, updateItem } from "../../services/item/itemApi";
import {
  formatPrice,
  formatRelativeDate,
  getLocationLabel,
  getPrimaryImage,
} from "../../utils/itemGalleryUtils";

import DashboardNavbar from "../../components/item-dashboard/DashboardNavbar";
import DashboardSummaryCards from "../../components/item-dashboard/DashboardSummaryCards";
import DashboardFilters from "../../components/item-dashboard/DashboardFilters";
import DashboardStatusMessage from "../../components/item-dashboard/DashboardStatusMessage";
import ItemTable from "../../components/item-dashboard/ItemTable";
import ItemModal from "../../components/item-dashboard/ItemModal";
import DashboardFooter from "../../components/item-dashboard/DashboardFooter";

const categoryOptions = [
  "Furniture",
  "Electronics",
  "Fashion",
  "Books",
  "Home Decor",
  "Sports",
  "Collectibles",
  "Other",
];

const conditionOptions = ["New", "Like New", "Good", "Fair", "Used"];
const modeOptions = ["Sell", "Swap", "Sell / Swap"];

const emptyForm = {
  title: "",
  category: "Furniture",
  condition: "Good",
  mode: "Sell",
  price: "",
  description: "",
};

const getItemId = (item) => item?.itemId || item?._id || "";

const buildFormFromItem = (item) => ({
  title: item?.title || "",
  category: item?.category || "Furniture",
  condition: item?.condition || "Good",
  mode: item?.mode || "Sell",
  price: item?.price ?? "",
  description: item?.description || "",
});

const statusTone = (type) => {
  if (type === "success")
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (type === "error") return "border-rose-200 bg-rose-50 text-rose-800";
  return "border-[#0b3b30]/10 bg-white text-[#36524b]";
};

function ItemDashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedId, setSelectedId] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const loadItems = async () => {
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await getItems({ limit: 100 });
      const payload = response.data;
      const nextItems = Array.isArray(payload) ? payload : payload.items || [];
      setItems(nextItems);

      if (!nextItems.length) {
        setSelectedId("");
        setFormData(emptyForm);
        setShowModal(false);
        setIsEditMode(false);
        return;
      }

      const current =
        nextItems.find((item) => getItemId(item) === selectedId) ||
        nextItems[0];
      setSelectedId(getItemId(current));
      setFormData(buildFormFromItem(current));
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Unable to load items right now. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (!showModal) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowModal(false);
        setIsEditMode(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showModal]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const title = String(item?.title || "").toLowerCase();
      const description = String(item?.description || "").toLowerCase();
      const category = String(item?.category || "");
      const matchesSearch =
        !query || title.includes(query) || description.includes(query);
      const matchesCategory =
        activeCategory === "All" || activeCategory === category;

      return matchesSearch && matchesCategory;
    });
  }, [activeCategory, items, search]);

  const selectedItem = useMemo(
    () => items.find((item) => getItemId(item) === selectedId) || null,
    [items, selectedId],
  );

  const summary = useMemo(() => {
    const pricedItems = items.filter((item) => Number(item?.price || 0) > 0);
    const averagePrice = pricedItems.length
      ? Math.round(
          pricedItems.reduce(
            (total, item) => total + Number(item?.price || 0),
            0,
          ) / pricedItems.length,
        )
      : 0;

    return {
      total: items.length,
      visible: filteredItems.length,
      swapReady: items.filter((item) =>
        String(item?.mode || "")
          .toLowerCase()
          .includes("swap"),
      ).length,
      averagePrice,
    };
  }, [filteredItems.length, items]);

  const openItemModal = (item, mode = "view") => {
    setSelectedId(getItemId(item));
    setFormData(buildFormFromItem(item));
    setStatus({ type: "", message: "" });
    setShowModal(true);
    setIsEditMode(mode === "edit");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditMode(false);
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!selectedId) return;

    setIsSaving(true);
    setStatus({ type: "", message: "" });

    try {
      const payload = { ...formData, price: Number(formData.price || 0) };
      const response = await updateItem(selectedId, payload);
      const updatedItem = response.data?.item || response.data || payload;

      setItems((current) =>
        current.map((item) =>
          getItemId(item) === selectedId ? { ...item, ...updatedItem } : item,
        ),
      );

      setStatus({ type: "success", message: "Item updated successfully." });
      setIsEditMode(false);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Update failed. Please review the item details and try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const itemId = getItemId(item);
    if (!itemId) return;

    const confirmed = window.confirm(
      `Delete "${item?.title || "this item"}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setStatus({ type: "", message: "" });

    try {
      await deleteItem(itemId);
      setItems((current) =>
        current.filter((entry) => getItemId(entry) !== itemId),
      );

      if (selectedId === itemId) {
        closeModal();
        setSelectedId("");
        setFormData(emptyForm);
      }

      setStatus({ type: "success", message: "Item deleted successfully." });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Delete failed. Please try again in a moment.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5ede2_0%,#faf6ef_36%,#e8f1ec_100%)] text-[#0a3327]">
      <DashboardNavbar />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-8">
        <DashboardSummaryCards summary={summary} formatPrice={formatPrice} />

        <section className="mt-6 rounded-[28px] border border-[#0f172a]/10 bg-white/92 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b1461a]">
                Table management
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-[#082d24]">
                Item row dashboard for easy admin control.
              </h1>
            </div>

            <button
              type="button"
              onClick={loadItems}
              className="rounded-full border border-[#0b3b30]/10 px-5 py-3 text-sm font-semibold text-[#0b3b30] transition hover:bg-[#eff6f3]"
            >
              Refresh table
            </button>
          </div>

          <DashboardFilters
            search={search}
            setSearch={setSearch}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            categoryOptions={categoryOptions}
          />

          <DashboardStatusMessage status={status} statusTone={statusTone} />

          <ItemTable
            loading={loading}
            filteredItems={filteredItems}
            openItemModal={openItemModal}
            handleDelete={handleDelete}
            getItemId={getItemId}
            getPrimaryImage={getPrimaryImage}
            formatPrice={formatPrice}
            getLocationLabel={getLocationLabel}
            formatRelativeDate={formatRelativeDate}
          />
        </section>
      </main>

      <ItemModal
        showModal={showModal}
        selectedItem={selectedItem}
        closeModal={closeModal}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        formData={formData}
        handleChange={handleChange}
        handleUpdate={handleUpdate}
        isSaving={isSaving}
        handleDelete={handleDelete}
        buildFormFromItem={buildFormFromItem}
        status={status}
        statusTone={statusTone}
        categoryOptions={categoryOptions}
        conditionOptions={conditionOptions}
        modeOptions={modeOptions}
        formatPrice={formatPrice}
        getLocationLabel={getLocationLabel}
        formatRelativeDate={formatRelativeDate}
        getPrimaryImage={getPrimaryImage}
        setFormData={setFormData}
        setStatus={setStatus}
      />

      <DashboardFooter loadItems={loadItems} />
    </div>
  );
}

export default ItemDashboard;
