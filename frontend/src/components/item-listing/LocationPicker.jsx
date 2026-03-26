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
}) => {
  return (
    <div className="space-y-4 md:col-span-2">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <label className="ml-1 text-[11px] font-bold uppercase tracking-[0.28em] text-[#0a3327]/55">
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

      <input type="hidden" name="lat" value={lat} />
      <input type="hidden" name="lng" value={lng} />
    </div>
  );
};

export default LocationPicker;
