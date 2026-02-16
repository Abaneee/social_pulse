import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, User, ArrowRight, Zap, TrendingUp, Shield, 
  BarChart3, CheckCircle2, ChevronRight, Layers, Globe, 
  BrainCircuit, Target, X, PieChart, Smartphone
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { login, register } from '../../services/api';

/* --- 1. UI COMPONENTS --- */

const Navbar = ({ onLoginClick }) => (
  <nav className="fixed top-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Zap className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">SocialPulse</span>
      </div>
      <div className="flex items-center gap-6">
        <button className="hidden md:block text-sm text-slate-400 hover:text-white transition-colors">Platform</button>
        <button className="hidden md:block text-sm text-slate-400 hover:text-white transition-colors">Solutions</button>
        <button 
          onClick={onLoginClick}
          className="px-5 py-2 bg-white text-slate-950 text-sm font-semibold rounded-full hover:bg-blue-50 transition-colors"
        >
          Sign In
        </button>
      </div>
    </div>
  </nav>
);

const SectionHeading = ({ badge, title, subtitle }) => (
  <div className="text-center max-w-3xl mx-auto mb-16">
    <div className="inline-flex items-center px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
      {badge}
    </div>
    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
      {title}
    </h2>
    <p className="text-lg text-slate-400 leading-relaxed">
      {subtitle}
    </p>
  </div>
);

const FeatureCard = ({ icon: Icon, title, desc, className }) => (
  <div className={`p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors ${className}`}>
    <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
      <Icon className="text-blue-500 w-6 h-6" />
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

/* --- 2. MAIN LANDING PAGE CONTENT --- */

const LandingPageContent = ({ onGetStarted }) => {
  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 selection:bg-blue-500/30">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/20 rounded-[100%] blur-[120px] pointer-events-none opacity-50" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-[1.1]"
          >
            Turn Social Noise into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
              Market Dominance.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Raw data is overwhelming. We translate millions of social signals into 
            clear, actionable business strategies using enterprise-grade AI.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full text-lg transition-all shadow-[0_0_40px_rgba(37,99,235,0.4)] flex items-center gap-2"
            >
              Analyze My Brand <ArrowRight size={20} />
            </button>
            <button className="px-8 py-4 bg-slate-900 border border-slate-800 text-white font-semibold rounded-full hover:bg-slate-800 transition-colors">
              View Case Studies
            </button>
          </motion.div>
        </div>
      </section>

      {/* The Problem / Solution (Bento Grid) */}
      <section className="py-24 px-6 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto">
          <SectionHeading 
            badge="The Process"
            title="From Chaos to Conversion"
            subtitle="Most businesses drown in data. We build the raft. Here is how SocialPulse transforms your raw metrics into profit."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Data Collection */}
            <FeatureCard 
              className="md:col-span-1"
              icon={Globe}
              title="Global Listening"
              desc="Our engines scrape data from 15+ major platforms in real-time. If it's being said, we capture it."
            />
            
            {/* Card 2: AI Processing (Wide) */}
            <div className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-blue-900/20 to-slate-900 border border-blue-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <BrainCircuit size={120} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <BrainCircuit className="text-white w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">AI Contextualization</h3>
                <p className="text-slate-300 text-lg max-w-md">
                  It's not just about counting likes. Our NLP models understand sentiment, sarcasm, and buying intent hidden within the text.
                </p>
              </div>
            </div>

            {/* Card 3: Strategy (Wide) */}
            <div className="md:col-span-2 p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center gap-8">
               <div className="flex-1">
                 <div className="w-12 h-12 bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-6">
                    <Target className="text-emerald-400 w-6 h-6" />
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-3">Strategic Execution</h3>
                 <p className="text-slate-400">
                   We don't just give you a dashboard. We give you a roadmap. 
                   "Post this content, at this time, to this audience, to increase sales by X%."
                 </p>
               </div>
               <div className="w-full md:w-1/2 bg-slate-950 border border-slate-800 rounded-xl p-4">
                  {/* Mock Chart */}
                  <div className="flex items-end justify-between h-32 gap-2">
                    {[40, 65, 45, 80, 55, 95].map((h, i) => (
                      <div key={i} style={{height: `${h}%`}} className="w-full bg-blue-600/50 rounded-t-sm" />
                    ))}
                  </div>
               </div>
            </div>

            {/* Card 4: Product */}
            <FeatureCard 
              className="md:col-span-1"
              icon={Smartphone}
              title="Product Optimization"
              desc="Use customer feedback loops to refine your product features before your competitors do."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 border-t border-slate-800">
        <div className="max-w-5xl mx-auto text-center bg-gradient-to-b from-blue-900/20 to-slate-900 rounded-[3rem] p-12 border border-white/5">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to decode your audience?
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Join 4,000+ modern brands using SocialPulse to build smarter strategies.
          </p>
          <button 
            onClick={onGetStarted}
            className="px-10 py-5 bg-white text-slate-950 font-bold rounded-full text-lg hover:bg-slate-200 transition-colors"
          >
            Start Your Free Trial
          </button>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 border-t border-slate-900 text-center text-slate-600 text-sm">
        <p>&copy; 2024 SocialPulse Analytics Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};

/* --- 3. AUTH MODAL COMPONENT --- */

const AuthModal = ({ isOpen, onClose, onAuthenticated }) => {
  const navigate = useNavigate();
  
  // Auth State
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '', password: '', username: '', company_name: '', role: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let response;
      if (isLogin) {
        response = await login({ email: formData.email, password: formData.password });
      } else {
        response = await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          company_name: formData.company_name,
          role: formData.role
        });
      }

      const { access, refresh } = response.data.tokens;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      onAuthenticated(true);
      navigate('/dataset');
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.response?.data?.error || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60]"
          />
          
          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <div>
                   <h3 className="text-xl font-bold text-white">{isLogin ? 'Welcome Back' : 'Create Account'}</h3>
                   <p className="text-sm text-slate-400">Access your strategic dashboard.</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Form Area */}
              <div className="p-6 overflow-y-auto">
                {error && (
                   <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-2">
                     <Shield size={16} /> {error}
                   </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                   {!isLogin && (
                     <div className="space-y-4 animate-fadeIn">
                       <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-500 uppercase">Username</label>
                          <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                          <input type="text" placeholder="Company" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm" value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} />
                          <input type="text" placeholder="Role" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} />
                       </div>
                     </div>
                   )}

                   <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase">Email</label>
                      <input type="email" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                   </div>

                   <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 uppercase">Password</label>
                      <input type="password" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                   </div>

                   <button type="submit" disabled={isLoading} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-2">
                     {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                   </button>
                </form>

                <div className="mt-6 text-center">
                   <p className="text-slate-500 text-sm">
                     {isLogin ? "New to SocialPulse?" : "Already have an account?"}
                     <button onClick={() => setIsLogin(!isLogin)} className="ml-2 text-blue-500 hover:text-blue-400 font-semibold">
                       {isLogin ? 'Get Started' : 'Log In'}
                     </button>
                   </p>
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* --- 4. PARENT COMPONENT --- */

const AuthPage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { setIsAuthenticated } = useData();

  return (
    <div className="relative">
      <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
      
      <LandingPageContent onGetStarted={() => setIsAuthModalOpen(true)} />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuthenticated={setIsAuthenticated}
      />
    </div>
  );
};

export default AuthPage;