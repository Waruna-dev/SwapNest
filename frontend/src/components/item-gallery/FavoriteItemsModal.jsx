import React from "react";
import {
  formatPrice,
  getLocationLabel,
  getPrimaryImage,
} from "../../utils/itemGalleryUtils";
import { IconCart, IconClose, IconSwap } from "./icons";

function FavoriteItemsModal({ items, onClose, onQuickView, onRemoveFavorite }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#07261f]/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-[30px] bg-[#fffdf9] shadow-[0_35px_120px_-40px_rgba(0,0,0,0.6)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#dc2626] text-white transition hover:bg-[#b91c1c]"
          aria-label="Close favourite items list"
        >
          <IconClose />
        </button>

        <div className="border-b border-[#0b3b30]/10 bg-[linear-gradient(135deg,#f7ecda_0%,#eef7f3_100%)] px-6 py-6 pr-20">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b1461a]">
            Favourite items
          </p>
          <h2 className="mt-2 text-3xl font-bold text-[#082d24]">
            Saved items list
          </h2>
          <p className="mt-2 text-sm text-[#55716b]">
            Review your liked items with image, price, location, and category.
          </p>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          {items.length ? (
            <div className="space-y-4">
              {items.map((item) => {
                const isSwapItem = String(item?.mode || "")
                  .toLowerCase()
                  .includes("swap");

                return (
                  <article
                    key={item.itemId}
                    className="flex flex-col gap-4 rounded-[24px] border border-[#0b3b30]/10 bg-white p-4 shadow-[0_18px_45px_-34px_rgba(11,59,48,0.38)] sm:flex-row"
                  >
                    <img
                      src={getPrimaryImage(item)}
                      alt={item.title}
                      className="h-24 w-full rounded-[18px] bg-[#efe6db] object-cover sm:w-28"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold text-[#082d24]">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-sm text-[#55716b]">
                            {item.category || "General"} . {item.condition || "Used"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onRemoveFavorite(item.itemId)}
                            className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-[#f3b5b5] bg-[#fff1f2] px-3 text-[#c24141] transition hover:bg-[#ffe4e6]"
                            aria-label="Remove favourite item"
                          >
                            <IconClose />
                          </button>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              isSwapItem
                                ? "bg-[#dff7ec] text-[#166534]"
                                : "bg-[#fff1e7] text-[#b1461a]"
                            }`}
                          >
                            {isSwapItem ? "Swap item" : formatPrice(item.price)}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`mt-4 grid gap-2 sm:ml-auto sm:max-w-[320px] ${
                          isSwapItem ? "sm:grid-cols-3" : "sm:grid-cols-2"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => onQuickView(item.itemId)}
                          className="rounded-full border border-[#d4d4d8] bg-white px-3 py-2 text-xs font-semibold text-[#0b3b30] transition hover:border-[#0b3b30] hover:bg-[#eff6f3]"
                        >
                          View
                        </button>

                        {isSwapItem ? (
                          <>
                            <button
                              type="button"
                              className="rounded-full border border-[#d4d4d8] bg-white px-3 py-2 text-xs font-semibold text-[#0b3b30] transition hover:border-[#0b3b30] hover:bg-[#eff6f3]"
                            >
                              Chat
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center gap-1 rounded-full bg-[#00443d] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#003b35]"
                            >
                              <IconSwap /> Swap
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="inline-flex items-center justify-center gap-1 rounded-full bg-[#a43c12] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#8f3410]"
                          >
                            <IconCart /> Buy
                          </button>
                        )}
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-[#335c52] sm:grid-cols-3">
                        <div className="rounded-[16px] bg-[#f7f3ea] px-3 py-2">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-[#7f8e89]">
                            Location
                          </p>
                          <p className="mt-1 truncate font-medium">
                            {getLocationLabel(item)}
                          </p>
                        </div>

                        <div className="rounded-[16px] bg-[#f7f3ea] px-3 py-2">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-[#7f8e89]">
                            Mode
                          </p>
                          <p className="mt-1 truncate font-medium">
                            {item.mode || "Buy"}
                          </p>
                        </div>

                        <div className="rounded-[16px] bg-[#f7f3ea] px-3 py-2">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-[#7f8e89]">
                            Contact
                          </p>
                          <p className="mt-1 truncate font-medium">
                            {item.contact || "Not added"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-[#0b3b30]/14 bg-[#fcfaf5] px-6 py-12 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#b1461a]">
                No favourites yet
              </p>
              <p className="mt-3 text-sm text-[#55716b]">
                Tap the heart on any item card and it will appear in this list.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FavoriteItemsModal;
