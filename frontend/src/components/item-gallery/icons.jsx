import React from "react";

export function IconSearch() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconHeart({ filled = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M12 20.5l-1.2-1.1C5.1 14.2 2 11.4 2 7.9A4.9 4.9 0 0 1 6.9 3 5.5 5.5 0 0 1 12 5.6 5.5 5.5 0 0 1 17.1 3 4.9 4.9 0 0 1 22 7.9c0 3.5-3.1 6.3-8.8 11.5L12 20.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function IconBuy() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      {/* Cart */}
      <path d="M3 5h2l2.2 9h10.6l2-7H7" />

      {/* Wheels */}
      <circle cx="10" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />

      {/* Plus (add to cart) */}
      <path d="M12 9v4M10 11h4" />
    </svg>
  );
}
export function IconMapPin() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 21s6-5.6 6-11a6 6 0 1 0-12 0c0 5.4 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}

export function IconChevron({ direction = "right" }) {
  const rotate = direction === "left" ? "rotate(180 12 12)" : "rotate(0 12 12)";
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <g transform={rotate}>
        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function IconCart() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="9" cy="19" r="1.4" />
      <circle cx="17" cy="19" r="1.4" />
      <path
        d="M3 5h2l2.1 9.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L20 8H7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSwap() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M7 7h11" strokeLinecap="round" />
      <path d="M14 4l4 3-4 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 17H6" strokeLinecap="round" />
      <path d="M10 14l-4 3 4 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconClose() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 6l12 12" strokeLinecap="round" />
      <path d="M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}
