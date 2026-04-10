import { useEffect, useMemo, useRef, useState } from "react";
import ItemQuickViewModal from "../../components/item-gallery/ItemQuickViewModal";
import {
  IconCart,
  IconHeart,
  IconMapPin,
  IconSearch,
  IconSwap,
} from "../../components/item-gallery/icons";
import { useLocationPicker } from "../../hooks/useLocationPicker";
import { getItem, getItems } from "../../services/item/itemApi";
import {
  formatPrice,
  formatRelativeDate,
  getLocationLabel,
  getPrimaryImage,
} from "../../utils/itemGalleryUtils";

const DEFAULT_MAX_PRICE = 500000;
const CONDITION_OPTIONS = ["New", "Like New", "Used", "Vintage", "Refurbished"];

const distanceBetweenKm = (lat1, lng1, lat2, lng2) => {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const previewPins = [
  { left: "18%", top: "58%" },
  { left: "39%", top: "49%" },
  { left: "50%", top: "44%" },
  { left: "84%", top: "20%" },
];

const MapPreviewFallback = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 overflow-hidden bg-[#efe6db]"
  >
    <svg
      viewBox="0 0 1200 720"
      className="h-full w-full"
      preserveAspectRatio="none"
    >
      <rect width="1200" height="720" fill="#efe9df" />
      <path d="M0 0H180V720H0Z" fill="#e6ddd0" />
      <path d="M100 0 L150 0 L130 720 L80 720 Z" fill="#f8f5ef" />
      <path d="M20 0 L55 0 L35 720 L0 720 Z" fill="#f8f5ef" />
      <path d="M62 0 L92 0 L72 720 L42 720 Z" fill="#d76d7e" opacity="0.7" />
      <path
        d="M105 0 L135 0 L115 720 L85 720 Z"
        fill="#d76d7e"
        opacity="0.7"
      />
      <g
        fill="none"
        stroke="#ffffff"
        strokeWidth="28"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M275 70 C330 90, 440 85, 520 75" />
        <path d="M450 0 L520 140" />
        <path d="M645 78 L1160 78" />
        <path d="M710 115 L1180 115" />
        <path d="M600 200 L1080 200" />
        <path d="M545 255 L1130 255" />
        <path d="M740 315 L1160 315" />
        <path d="M490 150 L430 310" />
        <path d="M680 155 L625 330" />
        <path d="M635 185 L760 470" />
        <path d="M820 188 L935 462" />
        <path d="M935 265 L1025 520" />
        <path d="M235 430 L540 430" />
        <path d="M285 520 L885 520" />
        <path d="M365 620 L985 620" />
        <path d="M300 445 C340 480, 340 555, 290 590" />
        <path d="M980 580 C1080 560, 1130 610, 1180 700" />
      </g>
      <g fill="none" stroke="#cbc3b7" strokeWidth="6" opacity="0.9">
        <path d="M275 70 C330 90, 440 85, 520 75" />
        <path d="M450 0 L520 140" />
        <path d="M645 78 L1160 78" />
        <path d="M710 115 L1180 115" />
        <path d="M600 200 L1080 200" />
        <path d="M545 255 L1130 255" />
        <path d="M740 315 L1160 315" />
        <path d="M490 150 L430 310" />
        <path d="M680 155 L625 330" />
        <path d="M635 185 L760 470" />
        <path d="M820 188 L935 462" />
        <path d="M935 265 L1025 520" />
        <path d="M235 430 L540 430" />
        <path d="M285 520 L885 520" />
        <path d="M365 620 L985 620" />
        <path d="M300 445 C340 480, 340 555, 290 590" />
        <path d="M980 580 C1080 560, 1130 610, 1180 700" />
      </g>
    </svg>

    {previewPins.map((pin, index) => (
      <div
        key={index}
        className="absolute h-10 w-10 -translate-x-1/2 -translate-y-full"
        style={{ left: pin.left, top: pin.top }}
      >
        <div className="absolute left-1/2 top-[85%] h-4 w-8 -translate-x-1/2 rounded-full bg-black/25 blur-[6px]" />
        <div className="relative h-full w-full">
          <div className="absolute inset-x-[18%] top-[8%] bottom-[22%] rounded-t-full rounded-b-[45%] bg-[linear-gradient(180deg,#5aa3e0_0%,#2f6fb1_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]" />
          <div className="absolute left-1/2 top-[36%] h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/95" />
          <div className="absolute bottom-0 left-1/2 h-5 w-3 -translate-x-1/2 rotate-45 rounded-[2px] bg-[#2f6fb1]" />
        </div>
      </div>
    ))}
  </div>
);

const ItemLocationCard = ({ item, distanceKm, onQuickView }) => {
  const locationLabel = getLocationLabel(item);
  const categoryLabel = item.category || "General";
  const isSwapItem = String(item.mode || "")
    .toLowerCase()
    .includes("swap");
  const conditionText = item.condition || "Used";
  const isNewCondition = conditionText.toLowerCase().includes("new");

  return (
    <article className="group flex h-full min-h-[23rem] flex-col overflow-hidden rounded-[24px] border border-[#0b3b30]/10 bg-white shadow-[0_18px_44px_-28px_rgba(13,55,44,0.34)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_60px_-28px_rgba(13,55,44,0.46)]">
      <div className="relative">
        <img
          src={getPrimaryImage(item)}
          alt={item.title}
          className="h-48 w-full bg-[#efe6db] object-cover object-center transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] shadow-sm ${
              isNewCondition
                ? "bg-[#d1fae5] text-[#166534]"
                : "bg-[#fef3c7] text-[#854d0e]"
            }`}
          >
            {conditionText}
          </span>

          <button
            type="button"
            aria-label="Favorite item"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-[rgba(255,255,255,0.92)] text-[#0b3b30] backdrop-blur"
          >
            <IconHeart filled={false} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3
          className="min-h-[3rem] overflow-hidden text-[1.05rem] font-medium leading-6 text-[#111827] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
          title={item.title}
        >
          {item.title}
        </h3>

        <div className="flex items-end gap-2">
          {isSwapItem ? (
            <span className="rounded-full bg-[#d1fae5] px-2 py-1 text-sm font-semibold text-[#065f46]">
              Swap item
            </span>
          ) : (
            <p className="font-headline text-[1.6rem] font-bold leading-none text-[#f97316]">
              {formatPrice(item.price)}
            </p>
          )}
          <span className="pb-0.5 text-xs font-medium text-[#7b848c]">
            {formatRelativeDate(item.createdAt)}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 text-xs text-[#6b7280]">
          <span
            className="inline-flex min-w-0 flex-1 items-center gap-1.5"
            title={locationLabel}
          >
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

        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-[#e7ddd0]">
            <div
              className="h-1.5 rounded-full bg-[#c65a1c]"
              style={{
                width: `${Math.min(
                  100,
                  (item.mapDistanceKm / Math.max(distanceKm, 1)) * 100,
                )}%`,
              }}
            />
          </div>
          <span className="text-sm font-medium text-[#6d7068]">
            {item.mapDistanceKm.toFixed(2)} km away
          </span>
        </div>

        <div
          className={`grid gap-2 pt-1 ${isSwapItem ? "grid-cols-3" : "grid-cols-2"}`}
        >
          <button
            type="button"
            onClick={() => onQuickView(item.itemId)}
            className="rounded-full border border-[#d4d4d8] bg-white px-3 py-2 text-xs font-semibold text-[#0b3b30] transition hover:border-[#0b3b30] hover:bg-[#eff6f3]"
          >
            View
          </button>

          {isSwapItem ? (
            <>
              <button
                type="button"
                className="rounded-full border border-[#d4d4d8] bg-white px-3 py-2 text-xs font-semibold text-[#0b3b30] transition hover:border-[#0b3b30] hover:bg-[#eff6f3]"
              >
                Chat
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-1 rounded-full bg-[#00443d] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#003b35]"
              >
                <IconSwap /> Swap
              </button>
            </>
          ) : (
            <button
              type="button"
              className="inline-flex items-center justify-center gap-1 rounded-full bg-[#a43c12] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#8f3410]"
            >
              <IconCart /> Buy
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

const ItemLocation = () => {
  const [formData, setFormData] = useState({
    lat: "",
    lng: "",
  });
  const [itemSearch, setItemSearch] = useState("");
  const [allItems, setAllItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState("");
  const [nearbyOnly, setNearbyOnly] = useState(true);
  const [distanceKm, setDistanceKm] = useState(16);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(150000);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [displayMode, setDisplayMode] = useState("pagination");
  const [selectedItem, setSelectedItem] = useState(null);
  const [quickViewLoading, setQuickViewLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const itemMarkerLayerRef = useRef(null);

  const {
    mapRef,
    mapInstanceRef,
    locationSearch,
    setLocationSearch,
    selectedAddress,
    locationState,
    handleUseCurrentLocation,
    handleLocationSearch,
  } = useLocationPicker(setFormData);

  const isLoading = locationState.type === "loading";
  const hasCoordinates = Boolean(formData.lat && formData.lng);
  const selectedLat = Number(formData.lat);
  const selectedLng = Number(formData.lng);

  const filteredItems = useMemo(() => {
    if (!hasCoordinates) {
      return [];
    }

    const normalizedSearch = itemSearch.trim().toLowerCase();

    return allItems
      .map((item) => {
        const [lng, lat] = item.location.coordinates;
        const distance = distanceBetweenKm(selectedLat, selectedLng, lat, lng);

        return {
          ...item,
          mapDistanceKm: distance,
        };
      })
      .filter((item) => Number(item.price || 0) >= minPrice)
      .filter((item) => Number(item.price || 0) <= maxPrice)
      .filter((item) =>
        selectedConditions.length
          ? selectedConditions.includes(item.condition || "Used")
          : true,
      )
      .filter((item) => {
        if (!normalizedSearch) {
          return true;
        }

        const searchableText = [
          item.title,
          item.category,
          item.condition,
          item.mode,
          item.description,
          getLocationLabel(item),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedSearch);
      })
      .filter((item) => (nearbyOnly ? item.mapDistanceKm <= distanceKm : true))
      .sort((a, b) => a.mapDistanceKm - b.mapDistanceKm)
      .slice(0, displayMode === "pagination" ? 8 : 12);
  }, [
    allItems,
    displayMode,
    distanceKm,
    hasCoordinates,
    itemSearch,
    maxPrice,
    minPrice,
    nearbyOnly,
    selectedConditions,
    selectedLat,
    selectedLng,
  ]);

  const searchSuggestions = useMemo(() => {
    const normalizedSearch = itemSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return [];
    }

    const suggestionPool = allItems.flatMap((item) => [
      item.title,
      item.category,
      item.condition,
      item.mode,
    ]);

    return [...new Set(suggestionPool.filter(Boolean))]
      .filter((value) => value.toLowerCase().includes(normalizedSearch))
      .slice(0, 5);
  }, [allItems, itemSearch]);

  useEffect(() => {
    let ignore = false;

    const loadItems = async () => {
      setItemsLoading(true);
      setItemsError("");

      try {
        const response = await getItems({ limit: 100 });

        if (!ignore) {
          setAllItems(
            (response.data?.items || []).filter(
              (item) =>
                !item?.isHidden &&
                Array.isArray(item?.location?.coordinates) &&
                item.location.coordinates.length === 2,
            ),
          );
        }
      } catch {
        if (!ignore) {
          setItemsError("Unable to load item locations right now.");
        }
      } finally {
        if (!ignore) {
          setItemsLoading(false);
        }
      }
    };

    loadItems();

    return () => {
      ignore = true;
    };
  }, []);

  const handleClearSelection = () => {
    setFormData({ lat: "", lng: "" });
    setLocationSearch("");
  };

  const handleResetFilters = () => {
    setItemSearch("");
    setNearbyOnly(true);
    setDistanceKm(16);
    setMinPrice(0);
    setMaxPrice(150000);
    setSelectedConditions([]);
    setDisplayMode("pagination");
  };

  const handleToggleCondition = (condition) => {
    setSelectedConditions((current) =>
      current.includes(condition)
        ? current.filter((entry) => entry !== condition)
        : [...current, condition],
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

  useEffect(() => {
    if (!mapInstanceRef?.current || !window.L) {
      return;
    }

    const L = window.L;
    const map = mapInstanceRef.current;

    if (!itemMarkerLayerRef.current) {
      itemMarkerLayerRef.current = L.layerGroup().addTo(map);
    }

    const markerLayer = itemMarkerLayerRef.current;
    markerLayer.clearLayers();

    filteredItems.forEach((item) => {
      const coords = item?.location?.coordinates;

      if (
        !Array.isArray(coords) ||
        coords.length !== 2 ||
        !Number.isFinite(Number(coords[0])) ||
        !Number.isFinite(Number(coords[1]))
      ) {
        return;
      }

      const [lng, lat] = coords;
      const marker = L.marker([lat, lng]);
      const isSwapItem = String(item.mode || "")
        .toLowerCase()
        .includes("swap");

      marker.bindPopup(`
        <div style="width: 180px;">
          <img
            src="${getPrimaryImage(item)}"
            alt="${item.title}"
            style="width: 100%; height: 96px; object-fit: cover; border-radius: 12px; margin-bottom: 10px;"
          />
          <div style="font-weight: 700; color: #0a3327; margin-bottom: 4px;">${item.title}</div>
          <div style="font-size: 12px; color: #54706a; margin-bottom: 6px;">${getLocationLabel(item)}</div>
          ${
            isSwapItem
              ? `<div style="display:inline-flex; align-items:center; gap:6px; padding:7px 12px; border-radius:999px; background:#dff7ec; color:#166534; font-size:13px; font-weight:700;">
                  <span style="font-size:14px;">⇄</span>
                  <span>Swap item</span>
                </div>`
              : `<div style="font-size: 13px; font-weight: 700; color: #b1461a;">${formatPrice(item.price)}</div>`
          }
        </div>
      `, {
        offset: [0, -18],
        closeButton: true,
        autoClose: true,
        closeOnEscapeKey: true,
      });

      marker.on("mouseover", () => {
        marker.openPopup();
      });

      marker.on("mouseout", () => {
        marker.closePopup();
      });

      marker.on("touchstart", () => {
        marker.openPopup();
      });

      marker.on("click", () => {
        marker.openPopup();
        handleQuickView(item.itemId);
      });

      marker.addTo(markerLayer);
    });

    return () => {
      markerLayer.clearLayers();
    };
  }, [filteredItems, mapInstanceRef]);

  return (
    <section className="min-h-screen bg-[#f5f1ea] px-4 py-10 text-[#0a3327] md:px-8 2xl:px-10">
      <div className="mx-auto max-w-[1680px]">
        <div className="mb-8 max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#0a3327]/55">
            Item Location
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-[#0a3327]">
            Nearby Marketplace Map
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#0a3327]/65">
            Search a place, use your device location, or click directly on the
            map to find listings around the selected item location.
          </p>
        </div>

        <div className="rounded-[32px] border border-[#0a3327]/10 bg-white/90 p-5 shadow-[0_28px_80px_-42px_rgba(10,51,39,0.34)] backdrop-blur md:p-7 xl:p-8">
          <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="space-y-4 xl:order-1">
              <div className="rounded-[32px] border border-[#0b3b30]/10 bg-white/85 p-6 shadow-[0_22px_70px_-42px_rgba(11,59,48,0.44)] backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7a8c86]">
                      Filters
                    </p>
                    <h2 className="mt-2 font-headline text-3xl font-bold text-[#082d24]">
                      Refine results
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-sm font-semibold text-[#b1461a]"
                  >
                    Reset
                  </button>
                </div>

                <div className="mt-6 space-y-7">
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#103b31]">
                        Search items
                      </p>
                      <span className="text-xs uppercase tracking-[0.2em] text-[#7a8c86]">
                        {filteredItems.length} found
                      </span>
                    </div>

                    <div className="relative mt-4">
                      <span className="pointer-events-none absolute left-4 top-1/2 z-[1] -translate-y-1/2 text-[#7a8c86]">
                        <IconSearch />
                      </span>
                      <input
                        type="text"
                        value={itemSearch}
                        onChange={(event) => setItemSearch(event.target.value)}
                        placeholder="Search by title, category, condition..."
                        className="h-12 w-full rounded-[18px] border border-[#0b3b30]/10 bg-[#fcfaf5] pl-12 pr-4 text-sm text-[#103b31] outline-none transition placeholder:text-[#7a8c86] focus:border-[#b1461a]/35 focus:ring-4 focus:ring-[#b1461a]/10"
                      />

                      {searchSuggestions.length ? (
                        <div className="absolute inset-x-0 top-[calc(100%+10px)] z-10 overflow-hidden rounded-[18px] border border-[#0b3b30]/10 bg-white shadow-[0_18px_40px_-28px_rgba(11,59,48,0.35)]">
                          {searchSuggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => setItemSearch(suggestion)}
                              className="flex w-full items-center gap-3 border-b border-[#0b3b30]/6 px-4 py-3 text-left text-sm text-[#21473d] transition last:border-b-0 hover:bg-[#f7f3ea]"
                            >
                              <span className="text-[#7a8c86]">
                                <IconSearch />
                              </span>
                              <span>{suggestion}</span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#103b31]">
                        Price range
                      </p>
                      <p className="text-sm text-[#55716b]">
                        {formatPrice(minPrice)} - {formatPrice(maxPrice)}
                      </p>
                    </div>

                    <div className="mt-4 space-y-4">
                      <input
                        type="range"
                        min="0"
                        max={DEFAULT_MAX_PRICE}
                        step="1000"
                        value={minPrice}
                        onChange={(event) =>
                          setMinPrice(
                            Math.min(Number(event.target.value), maxPrice),
                          )
                        }
                        className="w-full accent-[#b1461a]"
                      />
                      <input
                        type="range"
                        min="0"
                        max={DEFAULT_MAX_PRICE}
                        step="1000"
                        value={maxPrice}
                        onChange={(event) =>
                          setMaxPrice(
                            Math.max(Number(event.target.value), minPrice),
                          )
                        }
                        className="w-full accent-[#0b3b30]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#103b31]">
                        Location filter
                      </p>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#7a8c86]">
                        {distanceKm}km nearby
                      </p>
                    </div>

                    <div className="mt-4 rounded-[24px] bg-[#f6efe4] p-4">
                      <div className="flex items-center justify-between gap-4 text-sm font-medium text-[#103b31]">
                        <span>Nearby only</span>
                        <span className="rounded-full bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b1461a]">
                          Active
                        </span>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm text-[#55716b]">
                          <span>Distance</span>
                          <span>{distanceKm} km</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="50"
                          value={distanceKm}
                          onChange={(event) =>
                            setDistanceKm(Number(event.target.value))
                          }
                          className="mt-3 w-full accent-[#b1461a]"
                        />
                      </div>

                      <p className="mt-3 text-sm text-[#55716b]">
                        {selectedAddress ||
                          "Enable your location to unlock nearby listings."}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#103b31]">
                      Condition
                    </p>
                    <div className="mt-4 grid gap-3">
                      {CONDITION_OPTIONS.map((option) => (
                        <label
                          key={option}
                          className="flex items-center justify-between rounded-[20px] border border-[#0b3b30]/10 px-4 py-3 text-sm text-[#21473d]"
                        >
                          {option}
                          <input
                            type="checkbox"
                            checked={selectedConditions.includes(option)}
                            onChange={() => handleToggleCondition(option)}
                            className="h-4 w-4 rounded border-[#0b3b30]/15 text-[#b1461a] focus:ring-[#b1461a]"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#103b31]">
                      Browse mode
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setDisplayMode("pagination")}
                        className={`rounded-[20px] px-4 py-3 text-sm font-semibold transition ${
                          displayMode === "pagination"
                            ? "bg-[#0b3b30] text-white"
                            : "bg-[#f6efe4] text-[#21473d]"
                        }`}
                      >
                        Pagination
                      </button>

                      <button
                        type="button"
                        onClick={() => setDisplayMode("infinite")}
                        className={`rounded-[20px] px-4 py-3 text-sm font-semibold transition ${
                          displayMode === "infinite"
                            ? "bg-[#b1461a] text-white"
                            : "bg-[#f6efe4] text-[#21473d]"
                        }`}
                      >
                        Infinite scroll
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <div className="rounded-[28px] bg-[linear-gradient(180deg,#f7f1e7_0%,#fbf8f2_100%)] p-5 xl:order-2">
              <p className="text-xl font-semibold text-[#34554a]">
                Location Picker
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
                <input
                  type="text"
                  value={locationSearch}
                  onChange={(event) => setLocationSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleLocationSearch();
                    }
                  }}
                  placeholder="Search your item location"
                  className="h-14 rounded-[16px] border border-[#0a3327]/10 bg-white px-5 text-sm text-[#0a3327] outline-none transition placeholder:text-[#0a3327]/35 focus:border-[#b14716]/25 focus:ring-4 focus:ring-[#b14716]/10"
                />

                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="inline-flex h-14 items-center justify-center rounded-[16px] bg-[#496546] px-6 text-sm font-bold text-white transition hover:bg-[#3f583c]"
                >
                  Current Location
                </button>

                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="inline-flex h-14 items-center justify-center rounded-[16px] border border-[#0a3327]/10 bg-white px-6 text-sm font-semibold text-[#6d7068] transition hover:bg-[#f6f2ea]"
                >
                  Clear
                </button>
              </div>

              <div className="relative mt-5 overflow-hidden rounded-[24px] border border-[#0a3327]/10 bg-[#efe6db] shadow-[0_20px_60px_-38px_rgba(10,51,39,0.45)]">
                <MapPreviewFallback />

                <div
                  ref={mapRef}
                  className="relative z-[1] h-[420px] w-full bg-transparent"
                />

                {isLoading ? (
                  <div className="absolute inset-0 z-[3] flex items-center justify-center bg-[#0a3327]/18 backdrop-blur-[2px]">
                    <div className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0a3327] shadow-lg">
                      {locationState.message || "Loading location..."}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-[22px] bg-[linear-gradient(180deg,#f7f1e7_0%,#fbf8f2_100%)] p-5 shadow-[0_15px_40px_-34px_rgba(10,51,39,0.45)]">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f9789]">
                    Selected address
                  </p>
                  <p className="mt-3 text-sm font-medium leading-7 text-[#34554a]">
                    {selectedAddress || "No location selected yet."}
                  </p>
                  {hasCoordinates ? (
                    <p className="mt-4 text-sm font-medium text-[#6d7068]">
                      L: {selectedLat.toFixed(6)} | {selectedLng.toFixed(6)}
                    </p>
                  ) : null}
                </div>

                <div className="rounded-[22px] bg-[linear-gradient(180deg,#f7f1e7_0%,#fbf8f2_100%)] p-5 shadow-[0_15px_40px_-34px_rgba(10,51,39,0.45)]">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f9789]">
                    Coordinates
                  </p>
                  <p className="mt-3 text-sm font-medium leading-7 text-[#34554a]">
                    {hasCoordinates
                      ? `${selectedLat.toFixed(6)}, ${selectedLng.toFixed(6)}`
                      : "Coordinates will appear here after selection."}
                  </p>
                  {locationState.message && !isLoading ? (
                    <p className="mt-4 text-sm font-medium text-[#5f8f4f]">
                      {locationState.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-[28px] border border-[#0a3327]/8 bg-[linear-gradient(180deg,#f8f3ea_0%,#fcfaf5_100%)] p-5 shadow-[0_24px_60px_-38px_rgba(10,51,39,0.45)]">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8f9789]">
                      Nearby collection
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-[#34554a]">
                      Filtered Items
                    </p>
                    <p className="mt-1 text-sm text-[#6d7068]">
                      Curated matches around your selected map location.
                    </p>
                  </div>

                  <span className="inline-flex w-fit items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#34554a] shadow-[0_10px_24px_-18px_rgba(10,51,39,0.45)]">
                    ({filteredItems.length})
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {itemsError ? (
                    <p className="text-sm font-medium text-red-700">
                      {itemsError}
                    </p>
                  ) : itemsLoading ? (
                    <p className="text-sm font-medium text-[#6d7068]">
                      Loading nearby items...
                    </p>
                  ) : filteredItems.length ? (
                    filteredItems.map((item) => (
                      <ItemLocationCard
                        key={item.itemId}
                        item={item}
                        distanceKm={distanceKm}
                        onQuickView={handleQuickView}
                      />
                    ))
                  ) : (
                    <p className="text-sm font-medium leading-6 text-[#6d7068]">
                      Select a location to see items within the selected radius.
                    </p>
                  )}
                </div>

                {hasCoordinates && !itemsLoading && !itemsError ? (
                  <p className="mt-4 text-sm font-medium text-[#5f8f4f]">
                    Location selected from map.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal ? (
        <ItemQuickViewModal
          item={selectedItem}
          loading={quickViewLoading}
          onClose={closeModal}
        />
      ) : null}
    </section>
  );
};

export default ItemLocation;
