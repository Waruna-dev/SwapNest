function DashboardFilters({
  search,
  setSearch,
  activeCategory,
  setActiveCategory,
  categoryOptions,
}) {
  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_260px]">
      <form
        onSubmit={(event) => event.preventDefault()}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#36524b]">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title or description"
            className="w-full rounded-2xl border border-[#0b3b30]/10 bg-[#fcfbf8] py-3 pl-12 pr-4 text-sm outline-none transition focus:border-[#0b3b30]/30 focus:bg-white"
          />
        </div>

        <button
          type="submit"
          className="rounded-2xl bg-[#0b3b30] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#12483b]"
        >
          Search
        </button>
      </form>

      <select
        value={activeCategory}
        onChange={(event) => setActiveCategory(event.target.value)}
        className="w-full rounded-2xl border border-[#0b3b30]/10 bg-[#fcfbf8] px-4 py-3 text-sm outline-none"
      >
        <option value="All">All categories</option>
        {categoryOptions.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
}

export default DashboardFilters;
