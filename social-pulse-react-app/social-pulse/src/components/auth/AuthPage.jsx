import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, User, ArrowRight, Zap, TrendingUp, Shield,
  BarChart3, CheckCircle2, ChevronRight, Layers, Globe,
  BrainCircuit, Target, X, PieChart, Smartphone, Sparkles, FileText,
  Activity, Users, Database
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { useData } from '../../context/DataContext';
import { login, register } from '../../services/api';

/* --- 1. UI COMPONENTS --- */

const Navbar = ({ onLoginClick }) => {
  const { theme, toggleTheme } = useData();
  const isDark = theme === 'dark';

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 backdrop-blur-xl border-b transition-all duration-300 ${isDark ? 'bg-slate-950/20 border-white/5' : 'bg-white/40 border-slate-200'
      }`}>
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="text-white w-5 h-5 fill-white" />
          </div>
          <span className={`text-xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
            SOCIAL<span className="text-blue-600">PULSE</span>
          </span>
        </motion.div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-8 text-sm font-bold">
            <button className={`transition-colors relative group ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
              Vision
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
            </button>
            <button className={`transition-colors relative group ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
              Impact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
            </button>
          </div>

          <div className="h-6 w-[1px] bg-slate-200 dark:bg-white/10 hidden sm:block" />

          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-full transition-all ${isDark ? 'bg-white/5 text-yellow-400 hover:bg-white/10' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
          >
            {isDark ? <Sparkles size={18} /> : <Zap size={18} />}
          </button>

          <button
            onClick={onLoginClick}
            className={`px-6 py-2.5 text-sm font-bold rounded-full transition-all shadow-xl hover:scale-105 active:scale-95 ${isDark ? 'bg-white text-slate-950 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            Enter App
          </button>
        </div>
      </div>
    </nav>
  );
};

const SectionHeading = ({ badge, title, subtitle, centered = true }) => {
  const { theme } = useData();
  const isDark = theme === 'dark';

  return (
    <div className={`${centered ? 'text-center' : ''} max-w-4xl ${centered ? 'mx-auto' : ''} mb-16 px-6`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`inline-flex items-center px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest mb-6 ${isDark ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' : 'border-blue-200 bg-blue-50 text-blue-600'
          }`}
      >
        <Sparkles className="w-3 h-3 mr-2" />
        {badge}
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className={`text-3xl md:text-5xl font-black mb-6 leading-tight tracking-tight ${isDark ? 'text-white' : 'text-slate-900'
          }`}
      >
        {title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className={`text-lg leading-relaxed max-w-2xl ${centered ? 'mx-auto' : ''} ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'
          }`}
      >
        {subtitle}
      </motion.p>
    </div>
  );
};

const MiniMISDashboard = ({ isDark }) => {
  const data = [
    { name: 'Mon', growth: 400, health: 80 },
    { name: 'Tue', growth: 700, health: 85 },
    { name: 'Wed', growth: 600, health: 75 },
    { name: 'Thu', growth: 900, health: 90 },
    { name: 'Fri', growth: 1200, health: 95 },
    { name: 'Sat', growth: 1000, health: 88 },
    { name: 'Sun', growth: 1500, health: 98 },
  ];

  const axisStyle = {
    fontSize: '10px',
    fontWeight: 'bold',
    fill: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
  };

  return (
    <div className={`w-full h-full flex flex-col gap-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Users', val: '12.4K', color: 'text-blue-500' },
          { label: 'Audit Score', val: '98%', color: 'text-emerald-500' },
          { label: 'Cloud Load', val: '14%', color: 'text-purple-500' }
        ].map((kpi, i) => (
          <div key={i} className={`p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{kpi.label}</p>
            <p className={`text-xl font-black italic tracking-tighter ${kpi.color}`}>{kpi.val}</p>
          </div>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" {...axisStyle} axisLine={false} tickLine={false} />
            <Area type="monotone" dataKey="growth" stroke="#3b82f6" fill="url(#grad1)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <Bar dataKey="health" fill={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"} radius={[4, 4, 0, 0]} />
            <Bar dataKey="growth" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const MISSection = ({ onGetStarted }) => {
  const { theme } = useData();
  const isDark = theme === 'dark';

  return (
    <section className={`py-32 px-6 relative overflow-hidden ${isDark ? 'bg-slate-950/20' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-20">
        <div className="flex-1">
          <SectionHeading
            centered={false}
            badge="Management Info Systems"
            title="MIS: The Executive View of your Digital World."
            subtitle="High-level decision making shouldn't require manual assembly. Our MIS Dashboard provides a bird's-eye view of your entire data infrastructure."
          />

          {/* Market & User Needs Summary */}
          <div className="mb-10 space-y-4">
            <h4 className={`text-xs font-black uppercase tracking-[0.2em] mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Market Audit & User Needs</h4>
            {[
              { icon: Users, title: "Audience Sentiment Gap", desc: "Identify why users are leaving competitors for your niche.", color: "text-blue-500" },
              { icon: Target, title: "Unmet Feature Demand", desc: "AI-detected patterns in comment sections revealing high-value needs.", color: "text-emerald-500" },
              { icon: Activity, title: "Real-time Saturation", desc: "Audit if your market is over-saturated with legacy content.", color: "text-purple-500" }
            ].map((need, i) => (
              <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border transition-all hover:scale-[1.02] ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                <div className={`p-2 rounded-lg bg-opacity-10 ${need.color} bg-current`}>
                  <need.icon size={18} />
                </div>
                <div>
                  <h5 className={`text-sm font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{need.title}</h5>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{need.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 mb-10">
            <div className={`p-6 rounded-2xl border transition-all hover:bg-blue-600/5 group ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
              <h4 className={`font-black mb-2 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Layers className="text-blue-500" size={20} /> Unified Dataset Control
              </h4>
              <p className="text-sm text-slate-500 font-medium">Manage all your raw social feeds, refinery status, and ML models from a single mission control center.</p>
            </div>
            <div className={`p-6 rounded-2xl border transition-all hover:bg-purple-600/5 group ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
              <h4 className={`font-black mb-2 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <FileText className="text-purple-500" size={20} /> Automated Board Reports
              </h4>
              <p className="text-sm text-slate-500 font-medium">Generate 1-click executive summaries with AI-distilled insights ready for board-room presentation.</p>
            </div>
          </div>
          <button
            onClick={onGetStarted}
            className={`px-8 py-4 font-black rounded-full transition-all flex items-center gap-3 ${isDark ? 'bg-purple-600 text-white hover:bg-purple-500' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-xl'}`}
          >
            Explore MIS Engine <ArrowRight size={18} />
          </button>
        </div>

        <div className="flex-1 w-full relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className={`aspect-[4/3] rounded-[3rem] border shadow-2xl overflow-hidden p-10 flex flex-col ${isDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'}`}
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex gap-2">
                <div className="w-4 h-4 rounded-full bg-rose-500" />
                <div className="w-4 h-4 rounded-full bg-amber-500" />
                <div className="w-4 h-4 rounded-full bg-emerald-500" />
              </div>
              <div className="flex items-center gap-4">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>REAL-TIME MISSION CONTROL</div>
                <Database size={16} className="text-slate-500" />
              </div>
            </div>

            <div className="flex-1">
              <MiniMISDashboard isDark={isDark} />
            </div>

            <div className={`mt-10 pt-10 border-t flex justify-between items-center ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
              <div className="flex items-center gap-3 text-slate-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">System Healthy: 12 Nodes Online</span>
              </div>
              <button onClick={onGetStarted} className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:underline">Download Audit.pdf</button>
            </div>
          </motion.div>

          {/* Floating UI Elements */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className={`absolute -top-10 -right-10 p-6 rounded-3xl border shadow-2xl ${isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                <BarChart3 className="text-indigo-500" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-500 uppercase">Growth Index</div>
                <div className={`text-xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>+412.5%</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const AIAssistantSection = ({ onGetStarted }) => {
  const { theme } = useData();
  const isDark = theme === 'dark';

  const floatingChats = [
    { text: "What's the sentiment in Europe?", delay: 0 },
    { text: "Predict next week's viral trend.", delay: 2 },
    { text: "Our brand's ROI vs Competitor X.", delay: 4 },
    { text: "Alert me if 'Crisis' sentiment > 10%.", delay: 1 },
    { text: "Analyze buying intent in Gen Z.", delay: 3 },
  ];

  return (
    <section className={`py-32 px-6 relative overflow-hidden ${isDark ? 'bg-slate-900/40' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 text-left">
          <SectionHeading
            centered={false}
            badge="AI Intelligence"
            title="Ask the Pulse AI. Clear your Data Doubts."
            subtitle="Don't spend hours diving into charts. Just ask. Our Neural Engine processes billions of signals to give you human-like answers in milliseconds."
          />
          <div className="space-y-6 mb-10">
            <div className="flex gap-4 p-5 rounded-2xl border transition-all hover:border-blue-500/30 group bg-blue-500/5">
              <BrainCircuit className="text-blue-500 flex-shrink-0" size={24} />
              <div>
                <h4 className={`font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Zero-Latency Context</h4>
                <p className="text-sm text-slate-500 font-medium tracking-tight leading-relaxed">Instantly identify sarcasm, slang, and cultural context that legacy tools miss.</p>
              </div>
            </div>
            <div className="flex gap-4 p-5 rounded-2xl border transition-all hover:border-purple-500/30 group bg-purple-500/5">
              <Target className="text-purple-500 flex-shrink-0" size={24} />
              <div>
                <h4 className={`font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Decision Mapping</h4>
                <p className="text-sm text-slate-500 font-medium tracking-tight leading-relaxed">The AI doesn't just show data; it provides a 'Decision Map' for your next strategic move.</p>
              </div>
            </div>
          </div>
          <button
            onClick={onGetStarted}
            className={`px-8 py-4 font-black rounded-full transition-all flex items-center gap-3 ${isDark ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl'}`}>
            Try Voice Mode <Smartphone size={18} />
          </button>
        </div>

        <div className="flex-1 relative w-full max-w-lg aspect-square flex items-center justify-center">
          {/* Animated Robot Illustration */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-20 w-64 h-84"
          >
            {/* Robot Head */}
            <div className={`w-32 h-32 mx-auto rounded-3xl border-4 relative ${isDark ? 'bg-slate-950 border-blue-500/50 shadow-[0_0_50px_rgba(37,99,235,0.3)]' : 'bg-white border-blue-600 shadow-xl'}`}>
              <div className="absolute top-8 left-6 w-4 h-4 rounded-full bg-blue-500 animate-pulse" />
              <div className="absolute top-8 right-6 w-4 h-4 rounded-full bg-blue-500 animate-pulse" />
              <motion.div
                animate={{ scaleX: [0.8, 1, 0.8] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-500/50"
              />
            </div>
            {/* Robot Body */}
            <div className={`w-48 h-40 mx-auto mt-2 rounded-[2.5rem] border-4 flex flex-col items-center justify-center gap-3 ${isDark ? 'bg-slate-950 border-blue-500/50' : 'bg-white border-blue-600'}`}>
              <div className="w-24 h-1 bg-blue-500/20 rounded-full" />
              <div className="w-16 h-1 bg-blue-500/20 rounded-full" />
              <div className="w-20 h-4 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full animate-pulse" />
            </div>
            {/* Hover Flare */}
            <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 w-40 h-8 bg-blue-500/20 blur-xl rounded-full" />
          </motion.div>

          {/* Flying Chat Options */}
          {floatingChats.map((chat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 50, y: 100 }}
              whileInView={{
                opacity: [0, 1, 1, 0],
                x: [50, -100, -250],
                y: [100, -50, -200],
              }}
              transition={{
                duration: 6,
                delay: chat.delay,
                repeat: Infinity,
                ease: "linear"
              }}
              className={`absolute z-30 px-6 py-3 rounded-2xl border backdrop-blur-xl whitespace-nowrap text-sm font-bold shadow-2xl ${isDark ? 'bg-slate-900/80 border-white/10 text-blue-400' : 'bg-white/90 border-blue-100 text-blue-600'
                }`}
            >
              {chat.text}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* --- 2. MAIN LANDING PAGE CONTENT --- */

const LandingPageContent = ({ onGetStarted }) => {
  const { theme } = useData();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen selection:bg-blue-500/30 overflow-x-hidden font-sans transition-colors duration-500 ${isDark ? 'bg-[#020617] text-slate-200' : 'bg-slate-50 text-slate-800'
      }`}>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[1200px] pointer-events-none">
          <div className={`absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[100px] transition-opacity duration-1000 ${isDark ? 'bg-blue-600/20 opacity-40' : 'bg-blue-400/10 opacity-30'
            }`} />
          <div className={`absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] rounded-full blur-[80px] transition-opacity duration-1000 ${isDark ? 'bg-purple-600/10 opacity-30' : 'bg-purple-400/5 opacity-20'
            }`} />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-10 inline-flex items-center gap-3 px-5 py-2 rounded-full border backdrop-blur-md text-xs font-bold transition-all hover:scale-105 cursor-pointer ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-blue-600 text-white border-blue-500'
              }`}
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            V5.0: MIS REPORTING & STRATEGIC ROLLING DEPLOYED
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`text-5xl md:text-8xl font-black tracking-tight mb-8 leading-[1] ${isDark ? 'text-white' : 'text-slate-950'
              }`}
          >
            PRECISION <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">
              DATA INTELLIGENCE.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`text-lg md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed font-medium transition-colors ${isDark ? 'text-slate-400' : 'text-slate-700'
              }`}
          >
            Don't just listen to the noise. Understand the signals that drive growth.
            SocialPulse translates millions of messy interactions into clear,
            strategic roadmaps for the modern digital era.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <button
              onClick={onGetStarted}
              className={`group px-10 py-5 font-black rounded-full text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-3 ${isDark ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-700 text-white hover:bg-blue-800'
                }`}
            >
              Start Free Audit
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onGetStarted}
              className={`px-10 py-5 font-bold rounded-full text-lg border transition-all hover:bg-white/10 ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-700'
                }`}
            >
              View Examples
            </button>
          </motion.div>
        </div>
      </section>

      {/* AI Assistant Section (V4 New) */}
      <AIAssistantSection onGetStarted={onGetStarted} />

      {/* Vision Section */}
      <section className={`py-24 px-6 border-y ${isDark ? 'border-white/5 bg-slate-950/40' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <SectionHeading
            centered={false}
            badge="Our Vision"
            title="The Core Pulse behind Decision Making."
            subtitle="We believe clarity is the ultimate competitive advantage. Social media data isn't just numbers—it's the collective psychology of your market."
          />
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Globe, title: "Global Context", desc: "Understand geo-political shifts in real-time." },
              { icon: Zap, title: "Action Bias", desc: "Data designed to make you move fast." },
              { icon: BrainCircuit, title: "High-Fidelity", desc: "99% NLP accuracy for sub-text." },
              { icon: Shield, title: "Risk Safeguard", desc: "Detect negative trends before they peak." }
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                onClick={onGetStarted}
                className={`p-6 rounded-2xl border transition-all cursor-pointer ${isDark ? 'bg-white/5 border-white/10 hover:border-blue-500/50' : 'bg-slate-50 border-slate-100 hover:border-blue-400'
                  }`}
              >
                <item.icon className="text-blue-500 mb-4" size={24} />
                <h4 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</h4>
                <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MIS Section (V5 New) */}
      <MISSection onGetStarted={onGetStarted} />

      {/* Business Utility of Social Data (V4 Expansion) */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <SectionHeading
              badge="The Data Utility"
              title="How Strategy Meets Sentiment."
              subtitle="Modern business isn't about guessing what the customer wants. It's about auditing what they are actually saying."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div onClick={onGetStarted} className={`p-8 rounded-3xl border cursor-pointer transition-all hover:scale-[1.02] ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
              <div className="text-blue-500 font-black text-4xl mb-6">01.</div>
              <h4 className={`text-xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Hyper-Targeted Allocation</h4>
              <p className={`text-sm leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Stop burning budget on generic ads. Social data identifies the exact 'micro-cohorts' with the highest buying intent, allowing for 4x ROI on ad spend.
              </p>
            </div>
            <div onClick={onGetStarted} className={`p-8 rounded-3xl border cursor-pointer transition-all hover:scale-[1.02] ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
              <div className="text-indigo-500 font-black text-4xl mb-6">02.</div>
              <h4 className={`text-xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Reverse Engineering Trends</h4>
              <p className={`text-sm leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Instead of inventing new products, analyze the gaps in competitor engagement. SocialPulse identifies 'unmet needs' before the market catch up.
              </p>
            </div>
            <div onClick={onGetStarted} className={`p-8 rounded-3xl border cursor-pointer transition-all hover:scale-[1.02] ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
              <div className="text-purple-500 font-black text-4xl mb-6">03.</div>
              <h4 className={`text-xl font-black mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Predictive Crisis Control</h4>
              <p className={`text-sm leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Every major PR disaster starts with a few tweets. Our AI detects 'anomalous sentiment spikes' hours before they go viral, saving millions in brand equity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Data Rules Section */}
      <section className={`py-32 px-6 overflow-hidden relative ${isDark ? 'bg-[#03081e]' : 'bg-blue-50/30'}`}>
        {/* same content as V3 but polished */}
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-20 items-center">
          <div className="flex-1">
            <SectionHeading
              centered={false}
              badge="The Modern Era"
              title="Data: The Only Truth in a Noisy World."
              subtitle="Guesses are expensive. Opinions are biased. Social data is the raw, unfiltered truth of the global marketplace."
            />
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <Globe className="text-blue-500" />
                </div>
                <div>
                  <h4 className={`font-black text-xl mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Asymmetry of Information</h4>
                  <p className={`text-sm leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    In the 21st century, those who have better data win. It's not about working harder; it's about seeing what others are blind to.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <Layers className="text-indigo-500" />
                </div>
                <div>
                  <h4 className={`font-black text-xl mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>The Efficiency Multiplier</h4>
                  <p className={`text-sm leading-relaxed font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Data lets you identify which 20% of your community produces 80% of your virality. Focus your energy where it compounds.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-lg aspect-square relative">
            <motion.div
              animate={{
                rotate: [0, 5, 0],
                y: [0, -10, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className={`w-full h-full rounded-3xl border shadow-2xl overflow-hidden flex flex-col ${isDark ? 'bg-slate-950 border-white/10' : 'bg-white border-slate-200'
                }`}
            >
              <div className={`p-6 border-b font-bold tracking-tight ${isDark ? 'border-white/5 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                REAL-TIME AUDIT LOG
              </div>
              <div className="flex-1 p-8 space-y-8">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                    <span>Audience Growth Velocity</span>
                    <span className="text-blue-500">+142% Exponential</span>
                  </div>
                  <div className={`h-3 w-full rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '92%' }}
                      transition={{ duration: 3 }}
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500"
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="text-2xl font-black text-emerald-500">+4.2M</div>
                      <div className="text-[10px] font-bold uppercase text-slate-500">Impressions</div>
                    </div>
                    <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="text-2xl font-black text-blue-500">8.2%</div>
                      <div className="text-[10px] font-bold uppercase text-slate-500">Conv. Rate</div>
                    </div>
                  </div>
                  <div className={`h-32 rounded-2xl border p-4 flex items-end gap-2 overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
                    {[70, 40, 90, 60, 45, 85, 30, 95].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="w-full bg-indigo-600/40 rounded-t-lg border-t border-indigo-400/50 shadow-[0_0_20px_rgba(79,70,229,0.2)]"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className={`rounded-[3rem] p-16 md:p-24 border shadow-2xl relative overflow-hidden ${isDark ? 'bg-gradient-to-tr from-slate-900 to-slate-950 border-white/10' : 'bg-white border-slate-200'
              }`}
          >
            <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
              <Zap size={200} className="text-blue-600 rotate-12" />
            </div>

            <h2 className={`text-4xl md:text-6xl font-black mb-10 leading-tight uppercase transition-colors ${isDark ? 'text-white' : 'text-slate-950'
              }`}>
              THE FUTURE ISN'T RANDOMLY <br />
              <span className="text-blue-600">POSTED.</span>
            </h2>
            <p className={`text-lg mb-12 max-w-2xl mx-auto font-medium transition-colors ${isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
              Join 4,000+ industry-leading brands decoding their audience with SocialPulse.
              Your board-room strategy starts with real-time signals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={onGetStarted}
                className={`w-full sm:w-auto px-12 py-6 font-black rounded-full text-xl transition-all hover:scale-105 active:scale-95 shadow-xl ${isDark ? 'bg-blue-600 text-white hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                Launch App
              </button>
              <button
                onClick={onGetStarted}
                className={`w-full sm:w-auto px-12 py-6 font-bold rounded-full text-xl border transition-all hover:bg-slate-100 ${isDark ? 'bg-transparent text-white border-white/10 hover:bg-white/5' : 'bg-transparent text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}>
                Talk to Strategy
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Simplified Footer */}
      <footer className={`py-20 border-t text-center transition-colors ${isDark ? 'bg-[#020617] border-white/5' : 'bg-slate-100 border-slate-200'
        }`}>
        <div className="flex justify-center items-center gap-2 mb-8 grayscale opacity-50">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <Zap className="text-white w-5 h-5" />
          </div>
          <span className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>SOCIALPULSE</span>
        </div>
        <div className="flex justify-center gap-8 mb-8 text-xs font-black uppercase tracking-widest text-slate-500">
          <a href="https://abanee.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">Portfolio</a>
          <a href="#" className="hover:text-blue-500 transition-colors">Privacy</a>
          <a href="#" className="hover:text-blue-500 transition-colors">Terms</a>
        </div>
        <p className="text-slate-500 text-[10px] font-black tracking-widest">
          &copy; 2026 SOCIALPULSE ANALYTICS INC. ALL RIGHTS RESERVED.
        </p>
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