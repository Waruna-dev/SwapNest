import React, { useState } from "react";
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
  // Reset image index when item changes
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07261f]/70 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[34px] bg-[#fffdf9] shadow-[0_35px_120px_-40px_rgba(0,0,0,0.65)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#dc2626] text-white shadow-md transition hover:bg-[#b91c1c]"
          aria-label="Close quick view"
        >
          <IconClose />
        </button>

        {loading ? (
          <div className="grid min-h-[420px] place-items-center text-[#0b3b30]">
            Loading item details...
          </div>
        ) : (
          <div className="grid max-h-[92vh] overflow-y-auto lg:grid-cols-[1.15fr_0.85fr]">
            <div className="bg-[radial-gradient(circle_at_top,#f7c99a_0%,#eddfca_33%,#d6ece5_100%)] p-5">
              <div className="relative">
                <img
                  src={activeImage.url}
                  alt={item?.title}
                  className="h-[420px] w-full rounded-[28px] object-cover shadow-[0_25px_80px_-35px_rgba(0,0,0,0.55)]"
                />

                <button
                  onClick={showPrev}
                  type="button"
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-[#00443d] p-2 text-white shadow-sm transition hover:bg-[#003b35]"
                  aria-label="Previous image"
                >
                  <IconChevron direction="left" />
                </button>

                <button
                  onClick={showNext}
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[#00443d] p-2 text-white shadow-sm transition hover:bg-[#003b35]"
                  aria-label="Next image"
                >
                  <IconChevron direction="right" />
                </button>
              </div>

              {sliderImages.length > 1 && (
                <div className="mt-4 flex gap-2 overflow-x-auto px-1">
                  {sliderImages.map((image, index) => (
                    <button
                      key={image.publicId || image.url || index}
                      type="button"
                      onClick={() => setImgIndex(index)}
                      className={`h-16 w-16 shrink-0 rounded-[15px] border ${
                        index === imgIndex
                          ? "border-[#00443d]"
                          : "border-[#d4d4d8]"
                      } overflow-hidden`}
                    >
                      <img
                        src={image.url}
                        alt={`${item?.title} ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6 p-7">
              <div className="space-y-3 border-b border-[#0b3b30]/10 pb-5">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#7f8e89]">
                  <span>{item?.category || "General"}</span>
                  <span>{item?.condition || "Used"}</span>
                  <span>{item?.mode || "Buy"}</span>
                </div>

                <h2 className="font-headline text-4xl font-bold leading-tight text-[#082d24]">
                  {item?.title}
                </h2>

                {isSwapItem ? (
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#dff7ec] px-4 py-2 text-sm font-semibold text-[#166534]">
                    <IconSwap />
                    <span>Swap item</span>
                  </div>
                ) : (
                  <p className="font-headline text-3xl font-bold text-[#b1461a]">
                    {formatPrice(item?.price)}
                  </p>
                )}
              </div>

              <div className="grid gap-4 rounded-[26px] bg-[#f4ece1] p-5 text-sm text-[#163f35]">
                <p>
                  {item?.description ||
                    "No description has been added for this item yet."}
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[18px] bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#7f8e89]">
                      Location
                    </p>
                    <p className="mt-1 font-semibold">
                      {getLocationLabel(item)}
                    </p>
                  </div>

                  <div className="rounded-[18px] bg-white px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#7f8e89]">
                      Seller contact
                    </p>
                    <p className="mt-1 font-semibold">
                      {item?.contact || "Contact details not available"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  className="flex-1 rounded-full bg-[#b1461a] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_45px_-25px_rgba(177,70,26,0.95)] transition hover:bg-[#99360f]"
                >
                  Add to favorites
                </button>

                {isSwapItem ? (
                  <button
                    type="button"
                    className="flex-1 rounded-full border border-[#b1461a]/18 bg-[#fff4ec] px-5 py-4 text-sm font-semibold text-[#b1461a] transition hover:bg-[#ffebdb]"
                  >
                    Swap item
                  </button>
                ) : (
                  <button
                    type="button"
                    className="flex-1 rounded-full border border-[#0b3b30]/15 px-5 py-4 text-sm font-semibold text-[#0b3b30] transition hover:bg-[#eef5f2]"
                  >
                    Purchase
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemQuickViewModal;
