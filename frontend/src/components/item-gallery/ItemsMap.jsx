import { useEffect, useMemo, useRef, useState } from "react";
import {
  formatPrice,
  getLocationLabel,
  getPrimaryImage,
} from "../../utils/itemGalleryUtils";

const defaultCenter = [6.9271, 79.8612];

const loadLeafletAssets = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Leaflet can only load in the browser."));
  }

  if (window.L) {
    return Promise.resolve(window.L);
  }

  const existingStylesheet = document.querySelector(
    'link[data-leaflet="swapnest-gallery"]',
  );

  if (!existingStylesheet) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.dataset.leaflet = "swapnest-gallery";
    document.head.appendChild(link);
  }

  const existingScript = document.querySelector(
    'script[data-leaflet="swapnest-gallery"]',
  );

  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener("load", () => resolve(window.L));
      existingScript.addEventListener("error", () =>
        reject(new Error("Unable to load map assets.")),
      );
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.defer = true;
    script.dataset.leaflet = "swapnest-gallery";
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error("Unable to load map assets."));
    document.head.appendChild(script);
  });
};

function ItemsMap({ items, onQuickView }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerLayerRef = useRef(null);
  const [mapStatus, setMapStatus] = useState("loading");

  const itemsWithCoords = useMemo(
    () =>
      items.filter((item) => {
        const coords = item?.location?.coordinates;
        return (
          Array.isArray(coords) &&
          coords.length === 2 &&
          Number.isFinite(Number(coords[0])) &&
          Number.isFinite(Number(coords[1]))
        );
      }),
    [items],
  );

  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      try {
        const L = await loadLeafletAssets();
        if (!isMounted) return;

        const map = L.map(mapRef.current, {
          scrollWheelZoom: true,
          dragging: true,
          doubleClickZoom: true,
          touchZoom: true,
          boxZoom: true,
          keyboard: true,
        }).setView(defaultCenter, 8);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        map.scrollWheelZoom.enable();
        map.dragging.enable();
        map.doubleClickZoom.enable();
        map.touchZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();

        const container = map.getContainer();
        container.tabIndex = 0;
        container.style.cursor = "grab";

        markerLayerRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;
        setMapStatus("ready");

        // Leaflet can render with a stale size if the container finishes
        // layout after initialization.
        setTimeout(() => {
          map.invalidateSize();
        }, 0);
      } catch {
        if (isMounted) {
          setMapStatus("error");
        }
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerLayerRef.current || !window.L) {
      return;
    }

    const L = window.L;
    const markerLayer = markerLayerRef.current;
    markerLayer.clearLayers();

    if (!itemsWithCoords.length) {
      mapInstanceRef.current.setView(defaultCenter, 8);
      mapInstanceRef.current.invalidateSize();
      return;
    }

    const bounds = [];

    itemsWithCoords.forEach((item) => {
      const [lng, lat] = item.location.coordinates;
      const marker = L.marker([lat, lng]);

      marker.bindPopup(`
        <div style="width: 180px;">
          <img
            src="${getPrimaryImage(item)}"
            alt="${item.title}"
            style="width: 100%; height: 96px; object-fit: cover; border-radius: 12px; margin-bottom: 10px;"
          />
          <div style="font-weight: 700; color: #0a3327; margin-bottom: 4px;">${item.title}</div>
          <div style="font-size: 12px; color: #54706a; margin-bottom: 6px;">${getLocationLabel(item)}</div>
          <div style="font-size: 13px; font-weight: 700; color: #b1461a;">${formatPrice(item.price)}</div>
        </div>
      `);

      marker.on("click", () => {
        if (onQuickView) {
          onQuickView(item.itemId);
        }
      });

      marker.addTo(markerLayer);
      bounds.push([lat, lng]);
    });

    if (bounds.length === 1) {
      mapInstanceRef.current.setView(bounds[0], 12);
    } else {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    }

    mapInstanceRef.current.invalidateSize();
  }, [itemsWithCoords, onQuickView]);

  return (
    <section className="mb-6 overflow-hidden rounded-[30px] border border-[#0b3b30]/10 bg-white/80 p-5 shadow-[0_20px_60px_-42px_rgba(11,59,48,0.4)] backdrop-blur">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#b1461a]">
            Map View
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[#082d24]">
            Find listings by location
          </h2>
        </div>

        <div className="rounded-full bg-[#eff6f3] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0b3b30]">
          {itemsWithCoords.length} items on map
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[24px] border border-[#0b3b30]/10 bg-[#e8efe9]">
        <div ref={mapRef} className="h-[380px] w-full" />

        {mapStatus === "loading" ? (
          <div className="absolute inset-0 grid place-items-center bg-white/45 backdrop-blur-[2px]">
            <div className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0a3327] shadow-lg">
              Loading listings map...
            </div>
          </div>
        ) : null}

        {mapStatus === "error" ? (
          <div className="absolute inset-0 grid place-items-center bg-white/70">
            <div className="rounded-[20px] bg-white px-6 py-4 text-center text-sm font-medium text-red-700 shadow-lg">
              Unable to load the map right now.
            </div>
          </div>
        ) : null}

        {mapStatus === "ready" && !itemsWithCoords.length ? (
          <div className="absolute inset-0 grid place-items-center bg-white/45 backdrop-blur-[2px]">
            <div className="rounded-[20px] bg-white px-6 py-4 text-center text-sm font-medium text-[#54706a] shadow-lg">
              No items with saved locations in these results yet.
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default ItemsMap;
