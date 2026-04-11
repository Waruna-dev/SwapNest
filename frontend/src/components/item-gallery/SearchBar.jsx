import React, { useState } from "react";
import { IconSearch } from "./icons";

function SearchBar({ value, onChange, suggestions, onSuggestionClick }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-50 w-full">
      <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#54706a]">
        <IconSearch />
      </span>

      <input
        type="text"
        value={value}
        onChange={(event) => {
          setIsOpen(true);
          onChange(event);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search by title, style, or keyword"
        className="h-11 w-full rounded-[16px] border border-[#0b3b30]/10 bg-[#f7f0e5] pl-12 pr-4 text-sm text-[#0a3327] outline-none transition focus:border-[#b1461a] focus:bg-white"
      />

      {!!suggestions.length && value.trim() && isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-20 overflow-hidden rounded-[24px] border border-[#0b3b30]/10 bg-white shadow-[0_18px_55px_-30px_rgba(11,59,48,0.45)]">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                onSuggestionClick(suggestion);
                setIsOpen(false);
              }}
              className="block w-full border-b border-[#0b3b30]/6 px-5 py-3 text-left text-sm text-[#22443c] transition last:border-b-0 hover:bg-[#f7efe3]"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
