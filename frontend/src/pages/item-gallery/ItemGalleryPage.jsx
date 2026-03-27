// pages/ItemGalleryPage.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  getItem,
  getItems,
  getNearbyItems,
  getSuggestions,
} from "../../services/item/itemApi";

import MarketplaceHero from "../../components/item-gallery/MarketplaceHero";
import FilterSidebar from "../../components/item-gallery/FilterSidebar";
import ItemGrid from "../../components/item-gallery/ItemGrid";
import PaginationControls from "../../components/item-gallery/PaginationControls";
import ItemQuickViewModal from "../../components/item-gallery/ItemQuickViewModal";

const categoryOptions = [
  "All",
  "Furniture",
  "Electronics",
  "Fashion",
  "Books",
  "Home Decor",
  "Sports",
  "Collectibles",
];

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price low to high" },
  { value: "price_desc", label: "Price high to low" },
  { value: "popular", label: "Popular" },
];

const DEFAULT_MAX_PRICE = 500000;

const initialFilters = {
  search: "",
  category: "All",
  minPrice: 0,
  maxPrice: 150000,
  condition: [],
  sort: "newest",
  useNearby: false,
  distance: 5,
};

const cardSkeletons = Array.from({ length: 8 }, (_, index) => index);

function ItemGalleryPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [displayMode, setDisplayMode] = useState("pagination");
  const [selectedItem, setSelectedItem] = useState(null);
  const [quickViewLoading, setQuickViewLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [locationState, setLocationState] = useState({
    status: "idle",
    coords: null,
    message: "",
  });
  const [suggestions, setSuggestions] = useState([]);
  const sentinelRef = useRef(null);

  const hasMore = page < totalPages;

  const buildParams = useCallback(
    (nextPage) => {
      const params = { page: nextPage, limit: 12, sort: filters.sort };

      if (filters.search.trim()) params.q = filters.search.trim();
      if (filters.category !== "All") params.category = filters.category;
      if (filters.minPrice > 0) params.minPrice = filters.minPrice;
      if (filters.maxPrice < DEFAULT_MAX_PRICE)
        params.maxPrice = filters.maxPrice;
      if (filters.condition.length)
        params.condition = filters.condition.join(",");

      if (filters.useNearby && locationState.coords) {
        params.lat = locationState.coords.latitude;
        params.lng = locationState.coords.longitude;
        params.distance = filters.distance;
      }

      return params;
    },
    [filters, locationState.coords],
  );

  const loadItems = useCallback(
    async (nextPage = 1, append = false) => {
      const isLoadingMore = append && nextPage > 1;
      setError("");

      if (isLoadingMore) setLoadingMore(true);
      else setLoading(true);

      try {
        const params = buildParams(nextPage);
        const response =
          filters.useNearby && locationState.coords
            ? await getNearbyItems(params)
            : await getItems(params);

        const payload = response.data;

        // Filter out items that are not active (have pending swaps)
        const nextItems = (payload.items || []).filter((item) => {
          // Only show items that are active and don't have pending swaps
          return item.isActive !== false;
        });

        setItems((current) => (append ? [...current, ...nextItems] : nextItems));
        setPage(payload.page || nextPage);
        setTotalPages(payload.totalPages || 1);
        setTotalItems(payload.totalItems || 0);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Unable to load listings right now.",
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [buildParams, filters.useNearby, locationState.coords],
  );

  // Handle swap success - refresh items list
  const handleSwapSuccess = useCallback((swap) => {
    console.log("Swap successful, refreshing items:", swap);
    // Reload items to hide the swapped item
    loadItems(1, false);
    // Optional: Show success notification
    // You can add a toast notification here
  }, [loadItems]);

  // Handle swap status change from ItemCard
  const handleSwapStatusChange = useCallback((itemId, status) => {
    console.log(`Item ${itemId} status changed to: ${status}`);
    // Refresh items to reflect the status change
    loadItems(1, false);
  }, [loadItems]);

  useEffect(() => {
    loadItems(1, false);
  }, [loadItems]);

  useEffect(() => {
    if (!filters.search.trim()) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await getSuggestions({
          q: filters.search.trim(),
          limit: 6,
        });
        setSuggestions(response.data?.suggestions || []);
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [filters.search]);

  useEffect(() => {
    if (displayMode !== "infinite" || !hasMore || loading || loadingMore)
      return;

    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadItems(page + 1, true);
      },
      { rootMargin: "240px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [displayMode, hasMore, loadItems, loading, loadingMore, page]);

  useEffect(() => {
    if (!showModal) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowModal(false);
        setSelectedItem(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showModal]);

  const categoryCounts = useMemo(() => {
    const counts = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});
    counts.All = totalItems;
    return counts;
  }, [items, totalItems]);

  const paginationNumbers = useMemo(() => {
    if (totalPages <= 1) return [1];
    const numbers = new Set([1, totalPages, page - 1, page, page + 1]);
    return [...numbers]
      .filter((value) => value >= 1 && value <= totalPages)
      .sort((a, b) => a - b);
  }, [page, totalPages]);

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const toggleCondition = (value) => {
    setFilters((current) => {
      const nextConditions = current.condition.includes(value)
        ? current.condition.filter((entry) => entry !== value)
        : [...current.condition, value];

      return { ...current, condition: nextConditions };
    });
  };

  const handleToggleFavorite = (itemId) => {
    setFavorites((current) =>
      current.includes(itemId)
        ? current.filter((entry) => entry !== itemId)
        : [...current, itemId],
    );
  };

  const handleQuickView = async (itemId) => {
    setShowModal(true);
    setQuickViewLoading(true);

    try {
      const response = await getItem(itemId);
      setSelectedItem(response.data);
    } catch {
      setSelectedItem(null);
    } finally {
      setQuickViewLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const requestNearbyAccess = () => {
    if (!navigator.geolocation) {
      setLocationState({
        status: "error",
        coords: null,
        message: "Geolocation is not supported in this browser.",
      });
      return;
    }

    setLocationState({ status: "loading", coords: null, message: "" });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationState({
          status: "success",
          coords: position.coords,
          message: "Nearby listings enabled.",
        });
        setFilters((current) => ({ ...current, useNearby: true }));
      },
      () => {
        setLocationState({
          status: "error",
          coords: null,
          message:
            "Location access was denied. You can still browse all listings.",
        });
        setFilters((current) => ({ ...current, useNearby: false }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setSuggestions([]);
    setLocationState({ status: "idle", coords: null, message: "" });
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7efdf_0%,#fbf7ef_38%,#edf5f1_100%)] text-[#0a3327]">
      <MarketplaceHero
        filters={filters}
        totalItems={totalItems}
        favoritesCount={favorites.length}
        suggestions={suggestions}
        categoryOptions={categoryOptions}
        categoryCounts={categoryCounts}
        sortOptions={sortOptions}
        locationState={locationState}
        onFilterChange={handleFilterChange}
        onRequestLocation={requestNearbyAccess}
      />

      <main className="mx-auto w-full max-w-[1850px] px-4 py-10 sm:px-6 xl:px-8 2xl:px-10">
        <div className="grid gap-8 xl:grid-cols-[295px_minmax(0,1fr)]">
          <FilterSidebar
            filters={filters}
            displayMode={displayMode}
            locationState={locationState}
            onFilterChange={handleFilterChange}
            onToggleCondition={toggleCondition}
            onReset={handleReset}
            setDisplayMode={setDisplayMode}
          />

          <section>
            <div className="mb-6 flex flex-col gap-4 rounded-[30px] border border-[#0b3b30]/10 bg-white/80 p-5 shadow-[0_20px_60px_-42px_rgba(11,59,48,0.4)] backdrop-blur md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-[#55716b]">
                  Showing curated cards with larger visuals, quick actions, and
                  seller highlights.
                </p>
                {error ? (
                  <p className="mt-2 text-sm font-medium text-[#b1461a]">
                    {error}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/item/new"
                  className="rounded-full border border-[#0b3b30]/12 px-5 py-3 text-sm font-semibold text-[#0b3b30] transition hover:bg-[#f3f8f6]"
                >
                  List new item
                </Link>

                <button
                  type="button"
                  onClick={() => loadItems(1, false)}
                  className="rounded-full bg-[#b1461a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9b3a12]"
                >
                  Refresh results
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {cardSkeletons.map((value) => (
                  <div
                    key={value}
                    className="overflow-hidden rounded-[30px] border border-[#0b3b30]/8 bg-white/80 p-4"
                  >
                    <div className="h-72 animate-pulse rounded-[24px] bg-[#e8e1d6]" />
                    <div className="mt-4 h-8 animate-pulse rounded-full bg-[#efe7db]" />
                    <div className="mt-3 h-4 animate-pulse rounded-full bg-[#f3ecdf]" />
                    <div className="mt-6 h-12 animate-pulse rounded-[18px] bg-[#efe7db]" />
                  </div>
                ))}
              </div>
            ) : items.length ? (
              <>
                <ItemGrid
                  items={items}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onQuickView={handleQuickView}
                  onSwapSuccess={handleSwapSuccess}
                  onSwapStatusChange={handleSwapStatusChange}
                />

                {displayMode === "pagination" ? (
                  <PaginationControls
                    page={page}
                    totalPages={totalPages}
                    paginationNumbers={paginationNumbers}
                    onPageChange={(value) => loadItems(value, false)}
                  />
                ) : (
                  <div
                    ref={sentinelRef}
                    className="mt-8 rounded-[28px] border border-dashed border-[#0b3b30]/15 bg-white/70 px-5 py-6 text-center text-sm text-[#55716b]"
                  >
                    {loadingMore
                      ? "Loading more listings..."
                      : hasMore
                        ? "Scroll a little more to load the next set of items."
                        : "You have reached the end of the gallery."}
                  </div>
                )}
              </>
            ) : (
              <div className="grid min-h-[420px] place-items-center rounded-[34px] border border-dashed border-[#0b3b30]/18 bg-white/75 p-10 text-center shadow-[0_20px_65px_-45px_rgba(11,59,48,0.45)]">
                <div className="max-w-md">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#b1461a]">
                    No matches yet
                  </p>
                  <h3 className="mt-4 font-headline text-4xl font-bold text-[#082d24]">
                    Try widening your search or resetting the filters.
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-[#55716b]">
                    Nearby mode, multiple conditions, and tighter price ranges
                    can narrow results quickly. Resetting gives you the full
                    gallery again.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {showModal ? (
        <ItemQuickViewModal
          item={selectedItem}
          loading={quickViewLoading}
          onClose={closeModal}
        />
      ) : null}
    </div>
  );
}

export default ItemGalleryPage;