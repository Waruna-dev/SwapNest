function DashboardFilters({
  search, // current search text
  setSearch, // function to update search text
  activeCategory, // selected category value
  setActiveCategory, // function to update category
  categoryOptions, // list of categories
}) {
  return (
    // Main container (responsive grid layout)
    <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_260px]">
      {/* ================= SEARCH FORM ================= */}
      <form
        onSubmit={(event) => event.preventDefault()} // prevent page reload
        className="flex flex-col gap-3 sm:flex-row"
      >
        {/* Search input wrapper */}
        <div className="relative flex-1">
          {/* Search icon inside input */}
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-on-surface-variant">
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
              {/* Circle part of search icon */}
              <circle cx="11" cy="11" r="7" />
              {/* Handle part of search icon */}
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>

          {/* Search input field */}
          <input
            type="text"
            value={search} // controlled input
            onChange={(event) => setSearch(event.target.value)} // update state
            placeholder="Search by title or description"
            className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 pl-12 text-sm text-on-surface outline-none transition focus:border-primary focus:bg-surface"
          />
        </div>

        {/* Search button */}
        <button
          type="submit"
          className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition hover:bg-primary-container"
        >
          Search
        </button>
      </form>

      {/* ================= CATEGORY DROPDOWN ================= */}
      <select
        value={activeCategory} // current selected category
        onChange={(event) => setActiveCategory(event.target.value)} // update category
        className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none focus:border-primary"
      >
        {/* Default option */}
        <option value="All">All categories</option>

        {/* Dynamic category options */}
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
