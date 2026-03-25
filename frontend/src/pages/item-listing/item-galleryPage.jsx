import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getItem, getItems, getNearbyItems, getSuggestions } from "../../services/item/itemApi";

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
const sriLankaLocationHints = [
  { name: "Colombo", lat: 6.93, lng: 79.86 },
  { name: "Dehiwala", lat: 6.85, lng: 79.86 },
  { name: "Sri Jayawardenepura", lat: 6.89, lng: 79.92 },
  { name: "Negombo", lat: 7.21, lng: 79.84 },
  { name: "Galle", lat: 6.05, lng: 80.22 },
  { name: "Kandy", lat: 7.29, lng: 80.63 },
  { name: "Kurunegala", lat: 7.49, lng: 80.36 },
  { name: "Jaffna", lat: 9.67, lng: 80.01 },
  { name: "Matara", lat: 5.95, lng: 80.54 },
  { name: "Batticaloa", lat: 7.71, lng: 81.69 },
];

function formatPrice(price) {
  const value = Number(price || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatRelativeDate(dateString) {
  if (!dateString) return "Recently listed";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  if (diffDays === 0) return "Listed today";
  if (diffDays === 1) return "Listed yesterday";
  if (diffDays < 7) return `Listed ${diffDays} days ago`;
  return new Date(dateString).toLocaleDateString();
}

function getPrimaryImage(item) {
  return (
    item?.coverImage?.url ||
    item?.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80"
  );
}

function getLocationLabel(item) {
  const coords = item?.location?.coordinates;
  if (item?.distanceMeters) return `${(item.distanceMeters / 1000).toFixed(1)} km away`;
  if (Array.isArray(coords) && coords.length === 2) {
    const [lng, lat] = coords;
    const nearestCity = sriLankaLocationHints
      .map((entry) => ({
        ...entry,
        score: Math.abs(entry.lat - lat) + Math.abs(entry.lng - lng),
      }))
      .sort((a, b) => a.score - b.score)[0];

    if (nearestCity && nearestCity.score < 0.75) {
      return nearestCity.name;
    }

    return "Selected area";
  }
  return "Location unavailable";
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function IconHeart({ filled = false }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path d="M12 20.5l-1.2-1.1C5.1 14.2 2 11.4 2 7.9A4.9 4.9 0 0 1 6.9 3 5.5 5.5 0 0 1 12 5.6 5.5 5.5 0 0 1 17.1 3 4.9 4.9 0 0 1 22 7.9c0 3.5-3.1 6.3-8.8 11.5L12 20.5Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s6-5.6 6-11a6 6 0 1 0-12 0c0 5.4 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}

function IconChevron({ direction = "right" }) {
  const rotate = direction === "left" ? "rotate(180 12 12)" : "rotate(0 12 12)";
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <g transform={rotate}>
        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function IconCart() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="19" r="1.4" />
      <circle cx="17" cy="19" r="1.4" />
      <path d="M3 5h2l2.1 9.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 8H7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSwap() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 7h11" strokeLinecap="round" />
      <path d="M14 4l4 3-4 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 17H6" strokeLinecap="round" />
      <path d="M10 14l-4 3 4 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ItemCard({ item, isFavorite, onToggleFavorite, onQuickView }) {
  const locationLabel = getLocationLabel(item);
  const categoryLabel = item.category || "General";
  const isSwapItem = String(item.mode || "").toLowerCase().includes("swap");

  return (
    <article className="group flex h-full min-h-[21rem] flex-col overflow-hidden rounded-[20px] border border-[#0b3b30]/10 bg-white shadow-[0_16px_40px_-28px_rgba(13,55,44,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_-28px_rgba(13,55,44,0.45)]">
      <div className="relative">
        <img
          src={getPrimaryImage(item)}
          alt={item.title}
          className="h-40 w-full bg-[#efe6db] object-cover object-center transition duration-500 group-hover:scale-[1.03] sm:h-44"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0b3b30] shadow-sm">
            {item.condition || "Used"}
          </span>
          <button type="button" onClick={() => onToggleFavorite(item.itemId)} className={`inline-flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur ${isFavorite ? "border-[#b1461a] bg-[#b1461a] text-white" : "border-white/70 bg-white/92 text-[#0b3b30]"}`} aria-label="Toggle favorite">
            <IconHeart filled={isFavorite} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        <h3
          className="min-h-[2.8rem] overflow-hidden text-[1.05rem] font-medium leading-5 text-[#111827] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
          title={item.title}
        >
          {item.title}
        </h3>

        <div className="flex items-end gap-2">
          <p className="font-headline text-[1.6rem] font-bold leading-none text-[#f97316]">
            {formatPrice(item.price)}
          </p>
          <span className="pb-0.5 text-xs font-medium text-[#7b848c]">
            {formatRelativeDate(item.createdAt)}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 text-xs text-[#6b7280]">
          <span className="inline-flex min-w-0 flex-1 items-center gap-1.5" title={locationLabel}>
            <span className="shrink-0">
              <IconMapPin />
            </span>
            <span className="truncate font-medium">{locationLabel}</span>
          </span>
          <span
            className="max-w-[42%] truncate rounded-full bg-[#f4f4f5] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#71717a]"
            title={categoryLabel}
          >
            {categoryLabel}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => onQuickView(item.itemId)}
            className="rounded-full border border-[#d4d4d8] bg-white px-3 py-2 text-xs font-semibold text-[#0b3b30] transition hover:border-[#0b3b30] hover:bg-[#eff6f3]"
          >
            Quick view
          </button>
          {isSwapItem ? (
            <button
              type="button"
              className="inline-flex items-center justify-center gap-1 rounded-full border border-[#b1461a]/18 bg-[#fff2e9] px-3 py-2 text-xs font-semibold text-[#b1461a] transition hover:bg-[#ffe6d7]"
            >
              <IconSwap />
              Swap
            </button>
          ) : (
            <button
              type="button"
              className="rounded-full border border-[#d4d4d8] bg-white px-3 py-2 text-xs font-semibold text-[#0b3b30] transition hover:border-[#0b3b30] hover:bg-[#eff6f3]"
            >
              Chat
            </button>
          )}
          <button
            type="button"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#f97316] px-3 py-2 text-xs font-semibold text-white shadow-[0_16px_30px_-22px_rgba(249,115,22,0.95)] transition hover:translate-y-[-1px] hover:bg-[#ea580c]"
          >
            <IconCart />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
function ItemQuickViewModal({ item, loading, onClose }) {
  if (!item && !loading) return null;
  const isSwapItem = String(item?.mode || "").toLowerCase().includes("swap");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07261f]/70 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[34px] bg-[#fffdf9] shadow-[0_35px_120px_-40px_rgba(0,0,0,0.65)]">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[#0b3b30] shadow-md" aria-label="Close quick view">x</button>
        {loading ? (
          <div className="grid min-h-[420px] place-items-center text-[#0b3b30]">Loading item details...</div>
        ) : (
          <div className="grid max-h-[92vh] overflow-y-auto lg:grid-cols-[1.15fr_0.85fr]">
            <div className="bg-[radial-gradient(circle_at_top,#f7c99a_0%,#eddfca_33%,#d6ece5_100%)] p-5">
              <img src={getPrimaryImage(item)} alt={item?.title} className="h-[420px] w-full rounded-[28px] object-cover shadow-[0_25px_80px_-35px_rgba(0,0,0,0.55)]" />
              {!!item?.images?.length && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {item.images.slice(0, 4).map((image) => (
                    <img key={image.publicId || image.url} src={image.url} alt={item.title} className="h-24 w-full rounded-[18px] object-cover" />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6 p-7">
              <div className="space-y-3 border-b border-[#0b3b30]/10 pb-5">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#7f8e89]">
                  <span>{item?.category || "General"}</span>
                  <span>{item?.condition || "Used"}</span>
                  <span>{item?.mode || "Buy"}</span>
                </div>
                <h2 className="font-headline text-4xl font-bold leading-tight text-[#082d24]">{item?.title}</h2>
                <p className="font-headline text-3xl font-bold text-[#b1461a]">{formatPrice(item?.price)}</p>
              </div>

              <div className="grid gap-4 rounded-[26px] bg-[#f4ece1] p-5 text-sm text-[#163f35]">
                <p>{item?.description || "No description has been added for this item yet."}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[18px] bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#7f8e89]">Location</p>
                    <p className="mt-1 font-semibold">{getLocationLabel(item)}</p>
                  </div>
                  <div className="rounded-[18px] bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#7f8e89]">Seller contact</p>
                    <p className="mt-1 font-semibold">{item?.contact || "Contact details not available"}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" className="flex-1 rounded-full bg-[#b1461a] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_45px_-25px_rgba(177,70,26,0.95)] transition hover:bg-[#99360f]">
                  Add to cart
                </button>
                {isSwapItem ? (
                  <button type="button" className="flex-1 rounded-full border border-[#b1461a]/18 bg-[#fff4ec] px-5 py-4 text-sm font-semibold text-[#b1461a] transition hover:bg-[#ffebdb]">
                    Swap item
                  </button>
                ) : (
                  <button type="button" className="flex-1 rounded-full border border-[#0b3b30]/15 px-5 py-4 text-sm font-semibold text-[#0b3b30] transition hover:bg-[#eef5f2]">
                    Chat with seller
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
  const [locationState, setLocationState] = useState({ status: "idle", coords: null, message: "" });
  const [suggestions, setSuggestions] = useState([]);
  const sentinelRef = useRef(null);

  const hasMore = page < totalPages;

  const buildParams = useCallback((nextPage) => {
    const params = { page: nextPage, limit: 12, sort: filters.sort };
    if (filters.search.trim()) params.q = filters.search.trim();
    if (filters.category !== "All") params.category = filters.category;
    if (filters.minPrice > 0) params.minPrice = filters.minPrice;
    if (filters.maxPrice < DEFAULT_MAX_PRICE) params.maxPrice = filters.maxPrice;
    if (filters.condition.length) params.condition = filters.condition.join(",");
    if (filters.useNearby && locationState.coords) {
      params.lat = locationState.coords.latitude;
      params.lng = locationState.coords.longitude;
      params.distance = filters.distance;
    }
    return params;
  }, [filters, locationState.coords]);

  const loadItems = useCallback(async (nextPage = 1, append = false) => {
    const isLoadingMore = append && nextPage > 1;
    setError("");
    if (isLoadingMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const params = buildParams(nextPage);
      const response = filters.useNearby && locationState.coords ? await getNearbyItems(params) : await getItems(params);
      const payload = response.data;
      setItems((current) => (append ? [...current, ...(payload.items || [])] : payload.items || []));
      setPage(payload.page || nextPage);
      setTotalPages(payload.totalPages || 1);
      setTotalItems(payload.totalItems || 0);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load listings right now.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [buildParams, filters.useNearby, locationState.coords]);

  useEffect(() => { loadItems(1, false); }, [loadItems]);

  useEffect(() => {
    if (!filters.search.trim()) {
      setSuggestions([]);
      return undefined;
    }
    const timeoutId = setTimeout(async () => {
      try {
        const response = await getSuggestions({ q: filters.search.trim(), limit: 6 });
        setSuggestions(response.data?.suggestions || []);
      } catch {
        setSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [filters.search]);

  useEffect(() => {
    if (displayMode !== "infinite" || !hasMore || loading || loadingMore) return undefined;
    const node = sentinelRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) loadItems(page + 1, true);
    }, { rootMargin: "240px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [displayMode, hasMore, loadItems, loading, loadingMore, page]);

  useEffect(() => {
    if (!showModal) return undefined;
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
    return [...numbers].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b);
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
    setFavorites((current) => current.includes(itemId) ? current.filter((entry) => entry !== itemId) : [...current, itemId]);
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
      setLocationState({ status: "error", coords: null, message: "Geolocation is not supported in this browser." });
      return;
    }

    setLocationState({ status: "loading", coords: null, message: "" });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationState({ status: "success", coords: position.coords, message: "Nearby listings enabled." });
        setFilters((current) => ({ ...current, useNearby: true }));
      },
      () => {
        setLocationState({ status: "error", coords: null, message: "Location access was denied. You can still browse all listings." });
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
      <section className="relative overflow-hidden border-b border-[#0b3b30]/8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#f6c18c_0%,transparent_30%),radial-gradient(circle_at_top_right,#a6d6ca_0%,transparent_28%),linear-gradient(135deg,#f8edd8_0%,#fdfaf4_55%,#ebf6f1_100%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-8 md:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#b1461a]">Marketplace Gallery</p>
              <h1 className="mt-4 font-headline text-5xl font-extrabold leading-[0.95] text-[#082d24] md:text-7xl">Discover local finds with sharper search and cleaner browsing.</h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#47615c]">Browse a polished card grid, narrow listings by price and distance, and open quick-view details without losing your place.</p>
            </div>

            <div className="rounded-[30px] border border-white/70 bg-white/75 p-5 shadow-[0_24px_75px_-40px_rgba(11,59,48,0.45)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7a8c86]">Live browse</p>
              <div className="mt-3 flex items-end gap-8">
                <div><p className="font-headline text-4xl font-bold text-[#082d24]">{totalItems}</p><p className="text-sm text-[#47615c]">items matched</p></div>
                <div><p className="font-headline text-4xl font-bold text-[#082d24]">{favorites.length}</p><p className="text-sm text-[#47615c]">favorites saved</p></div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[34px] border border-white/70 bg-white/85 p-4 shadow-[0_26px_90px_-42px_rgba(11,59,48,0.42)] backdrop-blur md:p-5">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.7fr_auto]">
              <div className="relative">
                <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#54706a]"><IconSearch /></span>
                <input type="text" value={filters.search} onChange={(event) => handleFilterChange("search", event.target.value)} placeholder="Search by title, style, or keyword" className="w-full rounded-full border border-[#0b3b30]/10 bg-[#f7f0e5] py-4 pl-14 pr-5 text-sm text-[#0a3327] outline-none transition focus:border-[#b1461a] focus:bg-white" />
                {!!suggestions.length && filters.search.trim() && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-20 overflow-hidden rounded-[24px] border border-[#0b3b30]/10 bg-white shadow-[0_18px_55px_-30px_rgba(11,59,48,0.45)]">
                    {suggestions.map((suggestion) => (
                      <button type="button" key={suggestion} onClick={() => handleFilterChange("search", suggestion)} className="block w-full border-b border-[#0b3b30]/6 px-5 py-3 text-left text-sm text-[#22443c] transition last:border-b-0 hover:bg-[#f7efe3]">{suggestion}</button>
                    ))}
                  </div>
                )}
              </div>

              <select value={filters.sort} onChange={(event) => handleFilterChange("sort", event.target.value)} className="rounded-full border border-[#0b3b30]/10 bg-[#f7f0e5] px-5 py-4 text-sm text-[#0a3327] outline-none transition focus:border-[#b1461a]">
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>Sort by {option.label}</option>
                ))}
              </select>

              <button type="button" onClick={requestNearbyAccess} className="rounded-full bg-[#0b3b30] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#082d24]">
                {locationState.status === "loading" ? "Finding you..." : "Use my location"}
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {categoryOptions.map((category) => (
                <button type="button" key={category} onClick={() => handleFilterChange("category", category)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filters.category === category ? "bg-[#b1461a] text-white" : "bg-[#f7f0e5] text-[#21473d] hover:bg-[#efe4d4]"}`}>
                  {category} <span className="opacity-70">({categoryCounts[category] ?? 0})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1850px] px-4 py-10 sm:px-6 xl:px-8 2xl:px-10">
        <div className="grid gap-8 xl:grid-cols-[295px_minmax(0,1fr)]">
          <aside className="h-fit rounded-[32px] border border-[#0b3b30]/10 bg-white/85 p-6 shadow-[0_22px_70px_-42px_rgba(11,59,48,0.44)] backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7a8c86]">Filters</p>
                <h2 className="mt-2 font-headline text-3xl font-bold text-[#082d24]">Refine results</h2>
              </div>
              <button type="button" onClick={handleReset} className="text-sm font-semibold text-[#b1461a]">Reset</button>
            </div>

            <div className="mt-6 space-y-7">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#103b31]">Price range</p>
                  <p className="text-sm text-[#55716b]">{formatPrice(filters.minPrice)} - {formatPrice(filters.maxPrice)}</p>
                </div>
                <div className="mt-4 space-y-4">
                  <input type="range" min="0" max={DEFAULT_MAX_PRICE} step="1000" value={filters.minPrice} onChange={(event) => handleFilterChange("minPrice", Math.min(Number(event.target.value), filters.maxPrice))} className="w-full accent-[#b1461a]" />
                  <input type="range" min="0" max={DEFAULT_MAX_PRICE} step="1000" value={filters.maxPrice} onChange={(event) => handleFilterChange("maxPrice", Math.max(Number(event.target.value), filters.minPrice))} className="w-full accent-[#0b3b30]" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#103b31]">Location filter</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#7a8c86]">5km nearby</p>
                </div>
                <div className="mt-4 rounded-[24px] bg-[#f6efe4] p-4">
                  <label className="flex items-center justify-between gap-4 text-sm font-medium text-[#103b31]">
                    Nearby only
                    <input type="checkbox" checked={filters.useNearby} disabled={!locationState.coords} onChange={(event) => handleFilterChange("useNearby", event.target.checked)} className="h-5 w-5 rounded border-[#0b3b30]/20 text-[#b1461a] focus:ring-[#b1461a]" />
                  </label>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-[#55716b]"><span>Distance</span><span>{filters.distance} km</span></div>
                    <input type="range" min="1" max="25" value={filters.distance} onChange={(event) => handleFilterChange("distance", Number(event.target.value))} className="mt-3 w-full accent-[#b1461a]" />
                  </div>
                  <p className="mt-3 text-sm text-[#55716b]">{locationState.message || "Enable your location to unlock nearby listings."}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-[#103b31]">Condition</p>
                <div className="mt-4 grid gap-3">
                  {["New", "Like New", "Used", "Vintage", "Refurbished"].map((option) => (
                    <label key={option} className="flex items-center justify-between rounded-[20px] border border-[#0b3b30]/10 px-4 py-3 text-sm text-[#21473d]">
                      {option}
                      <input type="checkbox" checked={filters.condition.includes(option)} onChange={() => toggleCondition(option)} className="h-4 w-4 rounded border-[#0b3b30]/15 text-[#b1461a] focus:ring-[#b1461a]" />
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#103b31]">Browse mode</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setDisplayMode("pagination")} className={`rounded-[20px] px-4 py-3 text-sm font-semibold transition ${displayMode === "pagination" ? "bg-[#0b3b30] text-white" : "bg-[#f6efe4] text-[#21473d]"}`}>Pagination</button>
                  <button type="button" onClick={() => setDisplayMode("infinite")} className={`rounded-[20px] px-4 py-3 text-sm font-semibold transition ${displayMode === "infinite" ? "bg-[#b1461a] text-white" : "bg-[#f6efe4] text-[#21473d]"}`}>Infinite scroll</button>
                </div>
              </div>
            </div>
          </aside>

          <section>
            <div className="mb-6 flex flex-col gap-4 rounded-[30px] border border-[#0b3b30]/10 bg-white/80 p-5 shadow-[0_20px_60px_-42px_rgba(11,59,48,0.4)] backdrop-blur md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-[#55716b]">Showing curated cards with larger visuals, quick actions, and seller highlights.</p>
                {error ? <p className="mt-2 text-sm font-medium text-[#b1461a]">{error}</p> : null}
              </div>
              <div className="flex items-center gap-3">
                <Link to="/items/new" className="rounded-full border border-[#0b3b30]/12 px-5 py-3 text-sm font-semibold text-[#0b3b30] transition hover:bg-[#f3f8f6]">List new item</Link>
                <button type="button" onClick={() => loadItems(1, false)} className="rounded-full bg-[#b1461a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9b3a12]">Refresh results</button>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {cardSkeletons.map((value) => (
                  <div key={value} className="overflow-hidden rounded-[30px] border border-[#0b3b30]/8 bg-white/80 p-4">
                    <div className="h-72 animate-pulse rounded-[24px] bg-[#e8e1d6]" />
                    <div className="mt-4 h-8 animate-pulse rounded-full bg-[#efe7db]" />
                    <div className="mt-3 h-4 animate-pulse rounded-full bg-[#f3ecdf]" />
                    <div className="mt-6 h-12 animate-pulse rounded-[18px] bg-[#efe7db]" />
                  </div>
                ))}
              </div>
            ) : items.length ? (
              <>
                <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {items.map((item) => (
                    <ItemCard key={item.itemId} item={item} isFavorite={favorites.includes(item.itemId)} onToggleFavorite={handleToggleFavorite} onQuickView={handleQuickView} />
                  ))}
                </div>

                {displayMode === "pagination" ? (
                  <div className="mt-8 rounded-[30px] border border-[#0b3b30]/10 bg-[linear-gradient(135deg,#fdf9f1_0%,#eef6f3_100%)] px-5 py-5 text-sm text-[#21473d] shadow-[0_18px_50px_-40px_rgba(11,59,48,0.42)]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7b8d87]">Curated pages</p>
                        <p className="mt-2 font-headline text-2xl font-bold text-[#082d24]">
                          Page {page} of {totalPages}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={() => loadItems(page - 1, false)} disabled={page <= 1} className="inline-flex items-center gap-2 rounded-full border border-[#0b3b30]/12 bg-white px-4 py-2.5 font-semibold disabled:cursor-not-allowed disabled:opacity-45"><IconChevron direction="left" />Previous</button>
                        {paginationNumbers.map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => loadItems(value, false)}
                            className={`inline-flex h-11 min-w-11 items-center justify-center rounded-full px-4 font-semibold transition ${
                              value === page
                                ? "bg-[#b1461a] text-white shadow-[0_16px_34px_-20px_rgba(177,70,26,0.9)]"
                                : "border border-[#0b3b30]/10 bg-white text-[#21473d] hover:bg-[#f7efe4]"
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                        <button type="button" onClick={() => loadItems(page + 1, false)} disabled={page >= totalPages} className="inline-flex items-center gap-2 rounded-full bg-[#0b3b30] px-4 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45">Next<IconChevron /></button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div ref={sentinelRef} className="mt-8 rounded-[28px] border border-dashed border-[#0b3b30]/15 bg-white/70 px-5 py-6 text-center text-sm text-[#55716b]">
                    {loadingMore ? "Loading more listings..." : hasMore ? "Scroll a little more to load the next set of items." : "You have reached the end of the gallery."}
                  </div>
                )}
              </>
            ) : (
              <div className="grid min-h-[420px] place-items-center rounded-[34px] border border-dashed border-[#0b3b30]/18 bg-white/75 p-10 text-center shadow-[0_20px_65px_-45px_rgba(11,59,48,0.45)]">
                <div className="max-w-md">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#b1461a]">No matches yet</p>
                  <h3 className="mt-4 font-headline text-4xl font-bold text-[#082d24]">Try widening your search or resetting the filters.</h3>
                  <p className="mt-4 text-sm leading-7 text-[#55716b]">Nearby mode, multiple conditions, and tighter price ranges can narrow results quickly. Resetting gives you the full gallery again.</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {showModal ? <ItemQuickViewModal item={selectedItem} loading={quickViewLoading} onClose={closeModal} /> : null}
    </div>
  );
}

export default ItemGalleryPage;

