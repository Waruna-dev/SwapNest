function DashboardSummaryCards({ summary, formatPrice }) {
  const cards = [
    { label: "Total items", value: summary.total },
    { label: "Visible rows", value: summary.visible },
    { label: "Swap ready", value: summary.swapReady },
    { label: "Average price", value: formatPrice(summary.averagePrice) },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-[24px] border border-[#0b3b30]/10 bg-white/92 p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6e847d]">
            {card.label}
          </p>
          <h2 className="mt-2 text-3xl font-black text-[#082d24]">
            {card.value}
          </h2>
        </div>
      ))}
    </section>
  );
}

export default DashboardSummaryCards;
