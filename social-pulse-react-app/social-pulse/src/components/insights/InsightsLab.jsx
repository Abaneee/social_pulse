import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Award, Clock, Hash, Filter, Sparkles, CheckCircle, Calendar } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { predictInsights, getFilters } from '../../services/api';

const InsightsLab = () => {
  const { activeDataset, theme } = useData();
  const isDark = theme === 'dark';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);
  const [filterOptions, setFilterOptions] = useState({ platforms: [], content_types: [] });
  const [filters, setFilters] = useState({ platform: '', content_type: '' });

  // Load initial filter options
  useEffect(() => {
    if (activeDataset) {
      getFilters()
        .then(res => setFilterOptions(res.data))
        .catch(err => {
          console.error('Failed to load filters:', err);
          setError('Failed to load platform/content filters. Some insights may be limited.');
        });

      // Load initial insights
      fetchInsights();
    }
  }, [activeDataset]);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await predictInsights(filters);
      if (response.data.error) {
         setError(response.data.error);
      } else {
         setInsights(response.data.insights);
      }
    } catch (err) {
      console.error('Failed to fetch insights:', err);
      setError(err.response?.data?.error || 'Neural analysis failed. Please verify your dataset and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!activeDataset) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
        <TrendingUp className={`w-16 h-16 mb-4 animate-pulse ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
        <h2 className={`text-2xl font-black italic tracking-tighter ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>NO ACTIVE DATASET</h2>
        <p className={`mt-2 max-w-xs uppercase text-xs tracking-[0.2em] font-medium ${isDark ? 'text-slate-600' : 'text-slate-500'}`}>Initiate a mission in the Studio to unlock tactical analysis.</p>
      </div>
    );
  }

  if (error && !insights) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
        <div className={`w-16 h-16 mb-6 rounded-3xl flex items-center justify-center ${isDark ? 'bg-rose-500/10' : 'bg-rose-50'}`}>
          <TrendingUp className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className={`text-2xl font-black italic tracking-tighter ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>INTELLIGENCE BREACH</h2>
        <p className={`mt-3 max-w-md uppercase text-[10px] tracking-[0.2em] font-black leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {error}
        </p>
        <button 
          onClick={fetchInsights}
          className={`mt-10 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
        >
          Retry Analysis Mission
        </button>
      </div>
    );
  }

  return (
    <div className={`p-8 max-w-7xl mx-auto space-y-10 transition-colors duration-500`}>
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-10 border-slate-500/10">
        <div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-purple-500 via-pink-500 to-rose-600 bg-clip-text text-transparent italic tracking-tighter leading-none">
            INSIGHTS LAB
          </h1>
          <p className={`mt-3 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>AI-driven analysis and optimization strategy.</p>
        </div>

        <div className={`flex flex-wrap gap-4 p-3 rounded-2xl border transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'}`}>
          <div className="flex items-center space-x-2 px-3">
            <Filter className={`w-4 h-4 text-purple-600`} />
            <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Filters:</span>
          </div>

          <select
            value={filters.platform}
            onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
            className={`rounded-xl px-4 py-2 text-xs font-bold focus:outline-none transition-all ${isDark ? 'bg-slate-900 border-white/10 text-white focus:border-purple-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-purple-400'}`}
          >
            <option value="">All Platforms</option>
            {filterOptions.platforms.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={filters.content_type}
            onChange={(e) => setFilters({ ...filters, content_type: e.target.value })}
            className={`rounded-xl px-4 py-2 text-xs font-bold focus:outline-none transition-all ${isDark ? 'bg-slate-900 border-white/10 text-white focus:border-purple-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-purple-400'}`}
          >
            <option value="">All Content Types</option>
            {filterOptions.content_types.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={fetchInsights}
            disabled={loading}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isDark ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600/30' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-600/20'} disabled:opacity-50`}
          >
            {loading ? 'Analyzing...' : 'Run Neural Audit'}
          </button>
        </div>
      </div>

      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Best Time Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-8 rounded-[2.5rem] border md:col-span-2 transition-all ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'}`}
          >
            <div className="flex items-center space-x-4 mb-10">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                <Clock className={`w-6 h-6 text-blue-600`} />
              </div>
              <div>
                <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Best Time to Post</h3>
                <p className={`text-xs font-black uppercase tracking-widest text-slate-500`}>Peak engagement windows</p>
              </div>
            </div>

            <div className="flex items-end justify-between space-x-4">
              {insights.best_times.map((item, i) => (
                <div key={i} className="flex-1 space-y-3 text-center">
                  <div className={`text-2xl font-black font-mono ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{item.hour}:00</div>
                  <div className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {item.avg_engagement}% ENG.
                  </div>
                  <div className={`h-2.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500"
                      style={{ width: `${Math.min(item.avg_engagement * 10, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              {insights.best_times.length === 0 && (
                <div className="text-slate-500 font-bold italic w-full text-center">Incomplete temporal data</div>
              )}
            </div>
          </motion.div>

          {/* Best Day Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-8 rounded-[2.5rem] border transition-all ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'}`}
          >
            <div className="flex items-center space-x-4 mb-10">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                <Calendar className={`w-6 h-6 text-purple-600`} />
              </div>
              <div>
                <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Best Day</h3>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Optimal posting day</p>
              </div>
            </div>

            <div className="text-center py-6">
              <div className={`text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-3 italic tracking-tighter`}>
                {insights.best_day.day}
              </div>
              <div className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                {insights.best_day.avg_engagement}% Avg. Engagement
              </div>
            </div>
          </motion.div>

          {/* Predicted Engagement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-8 rounded-[2.5rem] border relative overflow-hidden transition-all ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'}`}
          >
            <div className="absolute top-0 right-0 p-6">
              <Sparkles className={`w-16 h-16 ${isDark ? 'text-white/5' : 'text-slate-950/5'} rotate-12`} />
            </div>

            <div className="flex items-center space-x-4 mb-10">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                <TrendingUp className={`w-6 h-6 text-emerald-600`} />
              </div>
              <div>
                <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Prediction</h3>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Expected performance</p>
              </div>
            </div>

            <div className="text-center py-6">
              <div className={`text-5xl font-black text-emerald-500 mb-3 font-mono tracking-tighter`}>
                {insights.predicted_engagement ? `${insights.predicted_engagement}%` : '--'}
              </div>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 leading-relaxed max-w-[140px] mx-auto`}>
                Based on current filters & historical signals
              </p>
            </div>
          </motion.div>

          {/* Top Hashtags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-8 rounded-[2.5rem] border lg:col-span-2 transition-all ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'}`}
          >
            <div className="flex items-center space-x-4 mb-10">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDark ? 'bg-pink-500/10' : 'bg-pink-50'}`}>
                <Hash className={`w-6 h-6 text-pink-600`} />
              </div>
              <div>
                <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Winning Hashtags</h3>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Tags driving diverse reach</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {insights.best_hashtags.map((tag, i) => (
                <div
                  key={i}
                  className={`px-5 py-3 rounded-2xl border transition-all ${isDark ? 'bg-white/5 border-white/10 hover:border-pink-500/50' : 'bg-slate-50 border-slate-100 hover:border-pink-300'} flex items-center space-x-3`}
                >
                  <span className={`text-pink-600 font-black text-sm`}>#{tag.hashtag}</span>
                  <span className={`text-xs font-black font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{tag.avg_engagement}%</span>
                </div>
              ))}
              {insights.best_hashtags.length === 0 && (
                <div className="text-slate-500 font-bold italic">No hashtag frequency detected</div>
              )}
            </div>
          </motion.div>

          {/* Engagement Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`p-10 rounded-[3rem] border lg:col-span-2 transition-all ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'}`}
          >
            <h3 className={`text-2xl font-black mb-10 ${isDark ? 'text-white' : 'text-slate-900'}`}>Engagement Distribution</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={insights.engagement_distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} vertical={false} />
                  <XAxis
                    dataKey="range"
                    stroke={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
                    tick={{ fill: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 10, fontWeight: 900 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
                    tick={{ fill: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 10, fontWeight: 900 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff',
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      borderRadius: '24px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                      padding: '16px',
                      borderWidth: '1px'
                    }}
                    itemStyle={{ color: isDark ? '#fff' : '#000', fontWeight: 900 }}
                  />
                  <Bar dataKey="count" radius={[12, 12, 0, 0]}>
                    {insights.engagement_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#gradient-${index % 3})`} />
                    ))}
                  </Bar>
                  <defs>
                    <linearGradient id="gradient-0" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="gradient-1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="gradient-2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ec4899" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#ec4899" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>
      )}
    </div>
  );
};

export default InsightsLab;
