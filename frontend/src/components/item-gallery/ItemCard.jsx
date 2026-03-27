import React, { useState } from "react";
import {
  formatPrice,
  formatRelativeDate,
  getLocationLabel,
  getPrimaryImage,
} from "../../utils/itemGalleryUtils";
import { IconCart, IconHeart, IconMapPin, IconSwap } from "./icons";
import SwapForm from "../../components/swap/SwapForm";

function ItemCard({ item, isFavorite, onToggleFavorite, onQuickView }) {
  const [showSwapModal, setShowSwapModal] = useState(false);
  
  const locationLabel = getLocationLabel(item);
  const categoryLabel = item.category || "General";
  const isSwapItem = String(item.mode || "")
    .toLowerCase()
    .includes("swap");
  const conditionText = item.condition ? item.condition : "Used";
  const isNewCondition = conditionText.toLowerCase().includes("new");

  // Get current user info from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwner = currentUser._id === item.ownerId;
  
  // Handle Swap button click - open modal
  const handleSwapClick = () => {
    console.log("Item being swapped:", item);
    console.log("Item ID:", item._id || item.itemId);
    console.log("Current user:", currentUser);
    
    if (!currentUser._id) {
      alert("Please login to swap items");
      return;
    }
    
    if (isOwner) {
      alert("You cannot swap your own item");
      return;
    }
    
    setShowSwapModal(true);
  };

  const handleSwapSuccess = (swap) => {
    console.log("Swap created:", swap);
    setShowSwapModal(false);
    alert("✅ Swap request sent successfully!");
  };

  // Handle Buy button click
  const handleBuyClick = () => {
    if (!currentUser._id) {
      alert("Please login to buy items");
      return;
    }
    console.log("Buy item:", item);
    alert("Purchase feature coming soon!");
  };

  return (
    <>
      <article className="group flex h-full min-h-[21rem] flex-col overflow-hidden rounded-[20px] border border-[#0b3b30]/10 bg-white shadow-[0_16px_40px_-28px_rgba(13,55,44,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_-28px_rgba(13,55,44,0.45)]">
        <div className="relative">
          <img
            src={getPrimaryImage(item)}
            alt={item.title}
            className="h-40 w-full bg-[#efe6db] object-cover object-center transition duration-500 group-hover:scale-[1.03] sm:h-44"
          />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] shadow-sm ${
                isNewCondition
                  ? "bg-[#d1fae5] text-[#166534]"
                  : "bg-[#fef3c7] text-[#854d0e]"
              }`}
            >
              {conditionText}
            </span>

            <button
              type="button"
              onClick={() => onToggleFavorite(item.itemId)}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur ${
                isFavorite
                  ? "border-[#dc2626] bg-[#dc2626] text-white"
                  : "border-white/70 bg-white/92 text-[#0b3b30]"
              }`}
              aria-label="Toggle favorite"
            >
              <IconHeart filled={isFavorite} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2.5 p-3.5">
          <h3
            className="min-h-[2.8rem] overflow-hidden text-[1.05rem] font-medium leading-5 text-[#111827] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
            title={item.title}
          >
            {item.title}
          </h3>

          <div className="flex items-end gap-2">
            {isSwapItem ? (
              <span className="rounded-full bg-[#d1fae5] px-2 py-1 text-sm font-semibold text-[#065f46]">
                Swap item
              </span>
            ) : (
              <p className="font-headline text-[1.6rem] font-bold leading-none text-[#f97316]">
                {formatPrice(item.price)}
              </p>
            )}
            <span className="pb-0.5 text-xs font-medium text-[#7b848c]">
              {formatRelativeDate(item.createdAt)}
            </span>
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 text-xs text-[#6b7280]">
            <span
              className="inline-flex min-w-0 flex-1 items-center gap-1.5"
              title={locationLabel}
            >
              <span className="shrink-0">
                <IconMapPin />
              </span>
              <span className="truncate font-medium">{locationLabel}</span>
            </span>

            <span
              className="max-w-[42%] truncate rounded-full bg-[#f4f4f5] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#71717a]"
              title={categoryLabel}
            >
              {categoryLabel}
            </span>
          </div>

          <div
            className={`grid gap-2 pt-1 ${isSwapItem ? "grid-cols-3" : "grid-cols-2"}`}
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
                  onClick={handleSwapClick}
                  className={`inline-flex items-center justify-center gap-1 rounded-full px-3 py-2 text-xs font-semibold text-white transition ${
                    isOwner 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-[#00443d] hover:bg-[#003b35]"
                  }`}
                  disabled={isOwner}
                  title={isOwner ? "You cannot swap your own item" : "Request to swap"}
                >
                  <IconSwap /> Swap
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleBuyClick}
                className="inline-flex items-center justify-center gap-1 rounded-full px-3 py-2 text-xs font-semibold text-white transition bg-[#a43c12] hover:bg-[#8f3410]"
              >
                <IconCart /> Buy
              </button>
            )}
          </div>
        </div>
      </article>

      {/* Swap Form Modal */}
      {showSwapModal && (
        <SwapForm
          itemId={item._id || item.itemId}
          itemTitle={item.title}
          ownerName={item.ownerName || item.owner?.username || "Unknown"}
          requesterId={currentUser._id}
          requesterName={currentUser.username}
          onClose={() => setShowSwapModal(false)}
          onSuccess={handleSwapSuccess}
        />
      )}
    </>
  );
}

export default ItemCard;