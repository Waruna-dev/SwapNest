import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createItem } from "../../services/item/itemApi";

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
const defaultMapCenter = { lat: 6.9271, lng: 79.8612 };

const initialForm = {
  title: "",
  description: "",
  price: "",
  category: "Fashion",
  mode: "Swap",
  condition: "Used",
  contact: "",
  ownerId: "",
  lat: "",
  lng: "",
};

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

const loadLeafletAssets = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Leaflet can only load in the browser."));
  }

  if (window.L) {
    return Promise.resolve(window.L);
  }

  const existingStylesheet = document.querySelector(
    'link[data-leaflet="swapnest"]',
  );
  if (!existingStylesheet) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.dataset.leaflet = "swapnest";
    document.head.appendChild(link);
  }

  const existingScript = document.querySelector(
    'script[data-leaflet="swapnest"]',
  );
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener("load", () => resolve(window.L));
      existingScript.addEventListener("error", () =>
        reject(new Error("Unable to load the OpenStreetMap map assets.")),
      );
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.defer = true;
    script.dataset.leaflet = "swapnest";
    script.onload = () => resolve(window.L);
    script.onerror = () =>
      reject(new Error("Unable to load the OpenStreetMap map assets."));
    document.head.appendChild(script);
  });
};

const ItemAddNewItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [locationState, setLocationState] = useState({
    type: "",
    message: "",
  });
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      ownerId: current.ownerId || decodeTokenOwnerId(),
    }));
  }, []);

  useEffect(() => {
    if (images.length === 0) {
      setImagePreviews([]);
      return undefined;
    }

    const previews = images.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setImagePreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [images]);

  const isSwapOnly = formData.mode === "Swap";

  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      try {
        const L = await loadLeafletAssets();
        if (!isMounted) return;

        const initialCenter = defaultMapCenter;

        const map = L.map(mapRef.current).setView(
          [initialCenter.lat, initialCenter.lng],
          11,
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        const marker = L.marker([initialCenter.lat, initialCenter.lng]).addTo(
          map,
        );

        mapInstanceRef.current = map;
        markerRef.current = marker;

        map.on("click", async (event) => {
          const lat = event.latlng?.lat;
          const lng = event.latlng?.lng;
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

          marker.setLatLng([lat, lng]);
          map.setView([lat, lng], 15);
          setFormData((current) => ({
            ...current,
            lat: String(lat),
            lng: String(lng),
          }));

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            );
            const results = await response.json();
            if (results?.display_name) {
              const address = results.display_name;
              setSelectedAddress(address);
              setLocationSearch(address);
              setLocationState({
                type: "success",
                message: "Map location selected successfully.",
              });
            } else {
              setSelectedAddress("Selected map point");
              setLocationState({
                type: "success",
                message: "Map point selected. Address could not be resolved.",
              });
            }
          } catch {
            setSelectedAddress("Selected map point");
            setLocationState({
              type: "success",
              message: "Map point selected. Address could not be resolved.",
            });
          }
        });
      } catch (error) {
        if (!isMounted) return;
        setLocationState({
          type: "error",
          message:
            error.message ||
            "OpenStreetMap location picker could not be loaded.",
        });
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === "mode" && value === "Swap" ? { price: "" } : {}),
    }));
  };

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []).slice(0, 5);
    setImages(selectedFiles);
  };

  const removeImage = (indexToRemove) => {
    setImages((current) =>
      current.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationState({
        type: "error",
        message: "Current device location is not supported in this browser.",
      });
      return;
    }

    setLocationState({
      type: "loading",
      message: "Detecting your current location...",
    });

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const nextPosition = {
          lat: coords.latitude,
          lng: coords.longitude,
        };

        setFormData((current) => ({
          ...current,
          lat: String(nextPosition.lat),
          lng: String(nextPosition.lng),
        }));

        if (markerRef.current)
          markerRef.current.setLatLng([nextPosition.lat, nextPosition.lng]);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView(
            [nextPosition.lat, nextPosition.lng],
            15,
          );
        }

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${nextPosition.lat}&lon=${nextPosition.lng}`,
          );
          const results = await response.json();
          const address =
            results?.display_name || "Current device location selected";
          setSelectedAddress(address);
          setLocationSearch(address);
        } catch {
          setSelectedAddress("Current device location selected");
        }

        setLocationState({
          type: "success",
          message: "Current device location added successfully.",
        });
      },
      () => {
        setLocationState({
          type: "error",
          message:
            "Unable to access current device location. Check browser permissions.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const handleLocationSearch = async () => {
    const query = locationSearch.trim();
    if (!query) {
      setLocationState({
        type: "error",
        message: "Enter a place name or address to search on the map.",
      });
      return;
    }

    setLocationState({
      type: "loading",
      message: "Searching OpenStreetMap location...",
    });

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=1`,
      );
      const results = await response.json();
      const firstResult = results?.[0];

      if (!firstResult) {
        setLocationState({
          type: "error",
          message: "No matching location found. Try a more specific address.",
        });
        return;
      }

      const lat = Number(firstResult.lat);
      const lng = Number(firstResult.lon);

      setFormData((current) => ({
        ...current,
        lat: String(lat),
        lng: String(lng),
      }));
      setSelectedAddress(firstResult.display_name || query);

      if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
      if (mapInstanceRef.current)
        mapInstanceRef.current.setView([lat, lng], 15);

      setLocationState({
        type: "success",
        message: "Location selected from OpenStreetMap search.",
      });
    } catch {
      setLocationState({
        type: "error",
        message: "Unable to search OpenStreetMap right now.",
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (!images.length) {
      setStatus({
        type: "error",
        message: "Add at least one image to publish your item.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "") payload.append(key, value);
      });

      images.forEach((file) => {
        payload.append("images", file);
      });

      const response = await createItem(payload);
      const createdItem = response.data;

      setStatus({
        type: "success",
        message: `Item created successfully with ID ${createdItem.itemId}.`,
      });
      setFormData((current) => ({
        ...initialForm,
        ownerId: current.ownerId,
      }));
      setImages([]);

      window.setTimeout(() => {
        navigate(`/test-api`);
      }, 1200);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "Unable to create the item right now. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f1ea] text-[#0a3327] font-body antialiased overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-[-80px] h-72 w-72 rounded-full bg-[#d7c3a4]/35 blur-3xl" />
        <div className="absolute top-40 right-[-60px] h-80 w-80 rounded-full bg-[#b14716]/12 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#295848]/10 blur-3xl" />
      </div>

      <nav className="relative z-10 border-b border-[#0a3327]/10 bg-[#f5f1ea]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
          <Link
            to="/"
            className="font-headline text-2xl font-extrabold tracking-tight text-[#0a3327]"
          >
            SwapNest
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/test-api"
              className="rounded-full border border-[#0a3327]/10 px-5 py-2.5 text-sm font-semibold text-[#0a3327]/70 transition hover:border-[#0a3327]/20 hover:text-[#0a3327]"
            >
              Browse Items
            </Link>
            <Link
              to="/"
              className="rounded-full bg-[#b14716] px-5 py-2.5 text-sm font-bold text-white shadow-[0_16px_35px_-18px_rgba(177,71,22,0.9)] transition hover:scale-[1.02]"
            >
              Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto grid max-w-7xl gap-10 px-6 py-8 md:px-10 lg:grid-cols-[0.92fr_1.08fr] lg:py-12">
        <section className="relative overflow-hidden rounded-[36px] bg-[#0d392c] p-8 text-[#f8f3eb] shadow-[0_30px_70px_-35px_rgba(10,51,39,0.65)] md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(244,198,123,0.2),_transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_50%)]" />

          <div className="relative space-y-8">
            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-[#f2c98e]">
                Curated Listing Studio
              </span>
              <h1 className="max-w-md font-headline text-4xl font-extrabold leading-tight md:text-6xl">
                Add a new item with gallery-first storytelling.
              </h1>
              <p className="max-w-lg text-base leading-7 text-white/72">
                {/* Create a listing that feels intentional, tactile, and premium.
                Upload imagery, define the exchange mode, and publish a piece
                worth discovering. */}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                  Images
                </p>
                <p className="mt-3 font-headline text-3xl font-bold">
                  {images.length}/5
                </p>
                <p className="mt-2 text-sm text-white/60">
                  Editorial preview cards update instantly.
                </p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                  Default mode
                </p>
                <p className="mt-3 font-headline text-3xl font-bold">
                  {formData.mode}
                </p>
                <p className="mt-2 text-sm text-white/60">
                  Swap-focused and ready for modern exchange.
                </p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                  Status
                </p>
                <p className="mt-3 font-headline text-3xl font-bold">
                  {isSubmitting ? "Saving" : "Draft"}
                </p>
                <p className="mt-2 text-sm text-white/60">
                  Built to match your backend `Item` model.
                </p>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-[#f8f3eb] p-5 text-[#0a3327] shadow-[0_18px_45px_-28px_rgba(0,0,0,0.4)]">
              <div className="flex items-center justify-between gap-4 border-b border-[#0a3327]/10 pb-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#0a3327]/45">
                    Live Cover Preview
                  </p>
                  <h2 className="mt-2 font-headline text-2xl font-bold">
                    {formData.title || "Your item title appears here"}
                  </h2>
                </div>
                <span className="rounded-full bg-[#b14716]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#b14716]">
                  {formData.category}
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                <div className="min-h-[220px] overflow-hidden rounded-[26px] bg-[#e8dfd3]">
                  {imagePreviews[0] ? (
                    <img
                      alt={imagePreviews[0].name} // Use the name of the first image as alt text for better accessibility
                      className="h-full w-full object-cover"
                      src={imagePreviews[0].url}
                    />
                  ) : (
                    <div className="flex h-full min-h-[220px] items-end bg-[linear-gradient(160deg,#ded0bc_0%,#f1e8db_42%,#c9a777_100%)] p-6">
                      <p className="max-w-[220px] font-headline text-2xl font-bold leading-tight text-[#0a3327]">
                        Your main image preview appears here.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between rounded-[26px] bg-[#f1ece4] p-5">
                  <div>
                    <p className="text-sm leading-6 text-[#0a3327]/68">
                      {formData.description ||
                        "Write a short, sensory description that explains texture, history, use, and exchange value."}
                    </p>
                  </div>

                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex items-center justify-between border-b border-[#0a3327]/10 pb-2">
                      <span className="text-[#0a3327]/50">Condition</span>
                      <span className="font-semibold">
                        {formData.condition}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-[#0a3327]/10 pb-2">
                      <span className="text-[#0a3327]/50">Price</span>
                      <span className="font-semibold">
                        {isSwapOnly
                          ? "Not required for swap"
                          : formData.price
                            ? `$${formData.price}`
                            : "Negotiable"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#0a3327]/50">Contact</span>
                      <span className="max-w-[160px] truncate font-semibold">
                        {formData.contact || "Add contact details"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[36px] border border-[#0a3327]/8 bg-[rgba(255,252,247,0.82)] p-6 shadow-[0_28px_70px_-38px_rgba(10,51,39,0.38)] backdrop-blur-xl md:p-8 lg:p-10">
          <div className="mb-8 flex flex-col gap-3 border-b border-[#0a3327]/10 pb-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#0a3327]/45">
              New Listing
            </span>
            <h2 className="font-headline text-4xl font-extrabold tracking-tight text-[#0a3327]">
              New Listing Form
            </h2>
            <p className="max-w-2xl text-base leading-7 text-[#0a3327]/68">
              {/* This form follows the backend `Item` schema exactly, including
              title, price, category, mode, condition, owner, gallery, and
              optional location. */}
            </p>
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
                  onChange={handleChange}
                  placeholder="Handwoven cane lounge chair"
                  className="h-16 w-full rounded-[24px] border border-[#0a3327]/8 bg-[#efebe4] px-6 text-[#0a3327] outline-none transition placeholder:text-[#0a3327]/32 focus:border-[#b14716]/25 focus:ring-4 focus:ring-[#b14716]/10"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="ml-1 text-[11px] font-bold uppercase tracking-[0.28em] text-[#0a3327]/55">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="5"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe material, story, era, texture, and why this item deserves a second life."
                  className="w-full rounded-[24px] border border-[#0a3327]/8 bg-[#efebe4] px-6 py-5 text-[#0a3327] outline-none transition placeholder:text-[#0a3327]/32 focus:border-[#b14716]/25 focus:ring-4 focus:ring-[#b14716]/10"
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
                  name="contact"
                  type="text"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="077 123 4567 or curator@swapnest.com"
                  className="h-16 w-full rounded-[24px] border border-[#0a3327]/8 bg-[#efebe4] px-6 text-[#0a3327] outline-none transition placeholder:text-[#0a3327]/32 focus:border-[#b14716]/25 focus:ring-4 focus:ring-[#b14716]/10"
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

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="ml-1 text-[11px] font-bold uppercase tracking-[0.28em] text-[#0a3327]/55">
                    Gallery Images
                  </label>
                  <span className="text-xs font-semibold text-[#0a3327]/45">
                    Up to 5 images
                  </span>
                </div>

                <label className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-[#0a3327]/18 bg-[#efe6db] px-6 py-8 text-center transition hover:border-[#b14716]/35 hover:bg-[#ede3d7]">
                  <span className="font-headline text-2xl font-bold text-[#0a3327]">
                    Drop visuals here or browse files
                  </span>
                  <span className="mt-3 max-w-md text-sm leading-6 text-[#0a3327]/62">
                    The backend expects multipart form-data with `images`, so
                    these uploads are ready for your `Item` API.
                  </span>
                  <span className="mt-5 rounded-full bg-[#b14716] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_35px_-18px_rgba(177,71,22,0.9)]">
                    Select Images
                  </span>
                  <input
                    multiple
                    accept="image/*"
                    className="hidden"
                    type="file"
                    onChange={handleImageChange}
                  />
                </label>

                {!!imagePreviews.length && (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={`${preview.name}-${index}`}
                        className="overflow-hidden rounded-[24px] border border-[#0a3327]/8 bg-white shadow-[0_18px_40px_-30px_rgba(10,51,39,0.45)]"
                      >
                        <img
                          alt={preview.name}
                          className="h-40 w-full object-cover"
                          src={preview.url}
                        />
                        <div className="flex items-center justify-between px-4 py-3">
                          <p className="max-w-[170px] truncate text-sm font-semibold text-[#0a3327]">
                            {preview.name}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="text-xs font-bold uppercase tracking-[0.18em] text-[#b14716]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4 md:col-span-2">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <label className="ml-1 text-[11px] font-bold uppercase tracking-[0.28em] text-[#0a3327]/55">
                      Location
                    </label>
                    <p className="mt-2 text-sm leading-6 text-[#0a3327]/58">
                      Search with OpenStreetMap, use your current location, or
                      click on the map to choose the exact point.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="inline-flex h-12 items-center justify-center rounded-full bg-[#0a3327] px-5 text-sm font-bold text-white transition hover:bg-[#08261f]"
                  >
                    Current Location
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
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
                    className="h-16 w-full rounded-[24px] border border-[#0a3327]/8 bg-[#efebe4] px-6 text-[#0a3327] outline-none transition placeholder:text-[#0a3327]/32 focus:border-[#b14716]/25 focus:ring-4 focus:ring-[#b14716]/10"
                  />
                  <button
                    type="button"
                    onClick={handleLocationSearch}
                    className="inline-flex h-16 items-center justify-center rounded-[24px] bg-[#b14716] px-6 text-sm font-bold text-white shadow-[0_18px_35px_-18px_rgba(177,71,22,0.9)] transition hover:scale-[1.01]"
                  >
                    Search Map
                  </button>
                </div>

                <div className="overflow-hidden rounded-[28px] border border-[#0a3327]/10 bg-white shadow-[0_18px_40px_-30px_rgba(10,51,39,0.25)]">
                  <div
                    ref={mapRef}
                    className="h-[320px] w-full bg-[linear-gradient(160deg,#ded0bc_0%,#f1e8db_42%,#c9a777_100%)]"
                  />
                </div>

                <div className="rounded-[24px] border border-[#0a3327]/8 bg-[#efe6db] px-5 py-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#0a3327]/45">
                    Selected address
                  </p>
                  <p className="mt-2 text-sm font-medium leading-6 text-[#0a3327]">
                    {selectedAddress || "No location selected yet."}
                  </p>
                  {locationState.message ? (
                    <p
                      className={`mt-3 text-sm font-medium ${
                        locationState.type === "error"
                          ? "text-red-700"
                          : locationState.type === "success"
                            ? "text-emerald-700"
                            : "text-[#0a3327]/60"
                      }`}
                    >
                      {locationState.message}
                    </p>
                  ) : null}
                </div>

                <input type="hidden" name="lat" value={formData.lat} />
                <input type="hidden" name="lng" value={formData.lng} />
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-[#0a3327]/10 pt-6 md:flex-row md:items-center md:justify-between">
              <p className="max-w-xl text-sm leading-6 text-[#0a3327]/56">
                Location is now selected through the map flow, and the form
                still submits hidden latitude and longitude values for your
                backend. Images are required too.
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
      </main>
    </div>
  );
};

export default ItemAddNewItem;
