import { Link } from "react-router-dom";

function DashboardNavbar() {
  return (
    <nav className="relative z-10 border-b border-[#0b3b30]/10 bg-[#f7f1e7]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#b1461a]">
            Item listing admin
          </p>
          <Link
            to="/items/dashboard"
            className="font-headline text-3xl font-black tracking-tight text-[#082d24]"
          >
            SwapNest Dashboard
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/items/gallery"
            className="rounded-full border border-[#0b3b30]/10 px-5 py-2.5 text-sm font-semibold text-[#0b3b30] transition hover:bg-white/80"
          >
            Browse items
          </Link>
          <Link
            to="/item/new"
            className="rounded-full bg-[#b1461a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#963812]"
          >
            Add new item
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default DashboardNavbar;
