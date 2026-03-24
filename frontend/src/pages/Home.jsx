import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="bg-swap-bg font-sans text-swap-text min-h-screen selection:bg-swap-primary selection:text-white">
      
      {/* --- 1. NAVBAR (Sticky with Glassmorphism) --- */}
      <nav className="fixed w-full z-50 top-0 transition-all duration-300 backdrop-blur-md bg-white/80 border-b border-gray-100">
        <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-swap-primary rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-md group-hover:rotate-12 transition-transform duration-300">S</div>
            <span className="text-2xl font-black tracking-tight text-swap-text">Swap<span className='text-swap-accent'>Nest</span></span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <Link to="/" className="text-swap-primary border-b-2 border-swap-primary pb-1">Home</Link>
            <a href="#categories" className="hover:text-swap-primary transition-colors">Categories</a>
            <a href="#how-it-works" className="hover:text-swap-primary transition-colors">How It Works</a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-5">
            <Link to="/login" className="text-sm font-bold text-swap-text hover:text-swap-primary transition-colors hidden sm:block">
              Sign In
            </Link>
            <button className="bg-swap-accent text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-swap-accent/30 hover:shadow-xl hover:shadow-swap-accent/40 hover:-translate-y-0.5 transition-all duration-300">
              List an Item
            </button>
          </div>
        </div>
      </nav>

      {/* --- 2. HERO SECTION (With Search Bar) --- */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 px-6 md:px-12 pt-40 pb-20 items-center">
        {/* Left Text & Search */}
        <div className="flex flex-col gap-6 max-w-xl z-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-swap-primary bg-swap-primary/10 px-4 py-2 rounded-full w-fit hover:bg-swap-primary/20 transition-colors cursor-pointer">
            <span className="animate-pulse">✨</span> The #1 Swapping App
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight text-swap-text">
            Your Local <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-swap-primary via-swap-secondary to-swap-accent">
              Thrift & Swap
            </span> <br/>
            Marketplace
          </h1>

          <p className="text-lg text-swap-light leading-relaxed">
            Discover unique secondhand treasures, reduce landfill waste, and connect with your campus. Join thousands making sustainable choices today.
          </p>

          {/* NEW: Interactive Search Bar */}
          <div className="mt-4 flex bg-white p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 focus-within:ring-2 focus-within:ring-swap-primary/50 transition-all">
            <input 
              type="text" 
              placeholder="Search for vintage tees, textbooks, lamps..." 
              className="w-full px-4 py-3 outline-none text-swap-text bg-transparent placeholder-swap-light"
            />
            <button className="bg-swap-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-md">
              Search
            </button>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-6 mt-4 text-sm font-bold text-swap-light">
            <div className="flex items-center gap-2"><span className="text-swap-secondary text-xl">✓</span> Free to join</div>
            <div className="flex items-center gap-2"><span className="text-swap-secondary text-xl">✓</span> Eco-friendly</div>
            <div className="flex items-center gap-2"><span className="text-swap-secondary text-xl">✓</span> Local meetups</div>
          </div>
        </div>

        {/* Right Images (Animated Grid) */}
        <div className="relative grid grid-cols-2 gap-4 md:gap-6 items-center">
          <div className="flex flex-col gap-4 md:gap-6 mt-12">
            <img 
              src="https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?q=80&w=400&auto=format&fit=crop" 
              alt="People swapping clothes" 
              className="rounded-3xl object-cover aspect-square shadow-xl hover:scale-[1.02] transition-transform duration-500"
            />
            <img 
              src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop" 
              alt="Flea market" 
              className="rounded-3xl object-cover aspect-[4/5] shadow-xl hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
          <div className="flex flex-col gap-4 md:gap-6">
            <img 
              src="https://picsum.photos/400/500?random=1" 
              alt="Sustainable shopping items" 
              className="rounded-3xl object-cover aspect-[4/5] shadow-xl hover:scale-[1.02] transition-transform duration-500"
            />
            <div className="bg-gradient-to-br from-swap-secondary to-swap-accent rounded-3xl aspect-square flex flex-col items-center justify-center p-6 text-white text-center shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
              <span className="text-5xl font-black mb-2 tracking-tighter">10k+</span>
              <span className="text-sm font-bold opacity-90">Items swapped this month!</span>
            </div>
          </div>
        </div>
      </main>

      {/* --- 3. FEATURED CATEGORIES (NEW) --- */}
      <section id="categories" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-swap-text mb-2">Popular Categories</h2>
            <p className="text-swap-light">Find exactly what you are looking for.</p>
          </div>
          <a href="#" className="text-swap-primary font-bold hover:underline hidden sm:block">View All →</a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { title: "Vintage Clothing", icon: "👕", color: "bg-orange-50" },
            { title: "Home & Decor", icon: "🪴", color: "bg-teal-50" },
            { title: "Electronics", icon: "📻", color: "bg-blue-50" },
            { title: "Books & Media", icon: "📚", color: "bg-purple-50" },
          ].map((cat, index) => (
            <div key={index} className={`${cat.color} p-8 rounded-3xl flex flex-col items-center justify-center text-center cursor-pointer hover:-translate-y-2 hover:shadow-xl transition-all duration-300 border border-white/50`}>
              <span className="text-5xl mb-4 drop-shadow-sm">{cat.icon}</span>
              <h3 className="font-bold text-swap-text">{cat.title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* --- 4. HOW IT WORKS --- */}
      <section id="how-it-works" className="bg-swap-primary/5 py-24 mt-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-swap-text mb-4">How SwapNest Works</h2>
            <p className="text-swap-light max-w-2xl mx-auto">Decluttering your space and finding new treasures has never been easier. Just three simple steps to start swapping.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Steps Array for cleaner code */}
            {[
              { num: "1", title: "Snap & Upload", desc: "Take a clear photo of the item you want to swap, add a quick description, and post it to your local feed in seconds.", color: "bg-swap-secondary/20 text-swap-secondary" },
              { num: "2", title: "Match & Chat", desc: "Browse items from neighbors. When you find something you like, send a message to propose a trade or a fair price.", color: "bg-swap-primary/20 text-swap-primary" },
              { num: "3", title: "Meet & Swap", desc: "Agree on a safe, local meetup spot. Exchange your items, reduce landfill waste, and enjoy your new treasure!", color: "bg-swap-accent/20 text-swap-accent" }
            ].map((step, index) => (
              <div key={index} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                <div className={`w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center text-2xl mb-6 font-black group-hover:scale-110 transition-transform duration-300`}>
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-swap-light text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 5. SOCIAL PROOF / TESTIMONIALS (NEW) --- */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto text-center">
         <h2 className="text-3xl md:text-4xl font-black text-swap-text mb-12">Loved by the Community</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white shadow-lg border border-gray-100 relative">
              <div className="text-4xl text-swap-secondary absolute -top-4 left-8">"</div>
              <p className="text-swap-text font-medium italic mb-6">"SwapNest completely changed how I decorate my apartment. I traded an old textbook for a beautiful vintage lamp!"</p>
              <div className="font-bold text-sm text-swap-primary">— Sarah M., Student</div>
            </div>
            <div className="p-8 rounded-3xl bg-white shadow-lg border border-gray-100 relative">
              <div className="text-4xl text-swap-secondary absolute -top-4 left-8">"</div>
              <p className="text-swap-text font-medium italic mb-6">"It is so much safer than other marketplaces because it is focused on our local community. The UI is also incredibly smooth."</p>
              <div className="font-bold text-sm text-swap-primary">— James T., Developer</div>
            </div>
            <div className="p-8 rounded-3xl bg-white shadow-lg border border-gray-100 relative">
              <div className="text-4xl text-swap-secondary absolute -top-4 left-8">"</div>
              <p className="text-swap-text font-medium italic mb-6">"I love that I am reducing waste. I have successfully swapped over 15 items of clothing this semester alone."</p>
              <div className="font-bold text-sm text-swap-primary">— Emily R., Fashion Major</div>
            </div>
         </div>
      </section>

      {/* --- 6. CALL TO ACTION & FOOTER --- */}
      <div className="bg-swap-text pt-20 border-t-8 border-swap-primary">
        <div className="max-w-4xl mx-auto text-center px-6 mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to start swapping?</h2>
          <p className="text-swap-light mb-8 text-lg">Join the fastest growing sustainable marketplace today.</p>
          <Link to="/login" className="bg-swap-accent text-white px-10 py-4 rounded-xl font-black text-lg shadow-xl hover:bg-white hover:text-swap-accent transition-colors duration-300 inline-block">
            Create Your Free Account
          </Link>
        </div>

        <footer className="pb-8 px-6 md:px-12 border-t border-gray-700 pt-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer">
              <div className="w-8 h-8 bg-swap-primary rounded-lg flex items-center justify-center text-white font-black text-lg">S</div>
              <span className="text-xl font-black text-white">Swap<span className='text-swap-accent'>Nest</span></span>
            </div>
            <p className="text-swap-light/60 text-sm">
              © 2026 SwapNest Marketplace. Built for a sustainable future.
            </p>
          </div>
        </footer>
      </div>

    </div>
  );
};

export default Home;