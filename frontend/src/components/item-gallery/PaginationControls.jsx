import React from "react";
import { IconChevron } from "./icons";

function PaginationControls({
  page,
  totalPages,
  paginationNumbers,
  onPageChange,
}) {
  return (
    <div className="mt-8 rounded-[30px] border border-[#0b3b30]/10 bg-[linear-gradient(135deg,#fdf9f1_0%,#eef6f3_100%)] px-5 py-5 text-sm text-[#21473d] shadow-[0_18px_50px_-40px_rgba(11,59,48,0.42)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7b8d87]">
            Curated pages
          </p>
          <p className="mt-2 font-headline text-2xl font-bold text-[#082d24]">
            Page {page} of {totalPages}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="inline-flex items-center gap-2 rounded-full border border-[#0b3b30]/12 bg-white px-4 py-2.5 font-semibold disabled:cursor-not-allowed disabled:opacity-45"
          >
            <IconChevron direction="left" />
            Previous
          </button>

          {paginationNumbers.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onPageChange(value)}
              className={`inline-flex h-11 min-w-11 items-center justify-center rounded-full px-4 font-semibold transition ${
                value === page
                  ? "bg-[#b1461a] text-white shadow-[0_16px_34px_-20px_rgba(177,70,26,0.9)]"
                  : "border border-[#0b3b30]/10 bg-white text-[#21473d] hover:bg-[#f7efe4]"
              }`}
            >
              {value}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-2 rounded-full bg-[#0b3b30] px-4 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            Next
            <IconChevron />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaginationControls;
