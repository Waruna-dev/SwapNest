const Footer = () => {
  return (
    <footer className="bg-primary text-on-primary font-body w-full rounded-t-[3rem] mt-10 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start w-full px-8 md:px-16 py-20 max-w-7xl mx-auto gap-12">
        
        <div className="mb-8 md:mb-0 max-w-sm">
          <div className="text-3xl font-bold text-on-primary mb-6 font-headline tracking-tighter">SwapNest</div>
          <p className="text-on-primary-container text-base leading-relaxed mb-8 font-medium">Cultivating a circular future for the teardrop island. Join the movement today.</p>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full border border-on-primary/10 flex items-center justify-center text-on-primary hover:bg-secondary hover:text-on-secondary hover:border-transparent cursor-pointer transition-all">
              <span className="material-symbols-outlined text-xl">public</span>
            </div>
            <div className="w-12 h-12 rounded-full border border-on-primary/10 flex items-center justify-center text-on-primary hover:bg-secondary hover:text-on-secondary hover:border-transparent cursor-pointer transition-all">
              <span className="material-symbols-outlined text-xl">chat_bubble</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-12 md:gap-24 w-full md:w-auto">
          <div className="flex flex-col gap-4">
            <h4 className="text-on-primary font-headline font-bold tracking-widest text-xs uppercase mb-2">Resources</h4>
            <a className="text-on-primary-container hover:text-on-primary transition-colors font-medium" href="#how-it-works">How it Works</a>
            <a className="text-on-primary-container hover:text-on-primary transition-colors font-medium" href="#impact">Sustainability Report</a>
            <a className="text-on-primary-container hover:text-on-primary transition-colors font-medium" href="#community">Local Hubs</a>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-on-primary font-headline font-bold tracking-widest text-xs uppercase mb-2">Company</h4>
            <a className="text-on-primary-container hover:text-on-primary transition-colors font-medium" href="#">Privacy Policy</a>
            <a className="text-on-primary-container hover:text-on-primary transition-colors font-medium" href="#">Community Guidelines</a>
            <a className="text-on-primary-container hover:text-on-primary transition-colors font-medium" href="#">Contact Us</a>
          </div>
        </div>
        
      </div>
      
      <div className="max-w-7xl mx-auto px-8 md:px-16 pb-12">
        <div className="border-t border-on-primary/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-on-primary-container text-sm font-medium">© 2026 SwapNest Sri Lanka. Circularity by design.</p>
          <div className="flex gap-8 text-sm font-medium text-on-primary-container">
            <a className="hover:text-on-primary transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-on-primary transition-colors" href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;