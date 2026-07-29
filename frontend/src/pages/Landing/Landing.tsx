import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  BarChart3, 
  Box, 
  Users, 
  Layers, 
  ShieldCheck,
  Zap,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 selection:bg-indigo-500/30">
      
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200 dark:border-slate-800 shadow-sm' : 'bg-transparent border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <Zap className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight">FlowSphere | Enterprise</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</a>
              <a href="#solutions" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Solutions</a>
              <a href="#pricing" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Pricing</a>
            </div>

            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors hidden sm:block"
              >
                Sign in
              </Link>
              <Link 
                to="/register" 
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors hidden sm:block"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 blur-[120px]" />
          <div className="absolute top-[20%] right-[-5%] w-[30%] h-[50%] rounded-full bg-blue-500/10 dark:bg-blue-500/20 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl mx-auto leading-[1.1]">
            Enterprise operations, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-400">
              beautifully simplified.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Unify your inventory, sales, customers, and operations in one modern, blazing-fast platform designed for scale.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xl shadow-slate-900/10 dark:shadow-white/10 transition-all hover:scale-[1.02]"
            >
              Start for free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <a 
              href="#demo"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm transition-all"
            >
              Book a demo
            </a>
          </div>

          {/* Dashboard Preview Image/Mockup */}
          <div className="mt-20 relative mx-auto max-w-5xl">
            <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 p-2 shadow-2xl backdrop-blur-sm">
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 aspect-[16/9] relative flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800 opacity-50" />
                {/* Mock UI elements to look like a dashboard */}
                <div className="absolute inset-4 sm:inset-8 border border-slate-200/80 dark:border-slate-700/80 rounded-lg bg-white dark:bg-slate-900 shadow-lg flex flex-col overflow-hidden">
                  {/* Topbar */}
                  <div className="h-12 border-b border-slate-100 dark:border-slate-800 flex items-center px-4 justify-between bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <div className="w-32 h-4 rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
                  {/* Body */}
                  <div className="flex-1 flex p-4 gap-4">
                    {/* Sidebar mock */}
                    <div className="w-32 hidden sm:flex flex-col gap-3 pt-2">
                      <div className="w-full h-4 rounded bg-slate-200 dark:bg-slate-800" />
                      <div className="w-3/4 h-4 rounded bg-slate-100 dark:bg-slate-800/50" />
                      <div className="w-5/6 h-4 rounded bg-slate-100 dark:bg-slate-800/50" />
                      <div className="w-4/5 h-4 rounded bg-slate-100 dark:bg-slate-800/50" />
                    </div>
                    {/* Main content mock */}
                    <div className="flex-1 flex flex-col gap-4 pt-2">
                      <div className="flex gap-4">
                        <div className="h-24 flex-1 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50" />
                        <div className="h-24 flex-1 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50" />
                        <div className="h-24 flex-1 hidden md:block rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50" />
                      </div>
                      <div className="flex-1 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Everything you need to scale</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              FlowSphere provides a complete suite of tools to manage your entire business operations from a single pane of glass.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Box className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
              title="Inventory Management"
              description="Track stock levels in real-time across multiple warehouses. Get low stock alerts automatically."
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
              title="CRM & Customers"
              description="Manage leads, distributors, and retail clients. Log notes and set follow-up reminders effortlessly."
            />
            <FeatureCard 
              icon={<Layers className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
              title="Sales Challans"
              description="Generate beautiful delivery challans and invoices instantly with auto-populated product pricing."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
              title="Advanced Reporting"
              description="Make data-driven decisions with real-time analytics on sales trends, top products, and revenue."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6 text-rose-600 dark:text-rose-400" />}
              title="Role-based Access"
              description="Secure your data with granular permissions for Admin, Sales, Warehouse, and Accounts teams."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
              title="Lightning Fast"
              description="Built on modern tech stack ensuring your team never waits for a page to load again."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Ready to transform your operations?</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
            Join forward-thinking companies that have upgraded their legacy ERPs to FlowSphere.
          </p>
          <Link 
            to="/login"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-1"
          >
            Get Started Now
          </Link>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card required</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 14-day free trial</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 bg-indigo-600 rounded flex items-center justify-center">
                  <Zap className="text-white w-4 h-4" />
                </div>
                <span className="font-bold tracking-tight">FlowSphere | Enterprise</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mb-6">
                Modern enterprise resource planning software for the next generation of businesses.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-sm mb-4">Product</h3>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Changelog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-sm mb-4">Company</h3>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-sm mb-4">Legal</h3>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} FlowSphere Inc. All rights reserved.
            </p>
            <div className="flex gap-4">
              {/* Social icons placeholders */}
              <div className="w-5 h-5 rounded bg-slate-300 dark:bg-slate-700 hover:bg-indigo-600 dark:hover:bg-indigo-500 cursor-pointer transition-colors" />
              <div className="w-5 h-5 rounded bg-slate-300 dark:bg-slate-700 hover:bg-indigo-600 dark:hover:bg-indigo-500 cursor-pointer transition-colors" />
              <div className="w-5 h-5 rounded bg-slate-300 dark:bg-slate-700 hover:bg-indigo-600 dark:hover:bg-indigo-500 cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none group">
      <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
};
