import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Zap, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { login, register } from '../../services/api';

const AuthPage = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useData();
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

  return (
    <div className="min-h-screen flex text-white relative overflow-hidden bg-midnight-darker">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-neon-purple/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-neon-blue/20 rounded-full blur-[100px]" />
      </div>

      {/* Left Panel - Hero */}
      <div className="hidden lg:flex w-1/2 relative z-10 flex-col justify-center px-20">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-pink via-neon-purple to-neon-blue flex items-center justify-center animate-pulse-glow">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold neon-text">Social Pulse</h1>
          </div>

          <h2 className="text-5xl font-bold leading-tight mb-6">
            Unlock the Power of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink">
              AI Analytics
            </span>
          </h2>

          <p className="text-xl text-white/60 mb-12 max-w-lg">
            Transform your social media data into actionable insights with our advanced ML-powered platform.
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-2xl">
              <TrendingUp className="w-8 h-8 text-neon-green mb-4" />
              <h3 className="text-lg font-semibold mb-2">Predictive Growth</h3>
              <p className="text-white/40 text-sm">Forecast trends with 94% accuracy</p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <Users className="w-8 h-8 text-neon-blue mb-4" />
              <h3 className="text-lg font-semibold mb-2">Audience Deep-Dive</h3>
              <p className="text-white/40 text-sm">Understand behaviors & preferences</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-white/40">
                {isLogin
                  ? 'Enter your credentials to continue'
                  : 'Join thousands of data-driven marketers'}
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
                <div className="space-y-4">
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-neon-blue transition-colors" />
                    <input
                      type="text"
                      placeholder="Username"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-neon-blue/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Company"
                      className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-blue/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Role"
                      className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-neon-blue/50 focus:bg-white/10 transition-all placeholder:text-white/20"
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-neon-purple/50 focus:bg-white/10 transition-all placeholder:text-white/20"
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-neon-pink/50 focus:bg-white/10 transition-all placeholder:text-white/20"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink font-bold text-lg hover:shadow-[0_0_20px_rgba(123,97,255,0.5)] transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2 disabled:opacity-70"
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
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
