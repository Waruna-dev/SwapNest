import React from "react";

function CategoryChips({ categories, selectedCategory, counts, onSelect }) {
  return (
    <div className="mt-5 flex flex-wrap gap-3">
      {categories.map((category) => (
        <button
          type="button"
          key={category}
          onClick={() => onSelect(category)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            selectedCategory === category
              ? "bg-[#b1461a] text-white"
              : "bg-[#f7f0e5] text-[#21473d] hover:bg-[#efe4d4]"
          }`}
        >
          {category}{" "}
          <span className="opacity-70">({counts[category] ?? 0})</span>
        </button>
      ))}
    </div>
  );
}

export default CategoryChips;
