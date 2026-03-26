import { Link } from "react-router-dom";

function DashboardFooter({ loadItems }) {
  return (
    <footer className="relative z-10 mt-12 border-t border-[#0b3b30]/10 bg-[#082d24] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-[1.2fr_0.8fr] md:px-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#e7b187]">
            SwapNest control center
          </p>
          <h3 className="mt-3 text-3xl font-black tracking-tight">
            Maintain item listings with a clean admin table and styled item
            card.
          </h3>
        </div>

        <div className="grid gap-3 text-sm text-white/75">
          <Link to="/items/gallery" className="transition hover:text-white">
            Marketplace gallery
          </Link>
          <Link to="/item/new" className="transition hover:text-white">
            Create a new listing
          </Link>
          <button
            type="button"
            onClick={loadItems}
            className="w-fit rounded-full border border-white/15 px-4 py-2 text-left font-semibold text-white transition hover:bg-white/10"
          >
            Sync latest items
          </button>
        </div>
      </div>
    </footer>
  );
}

export default DashboardFooter;
