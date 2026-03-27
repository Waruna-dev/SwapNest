import React from "react";
import ItemCard from "./ItemCard";

function ItemGrid({ items, favorites, onToggleFavorite, onQuickView, onSwapStatusChange }) {
  return (
    <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
      {items.map((item) => (
        <ItemCard
          key={item.itemId || item._id}
          item={item}
          isFavorite={favorites.includes(item.itemId)}
          onToggleFavorite={onToggleFavorite}
          onQuickView={onQuickView}
          onSwapStatusChange={onSwapStatusChange}
        />
      ))}
    </div>
  );
}

export default ItemGrid;