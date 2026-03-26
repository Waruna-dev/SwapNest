import { Link } from "react-router-dom";

const AddItemNavbar = () => {
  return (
    <nav className="relative z-10 border-b border-[#0a3327]/10 bg-[#f5f1ea]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <Link
          to="/"
          className="font-headline text-2xl font-extrabold tracking-tight text-[#0a3327]"
        >
          SwapNest
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/items/gallery"
            className="rounded-full border border-[#0a3327]/10 px-5 py-2.5 text-sm font-semibold text-[#0a3327]/70 transition hover:border-[#0a3327]/20 hover:text-[#0a3327]"
          >
            Browse Items
          </Link>

          <Link
            to="/"
            className="rounded-full bg-[#b14716] px-5 py-2.5 text-sm font-bold text-white shadow-[0_16px_35px_-18px_rgba(177,71,22,0.9)] transition hover:scale-[1.02]"
          >
            Home
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default AddItemNavbar;
