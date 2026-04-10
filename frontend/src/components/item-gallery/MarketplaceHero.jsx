import React from "react";
import SearchBar from "./SearchBar";
import CategoryChips from "./CategoryChips";

function MarketplaceHero({
  filters,
  totalItems,
  favoritesCount,
  suggestions,
  categoryOptions,
  categoryCounts,
  sortOptions,
  locationState,
  onFilterChange,
  onRequestLocation,
}) {
  return (
    <section className="relative overflow-visible border-b border-[#0b3b30]/8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#f6c18c_0%,transparent_30%),radial-gradient(circle_at_top_right,#a6d6ca_0%,transparent_28%),linear-gradient(135deg,#f8edd8_0%,#fdfaf4_55%,#ebf6f1_100%)]" />

      <div className="relative mx-auto max-w-7xl px-6 py-8 md:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#b1461a]">
              Marketplace Gallery
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-[34px] border border-white/70 bg-white/85 p-4 shadow-[0_26px_90px_-42px_rgba(11,59,48,0.42)] backdrop-blur md:p-5">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.7fr_auto]">
            <SearchBar
              value={filters.search}
              onChange={(e) => onFilterChange("search", e.target.value)}
              suggestions={suggestions}
              onSuggestionClick={(value) => onFilterChange("search", value)}
            />

            <select
              value={filters.sort}
              onChange={(e) => onFilterChange("sort", e.target.value)}
              className="rounded-full border border-[#0b3b30]/10 bg-[#f7f0e5] px-5 py-4 text-sm text-[#0a3327] outline-none transition focus:border-[#b1461a]"
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
              className="rounded-full bg-[#0b3b30] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#082d24]"
            >
              {locationState.status === "loading"
                ? "Finding you..."
                : "Use my location"}
            </button>
          </div>

          <CategoryChips
            categories={categoryOptions}
            selectedCategory={filters.category}
            counts={categoryCounts}
            onSelect={(category) => onFilterChange("category", category)}
          />
        </div>
      </div>
    </section>
  );
}

export default MarketplaceHero;
