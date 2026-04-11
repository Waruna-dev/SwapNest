import React, { useState } from "react";
import { formatPrice } from "../../utils/itemGalleryUtils";
import { IconChevron, IconInfinite, IconPagination } from "./icons";
import SearchBar from "./SearchBar";

const DEFAULT_MAX_PRICE = 500000;

function FilterSidebar({
  filters,
  displayMode,
  locationState,
  suggestions,
  sortOptions,
  categoryOptions,
  categoryCounts,
  onFilterChange,
  onToggleCondition,
  onReset,
  setDisplayMode,
  onRequestLocation,
}) {
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

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
        <div className="space-y-3">
          <SearchBar
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            suggestions={suggestions}
            onSuggestionClick={(value) => onFilterChange("search", value)}
          />

          <select
            value={filters.sort}
            onChange={(e) => onFilterChange("sort", e.target.value)}
            className="h-12 w-full rounded-[18px] border border-[#0b3b30]/10 bg-[#f7f1e7] px-4 text-sm text-[#0a3327] outline-none transition focus:border-[#b1461a]"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                Sort by {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onRequestLocation}
            className="flex h-12 w-full items-center justify-center rounded-[18px] bg-[#0b3b30] px-4 text-sm font-semibold text-white transition hover:bg-[#082d24]"
          >
            {locationState.status === "loading"
              ? "Finding you..."
              : "Nearby search"}
          </button>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowCategoryMenu((current) => !current)}
            className="flex w-full items-center justify-between rounded-[20px] border border-[#0b3b30]/10 bg-[#f7f1e7] px-4 py-3 text-left transition hover:bg-[#f2ebdf]"
          >
            <div>
              <p className="text-sm font-semibold text-[#103b31]">Category</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#7a8c86]">
                {filters.category}
              </p>
            </div>

            <span
              className={`text-[#21473d] transition-transform ${
                showCategoryMenu ? "rotate-90" : ""
              }`}
            >
              <IconChevron direction="right" />
            </span>
          </button>

          {showCategoryMenu ? (
            <div className="mt-4 grid gap-3">
              {categoryOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onFilterChange("category", option);
                    setShowCategoryMenu(false);
                  }}
                  className={`flex items-center justify-between rounded-[20px] border px-4 py-3 text-sm font-semibold transition ${
                    filters.category === option
                      ? "border-[#b1461a]/20 bg-[#fff1e7] text-[#b1461a]"
                      : "border-[#0b3b30]/10 bg-white text-[#21473d] hover:bg-[#f7f1e7]"
                  }`}
                >
                  <span>{option}</span>
                  <span className="opacity-70">
                    ({categoryCounts[option] ?? 0})
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

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
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setDisplayMode("pagination")}
              aria-label="Pagination mode"
              title="Pagination mode"
              className={`flex h-14 w-14 items-center justify-center rounded-[18px] border transition ${
                displayMode === "pagination"
                  ? "border-[#0b3b30] bg-[#0b3b30] text-white shadow-[0_14px_30px_-18px_rgba(11,59,48,0.7)]"
                  : "border-[#0b3b30]/10 bg-[#f6efe4] text-[#21473d] hover:bg-[#efe6d8]"
              }`}
            >
              <IconPagination />
            </button>

            <button
              type="button"
              onClick={() => setDisplayMode("infinite")}
              aria-label="Infinite scroll mode"
              title="Infinite scroll mode"
              className={`flex h-14 w-14 items-center justify-center rounded-[18px] border transition ${
                displayMode === "infinite"
                  ? "border-[#b1461a] bg-[#b1461a] text-white shadow-[0_14px_30px_-18px_rgba(177,70,26,0.7)]"
                  : "border-[#0b3b30]/10 bg-[#f6efe4] text-[#21473d] hover:bg-[#efe6d8]"
              }`}
            >
              <IconInfinite />
            </button>
          </div>

          <div className="mt-3 flex gap-3 text-xs font-semibold text-[#55716b]">
            <div className="flex w-14 justify-center">Pages</div>
            <div className="flex w-14 justify-center">Scroll</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default FilterSidebar;
