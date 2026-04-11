import React, { useEffect } from 'react';
import Header from '../components/Header'; 

const PrivacyPolicy = () => {
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface-container-lowest to-background flex flex-col relative overflow-hidden">
      {/* Add padding-top to account for fixed header */}
      <div className="pt-20">
        <Header />
      </div>
      
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none animate-float"></div>
      <div className="absolute -top-10 -left-10 w-96 h-96 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-secondary-container/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
  
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
          <h1 className="text-5xl md:text-7xl font-headline font-bold bg-gradient-to-r from-primary via-primary-container to-secondary-container bg-clip-text text-transparent mb-4 animate-gradient">
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
              <div className="bg-primary/5 rounded p-4 mb-4">
                
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

        
          <section id="section-3" className="bg-white/80 backdrop-blur-sm rounde p-6 md:p-8 shadow-lg border border-outline-variant/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-container/20 to-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl font-bold text-primary">03</span>
              </div>
              <h2 className="text-2xl font-headline font-semibold text-primary">How We Use Your Information</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-primary/5 rounded p-4">
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
              <div className="bg-primary/5 rounded p-4">
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
              <div className="bg-secondary-container/5 rounded p-4">
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
              <div className="bg-white/50 rounded p-4">
                <div className="flex items-center gap-2 mb-3">
                 
                  <p className="text-primary font-semibold">Access & Portability</p>
                </div>
                <ul className="space-y-2 text-sm text-on-surface-variant">
                  <li className="flex items-center gap-2">✓ Request access to your personal data</li>
                  <li className="flex items-center gap-2">✓ Receive data in portable format</li>
                  <li className="flex items-center gap-2">✓ Know what information we hold</li>
                </ul>
              </div>
              <div className="bg-white/50 rounded p-4">
                <div className="flex items-center gap-2 mb-3">
               
                  <p className="text-primary font-semibold">Correction & Deletion</p>
                </div>
                <ul className="space-y-2 text-sm text-on-surface-variant">
                  <li className="flex items-center gap-2">✓ Update inaccurate information</li>
                  <li className="flex items-center gap-2">✓ Delete your account and data</li>
                  <li className="flex items-center gap-2">✓ Opt out of marketing communications</li>
                </ul>
              </div>
              <div className="bg-white/50 rounded p-4">
                <div className="flex items-center gap-2 mb-3">
            
                  <p className="text-primary font-semibold">Processing Restrictions</p>
                </div>
                <ul className="space-y-2 text-sm text-on-surface-variant">
                  <li className="flex items-center gap-2">✓ Restrict how we process your data</li>
                  <li className="flex items-center gap-2">✓ Object to certain processing activities</li>
                  <li className="flex items-center gap-2">✓ Withdraw consent at any time</li>
                </ul>
              </div>
              <div className="bg-white/50 rounded p-4">
                <div className="flex items-center gap-2 mb-3">
             
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
              <div className="bg-primary/5 rounded p-5">
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
            <div className="w-12 h-12 rounded-full border border-on-primary/10 flex items-center justify-center text-on-primary hover:bg-secondary hover:text-on-secondary hover:border-transparent cursor-pointer transition-all">
              <span className="material-symbols-outlined text-xl">public</span>
            </div>
            {/* Facebook */}
            <div className="w-12 h-12 rounded-full border border-on-primary/10 flex items-center justify-center text-on-primary hover:bg-[#1877F2] hover:text-white hover:border-transparent cursor-pointer transition-all duration-300 hover:scale-110">
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Twitter/X */}
            <div className="w-12 h-12 rounded-full border border-on-primary/10 flex items-center justify-center text-on-primary hover:bg-[#1DA1F2] hover:text-white hover:border-transparent cursor-pointer transition-all duration-300 hover:scale-110">
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </div>

            {/* Instagram */}
            <div className="w-12 h-12 rounded-full border border-on-primary/10 flex items-center justify-center text-on-primary hover:bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:text-white hover:border-transparent cursor-pointer transition-all duration-300 hover:scale-110">
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
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
              <a className="text-on-primary-container hover:text-on-primary transition-all duration-300 font-body hover:translate-x-1 inline-block" href="/community-guidelines">Community Guidelines</a>
              <a className="text-on-primary-container hover:text-on-primary transition-all duration-300 font-body hover:translate-x-1 inline-block" href="#">Contact Us</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 pb-12 relative z-10">
          <div className="border-t border-on-primary/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-on-primary-container text-sm font-body">© 2026 SwapNest Sri Lanka. Circularity by design.</p>
            <div className="flex gap-8 text-sm font-body text-on-primary-container">
              <a className="hover:text-on-primary transition-colors" href="/terms">Terms of Service</a>
          
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