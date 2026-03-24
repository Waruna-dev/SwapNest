import { useState } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="bg-background text-on-surface font-body selection:bg-secondary-fixed selection:text-on-secondary-container antialiased overflow-x-hidden">
      
      {/* TopNavBar */}
      <nav className="sticky top-0 z-50 w-full bg-[#fbf9f5]/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex justify-between items-center px-6 md:px-8 py-4 max-w-7xl mx-auto">
          <Link to="/" className="text-2xl font-extrabold text-[#012d1d] font-headline tracking-tight">SwapNest</Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a className="text-[#a43c12] font-bold border-b-2 border-[#a43c12] pb-1 font-headline" href="#">Explore</a>
            <a className="text-[#1b4332]/70 hover:text-[#012d1d] transition-all duration-300 font-headline font-bold" href="#">Swaps</a>
            <a className="text-[#1b4332]/70 hover:text-[#012d1d] transition-all duration-300 font-headline font-bold" href="#">Community</a>
            <a className="text-[#1b4332]/70 hover:text-[#012d1d] transition-all duration-300 font-headline font-bold" href="#">Impact</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden md:block text-[#012d1d] font-headline font-bold text-lg hover:opacity-80 transition-opacity">
              Sign In
            </Link>
            <Link to="/register" className="hidden md:inline-block bg-secondary text-on-secondary px-6 py-2.5 rounded-full font-bold hover:scale-105 active:scale-95 transition-all">
              Sign Up
            </Link>
            
            {/* Mobile Hamburger Button */}
            <button 
              className="md:hidden p-2 text-[#012d1d]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#fbf9f5] border-b border-outline-variant/10 shadow-lg py-4 px-6 flex flex-col gap-4 animate-fade-in-down">
            <a className="text-[#a43c12] font-bold font-headline text-lg" href="#">Explore</a>
            <a className="text-[#1b4332] font-bold font-headline text-lg" href="#">Swaps</a>
            <a className="text-[#1b4332] font-bold font-headline text-lg" href="#">Community</a>
            <div className="h-px bg-outline-variant/20 my-2"></div>
            <Link to="/login" className="text-[#012d1d] font-headline font-bold text-lg">Sign In</Link>
            <Link to="/register" className="bg-secondary text-on-secondary px-6 py-3 rounded-full font-bold text-center mt-2">Sign Up</Link>
          </div>
        )}
      </nav>

      <main>
        {/* Hero Section: Split Screen */}
        <section className="relative min-h-[85vh] flex flex-col md:flex-row overflow-hidden">
          {/* Left Side: Content */}
          <div className="flex-1 flex items-center px-6 md:px-12 lg:px-24 py-16 bg-surface">
            <div className="max-w-xl space-y-8 md:space-y-10">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-headline font-extrabold text-primary leading-[1.1] tracking-tight">
                Trade what you <span className="text-secondary">have</span>, get what you <span className="text-secondary">need</span>
              </h1>
              <p className="text-lg text-on-surface-variant font-medium leading-relaxed">
                Join Sri Lanka's most curated swap community. Give your pre-loved items a new life and discover unique treasures from neighbors near you.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow max-w-md">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/40">search</span>
                  <input 
                    className="w-full pl-12 pr-4 py-4 rounded-full border-none outline-none bg-surface-container-high focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-primary/40" 
                    placeholder="Search for textbooks, electronics, decor..." 
                    type="text"
                  />
                </div>
                <Link to="/register" className="bg-secondary text-on-secondary px-8 py-4 rounded-full font-bold text-center hover:scale-105 transition-transform active:scale-95 whitespace-nowrap shadow-lg shadow-secondary/20">
                  Start Swapping
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <div className="flex -space-x-3">
                  <img className="w-10 h-10 rounded-full border-2 border-surface object-cover" alt="user" src="https://images.unsplash.com/photo-1615813967515-e1838c1f56d6?auto=format&fit=crop&q=80&w=100"/>
                  <img className="w-10 h-10 rounded-full border-2 border-surface object-cover" alt="user" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100"/>
                  <img className="w-10 h-10 rounded-full border-2 border-surface object-cover" alt="user" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"/>
                </div>
                <p className="text-sm font-semibold text-primary/60">Trusted by 12,000+ Sri Lankans</p>
              </div>
            </div>
          </div>

          {/* Right Side: Visual */}
          <div className="hidden md:block flex-1 relative h-[500px] md:h-auto overflow-hidden">
            <img className="absolute inset-0 w-full h-full object-cover" alt="Tropical interior" src="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=1000"/>
            
            {/* Floating Tags */}
            <div className="absolute top-1/4 left-1/4 bg-[#fbf9f5]/80 backdrop-blur-md p-3 rounded-2xl flex items-center gap-3 animate-[bounce_4s_infinite] shadow-xl">
              <div className="bg-secondary p-2 rounded-xl text-on-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">chair</span>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Available for Swap</p>
                <p className="text-sm font-bold text-primary">Teak Wood Chair</p>
              </div>
            </div>
            
            <div className="absolute bottom-1/3 right-1/4 bg-[#fbf9f5]/80 backdrop-blur-md p-3 rounded-2xl flex items-center gap-3 animate-[bounce_5s_infinite_1s] shadow-xl">
              <div className="bg-tertiary p-2 rounded-xl text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">potted_plant</span>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Trending</p>
                <p className="text-sm font-bold text-primary">Indoor Areca Palm</p>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="py-20 px-6 md:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="bg-primary-fixed text-on-primary-fixed px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">How it works</span>
            <h2 className="text-4xl md:text-5xl font-headline font-extrabold text-primary mt-6">Swap in three simple steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="group p-8 md:p-10 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors duration-500 relative overflow-hidden text-center md:text-left">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform mx-auto md:mx-0">
                <span className="material-symbols-outlined text-3xl text-secondary">add_a_photo</span>
              </div>
              <h3 className="text-2xl font-headline font-bold text-primary mb-4">Post</h3>
              <p className="text-on-surface-variant leading-relaxed">Photograph your item and list it in seconds. Our platform helps you with the perfect description.</p>
            </div>
            
            <div className="group p-8 md:p-10 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors duration-500 relative overflow-hidden text-center md:text-left">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform mx-auto md:mx-0">
                <span className="material-symbols-outlined text-3xl text-secondary">handshake</span>
              </div>
              <h3 className="text-2xl font-headline font-bold text-primary mb-4">Match</h3>
              <p className="text-on-surface-variant leading-relaxed">Find items of similar value and aesthetic from people right here in your local area.</p>
            </div>
            
            <div className="group p-8 md:p-10 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors duration-500 relative overflow-hidden text-center md:text-left">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform mx-auto md:mx-0">
                <span className="material-symbols-outlined text-3xl text-secondary">swap_horiz</span>
              </div>
              <h3 className="text-2xl font-headline font-bold text-primary mb-4">Swap</h3>
              <p className="text-on-surface-variant leading-relaxed">Chat, confirm, and meet up locally (like at a cafe in Colombo) to complete your exchange securely.</p>
            </div>
          </div>
        </section>

        {/* Featured Swaps: Horizontal Gallery */}
        <section className="py-20 bg-[radial-gradient(circle_at_top_right,#1b4332,#012d1d)] overflow-hidden">
          <div className="px-6 md:px-8 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-white">Trending in your area</h2>
              <p className="text-primary-fixed/70 mt-2">Hand-picked swaps matching your aesthetic.</p>
            </div>
            <button className="flex items-center gap-2 text-primary-fixed font-bold hover:text-white transition-colors">
              View Gallery <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
          
          <div className="flex overflow-x-auto gap-6 md:gap-8 px-6 md:px-8 pb-12 scroll-smooth snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {/* Item 1 */}
            <div className="min-w-[300px] md:min-w-[400px] snap-center group">
              <div className="relative h-[400px] md:h-[450px] rounded-xl overflow-hidden shadow-2xl">
                <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="vintage camera" src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=500"/>
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Verified Swap</span>
                </div>
                <div className="absolute bottom-0 inset-x-0 p-5 md:p-6 bg-[#fbf9f5]/90 backdrop-blur-md translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex flex-col mb-2">
                    <h4 className="text-xl font-headline font-extrabold text-primary">Sony A6000 Camera</h4>
                    <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-xs">location_on</span> Colombo 03 • 2 km away
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-4">Excellent condition, looking for a good laptop or tablet.</p>
                  <button className="w-full bg-primary text-white py-3 rounded-full font-bold hover:bg-primary/90 transition-colors">Make Offer</button>
                </div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="min-w-[300px] md:min-w-[400px] snap-center group">
              <div className="relative h-[400px] md:h-[450px] rounded-xl overflow-hidden shadow-2xl">
                <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="bike" src="https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=500"/>
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Verified Swap</span>
                </div>
                <div className="absolute bottom-0 inset-x-0 p-5 md:p-6 bg-[#fbf9f5]/90 backdrop-blur-md translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex flex-col mb-2">
                    <h4 className="text-xl font-headline font-extrabold text-primary">Mountain Bike</h4>
                    <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-xs">location_on</span> Nugegoda • 5 km away
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-4">Lightweight frame, used for 6 months. Swap for a gym bench.</p>
                  <button className="w-full bg-primary text-white py-3 rounded-full font-bold hover:bg-primary/90 transition-colors">Make Offer</button>
                </div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="min-w-[300px] md:min-w-[400px] snap-center group">
              <div className="relative h-[400px] md:h-[450px] rounded-xl overflow-hidden shadow-2xl">
                <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="books" src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=500"/>
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Verified Swap</span>
                </div>
                <div className="absolute bottom-0 inset-x-0 p-5 md:p-6 bg-[#fbf9f5]/90 backdrop-blur-md translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex flex-col mb-2">
                    <h4 className="text-xl font-headline font-extrabold text-primary">University Textbooks</h4>
                    <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-xs">location_on</span> Dehiwala • 3 km away
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-4">CS and Engineering textbooks. Open to graphic novels or art prints.</p>
                  <button className="w-full bg-primary text-white py-3 rounded-full font-bold hover:bg-primary/90 transition-colors">Make Offer</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community Impact */}
        <section className="py-20 px-6 md:px-8 overflow-hidden bg-surface relative">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="flex-1 space-y-6 md:space-y-8 order-2 md:order-1 text-center md:text-left">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-headline font-extrabold text-primary leading-tight">Better for your wallet, <span className="text-secondary">better for Sri Lanka.</span></h2>
              <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed">We believe in a circular economy. By swapping instead of buying, our community is actively reducing waste and building sustainable connections.</p>
              <div className="grid grid-cols-2 gap-6 md:gap-8 pt-6 md:pt-8">
                <div>
                  <p className="text-4xl md:text-5xl font-headline font-extrabold text-secondary">24.5k+</p>
                  <p className="text-xs md:text-sm font-bold text-primary/60 mt-2 uppercase tracking-widest">Items Saved</p>
                </div>
                <div>
                  <p className="text-4xl md:text-5xl font-headline font-extrabold text-tertiary">120t</p>
                  <p className="text-xs md:text-sm font-bold text-primary/60 mt-2 uppercase tracking-widest">CO2 Offset</p>
                </div>
              </div>
            </div>
            <div className="flex-1 relative order-1 md:order-2 w-full max-w-sm md:max-w-none mx-auto">
              <div className="absolute -inset-4 bg-primary-fixed rounded-full blur-3xl opacity-30"></div>
              <img className="relative rounded-xl shadow-2xl aspect-square object-cover w-full" alt="Lush tropical plant" src="https://images.unsplash.com/photo-1534620808146-d33bb39128b2?auto=format&fit=crop&q=80&w=600"/>
            </div>
          </div>
        </section>

        {/* Trust / Testimonials */}
        <section className="py-20 px-6 md:px-8 bg-stone-100 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-primary">The community loves to swap</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              
              <div className="p-6 md:p-8 bg-white rounded-xl shadow-sm space-y-6">
                <div className="flex items-center gap-4">
                  <img className="w-14 h-14 rounded-full object-cover" alt="Dinithi" src="https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?auto=format&fit=crop&q=80&w=100"/>
                  <div>
                    <h4 className="font-bold text-primary">Dinithi Perera</h4>
                    <div className="flex text-secondary-container">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    </div>
                  </div>
                </div>
                <p className="text-on-surface-variant italic">"I swapped my old DSLR for a beautiful teak armchair. The process was so seamless and I met a great neighbor in Colombo!"</p>
              </div>
              
              <div className="p-6 md:p-8 bg-white rounded-xl shadow-sm space-y-6">
                <div className="flex items-center gap-4">
                  <img className="w-14 h-14 rounded-full object-cover" alt="Kasun" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100"/>
                  <div>
                    <h4 className="font-bold text-primary">Kasun Silva</h4>
                    <div className="flex text-secondary-container">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    </div>
                  </div>
                </div>
                <p className="text-on-surface-variant italic">"Found some rare university notes in exchange for a monitor I wasn't using anymore. SwapNest is a game changer for students."</p>
              </div>
              
              <div className="p-6 md:p-8 bg-white rounded-xl shadow-sm space-y-6">
                <div className="flex items-center gap-4">
                  <img className="w-14 h-14 rounded-full object-cover" alt="Amani" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100"/>
                  <div>
                    <h4 className="font-bold text-primary">Amani Fernando</h4>
                    <div className="flex text-secondary-container">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    </div>
                  </div>
                </div>
                <p className="text-on-surface-variant italic">"The curation is amazing. Every item feels high-quality and the community is so respectful. Love the impact we're making together."</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-6 md:px-8">
          <div className="max-w-5xl mx-auto bg-primary rounded-xl overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0 opacity-40 pointer-events-none">
              <img className="w-full h-full object-cover" alt="Tropical community cafe vibe" src="https://images.unsplash.com/photo-1538356345943-424a1380ea0d?auto=format&fit=crop&q=80&w=1000"/>
            </div>
            <div className="relative px-6 py-16 md:py-20 text-center space-y-8">
              <h2 className="text-3xl md:text-5xl font-headline font-extrabold text-white">Ready to find your next treasure?</h2>
              <p className="text-primary-fixed/90 max-w-2xl mx-auto text-base md:text-lg font-medium">Join SwapNest today and start trading with locals. Your first swap is just a few clicks away.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Link to="/register" className="bg-secondary text-on-secondary px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-secondary/20">
                  Create My Profile
                </Link>
                <button className="bg-primary-container text-on-primary-container px-8 py-4 rounded-full font-bold text-lg hover:bg-primary-container/80 transition-colors border border-primary-fixed/20">
                  How it Works
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full rounded-t-[2rem] md:rounded-t-[3rem] mt-10 bg-stone-100">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 md:px-12 py-12 md:py-16 gap-8 max-w-7xl mx-auto">
          <div className="space-y-4 text-center md:text-left">
            <div className="text-xl font-bold text-primary font-headline">SwapNest</div>
            <p className="font-body text-sm text-primary/60 max-w-xs mx-auto md:mx-0">
              © 2026 SwapNest. Cultivating Sustainable Communities through conscious curation and circular trade in Sri Lanka.
            </p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-4 max-w-md">
            <a className="font-body text-sm text-primary/60 hover:text-secondary transition-colors" href="#">Sustainability Report</a>
            <a className="font-body text-sm text-primary/60 hover:text-secondary transition-colors" href="#">Privacy Policy</a>
            <a className="font-body text-sm text-primary/60 hover:text-secondary transition-colors" href="#">Terms of Service</a>
            <a className="font-body text-sm text-primary/60 hover:text-secondary transition-colors" href="#">How it Works</a>
            <a className="font-body text-sm text-primary/60 hover:text-secondary transition-colors" href="#">Contact Us</a>
          </div>
          <div className="flex gap-4">
            <button className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center hover:bg-secondary hover:text-white transition-all">
              <span className="material-symbols-outlined text-xl">language</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center hover:bg-secondary hover:text-white transition-all">
              <span className="material-symbols-outlined text-xl">public</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;