function DashboardFilters({
  search,
  setSearch,
  activeCategory,
  setActiveCategory,
  categoryOptions,
}) {
  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_260px]">
      <input
        type="text"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by title or description"
        className="w-full rounded-2xl border border-[#0b3b30]/10 bg-[#fcfbf8] px-4 py-3 text-sm outline-none"
      />

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
