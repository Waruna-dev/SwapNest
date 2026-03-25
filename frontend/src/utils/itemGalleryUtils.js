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

export function formatPrice(price) {
  const value = Number(price || 0);
  return `Rs ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function formatRelativeDate(dateString) {
  if (!dateString) return "Recently listed";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  if (diffDays === 0) return "Listed today";
  if (diffDays === 1) return "Listed yesterday";
  if (diffDays < 7) return `Listed ${diffDays} days ago`;

  return new Date(dateString).toLocaleDateString();
}

export function getPrimaryImage(item) {
  return (
    item?.coverImage?.url ||
    item?.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80"
  );
}

export function getLocationLabel(item) {
  const coords = item?.location?.coordinates;

  if (item?.distanceMeters) {
    return `${(item.distanceMeters / 1000).toFixed(1)} km away`;
  }

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
