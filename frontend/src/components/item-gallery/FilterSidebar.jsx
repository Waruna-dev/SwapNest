import React from "react";
import { formatPrice } from "../../utils/itemGalleryUtils";

const DEFAULT_MAX_PRICE = 500000;

function FilterSidebar({
  filters,
  displayMode,
  locationState,
  onFilterChange,
  onToggleCondition,
  onReset,
  setDisplayMode,
}) {
  return (
    <aside className="h-fit rounded-[32px] border border-[#0b3b30]/10 bg-white/85 p-6 shadow-[0_22px_70px_-42px_rgba(11,59,48,0.44)] backdrop-blur">
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
          onClick={onReset}
          className="text-sm font-semibold text-[#b1461a]"
        >
          Reset
        </button>
      </div>

      <div className="mt-6 space-y-7">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#103b31]">Price range</p>
            <p className="text-sm text-[#55716b]">
              {formatPrice(filters.minPrice)} - {formatPrice(filters.maxPrice)}
            </p>
          </div>

          <div className="mt-4 space-y-4">
            <input
              type="range"
              min="0"
              max={DEFAULT_MAX_PRICE}
              step="1000"
              value={filters.minPrice}
              onChange={(e) =>
                onFilterChange(
                  "minPrice",
                  Math.min(Number(e.target.value), filters.maxPrice),
                )
              }
              className="w-full accent-[#b1461a]"
            />
            <input
              type="range"
              min="0"
              max={DEFAULT_MAX_PRICE}
              step="1000"
              value={filters.maxPrice}
              onChange={(e) =>
                onFilterChange(
                  "maxPrice",
                  Math.max(Number(e.target.value), filters.minPrice),
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
              5km nearby
            </p>
          </div>

          <div className="mt-4 rounded-[24px] bg-[#f6efe4] p-4">
            <label className="flex items-center justify-between gap-4 text-sm font-medium text-[#103b31]">
              Nearby only
              <input
                type="checkbox"
                checked={filters.useNearby}
                disabled={!locationState.coords}
                onChange={(e) => onFilterChange("useNearby", e.target.checked)}
                className="h-5 w-5 rounded border-[#0b3b30]/20 text-[#b1461a] focus:ring-[#b1461a]"
              />
            </label>

            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-[#55716b]">
                <span>Distance</span>
                <span>{filters.distance} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                value={filters.distance}
                onChange={(e) =>
                  onFilterChange("distance", Number(e.target.value))
                }
                className="mt-3 w-full accent-[#b1461a]"
              />
            </div>

            <p className="mt-3 text-sm text-[#55716b]">
              {locationState.message ||
                "Enable your location to unlock nearby listings."}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-[#103b31]">Condition</p>
          <div className="mt-4 grid gap-3">
            {["New", "Like New", "Used", "Vintage", "Refurbished"].map(
              (option) => (
                <label
                  key={option}
                  className="flex items-center justify-between rounded-[20px] border border-[#0b3b30]/10 px-4 py-3 text-sm text-[#21473d]"
                >
                  {option}
                  <input
                    type="checkbox"
                    checked={filters.condition.includes(option)}
                    onChange={() => onToggleCondition(option)}
                    className="h-4 w-4 rounded border-[#0b3b30]/15 text-[#b1461a] focus:ring-[#b1461a]"
                  />
                </label>
              ),
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-[#103b31]">Browse mode</p>
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
    </aside>
  );
}

export default FilterSidebar;
