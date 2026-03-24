import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="bg-background text-on-surface overflow-x-hidden font-body">
      
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center w-full px-8 py-4 max-w-7xl mx-auto">
          <div className="text-2xl font-extrabold text-primary font-headline tracking-tight">
            SwapNest
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a className="text-secondary font-bold border-b-2 border-secondary font-headline transition-all" href="#">Home</a>
            <a className="text-primary hover:text-secondary transition-colors font-headline font-bold" href="#">Categories</a>
            <a className="text-primary hover:text-secondary transition-colors font-headline font-bold" href="#">How it Works</a>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/login" className="text-primary font-bold hover:opacity-80 transition-all">
              Sign In
            </Link>
            
            {/* 👇 UPDATED BUTTON: Now a Link to the Register page! */}
            <Link 
              to="/register" 
              className="bg-secondary text-on-secondary px-6 py-2.5 rounded-full font-bold hover:scale-105 active:scale-95 transition-all inline-block"
            >
              Sign Up
            </Link>

          </div>
        </div>
      </nav>

      <main className="pt-24">
        
        {/* Hero Section */}
        <section className="relative px-8 py-20 max-w-7xl mx-auto overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 z-10">
              <h1 className="text-6xl md:text-7xl font-extrabold text-primary leading-[1.1] mb-6 tracking-tight font-headline">
                Your Trash, <br/><span className="text-secondary">Their Treasure.</span>
              </h1>
              <p className="text-xl text-on-surface-variant max-w-lg mb-10 leading-relaxed">
                Join the community-led movement to swap, share, and sustain. Exchange premium goods with neighbors without spending a dime.
              </p>
              
              {/* Glassmorphic Search Bar */}
              <div className="relative max-w-xl group">
                <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl group-focus-within:bg-secondary/10 transition-all"></div>
                <div className="relative flex items-center bg-surface-container-low/80 backdrop-blur-md p-2 rounded-full border border-outline-variant/20">
                  <span className="material-symbols-outlined ml-4 text-on-surface-variant">search</span>
                  <input 
                    className="w-full bg-transparent border-none outline-none focus:ring-0 px-4 text-on-surface placeholder:text-on-surface-variant/60" 
                    placeholder="Search for vintage cameras, plants, decor..." 
                    type="text"
                  />
                  <button className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold hover:bg-primary-container transition-all">
                    Explore
                  </button>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-5 relative">
              {/* Asymmetric Image Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <div className="rounded-3xl overflow-hidden aspect-[4/5] shadow-lg">
                    <img className="w-full h-full object-cover" alt="sustainable fashion" src="https://picsum.photos/400/500?random=1" />
                  </div>
                  <div className="rounded-3xl overflow-hidden aspect-square shadow-lg">
                    <img className="w-full h-full object-cover" alt="minimalist living room" src="https://picsum.photos/400/400?random=2" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-3xl overflow-hidden aspect-square shadow-lg">
                    <img className="w-full h-full object-cover" alt="designer watch" src="https://picsum.photos/400/400?random=3" />
                  </div>
                  <div className="rounded-3xl overflow-hidden aspect-[4/5] shadow-lg">
                    <img className="w-full h-full object-cover" alt="vintage vinyl records" src="https://picsum.photos/400/500?random=4" />
                  </div>
                </div>
              </div>
              {/* Decorative Element */}
              <div className="absolute -z-10 -bottom-10 -right-10 w-64 h-64 bg-primary-fixed opacity-30 rounded-full blur-3xl"></div>
            </div>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="py-24 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex justify-between items-end mb-16">
              <div>
                <h2 className="text-4xl font-extrabold text-primary mb-4 font-headline">Curated Categories</h2>
                <p className="text-on-surface-variant">Find exactly what you need in your local nest.</p>
              </div>
              <button className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all">
                View All <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              <div className="group cursor-pointer">
                <div className="bg-surface-container-lowest p-8 rounded-3xl mb-4 group-hover:-translate-y-2 transition-transform duration-300 flex items-center justify-center aspect-square">
                  <span className="material-symbols-outlined text-5xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>checkroom</span>
                </div>
                <h3 className="font-bold text-center text-primary group-hover:text-secondary transition-colors font-headline">Vintage Clothing</h3>
              </div>
              <div className="group cursor-pointer">
                <div className="bg-surface-container-lowest p-8 rounded-3xl mb-4 group-hover:-translate-y-2 transition-transform duration-300 flex items-center justify-center aspect-square">
                  <span className="material-symbols-outlined text-5xl text-tertiary-fixed-variant" style={{ fontVariationSettings: "'FILL' 1" }}>chair</span>
                </div>
                <h3 className="font-bold text-center text-primary group-hover:text-secondary transition-colors font-headline">Home Decor</h3>
              </div>
              <div className="group cursor-pointer">
                <div className="bg-surface-container-lowest p-8 rounded-3xl mb-4 group-hover:-translate-y-2 transition-transform duration-300 flex items-center justify-center aspect-square">
                  <span className="material-symbols-outlined text-5xl text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>devices</span>
                </div>
                <h3 className="font-bold text-center text-primary group-hover:text-secondary transition-colors font-headline">Electronics</h3>
              </div>
              <div className="group cursor-pointer">
                <div className="bg-surface-container-lowest p-8 rounded-3xl mb-4 group-hover:-translate-y-2 transition-transform duration-300 flex items-center justify-center aspect-square">
                  <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
                </div>
                <h3 className="font-bold text-center text-primary group-hover:text-secondary transition-colors font-headline">Books & Media</h3>
              </div>
              <div className="group cursor-pointer">
                <div className="bg-surface-container-lowest p-8 rounded-3xl mb-4 group-hover:-translate-y-2 transition-transform duration-300 flex items-center justify-center aspect-square">
                  <span className="material-symbols-outlined text-5xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>potted_plant</span>
                </div>
                <h3 className="font-bold text-center text-primary group-hover:text-secondary transition-colors font-headline">Garden & Outdoors</h3>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-32 px-8 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="bg-primary-fixed text-on-primary-fixed px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase mb-6 inline-block">The Process</span>
            <h2 className="text-5xl font-extrabold text-primary font-headline">Simple. Sustainable. Social.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="relative z-10 text-center flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center mb-8 relative group">
                <div className="absolute inset-0 bg-primary/5 rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>add_a_photo</span>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-xl">1</div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary font-headline">Snap</h3>
              <p className="text-on-surface-variant leading-relaxed">Take a quick photo of the item you no longer use. Add a brief description of its condition.</p>
            </div>
            
            <div className="relative z-10 text-center flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center mb-8 relative group">
                <div className="absolute inset-0 bg-primary/5 rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>handshake</span>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-xl">2</div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary font-headline">Match</h3>
              <p className="text-on-surface-variant leading-relaxed">Our curator algorithm matches your items with people nearby who have what you want.</p>
            </div>
            
            <div className="relative z-10 text-center flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center mb-8 relative group">
                <div className="absolute inset-0 bg-primary/5 rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>sync_alt</span>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-xl">3</div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary font-headline">Swap</h3>
              <p className="text-on-surface-variant leading-relaxed">Meet up in a safe, local spot and complete the exchange. Zero waste, zero cost.</p>
            </div>
            
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-[2px] bg-outline-variant/30 -z-0"></div>
          </div>
        </section>

        {/* Community Stats */}
        <section className="mx-8 mb-24">
          <div className="max-w-7xl mx-auto bg-primary rounded-xl p-16 md:p-24 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl opacity-50"></div>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
              <div>
                <div className="text-6xl font-extrabold text-primary-fixed mb-4 font-headline">12K+</div>
                <div className="text-on-primary-container font-medium tracking-wide uppercase text-sm">Items Swapped</div>
              </div>
              <div>
                <div className="text-6xl font-extrabold text-secondary-container mb-4 font-headline">4.8t</div>
                <div className="text-on-primary-container font-medium tracking-wide uppercase text-sm">Waste Diverted</div>
              </div>
              <div>
                <div className="text-6xl font-extrabold text-tertiary-fixed mb-4 font-headline">850</div>
                <div className="text-on-primary-container font-medium tracking-wide uppercase text-sm">Active Hubs</div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-8 max-w-7xl mx-auto">
          <h2 className="text-4xl font-extrabold text-primary text-center mb-16 font-headline">Loved by the Community</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-surface-container-low p-10 rounded-3xl border border-outline-variant/10">
              <div className="flex gap-1 mb-6">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <p className="text-lg text-on-surface mb-8 italic">"I swapped an old DSLR I wasn't using for a beautiful vintage coffee table. The process was so easy and I met a wonderful neighbor!"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img className="w-full h-full object-cover" alt="user" src="https://picsum.photos/100/100?random=5" />
                </div>
                <div>
                  <div className="font-bold text-primary font-headline">Sarah Jenkins</div>
                  <div className="text-sm text-on-surface-variant">Brooklyn, NY</div>
                </div>
              </div>
            </div>
            
            <div className="bg-surface-container-low p-10 rounded-3xl border border-outline-variant/10">
              <div className="flex gap-1 mb-6">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>
              </div>
              <p className="text-lg text-on-surface mb-8 italic">"Best eco-conscious app out there. It's not just about getting free stuff, it's about building a circular economy that actually works."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img className="w-full h-full object-cover" alt="user" src="https://picsum.photos/100/100?random=6" />
                </div>
                <div>
                  <div className="font-bold text-primary font-headline">Marcus Thorne</div>
                  <div className="text-sm text-on-surface-variant">Austin, TX</div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low p-10 rounded-3xl border border-outline-variant/10">
              <div className="flex gap-1 mb-6">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <p className="text-lg text-on-surface mb-8 italic">"I've found so many rare books on SwapNest. The community is high-quality and people really take care of the items they list."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img className="w-full h-full object-cover" alt="user" src="https://picsum.photos/100/100?random=7" />
                </div>
                <div>
                  <div className="font-bold text-primary font-headline">Elena Rodriguez</div>
                  <div className="text-sm text-on-surface-variant">Portland, OR</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-8 max-w-7xl mx-auto">
          <div className="bg-surface-container-high rounded-xl p-16 text-center relative overflow-hidden group">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-secondary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            <h2 className="text-5xl font-extrabold text-primary mb-6 relative z-10 font-headline">Ready to join the movement?</h2>
            <p className="text-xl text-on-surface-variant mb-12 max-w-2xl mx-auto relative z-10">
              Start swapping today and help us build a world where everything has a second life. It only takes 60 seconds to list your first item.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link to="/login" className="bg-secondary text-on-secondary px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-secondary/20">
                Start Swapping
              </Link>
              <button className="bg-primary text-on-primary px-10 py-5 rounded-full font-bold text-lg hover:opacity-90 transition-all">
                How it Works
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low w-full rounded-t-[3rem] mt-20 pb-8 pt-16 border-t border-outline-variant/20">
        <div className="flex flex-col md:flex-row justify-between items-start w-full px-12 max-w-7xl mx-auto mb-16">
          <div className="mb-12 md:mb-0">
            <span className="text-xl font-bold text-primary mb-4 block font-headline">SwapNest</span>
            <p className="max-w-xs text-on-surface-variant text-sm leading-relaxed">
              Building a circular economy, one swap at a time. Join our community of sustainable curators.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="flex flex-col space-y-3">
              <span className="font-bold text-primary mb-2">Company</span>
              <a className="text-on-surface-variant hover:text-secondary transition-colors text-sm" href="#">Mission</a>
              <a className="text-on-surface-variant hover:text-secondary transition-colors text-sm" href="#">Privacy</a>
              <a className="text-on-surface-variant hover:text-secondary transition-colors text-sm" href="#">Terms</a>
            </div>
            <div className="flex flex-col space-y-3">
              <span className="font-bold text-primary mb-2">Community</span>
              <a className="text-on-surface-variant hover:text-secondary transition-colors text-sm" href="#">Guidelines</a>
              <a className="text-on-surface-variant hover:text-secondary transition-colors text-sm" href="#">Contact</a>
              <a className="text-on-surface-variant hover:text-secondary transition-colors text-sm" href="#">Blog</a>
            </div>
            <div className="flex flex-col space-y-4">
              <span className="font-bold text-primary mb-2">Social</span>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-fixed cursor-pointer hover:bg-secondary transition-colors">
                  <span className="material-symbols-outlined">public</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-fixed cursor-pointer hover:bg-secondary transition-colors">
                  <span className="material-symbols-outlined">favorite</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-12 pt-8 border-t border-outline-variant/20 text-center md:text-left">
          <p className="text-on-surface-variant text-sm opacity-60">© 2026 SwapNest. Elevated Sustainability.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;