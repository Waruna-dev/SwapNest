// src/pages/PrivacyPolicy.jsx
import React, { useEffect } from 'react';

const PrivacyPolicy = () => {
  // Smooth scroll to top on page load
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6-4h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zm10-10V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v4" />
              </svg>
            </div>
          </div>
          <div className="inline-block mb-4">
          
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-bold bg-gradient-to-r from-primary via-primary-container to-secondary-container bg-clip-text  mb-4 animate-gradient">
            Privacy Policy
          </h1>
          <p className="text-on-surface-variant text-sm font-body flex items-center justify-center gap-3">
            <span className="w-1.5 h-1.5 bg-secondary-container rounded-full"></span>
            <span>Effective Date: March 25, 2026</span>
            <span className="w-1.5 h-1.5 bg-secondary-container rounded-full"></span>
            
          </p>
        </div>

        <div className="mb-12 flex flex-wrap justify-center gap-3 animate-fade-in-up animation-delay-200">
          {['Introduction', 'Collection', 'Usage', 'Sharing', 'Rights', 'Security'].map((item, idx) => (
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
                <h2 className="text-3xl font-headline font-bold text-primary">Introduction</h2>
              </div>
            </div>
            <p className="text-on-surface-variant leading-relaxed font-body text-lg">
              At SwapNest, we value your privacy and are committed to protecting your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our platform. 
              We believe in transparency and want you to understand our practices regarding your information.
            </p>
          </section>

          <section id="section-2" className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-outline-variant/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-container/20 to-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl font-bold text-primary">02</span>
              </div>
              <h2 className="text-2xl font-headline font-semibold text-primary">Information We Collect</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-primary/5 rounded-xl p-4 mb-4">
                
                <ul className="space-y-4 text-on-surface-variant font-body">
                  {[
                    { title: "Personal Information", desc: "Name, email address, contact number, and location", icon: "🔸" },
                    { title: "Account Data", desc: "Username, password, profile picture, and preferences", icon: "🔸" },
                    { title: "Transaction Data", desc: "Items listed, swap requests, exchange history, ratings", icon: "🔸" },
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 group/item hover:translate-x-2 transition-all duration-300">
                      <span className="text-2xl group-hover/item:scale-110 transition-transform">{item.icon}</span>
                      <div className="flex-1">
                        <strong className="text-on-surface font-semibold block mb-1">{item.title}</strong>
                        <span className="text-on-surface-variant text-sm">{item.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
            </div>
          </section>

        
          <section id="section-3" className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-outline-variant/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-container/20 to-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl font-bold text-primary">03</span>
              </div>
              <h2 className="text-2xl font-headline font-semibold text-primary">How We Use Your Information</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-primary/5 rounded-xl p-4">
                <p className="text-primary font-semibold mb-3">Primary Purposes</p>
                <ul className="space-y-3 text-on-surface-variant font-body">
                  {[
                    "Create and manage your account securely",
                    "Facilitate swap transactions between users",
                    "Verify your identity and prevent fraud",
                    "Communicate important updates and notifications",
                    "Improve our services and user experience",
                    "Provide personalized content and recommendations"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 group/item hover:translate-x-2 transition-all duration-300">
                      <span className="text-secondary-container text-lg group-hover/item:scale-110 transition-transform">✓</span>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section id="section-4" className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-outline-variant/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-container/20 to-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl font-bold text-primary">04</span>
              </div>
              <h2 className="text-2xl font-headline font-semibold text-primary">Sharing Your Information</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-primary/5 rounded-xl p-4">
                <p className="text-primary font-semibold mb-3"> When We Share Your Data</p>
                <ul className="space-y-3 text-on-surface-variant font-body">
                  {[
                    { context: "With Other Users", desc: "Username, profile picture, and item details during swap transactions" },
                    { context: "Legal Compliance", desc: "When required by law, court order, or to protect our rights" },
                    { context: "Business Transfers", desc: "In connection with mergers, acquisitions, or asset sales" }
                  ].map((item, idx) => (
                    <li key={idx} className="border-b border-outline-variant/30 last:border-0 pb-3 last:pb-0">
                      <div className="flex items-start gap-3">
                        <span className="text-secondary-container text-lg">•</span>
                        <div>
                          <strong className="text-on-surface font-semibold block text-sm">{item.context}</strong>
                          <span className="text-on-surface-variant text-sm">{item.desc}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-secondary-container/5 rounded-xl p-4">
                <p className="text-secondary-container font-semibold text-sm mb-2">🚫 We Never Sell Your Data</p>
                <p className="text-xs text-on-surface-variant">
                  SwapNest does not and will never sell your personal information to third parties. 
                  Your trust is our priority.
                </p>
              </div>
            </div>
          </section>

          <section id="section-5" className="bg-gradient-to-br from-white to-primary/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-outline-variant/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-container/20 to-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl font-bold text-primary">05</span>
              </div>
              <h2 className="text-2xl font-headline font-semibold text-primary">Your Privacy Rights</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🔍</span>
                  <p className="text-primary font-semibold">Access & Portability</p>
                </div>
                <ul className="space-y-2 text-sm text-on-surface-variant">
                  <li className="flex items-center gap-2">✓ Request access to your personal data</li>
                  <li className="flex items-center gap-2">✓ Receive data in portable format</li>
                  <li className="flex items-center gap-2">✓ Know what information we hold</li>
                </ul>
              </div>
              <div className="bg-white/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">✏️</span>
                  <p className="text-primary font-semibold">Correction & Deletion</p>
                </div>
                <ul className="space-y-2 text-sm text-on-surface-variant">
                  <li className="flex items-center gap-2">✓ Update inaccurate information</li>
                  <li className="flex items-center gap-2">✓ Delete your account and data</li>
                  <li className="flex items-center gap-2">✓ Opt out of marketing communications</li>
                </ul>
              </div>
              <div className="bg-white/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">⚙️</span>
                  <p className="text-primary font-semibold">Processing Restrictions</p>
                </div>
                <ul className="space-y-2 text-sm text-on-surface-variant">
                  <li className="flex items-center gap-2">✓ Restrict how we process your data</li>
                  <li className="flex items-center gap-2">✓ Object to certain processing activities</li>
                  <li className="flex items-center gap-2">✓ Withdraw consent at any time</li>
                </ul>
              </div>
              <div className="bg-white/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📞</span>
                  <p className="text-primary font-semibold">Lodge Complaints</p>
                </div>
                <ul className="space-y-2 text-sm text-on-surface-variant">
                  <li className="flex items-center gap-2">✓ Contact our Office</li>
                  <li className="flex items-center gap-2">✓ File complaint with supervisory authority</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="section-6" className="bg-gradient-to-br from-white to-secondary-container/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg border border-outline-variant/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-container/20 to-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl font-bold text-primary">06</span>
              </div>
              <h2 className="text-2xl font-headline font-semibold text-primary">Data Security</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-primary/5 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  
                </div>
                <p className="text-on-surface-variant leading-relaxed font-body text-sm mb-4">
                   We implement industry-standard security measures to protect your personal information. 
              Your passwords are encrypted. We update our security protocols to ensure your data remains safe from unauthorized access.
                </p>
                
              </div>
              
            </div>
          </section>


          
        </div>
      </div>

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

export default PrivacyPolicy;