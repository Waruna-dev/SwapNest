import { useEffect, useMemo, useRef, useState } from "react";
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

const decodeTokenOwnerId = () => {
  try {
    const token = localStorage.getItem("swapnest_token");
    if (!token) return "";

    const payload = token.split(".")[1];
    if (!payload) return "";

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(window.atob(normalized));
    return decoded?.id || "";
  } catch {
    return "";
  }
};

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
  lat: "",
  lng: "",
};

const getItemId = (item) => item?.itemId || item?._id || "";

const buildFormFromItem = (item) => {
  const coords = Array.isArray(item?.location?.coordinates)
    ? item.location.coordinates
    : [];

  return {
    title: item?.title || "",
    category: item?.category || "Furniture",
    condition: item?.condition || "Good",
    mode: item?.mode || "Sell",
    price: item?.price ?? "",
    description: item?.description || "",
    lat: coords[1] ?? "",
    lng: coords[0] ?? "",
  };
};

const buildExistingImageEntries = (item) =>
  Array.isArray(item?.images)
    ? item.images.slice(0, 5).map((image, index) => ({
        kind: "existing",
        id: image?.publicId || `existing-${index}`,
        name: `Image ${index + 1}`,
        url: image?.url || "",
        publicId: image?.publicId || "",
      }))
    : [];

const revokeNewImageUrls = (images = []) => {
  images.forEach((image) => {
    if (image.kind === "new" && image.url) {
      URL.revokeObjectURL(image.url);
    }
  });
};

const statusTone = (type) => {
  if (type === "success")
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (type === "error") return "border-rose-200 bg-rose-50 text-rose-800";
  return "border-[#0b3b30]/10 bg-white text-[#36524b]";
};

function ItemDashboard({ ownerOnly = false }) {
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
  const [editImages, setEditImages] = useState([]);
  const editImagesRef = useRef([]);
  const ownerId = ownerOnly ? decodeTokenOwnerId() : "";

  useEffect(() => {
    editImagesRef.current = editImages;
  }, [editImages]);

  const loadItems = async () => {
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await getItems({ limit: 100, includeHidden: true });
      const payload = response.data;
      const allItems = Array.isArray(payload) ? payload : payload.items || [];
      const nextItems = ownerOnly
        ? allItems.filter((item) => String(item?.ownerId || "") === ownerId)
        : allItems;
      setItems(nextItems);

      if (!nextItems.length) {
        revokeNewImageUrls(editImages);
        setSelectedId("");
        setFormData(emptyForm);
        setEditImages([]);
        setShowModal(false);
        setIsEditMode(false);
        return;
      }

      const current =
        nextItems.find((item) => getItemId(item) === selectedId) ||
        nextItems[0];
      revokeNewImageUrls(editImages);
      setSelectedId(getItemId(current));
      setFormData(buildFormFromItem(current));
      setEditImages(buildExistingImageEntries(current));
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
    return () => {
      revokeNewImageUrls(editImagesRef.current);
    };
  }, []);

  useEffect(() => {
    loadItems();
  }, [ownerId, ownerOnly]);

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

  useEffect(() => {
    if (!showModal) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showModal, selectedItem, editImages]);

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
      visible: items.filter((item) => !item?.isHidden).length,
      swapReady: items.filter((item) =>
        String(item?.mode || "")
          .toLowerCase()
          .includes("swap"),
      ).length,
      averagePrice,
    };
  }, [filteredItems.length, items]);

  const openItemModal = (item, mode = "view") => {
    revokeNewImageUrls(editImages);
    setSelectedId(getItemId(item));
    setFormData(buildFormFromItem(item));
    setEditImages(buildExistingImageEntries(item));
    setStatus({ type: "", message: "" });
    setShowModal(true);
    setIsEditMode(mode === "edit");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === "mode" && value === "Swap" ? { price: "" } : {}),
    }));
  };

  const closeModal = () => {
    revokeNewImageUrls(editImages);
    setEditImages(buildExistingImageEntries(selectedItem));
    setShowModal(false);
    setIsEditMode(false);
  };

  const handleEditImageChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (!selectedFiles.length) {
      return;
    }

    setEditImages((current) => {
      const remainingSlots = Math.max(0, 5 - current.length);
      const acceptedFiles = selectedFiles.slice(0, remainingSlots);
      const nextImages = acceptedFiles.map((file, index) => ({
        kind: "new",
        id: `${file.name}-${file.lastModified}-${index}`,
        name: file.name,
        url: URL.createObjectURL(file),
        file,
      }));

      return [...current, ...nextImages];
    });

    event.target.value = "";
  };

  const removeEditImage = (indexToRemove) => {
    setEditImages((current) =>
      current.filter((image, index) => {
        const shouldKeep = index !== indexToRemove;

        if (!shouldKeep && image.kind === "new" && image.url) {
          URL.revokeObjectURL(image.url);
        }

        return shouldKeep;
      }),
    );
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!selectedId) return;

    setIsSaving(true);
    setStatus({ type: "", message: "" });

    try {
      const payload = new FormData();

      Object.entries({
        ...formData,
        price: Number(formData.price || 0),
      }).forEach(([key, value]) => {
        payload.append(key, value);
      });

      payload.append(
        "keepImagePublicIds",
        JSON.stringify(
          editImages
            .filter((image) => image.kind === "existing" && image.publicId)
            .map((image) => image.publicId),
        ),
      );

      editImages
        .filter((image) => image.kind === "new" && image.file)
        .forEach((image) => {
          payload.append("images", image.file);
        });

      const response = await updateItem(selectedId, payload);
      const updatedItem = response.data?.item || response.data || payload;

      setItems((current) =>
        current.map((item) =>
          getItemId(item) === selectedId ? { ...item, ...updatedItem } : item,
        ),
      );
      revokeNewImageUrls(editImages);
      setEditImages(buildExistingImageEntries(updatedItem));

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

  const handleToggleHidden = async (item) => {
    const itemId = getItemId(item);
    if (!itemId) return;

    const nextHiddenState = !item?.isHidden;

    setStatus({ type: "", message: "" });

    try {
      const payload = new FormData();
      payload.append("isHidden", String(nextHiddenState));

      const response = await updateItem(itemId, payload);
      const updatedItem = response.data?.item || response.data || {};

      setItems((current) =>
        current.map((entry) =>
          getItemId(entry) === itemId
            ? { ...entry, ...updatedItem, isHidden: nextHiddenState }
            : entry,
        ),
      );

      setStatus({
        type: "success",
        message: nextHiddenState
          ? "Item hidden from the gallery."
          : "Item is visible in the gallery again.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Unable to update item visibility right now.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5ede2_0%,#faf6ef_36%,#e8f1ec_100%)] text-[#0a3327]">
      {/* <DashboardNavbar /> */}
      <main className="relative z-10 mx-auto max-w-[1400px] px-4 py-8 md:px-8">
        <DashboardSummaryCards summary={summary} formatPrice={formatPrice} />

        <section className="mt-6 w-full rounded-[28px] border border-[#0f172a]/10 bg-white/92 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b1461a]">
                {ownerOnly ? "My listings" : "Item management"}
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-[#082d24]">
                {ownerOnly ? "My items" : "Item dashboard"}
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
            handleToggleHidden={handleToggleHidden}
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
        editImages={editImages}
        handleEditImageChange={handleEditImageChange}
        removeEditImage={removeEditImage}
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
        setEditImages={setEditImages}
        setStatus={setStatus}
        handleToggleHidden={handleToggleHidden}
      />
      {/* <DashboardFooter loadItems={loadItems} /> */}
    </div>
  );
}

export default ItemDashboard;
