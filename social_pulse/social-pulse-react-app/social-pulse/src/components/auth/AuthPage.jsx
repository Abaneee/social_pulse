import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Mail, Lock, User, ArrowRight, Zap, TrendingUp, 
  Users, AlertCircle, Activity, BarChart2, Globe, ChevronDown 
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { login, register } from '../../services/api';

const AuthPage = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useData();
  const authRef = useRef(null); // Reference to scroll to login section

  // --- AUTH STATE & LOGIC (Kept from your original code) ---
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    company_name: '',
    role: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let response;
      if (isLogin) {
        response = await login({
          email: formData.email,
          password: formData.password
        });
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
      setIsAuthenticated(true);
      navigate('/dataset');
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.response?.data?.error || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToAuth = () => {
    authRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-midnight-darker text-white overflow-x-hidden selection:bg-neon-blue selection:text-white">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-midnight-darker/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">SocialPulse</span>
          </div>
          <button 
            onClick={scrollToAuth}
            className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-6 min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-neon-blue/20 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neon-blue text-xs font-bold uppercase tracking-wider mb-8">
            <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
            <span>Live System Active</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            The Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink">
              Engagement Intelligence
            </span>
          </h1>

          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop guessing. Start knowing. Analyze social trends in real-time, predict viral content with AI, and dominate your niche with data-driven precision.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={scrollToAuth}
              className="px-8 py-4 rounded-xl bg-neon-blue text-black font-bold text-lg hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all transform hover:-translate-y-1"
            >
              Start Analyzing Free
            </button>
            <button className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 font-bold text-lg hover:bg-white/10 transition-all flex items-center space-x-2">
              <PlayIcon /> <span>Watch Demo</span>
            </button>
          </div>
        </motion.div>

        {/* Floating Mock UI Element */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-16 w-full max-w-5xl glass-card border border-white/10 rounded-t-3xl p-4 md:p-8 relative"
        >
           <div className="absolute inset-0 bg-gradient-to-t from-midnight-darker via-transparent to-transparent z-20" /> {/* Fade out bottom */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-80">
              <MockStatCard icon={Activity} label="Live Engagement" value="+12.5%" color="text-neon-green" />
              <MockStatCard icon={Users} label="Active Reach" value="2.4M" color="text-neon-blue" />
              <MockStatCard icon={TrendingUp} label="Viral Probability" value="High" color="text-neon-pink" />
           </div>
        </motion.div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-24 bg-black/20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Globe className="w-8 h-8 text-neon-blue" />}
              title="Real-Time Monitoring"
              desc="Ingest data streams instantly. Watch your engagement metrics evolve as the world interacts with your content."
            />
            <FeatureCard 
              icon={<BarChart2 className="w-8 h-8 text-neon-purple" />}
              title="Predictive ML Models"
              desc="Our proprietary AI forecasts trend trajectories with 94% accuracy, letting you pivot before the market moves."
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8 text-neon-pink" />}
              title="Audience Deep-Dive"
              desc="Go beyond demographics. Understand psychographics, sentiment, and behavior patterns at scale."
            />
          </div>
        </div>
      </section>

      {/* --- AUTH SECTION (Bottom) --- */}
      <section ref={authRef} className="py-24 relative overflow-hidden flex items-center justify-center min-h-[90vh]">
        {/* Background Gradients for Auth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-purple/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10 px-6">
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl"
          >
            <div className="text-center mb-8">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">
                {isLogin ? 'Welcome Back' : 'Get Started'}
              </h2>
              <p className="text-white/40">
                {isLogin ? 'Access your dashboard' : 'Create your professional account'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 flex items-center space-x-3 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-neon-blue transition-colors" />
                    <input
                      type="text"
                      placeholder="Username"
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-neon-blue/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Company"
                      className="bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-blue/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Role"
                      className="bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-blue/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-neon-purple transition-colors" />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-neon-purple/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-neon-pink transition-colors" />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-neon-pink/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink font-bold text-lg hover:shadow-[0_0_20px_rgba(123,97,255,0.5)] transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2 disabled:opacity-70 mt-4"
              >
                {isLoading ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-white/40 text-sm">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-neon-blue hover:text-neon-purple transition-colors font-medium"
                >
                  {isLogin ? 'Sign Up Now' : 'Sign In'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Simple */}
      <footer className="py-8 text-center text-white/20 text-sm border-t border-white/5">
        &copy; {new Date().getFullYear()} SocialPulse Analytics. All rights reserved.
      </footer>
    </div>
  );
};

// --- Helper Components ---

const FeatureCard = ({ icon, title, desc }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-neon-blue/30 transition-all"
  >
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-white/50 leading-relaxed">{desc}</p>
  </motion.div>
);

const MockStatCard = ({ icon: Icon, label, value, color }) => (
  <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center space-x-4">
    <div className={`p-3 rounded-lg bg-white/5 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-xs text-white/40 uppercase">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
);

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 3L19 12L5 21V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default AuthPage;