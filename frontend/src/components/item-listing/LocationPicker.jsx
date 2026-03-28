const LocationPicker = ({
  mapRef,
  locationSearch,
  setLocationSearch,
  selectedAddress,
  locationState,
  handleUseCurrentLocation,
  handleLocationSearch,
  lat,
  lng,
  isSearching = false,
  isGettingCurrentLocation = false,
}) => {
  const hasSearchText = locationSearch.trim().length > 0;
  const hasSelectedLocation = lat && lng;

  return (
    <div className="space-y-4 md:col-span-2">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <label
            htmlFor="location-search"
            className="ml-1 text-[11px] font-bold uppercase tracking-[0.28em] text-[#0a3327]/55"
          >
            Location
          </label>

          <p className="mt-2 text-sm leading-6 text-[#0a3327]/58">
            Search with OpenStreetMap, use your current location, or click on
            the map to choose the exact point.
          </p>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isGettingCurrentLocation}
          className={`inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-bold text-white transition ${
            isGettingCurrentLocation
              ? "cursor-not-allowed bg-[#0a3327]/50"
              : "bg-[#0a3327] hover:bg-[#08261f]"
          }`}
        >
          {isGettingCurrentLocation
            ? "Getting location..."
            : "Current Location"}
        </button>
      </div>

      {/* Search box */}
      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <input
          id="location-search"
          type="text"
          value={locationSearch}
          onChange={(event) => setLocationSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && hasSearchText && !isSearching) {
              event.preventDefault();
              handleLocationSearch();
            }
          }}
          placeholder="Search your item location"
          autoComplete="street-address"
          aria-label="Search location"
          className="h-16 w-full rounded-[24px] border border-[#0a3327]/8 bg-[#efebe4] px-6 text-[#0a3327] outline-none transition placeholder:text-[#0a3327]/32 focus:border-[#b14716]/25 focus:ring-4 focus:ring-[#b14716]/10"
        />

        <button
          type="button"
          onClick={handleLocationSearch}
          disabled={!hasSearchText || isSearching}
          className={`inline-flex h-16 items-center justify-center rounded-[24px] px-6 text-sm font-bold text-white transition ${
            !hasSearchText || isSearching
              ? "cursor-not-allowed bg-[#b14716]/50"
              : "bg-[#b14716] shadow-[0_18px_35px_-18px_rgba(177,71,22,0.9)] hover:scale-[1.01]"
          }`}
        >
          {isSearching ? "Searching..." : "Search Map"}
        </button>

        <button
          type="button"
          onClick={() => setLocationSearch("")}
          className="inline-flex h-16 items-center justify-center rounded-[24px] border border-[#0a3327]/10 bg-white px-6 text-sm font-bold text-[#0a3327] transition hover:bg-[#f7f4ef]"
        >
          Clear
        </button>
      </div>

      {/* Map */}
      <div className="overflow-hidden rounded-[28px] border border-[#0a3327]/10 bg-white shadow-[0_18px_40px_-30px_rgba(10,51,39,0.25)]">
        <div
          ref={mapRef}
          role="region"
          aria-label="Location map"
          className="relative h-[320px] w-full bg-[linear-gradient(160deg,#ded0bc_0%,#f1e8db_42%,#c9a777_100%)]"
        >
          {!hasSelectedLocation && (
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm font-medium text-[#0a3327]/55">
              Search, use current location, or click the map to select a point.
            </div>
          )}
        </div>
      </div>

      {/* Selected address */}
      <div className="rounded-[24px] border border-[#0a3327]/8 bg-[#efe6db] px-5 py-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#0a3327]/45">
          Selected address
        </p>

        <p className="mt-2 text-sm font-medium leading-6 text-[#0a3327]">
          {selectedAddress || "No location selected yet."}
        </p>

        {hasSelectedLocation && (
          <div className="mt-3 grid gap-2 text-sm text-[#0a3327]/80 sm:grid-cols-2">
            <p>
              <span className="font-semibold">Latitude:</span> {lat}
            </p>
            <p>
              <span className="font-semibold">Longitude:</span> {lng}
            </p>
          </div>
        )}

        {locationState?.message ? (
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
        ) : (
          <p className="mt-3 text-sm text-[#0a3327]/55">
            Tip: Choose the exact place so buyers can understand where the item
            is located.
          </p>
        )}
      </div>

      {/* Hidden form values */}
      <input type="hidden" name="lat" value={lat || ""} />
      <input type="hidden" name="lng" value={lng || ""} />
      <input
        type="hidden"
        name="selectedAddress"
        value={selectedAddress || ""}
      />
    </div>
  );
};

export default LocationPicker;
