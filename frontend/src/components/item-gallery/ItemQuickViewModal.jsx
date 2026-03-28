import React, { useEffect, useState } from "react";
import {
  formatPrice,
  getLocationLabel,
  getPrimaryImage,
} from "../../utils/itemGalleryUtils";
import { IconSwap, IconClose, IconChevron } from "./icons";

function ItemQuickViewModal({ item, loading, onClose }) {
  const [imgIndex, setImgIndex] = useState(0);

  if (!item && !loading) return null;
  // Determine if the item is a swap item based on its mode
  const isSwapItem = String(item?.mode || "")
    .toLowerCase()
    .includes("swap");

  const sliderImages = item?.images?.length
    ? item.images.slice(0, 5)
    : [{ url: getPrimaryImage(item) }];
  const activeImage = sliderImages[imgIndex % sliderImages.length];

  const showPrev = () =>
    setImgIndex(
      (prev) => (prev - 1 + sliderImages.length) % sliderImages.length,
    );
  const showNext = () =>
    setImgIndex((prev) => (prev + 1) % sliderImages.length);

  useEffect(() => {
    setImgIndex(0);
  }, [item?.itemId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07261f]/70 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[34px] bg-[#fffdf9] shadow-[0_35px_120px_-40px_rgba(0,0,0,0.65)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#c4511c] text-white shadow-md transition hover:bg-[#a94314]"
          aria-label="Close quick view"
        >
          <IconClose />
        </button>

        {loading ? (
          <div className="grid min-h-[420px] place-items-center text-[#0b3b30]">
            Loading item details...
          </div>
        ) : (
          <div className="grid max-h-[92vh] overflow-y-auto lg:grid-cols-[1fr_1fr]">
            <div className="border-b border-[#0b3b30]/10 bg-white p-6 lg:border-b-0 lg:border-r">
              <div className="max-w-xl">
                <p className="text-base text-[#51656a]">
                  {item?.category || "General"}
                </p>
                <h2 className="mt-4 font-headline text-5xl font-bold leading-[0.95] tracking-tight text-[#082d24]">
                  {item?.title || "Item preview"}
                </h2>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-[#cbd8d2] bg-[#f7faf8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-[#6f817c]">
                    {item?.condition || "Used"}
                  </span>
                  <span className="rounded-full border border-[#cbd8d2] bg-[#fff7ef] px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-[#b1461a]">
                    {item?.mode || "Buy"}
                  </span>
                </div>

                {!isSwapItem ? (
                  <div className="mt-5 inline-flex rounded-full bg-[#fff1e7] px-5 py-2.5 text-xl font-bold text-[#b1461a] shadow-[0_18px_45px_-30px_rgba(177,70,26,0.65)]">
                    {formatPrice(item?.price)}
                  </div>
                ) : null}

                <div className="mt-8 border-t border-[#0b3b30]/10 pt-8">
                  <div className="text-[#21473d]">
                    <p className="text-lg font-semibold text-[#082d24]">
                      Overview
                    </p>
                    <p className="mt-2 text-base leading-8 text-[#556a6f]">
                      {item?.description || "No description has been added for this item yet."}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-[24px] border border-[#0b3b30]/10 bg-[linear-gradient(135deg,#faf5ea_0%,#f4efe2_100%)] p-3 shadow-[0_18px_40px_-32px_rgba(11,59,48,0.35)]">
                  <div className="grid gap-3 sm:grid-cols-[1fr_1.2fr]">
                    <div className="rounded-[18px] bg-white/78 px-4 py-3 backdrop-blur">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[#8a9389]">
                        Location
                      </p>
                      <p className="mt-1.5 text-lg font-semibold leading-6 text-[#173e35]">
                        {getLocationLabel(item)}
                      </p>
                    </div>

                    <div className="rounded-[18px] bg-white/78 px-4 py-3 backdrop-blur">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[#8a9389]">
                        Seller contact
                      </p>
                      <p className="mt-1.5 truncate text-lg font-semibold leading-6 text-[#173e35]">
                        {item?.contact || "Not added"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                  <button
                    type="button"
                    className="flex-1 rounded-full bg-[#c4511c] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_-25px_rgba(196,81,28,0.95)] transition hover:bg-[#aa4518]"
                  >
                    Add to favorites
                  </button>

                  {isSwapItem ? (
                    <button
                      type="button"
                      className="flex-1 rounded-full border border-[#0b3b30]/12 bg-[#e5f7ef] px-5 py-3 text-sm font-semibold text-[#0b5b43] transition hover:bg-[#d5f0e5]"
                    >
                      <span className="inline-flex items-center gap-2">
                        <IconSwap />
                        Swap item
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="flex-1 rounded-full border border-[#0b3b30]/15 bg-white px-5 py-3 text-sm font-semibold text-[#0b3b30] transition hover:bg-[#eef5f2]"
                    >
                      Purchase
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[radial-gradient(circle_at_top_left,#f6dfb9_0%,#edf3ef_38%,#ffffff_100%)] p-6">
              <div className="grid gap-4">
                <div className="relative">
                  <img
                    src={activeImage.url}
                    alt={item?.title}
                    className="h-[340px] w-full rounded-[28px] bg-white object-contain shadow-[0_25px_80px_-35px_rgba(0,0,0,0.55)] lg:h-[420px]"
                  />

                  <button
                    onClick={showPrev}
                    type="button"
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-[#00443d] p-3 text-white shadow-sm transition hover:bg-[#003b35]"
                    aria-label="Previous image"
                  >
                    <IconChevron direction="left" />
                  </button>

                  <button
                    onClick={showNext}
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-[#00443d] p-3 text-white shadow-sm transition hover:bg-[#003b35]"
                    aria-label="Next image"
                  >
                    <IconChevron direction="right" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-3 xl:grid-cols-5">
                  {sliderImages.map((image, index) => {
                    return (
                      <button
                        key={image.publicId || image.url || index}
                        type="button"
                        onClick={() => setImgIndex(index)}
                        className={`overflow-hidden rounded-[20px] border text-left shadow-[0_20px_50px_-34px_rgba(0,0,0,0.4)] transition ${
                          index === imgIndex
                            ? "border-[#00443d] ring-2 ring-[#00443d]/20"
                            : "border-white/70 hover:border-[#00443d]"
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={`${item?.title} preview ${index + 1}`}
                          className="h-24 w-full object-cover sm:h-28"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemQuickViewModal;
