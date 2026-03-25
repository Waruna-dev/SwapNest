import { useEffect, useRef, useState } from "react";

const defaultMapCenter = { lat: 6.9271, lng: 79.8612 };

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

export const useLocationPicker = (setFormData) => {
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
    let isMounted = true;

    const initializeMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      try {
        const L = await loadLeafletAssets();
        if (!isMounted) return;

        const map = L.map(mapRef.current).setView(
          [defaultMapCenter.lat, defaultMapCenter.lng],
          11,
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        const marker = L.marker([
          defaultMapCenter.lat,
          defaultMapCenter.lng,
        ]).addTo(map);

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
  }, [setFormData]);

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

        if (markerRef.current) {
          markerRef.current.setLatLng([nextPosition.lat, nextPosition.lng]);
        }

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
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
          query,
        )}&limit=1`,
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

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([lat, lng], 15);
      }

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

  return {
    mapRef,
    locationSearch,
    setLocationSearch,
    selectedAddress,
    locationState,
    handleUseCurrentLocation,
    handleLocationSearch,
  };
};
