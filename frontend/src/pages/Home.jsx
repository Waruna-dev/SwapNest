import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="bg-swap-bg font-sans text-swap-text min-h-screen">
      
      {/* --- 1. NAVBAR --- */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-swap-primary rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-md">S</div>
          <span className="text-2xl font-black tracking-tight text-swap-text">Swap<span className='text-swap-accent'>Nest</span></span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/" className="text-swap-primary border-b-2 border-swap-primary pb-1">Home</Link>
          <a href="#marketplace" className="hover:text-swap-primary transition-colors">Marketplace</a>
          <a href="#how-it-works" className="hover:text-swap-primary transition-colors">How It Works</a>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            to="/login" 
            className="text-sm font-bold text-swap-text hover:text-swap-primary transition-colors hidden sm:block"
          >
            Sign In
          </Link>
          <button className="bg-swap-accent text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
            List an Item
          </button>
        </div>
      </nav>

      {/* --- 2. HERO SECTION --- */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 px-6 md:px-12 py-12 md:py-20 items-center">
        
        {/* Left Text */}
        <div className="flex flex-col gap-6 max-w-xl z-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-swap-primary bg-swap-primary/10 px-4 py-2 rounded-full w-fit">
            <span>✨</span> Building Sustainable Communities
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight text-swap-text">
            Your Local <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-swap-secondary to-swap-accent">
              Thrift & Swap
            </span> <br/>
            Marketplace
          </h1>

          <p className="text-lg text-swap-light leading-relaxed">
            Discover unique secondhand treasures, reduce waste, and connect with your neighbors. Join thousands making sustainable choices every single day.
          </p>

          <div className="flex gap-4 mt-4">
            <button className="bg-swap-primary text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition-all">
              Explore Items
            </button>
            <Link to="/login" className="bg-white border-2 border-swap-light/30 text-swap-text px-8 py-3.5 rounded-xl font-bold hover:border-swap-primary hover:text-swap-primary transition-all">
              Join the Nest
            </Link>
          </div>
        </div>

        {/* Right Images (Staggered Grid) */}
        <div className="relative grid grid-cols-2 gap-4 md:gap-6 items-center">
          <div className="flex flex-col gap-4 md:gap-6 mt-12">
            <img 
              src="https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?q=80&w=400&auto=format&fit=crop" 
              alt="People swapping clothes" 
              className="rounded-3xl object-cover aspect-square shadow-xl"
            />
            <img 
              src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop" 
              alt="Flea market" 
              className="rounded-3xl object-cover aspect-[4/5] shadow-xl"
            />
          </div>
          <div className="flex flex-col gap-4 md:gap-6">
            
            {/* 👇 THIS IS THE BULLETPROOF PICSUM IMAGE */}
            <img 
              src="https://picsum.photos/400/500" 
              alt="Sustainable shopping items" 
              className="rounded-3xl object-cover aspect-[4/5] shadow-xl"
            />
            
            <div className="bg-swap-secondary rounded-3xl aspect-square flex flex-col items-center justify-center p-6 text-white text-center shadow-xl">
              <span className="text-4xl font-black mb-2">10k+</span>
              <span className="text-sm font-medium opacity-90">Items successfully swapped this month!</span>
            </div>
          </div>
        </div>
      </main>

      {/* --- 3. HOW IT WORKS SECTION --- */}
      <section id="how-it-works" className="bg-swap-primary/5 py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-swap-text mb-4">How SwapNest Works</h2>
            <p className="text-swap-light max-w-2xl mx-auto">Decluttering your space and finding new treasures has never been easier. Just three simple steps to start swapping.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-swap-secondary/20 text-swap-secondary rounded-2xl flex items-center justify-center text-2xl mb-6 font-bold">1</div>
              <h3 className="text-xl font-bold mb-3">Snap & Upload</h3>
              <p className="text-swap-light text-sm leading-relaxed">Take a clear photo of the item you want to swap, add a quick description, and post it to your local feed in seconds.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-swap-primary/20 text-swap-primary rounded-2xl flex items-center justify-center text-2xl mb-6 font-bold">2</div>
              <h3 className="text-xl font-bold mb-3">Match & Chat</h3>
              <p className="text-swap-light text-sm leading-relaxed">Browse items from neighbors. When you find something you like, send a message to propose a trade or a fair price.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-swap-accent/20 text-swap-accent rounded-2xl flex items-center justify-center text-2xl mb-6 font-bold">3</div>
              <h3 className="text-xl font-bold mb-3">Meet & Swap</h3>
              <p className="text-swap-light text-sm leading-relaxed">Agree on a safe, local meetup spot. Exchange your items, reduce landfill waste, and enjoy your new treasure!</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 4. FOOTER --- */}
      <footer className="bg-swap-text pt-16 pb-8 px-6 md:px-12 border-t-8 border-swap-primary">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-swap-primary rounded-lg flex items-center justify-center text-white font-black text-lg">S</div>
            <span className="text-xl font-black text-white">Swap<span className='text-swap-accent'>Nest</span></span>
          </div>
          <p className="text-swap-light/60 text-sm">
            © 2026 SwapNest Marketplace. Built for a sustainable future.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default Home;