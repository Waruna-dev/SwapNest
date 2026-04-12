import React from "react";

function MarketplaceHero() {
  return (
    <section className="relative overflow-visible">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#f6c18c_0%,transparent_30%),radial-gradient(circle_at_top_right,#a6d6ca_0%,transparent_28%),linear-gradient(135deg,#f8edd8_0%,#fdfaf4_55%,#ebf6f1_100%)]" />

      <div className="relative mx-auto max-w-6xl px-6 py-8 md:px-8">
        <div className="rounded-[26px] border border-white/70 bg-white/88 p-5 shadow-[0_26px_90px_-42px_rgba(11,59,48,0.42)] backdrop-blur md:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#b1461a]">
            Marketplace Gallery
          </p>
          <h2 className="mt-3 font-headline text-3xl font-bold text-[#082d24] md:text-4xl">
            Discover listings with all controls in one sidebar.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#55716b] md:text-base">
            Search, sort, category, price, and nearby options are grouped on
            the left for a cleaner browsing experience.
          </p>
        </div>
      </div>
    </section>
  );
}

export default MarketplaceHero;
