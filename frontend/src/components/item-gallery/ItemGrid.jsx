import React from "react";
import ItemCard from "./ItemCard";

function ItemGrid({ items, favorites, onToggleFavorite, onQuickView }) {
  return (
    <div className="grid auto-rows-fr gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
      {items.map((item) => (
        <ItemCard
          key={item.itemId}
          item={item}
          isFavorite={favorites.includes(item.itemId)}
          onToggleFavorite={onToggleFavorite}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  );
}

export default ItemGrid;
