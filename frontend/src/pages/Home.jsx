import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const useScrollReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("opacity-0", "translate-y-12");
            entry.target.classList.add("opacity-100", "translate-y-0");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".reveal-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
};

const Home = () => {
  useScrollReveal();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('swapnest_token');
    if (token) setIsLoggedIn(true);
  }, []);

  return (
    <div className="bg-[#fbf9f5] text-[#1b1c1a] font-sans antialiased selection:bg-[#fe7e4f] selection:text-white">
      {/* --- TOP NAVIGATION --- */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-white/80 backdrop-blur-xl shadow-sm py-3" : "bg-transparent py-5"}`}
      >
        <div className="flex justify-between items-center px-6 md:px-12 max-w-[1400px] mx-auto">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tighter text-[#012d1d] font-serif"
          >
            SwapNest
          </Link>

          <div className="hidden md:flex items-center gap-8 font-semibold text-sm tracking-tight">
            <a
              className="text-[#a43c12] border-b-2 border-[#a43c12] pb-1"
              href="#discover"
            >
              Discover
            </a>
            <a
              className="text-[#012d1d]/80 hover:text-[#012d1d] transition-colors"
              href="#how-it-works"
            >
              How it Works
            </a>
            <a
              className="text-[#012d1d]/80 hover:text-[#012d1d] transition-colors"
              href="#impact"
            >
              Impact
            </a>
            <a
              className="text-[#012d1d]/80 hover:text-[#012d1d] transition-colors"
              href="#community"
            >
              Community
            </a>
            <Link
              to="/volunteer-hero"
              className="text-[#012d1d]/80 hover:text-[#012d1d] transition-colors"
            >
              Volunteer
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/login"
              className="text-[#012d1d] font-bold text-sm hover:opacity-70 transition-opacity"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-[#a43c12] text-white px-7 py-2.5 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-transform duration-200 shadow-md shadow-[#a43c12]/20"
            >
              Sign Up
            </Link>
          </div>

          <button
            className="md:hidden text-[#012d1d]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="material-symbols-outlined text-3xl">
              {isMobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden absolute top-full left-0 w-full bg-[#fbf9f5] border-b border-gray-200 shadow-xl transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? "max-h-[400px] py-6" : "max-h-0 py-0"}`}
        >
          <div className="flex flex-col gap-6 px-6">
            <a href="#discover" className="text-[#a43c12] font-bold text-lg">
              Discover
            </a>
            <a
              href="#how-it-works"
              className="text-[#012d1d] font-bold text-lg"
            >
              How it Works
            </a>
            <a href="#community" className="text-[#012d1d] font-bold text-lg">
              Community
            </a>
            <div className="h-px bg-gray-200"></div>
            <Link
              to="/login"
              className="text-[#012d1d] font-bold text-lg"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-[#a43c12] text-white px-6 py-3 rounded-xl font-bold text-center"
            >
              Create Account
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="min-h-[90vh] flex flex-col md:flex-row pt-24 pb-12 overflow-hidden">
          <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 z-10 reveal-on-scroll opacity-0 translate-y-12 transition-all duration-1000 ease-out">
            <span className="text-[#a43c12] font-bold tracking-widest uppercase text-xs mb-4">
              Curated Consumption
            </span>
            <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-serif font-extrabold text-[#012d1d] leading-[1.05] tracking-tighter mb-8">
              The Art of <br />
              <span className="italic text-[#a43c12]">the Swap.</span>
            </h1>
            <p className="text-lg text-[#1b1c1a]/80 mb-8 leading-relaxed max-w-md">
              Transform everyday items into extraordinary opportunities. Join our community of conscious swappers and discover the joy of sustainable living.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={isLoggedIn ? "/marketplace" : "/register"}
                className="bg-[#a43c12] text-white px-8 py-4 rounded-full font-bold text-center hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-[#a43c12]/20"
              >
                {isLoggedIn ? "Go to Dashboard" : "Explore Gallery"}
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-4 rounded-full font-bold text-center text-[#012d1d] border border-gray-300 hover:bg-gray-100 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
          <div className="w-full md:w-1/2 relative reveal-on-scroll opacity-0 translate-y-12 transition-all duration-1000 ease-out">
            <div className="absolute inset-0 bg-gradient-to-br from-[#a43c12]/20 to-[#012d1d]/20 rounded-3xl transform rotate-6"></div>
            <div className="relative h-96 md:h-full min-h-[400px] bg-white rounded-3xl shadow-2xl p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">♻️</div>
                <h3 className="text-2xl font-bold text-[#012d1d] mb-2">Sustainable Swapping</h3>
                <p className="text-[#1b1c1a]/70">Give items a second life</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
