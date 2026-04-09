import React, { useEffect } from 'react';

const TermsConditions = () => {
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface-container-lowest to-background flex flex-col relative overflow-hidden">
  
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none animate-float"></div>
      <div className="absolute -top-10 -left-10 w-96 h-96 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-secondary-container/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary-container via-primary to-secondary-container bg-[length:200%_100%] animate-gradient-x z-50"></div>
      
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 relative z-10">

        <div className="mb-20 text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary-container/20 flex items-center justify-center animate-float">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-headline font-bold bg-gradient-to-r from-primary via-primary-container to-secondary-container bg-clip-text text-transparent mb-4 animate-gradient">
            Terms & Conditions
          </h1>
          <p className="text-on-surface-variant text-sm font-body flex items-center justify-center gap-3">
            <span className="w-1.5 h-1.5 bg-secondary-container rounded-full"></span>
            <span>Effective Date: March 25, 2026</span>
            <span className="w-1.5 h-1.5 bg-secondary-container rounded-full"></span>
          </p>
        </div>

        <div className="mb-12 flex flex-wrap justify-center gap-3 animate-fade-in-up animation-delay-200">
          {['Acceptance', 'Eligibility', 'Listings', 'Transactions', 'Conduct', 'Volunteers', 'Liability', 'Termination', 'Changes'].map((item, idx) => (
            <a
              key={idx}
              href={`#section-${idx + 1}`}
              className="px-4 py-2 text-sm font-medium text-on-surface-variant bg-white/50 backdrop-blur-sm rounded-full border border-outline-variant/30 hover:bg-secondary-container hover:text-white hover:border-secondary-container transition-all duration-300 hover:scale-105"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       
          <section id="section-1" className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-xl border border-outline-variant/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group scroll-mt-24">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-container/20 to-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-primary">01</span>
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-headline font-bold text-primary">Acceptance of Terms</h2>
              </div>
            </div>
            <p className="text-on-surface-variant leading-relaxed font-body text-lg">
              By accessing, browsing, or using SwapNest (the "Platform"), you acknowledge that you have read, understood, 
              and agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, 
              you must not use our Platform. These terms constitute a legally binding agreement between you and SwapNest.
            </p>
          </section>

          <section id="section-2" className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-outline-variant/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-container/20 to-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl font-bold text-primary">02</span>
              </div>
              <h2 className="text-2xl font-headline font-semibold text-primary">User Eligibility</h2>
            </div>
            <ul className="space-y-4 text-on-surface-variant font-body">
              {[
                { text: "Age Requirement", desc: "You must be at least 18 years old to create an account and use SwapNest services." },
                { text: "Account Information", desc: "You agree to provide accurate, current, and complete information during registration." },
                { text: "Account Security", desc: "You are solely responsible for maintaining the confidentiality of your account credentials." },
                { text: "Legal Capacity", desc: "You must have the legal capacity to enter into binding contracts in your jurisdiction." }
              ].map((item, idx) => (
                <li key={idx} className="group/item hover:translate-x-2 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <span className="text-secondary-container text-lg font-bold group-hover/item:scale-110 transition-transform">✓</span>
                    <div>
                      <strong className="text-on-surface font-semibold block mb-1">{item.text}</strong>
                      <span className="text-on-surface-variant text-sm">{item.desc}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section id="section-3" className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-outline-variant/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-container/20 to-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl font-bold text-primary">03</span>
              </div>
              <h2 className="text-2xl font-headline font-semibold text-primary">Listing Items</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-primary/5 rounded-xl p-4 mb-4">
                <p className="text-sm text-primary font-medium mb-2">📋 Listing Requirements</p>
                <ul className="space-y-3 text-on-surface-variant font-body">
                  {[
                    "Provide accurate, detailed descriptions with high-quality photos",
                    "Specify the item's condition (New, Like New, Good, Fair)",
                    "Include dimensions, materials, and any defects or imperfections"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-secondary-container">•</span>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-error/5 rounded-xl p-4">
                <p className="text-sm text-error font-medium mb-2">🚫 Prohibited Items</p>
                <ul className="space-y-3 text-on-surface-variant font-body">
                  {[
                    "Illegal goods, drugs, or controlled substances",
                    "Counterfeit, replica, or unauthorized products",
                    "Hazardous, flammable, or dangerous materials",
                    "Stolen goods or items without clear ownership"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-error">•</span>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section id="section-4" className="bg-gradient-to-br from-white to-secondary-container/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-outline-variant/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-container/20 to-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl font-bold text-primary">04</span>
              </div>
              <h2 className="text-2xl font-headline font-semibold text-primary">Swap Transactions</h2>
            </div>
            <ul className="space-y-4 text-on-surface-variant font-body">
              {[
                "Swap requests are legally binding once accepted by the listing owner",
                "Users must coordinate and execute the exchange within agreed timelines",
                "Always meet in public, well-lit locations with security cameras",
                "Consider bringing a friend or family member for safety during exchanges",
                "SwapNest acts solely as a platform and is not party to transaction disputes"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 group/item hover:translate-x-2 transition-all duration-300">
                  <span className="text-secondary-container text-xl group-hover/item:scale-110 transition-transform">↻</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="section-5" className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-outline-variant/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-container/20 to-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl font-bold text-primary">05</span>
              </div>
              <h2 className="text-2xl font-headline font-semibold text-primary">User Conduct</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-primary/5 rounded-xl p-4">
                  <p className="text-primary font-semibold mb-2">✅ Expected Behavior</p>
                  <ul className="space-y-2 text-sm">
                    {["Be respectful and courteous", "Communicate clearly and promptly", "Honor your commitments"].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-secondary-container">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-error/5 rounded-xl p-4">
                  <p className="text-error font-semibold mb-2">❌ Prohibited Actions</p>
                  <ul className="space-y-2 text-sm">
                    {["Harassment or abusive behavior", "Spam or unsolicited messages", "Fraudulent or deceptive practices"].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-error">✗</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant mt-2">Violations may result in immediate account suspension or permanent termination.</p>
            </div>
          </section>

          <section id="section-6" className="bg-gradient-to-br from-white to-primary/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-outline-variant/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-container/20 to-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl font-bold text-primary">06</span>
              </div>
              <h2 className="text-2xl font-headline font-semibold text-primary">Volunteer Services</h2>
            </div>
            <p className="text-on-surface-variant leading-relaxed font-body mb-4">
              SwapNest offers optional volunteer delivery services to facilitate item exchanges. While we conduct basic screening, 
              volunteers are independent community members. Users acknowledge that:
            </p>
            <ul className="space-y-3 text-on-surface-variant font-body bg-white/50 rounded-xl p-4">
              {[
                "SwapNest does not employ or directly supervise volunteers",
                "Users assume all risks associated with volunteer-assisted deliveries",
                "Volunteers reserve the right to refuse any delivery request",
                "Report any concerns immediately"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-secondary-container text-lg">ⓘ</span>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="section-7" className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-outline-variant/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-container/20 to-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl font-bold text-primary">07</span>
              </div>
              <h2 className="text-2xl font-headline font-semibold text-primary">Limitation of Liability</h2>
            </div>
            <div className="bg-primary/5 rounded-xl p-5 mb-4">
              <p className="text-on-surface-variant leading-relaxed font-body">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, SWAPNEST PROVIDES THE PLATFORM "AS IS" WITHOUT WARRANTIES OF ANY KIND.
              </p>
            </div>
            <ul className="space-y-3 text-on-surface-variant font-body">
              {[
                "We do not guarantee item condition, authenticity, or quality",
                "We are not responsible for failed, incomplete, or disputed transactions",
                "We do not provide insurance coverage for items or deliveries",
                "We are not liable for indirect, incidental, or consequential damages"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-secondary-container">⚠️</span>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="section-8" className="bg-gradient-to-br from-white to-secondary-container/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-outline-variant/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-container/20 to-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl font-bold text-primary">08</span>
              </div>
              <h2 className="text-2xl font-headline font-semibold text-primary">Termination</h2>
            </div>
            <p className="text-on-surface-variant leading-relaxed font-body mb-4">
              SwapNest reserves the right, in its sole discretion, to suspend or terminate your account and access to the Platform for any reason, including:
            </p>
            <ul className="space-y-2 text-on-surface-variant font-body mb-4">
              {[
                "Violation of these Terms & Conditions",
                "Engagement in fraudulent or deceptive activities",
                "Harmful behavior toward other users or the community",
                "Extended periods of account inactivity"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-secondary-container">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-on-surface-variant italic">You may delete your account at any time through account settings.</p>
          </section>

          <section id="section-9" className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-outline-variant/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-container/20 to-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl font-bold text-primary">09</span>
              </div>
              <h2 className="text-2xl font-headline font-semibold text-primary">Changes to Terms</h2>
            </div>
            <p className="text-on-surface-variant leading-relaxed font-body mb-4">
              We may update these Terms & Conditions periodically to reflect changes in our practices, legal requirements, or operational needs. 
              When we make material changes, we will:
            </p>
            <ul className="space-y-2 text-on-surface-variant font-body mb-4">
              {[
                "Post the updated terms on this page with a new effective date",
                "Notify users via email or platform notification",
                "Require acknowledgment for significant changes"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-secondary-container">📢</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-on-surface-variant">Continued use of the Platform after changes constitutes acceptance of the updated terms.</p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-primary w-full rounded-t-[3rem] mt-16 overflow-hidden relative z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-container/10 to-transparent pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start w-full px-6 md:px-12 py-16 max-w-7xl mx-auto gap-12 relative z-10">
          <div className="mb-8 md:mb-0 max-w-sm">
            <div className="text-3xl font-bold text-on-primary mb-6 font-headline tracking-tighter">SwapNest</div>
            <p className="text-on-primary-container text-base leading-relaxed mb-8 font-body">Cultivating a circular future for the teardrop island. Join the movement today.</p>
            <div className="flex gap-4">
              {['public', 'chat_bubble'].map((icon, idx) => (
                <div key={idx} className="w-12 h-12 rounded-full border border-on-primary/20 flex items-center justify-center text-on-primary hover:bg-secondary-container hover:border-transparent hover:text-on-secondary cursor-pointer transition-all duration-300 group hover:scale-110 hover:shadow-xl">
                  <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">{icon}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-12 md:gap-20 w-full md:w-auto">
            <div className="flex flex-col gap-4">
              <h4 className="text-on-primary font-bold tracking-widest text-xs uppercase mb-3 font-headline">Resources</h4>
              {['How it Works', 'Sustainability Report', 'Local Hubs'].map((item, idx) => (
                <a key={idx} className="text-on-primary-container hover:text-on-primary transition-all duration-300 font-body hover:translate-x-1 inline-block" href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}>{item}</a>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-on-primary font-bold tracking-widest text-xs uppercase mb-3 font-headline">Company</h4>
              <a className="text-on-primary-container hover:text-on-primary transition-all duration-300 font-body hover:translate-x-1 inline-block" href="/privacy">Privacy Policy</a>
              <a className="text-on-primary-container hover:text-on-primary transition-all duration-300 font-body hover:translate-x-1 inline-block" href="/terms">Terms & Conditions</a>
              <a className="text-on-primary-container hover:text-on-primary transition-all duration-300 font-body hover:translate-x-1 inline-block" href="#">Contact Us</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 pb-12 relative z-10">
          <div className="border-t border-on-primary/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-on-primary-container text-sm font-body">© 2026 SwapNest Sri Lanka. Circularity by design.</p>
            <div className="flex gap-8 text-sm font-body text-on-primary-container">
              <a className="hover:text-on-primary transition-colors" href="/terms">Terms of Service</a>
              <a className="hover:text-on-primary transition-colors" href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
          background-size: 200% 100%;
        }
        
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        
        .scroll-mt-24 {
          scroll-margin-top: 6rem;
        }
      `}</style>
    </div>
  );
};

export default TermsConditions;