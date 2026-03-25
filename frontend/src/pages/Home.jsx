import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Lightweight hook for fast, high-performance scroll animations
const useScrollReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-12');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
};

const Home = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useScrollReveal();

  // Dynamic navbar background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-[#fbf9f5] text-[#1b1c1a] font-sans antialiased selection:bg-[#fe7e4f] selection:text-white">
      
      {/* --- TOP NAVIGATION --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="flex justify-between items-center px-6 md:px-12 max-w-[1400px] mx-auto">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-[#012d1d] font-serif">
            SwapNest
          </Link>
          
          <div className="hidden md:flex items-center gap-8 font-semibold text-sm tracking-tight">
            <a className="text-[#a43c12] border-b-2 border-[#a43c12] pb-1" href="#discover">Discover</a>
            <a className="text-[#012d1d]/80 hover:text-[#012d1d] transition-colors" href="#how-it-works">How it Works</a>
            <a className="text-[#012d1d]/80 hover:text-[#012d1d] transition-colors" href="#impact">Impact</a>
            <a className="text-[#012d1d]/80 hover:text-[#012d1d] transition-colors" href="#community">Community</a>
          <Link 
    to="/volunteer" 
    className="text-[#012d1d]/80 hover:text-[#012d1d] transition-colors"
  >
    Volunteer
  </Link>

          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/login" className="text-[#012d1d] font-bold text-sm hover:opacity-70 transition-opacity">
              Sign In
            </Link>
            <Link to="/register" className="bg-[#a43c12] text-white px-7 py-2.5 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-transform duration-200 shadow-md shadow-[#a43c12]/20">
              Sign Up
            </Link>
          </div>

          <button className="md:hidden text-[#012d1d]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <span className="material-symbols-outlined text-3xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden absolute top-full left-0 w-full bg-[#fbf9f5] border-b border-gray-200 shadow-xl transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-[400px] py-6' : 'max-h-0 py-0'}`}>
          <div className="flex flex-col gap-6 px-6">
            <a href="#discover" className="text-[#a43c12] font-bold text-lg">Discover</a>
            <a href="#how-it-works" className="text-[#012d1d] font-bold text-lg">How it Works</a>
            <a href="#community" className="text-[#012d1d] font-bold text-lg">Community</a>
            <div className="h-px bg-gray-200"></div>
            <Link to="/login" className="text-[#012d1d] font-bold text-lg">Sign In</Link>
            <Link to="/register" className="bg-[#a43c12] text-white px-6 py-3 rounded-xl font-bold text-center">Create Account</Link>
          </div>
        </div>
      </nav>

      <main>
        {/* --- IMMERSIVE HERO SECTION --- */}
        <section className="min-h-[90vh] flex flex-col md:flex-row pt-24 pb-12 overflow-hidden">
          <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 z-10 reveal-on-scroll opacity-0 translate-y-12 transition-all duration-1000 ease-out">
            <span className="text-[#a43c12] font-bold tracking-widest uppercase text-xs mb-4">Curated Consumption</span>
            <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-serif font-extrabold text-[#012d1d] leading-[1.05] tracking-tighter mb-8">
              The Art of <br/><span className="italic text-[#a43c12]">the Swap.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-md mb-10 leading-relaxed font-medium">
              Elevate your lifestyle through Sri Lanka's premium circular marketplace. Exchange stories, not just items.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="bg-[#012d1d] text-white px-8 py-4 rounded-full font-bold text-center hover:bg-[#1b4332] transition-colors shadow-xl shadow-[#012d1d]/20">
                Explore Gallery
              </Link>
              <a href="#how-it-works" className="px-8 py-4 rounded-full font-bold text-center text-[#012d1d] border border-gray-300 hover:bg-gray-100 transition-colors">
                Learn More
              </a>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 h-[500px] md:h-auto relative overflow-hidden reveal-on-scroll opacity-0 translate-y-12 transition-all duration-1000 delay-200 ease-out">
            <img className="w-full h-full object-cover rounded-l-[3rem] shadow-2xl" alt="Vintage Camera" src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80"/>
            <div className="absolute bottom-12 right-12 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-white max-w-xs shadow-2xl">
              <p className="text-sm font-light italic leading-relaxed">"A lens into the past, ready for a new vision in the present."</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Curator" className="w-full h-full object-cover"/>
                </div>
                <span className="text-xs font-bold tracking-widest uppercase">Curated by Amal K.</span>
              </div>
            </div>
          </div>
        </section>

        {/* --- THE CIRCULAR GALLERY (EDITORIAL GRID) --- */}
        <section id="discover" className="py-32 px-6 md:px-16 bg-[#eae8e4]/40 reveal-on-scroll opacity-0 translate-y-12 transition-all duration-1000 ease-out overflow-hidden">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#012d1d] tracking-tight">The Circular Gallery</h2>
                <p className="text-gray-500 mt-4 font-medium text-lg">Hand-picked treasures looking for their next chapter.</p>
              </div>
              <Link to="/register" className="text-[#012d1d] font-bold flex items-center gap-2 group hover:text-[#a43c12] transition-colors pb-2">
                View All Listings 
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Large Item */}
              <div className="md:col-span-2 md:row-span-2 bg-white rounded-[2rem] overflow-hidden group shadow-sm hover:shadow-xl transition-shadow cursor-pointer">
                <div className="h-96 md:h-[500px] relative overflow-hidden">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Ceramic Vase" src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80"/>
                  <div className="absolute top-6 right-6">
                    <span className="bg-white/90 backdrop-blur text-[#012d1d] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">Colombo</span>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-serif font-bold text-[#012d1d]">Artisan Terra Vase</h3>
                  <p className="text-gray-500 text-sm mt-2 italic">Minimalist, earth-toned, and locally crafted.</p>
                </div>
              </div>
              
              {/* Small Item 1 */}
              <div className="bg-white rounded-[2rem] overflow-hidden group shadow-sm hover:shadow-xl transition-shadow cursor-pointer">
                <div className="h-64 relative overflow-hidden">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Luxury Watch" src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=500&q=80"/>
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 backdrop-blur text-[#012d1d] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">Kandy</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-serif font-bold text-[#012d1d]">Heritage Timepiece</h3>
                </div>
              </div>
              
              {/* Small Item 2 */}
              <div className="bg-white rounded-[2rem] overflow-hidden group shadow-sm hover:shadow-xl transition-shadow cursor-pointer">
                <div className="h-64 relative overflow-hidden">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Vintage Books" src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=500&q=80"/>
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 backdrop-blur text-[#012d1d] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">Galle</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-serif font-bold text-[#012d1d]">Classic Literature Set</h3>
                </div>
              </div>
              
              {/* Wide Item */}
              <div className="md:col-span-2 bg-white rounded-[2rem] overflow-hidden group flex flex-col md:flex-row shadow-sm hover:shadow-xl transition-shadow cursor-pointer">
                <div className="md:w-1/2 h-64 md:h-auto relative overflow-hidden">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Mid-century Chair" src="https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=600&q=80"/>
                </div>
                <div className="md:w-1/2 p-8 flex flex-col justify-center">
                  <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest self-start mb-4 border border-gray-200">Colombo</span>
                  <h3 className="text-2xl font-serif font-bold text-[#012d1d]">Teak Lounge Chair</h3>
                  <p className="text-gray-500 text-sm mt-3 font-medium leading-relaxed">Beautifully restored mid-century classic. Looking for a home with good natural light.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- THE PROCESS STORY --- */}
        <section id="how-it-works" className="py-32 px-6 md:px-16 bg-[#012d1d] text-white overflow-hidden relative reveal-on-scroll opacity-0 translate-y-12 transition-all duration-1000 ease-out">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#1b4332] rounded-full blur-[120px] -mr-64 -mt-64 opacity-50 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="max-w-3xl mb-24">
              <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 tracking-tight">The Lifecycle of a Swap</h2>
              <p className="text-[#a5d0b9] text-xl leading-relaxed font-medium">Sustainability isn't a trend; it's a practice. We've simplified the circular economy into three intentional movements.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="group">
                <div className="w-20 h-20 rounded-3xl bg-[#1b4332] flex items-center justify-center mb-8 group-hover:bg-[#a43c12] transition-colors duration-500 shadow-xl">
                  <span className="material-symbols-outlined text-4xl text-[#8cf5e4] group-hover:text-white transition-colors" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                </div>
                <h3 className="text-3xl font-serif font-bold mb-4">Post</h3>
                <p className="text-[#a5d0b9] leading-relaxed text-lg">Document your item's story through our editorial interface. High-quality photography invites the right matches.</p>
              </div>
              
              <div className="group">
                <div className="w-20 h-20 rounded-3xl bg-[#1b4332] flex items-center justify-center mb-8 group-hover:bg-[#a43c12] transition-colors duration-500 shadow-xl">
                  <span className="material-symbols-outlined text-4xl text-[#8cf5e4] group-hover:text-white transition-colors" style={{ fontVariationSettings: "'FILL' 1" }}>sync_alt</span>
                </div>
                <h3 className="text-3xl font-serif font-bold mb-4">Match</h3>
                <p className="text-[#a5d0b9] leading-relaxed text-lg">Our curation engine connects you with community members who value what you hold and have what you seek.</p>
              </div>
              
              <div className="group">
                <div className="w-20 h-20 rounded-3xl bg-[#1b4332] flex items-center justify-center mb-8 group-hover:bg-[#a43c12] transition-colors duration-500 shadow-xl">
                  <span className="material-symbols-outlined text-4xl text-[#8cf5e4] group-hover:text-white transition-colors" style={{ fontVariationSettings: "'FILL' 1" }}>handshake</span>
                </div>
                <h3 className="text-3xl font-serif font-bold mb-4">Swap</h3>
                <p className="text-[#a5d0b9] leading-relaxed text-lg">Complete the cycle in person at our verified local hubs. A simple exchange that keeps quality goods out of landfills.</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- LOCAL IMPACT VISUALS --- */}
        <section id="impact" className="py-32 px-6 md:px-16 bg-[#fbf9f5] overflow-hidden reveal-on-scroll opacity-0 translate-y-12 transition-all duration-1000 ease-out">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            
            <div className="relative order-2 md:order-1">
              <div className="absolute -top-10 -left-10 w-64 h-64 bg-[#c1ecd4]/50 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-[#fe7e4f]/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 space-y-16">
                <div>
                  <span className="text-7xl md:text-8xl lg:text-9xl font-serif font-black text-[#012d1d] tracking-tighter block">12.4k</span>
                  <span className="text-2xl font-serif font-bold text-[#a43c12] mt-2 block">Kgs of waste diverted</span>
                </div>
                <div className="grid grid-cols-2 gap-10">
                  <div>
                    <h4 className="text-4xl md:text-5xl font-black text-[#012d1d] mb-2">850+</h4>
                    <p className="text-gray-500 font-medium">Active Hubs in Colombo</p>
                  </div>
                  <div>
                    <h4 className="text-4xl md:text-5xl font-black text-[#012d1d] mb-2">3.2k</h4>
                    <p className="text-gray-500 font-medium">Swaps in the last month</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 md:order-2">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#012d1d] mb-8 leading-[1.1] tracking-tight">
                Quantifying our <br/>collective impact.
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-10 font-medium">
                Every item swapped is a statement against overconsumption. In the heart of Sri Lanka, we are building a network that values longevity over novelty.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-[#4bb7a8]/10 text-[#005048] px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 border border-[#4bb7a8]/20">
                  <span className="w-2 h-2 rounded-full bg-[#4bb7a8] animate-pulse"></span>
                  Live Impact Tracking
                </div>
                <div className="bg-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest text-[#012d1d] border border-gray-200 shadow-sm">
                  Verified Sustainable
                </div>
              </div>
            </div>
            
          </div>
        </section>

        {/* --- CURATED TESTIMONIALS --- */}
        <section id="community" className="py-32 px-6 md:px-16 bg-[#eae8e4]/30 overflow-hidden reveal-on-scroll opacity-0 translate-y-12 transition-all duration-1000 ease-out">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#012d1d] tracking-tight">Voices of the Movement</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-12 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 border border-gray-100">
                <p className="text-xl font-serif italic text-[#012d1d] leading-relaxed mb-10">
                  "SwapNest has completely changed how I view my belongings. It's no longer about owning; it's about stewardship."
                </p>
                <div className="flex items-center gap-4">
                  <img className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100" alt="User" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"/>
                  <div>
                    <h4 className="font-bold text-[#012d1d] text-lg">Dinesh R.</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Colombo Collector</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#012d1d] text-white p-12 rounded-[2.5rem] shadow-xl hover:-translate-y-2 transition-all duration-500 transform md:-translate-y-6">
                <p className="text-xl font-serif italic leading-relaxed mb-10 text-gray-200">
                  "Finding unique, pre-loved decor in Galle was always a challenge until this platform. The community is incredibly curated."
                </p>
                <div className="flex items-center gap-4">
                  <img className="w-14 h-14 rounded-full object-cover ring-2 ring-white/20" alt="User" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"/>
                  <div>
                    <h4 className="font-bold text-white text-lg">Sanduni P.</h4>
                    <p className="text-[10px] text-[#86af99] font-bold uppercase tracking-widest">Galle Designer</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-12 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 border border-gray-100">
                <p className="text-xl font-serif italic text-[#012d1d] leading-relaxed mb-10">
                  "I swapped my old DSLR for a hand-woven tapestry. It felt more like a cultural exchange than a mere transaction."
                </p>
                <div className="flex items-center gap-4">
                  <img className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100" alt="User" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"/>
                  <div>
                    <h4 className="font-bold text-[#012d1d] text-lg">Ishan K.</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Kandy Creative</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- FINAL CTA --- */}
        <section className="py-24 px-6 overflow-hidden reveal-on-scroll opacity-0 translate-y-12 transition-all duration-1000 ease-out">
          <div className="max-w-6xl mx-auto bg-[#1b4332] rounded-[3.5rem] p-12 md:p-24 text-center relative shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#012d1d] to-transparent opacity-80 pointer-events-none"></div>
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-8 tracking-tight">Ready to join the movement?</h2>
              <p className="text-[#a5d0b9] text-xl mb-12 leading-relaxed font-medium">Start your circular journey today. Your next favorite treasure is waiting for a new home.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link to="/register" className="bg-[#a43c12] text-white px-10 py-5 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20 w-full sm:w-auto">
                  Start Swapping
                </Link>
                <a href="#how-it-works" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-full font-bold text-lg hover:bg-white/20 transition-colors w-full sm:w-auto">
                  How it Works
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-[#012d1d] w-full rounded-t-[3rem] mt-10 overflow-hidden reveal-on-scroll opacity-0 translate-y-12 transition-all duration-1000 ease-out">
        <div className="flex flex-col md:flex-row justify-between items-start w-full px-8 md:px-16 py-20 max-w-7xl mx-auto gap-12">
          
          <div className="mb-8 md:mb-0 max-w-sm">
            <div className="text-3xl font-bold text-white mb-6 font-serif tracking-tighter">SwapNest</div>
            <p className="text-[#86af99] text-base leading-relaxed mb-8 font-medium">Cultivating a circular future for the teardrop island. Join the movement today.</p>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-[#a43c12] hover:border-transparent cursor-pointer transition-all">
                <span className="material-symbols-outlined text-xl">public</span>
              </div>
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-[#a43c12] hover:border-transparent cursor-pointer transition-all">
                <span className="material-symbols-outlined text-xl">chat_bubble</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-12 md:gap-24 w-full md:w-auto">
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold tracking-widest text-xs uppercase mb-2">Resources</h4>
              <a className="text-[#86af99] hover:text-white transition-colors font-medium" href="#how-it-works">How it Works</a>
              <a className="text-[#86af99] hover:text-white transition-colors font-medium" href="#impact">Sustainability Report</a>
              <a className="text-[#86af99] hover:text-white transition-colors font-medium" href="#community">Local Hubs</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold tracking-widest text-xs uppercase mb-2">Company</h4>
              <a className="text-[#86af99] hover:text-white transition-colors font-medium" href="#">Privacy Policy</a>
              <a className="text-[#86af99] hover:text-white transition-colors font-medium" href="#">Community Guidelines</a>
              <a className="text-[#86af99] hover:text-white transition-colors font-medium" href="#">Contact Us</a>
            </div>
          </div>
          
        </div>
        
        <div className="max-w-7xl mx-auto px-8 md:px-16 pb-12">
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[#86af99] text-sm font-medium">© 2026 SwapNest Sri Lanka. Circularity by design.</p>
            <div className="flex gap-8 text-sm font-medium text-[#86af99]">
              <a className="hover:text-white transition-colors" href="#">Terms of Service</a>
              <a className="hover:text-white transition-colors" href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;