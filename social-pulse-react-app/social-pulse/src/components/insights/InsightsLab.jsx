import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Award, Clock, Hash, Filter, Sparkles, CheckCircle, Calendar } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { predictInsights, getFilters } from '../../services/api';

const InsightsLab = () => {
  const { activeDataset } = useData();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [filterOptions, setFilterOptions] = useState({ platforms: [], content_types: [] });
  const [filters, setFilters] = useState({ platform: '', content_type: '' });

  // Load initial filter options
  useEffect(() => {
    if (activeDataset) {
      getFilters()
        .then(res => setFilterOptions(res.data))
        .catch(err => console.error('Failed to load filters:', err));

      // Load initial insights without filters
      fetchInsights();
    }
  }, [activeDataset]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const response = await predictInsights(filters);
      setInsights(response.data.insights);
    } catch (err) {
      console.error('Failed to fetch insights:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!activeDataset) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <TrendingUp className="w-16 h-16 text-white/20 mb-4" />
        <h2 className="text-2xl font-bold text-white/40">No Active Dataset</h2>
        <p className="text-white/20 mt-2">Upload a dataset to generate insights.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-pink">
            Insights Lab
          </h1>
          <p className="text-white/60 mt-2">AI-driven analysis and optimization</p>
        </div>

        <div className="flex flex-wrap gap-4 bg-white/5 p-2 rounded-xl border border-white/10">
          <div className="flex items-center space-x-2 px-3">
            <Filter className="w-4 h-4 text-neon-purple" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          <select
            value={filters.platform}
            onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
            className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-neon-purple/50"
          >
            <option value="">All Platforms</option>
            {filterOptions.platforms.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={filters.content_type}
            onChange={(e) => setFilters({ ...filters, content_type: e.target.value })}
            className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-neon-purple/50"
          >
            <option value="">All Content Types</option>
            {filterOptions.content_types.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={fetchInsights}
            disabled={loading}
            className="px-4 py-1.5 rounded-lg bg-neon-purple/20 text-neon-purple border border-neon-purple/30 hover:bg-neon-purple/30 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Apply Analysis'}
          </button>
        </div>
      </div>

      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Best Time Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 rounded-2xl md:col-span-2"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-neon-blue/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-neon-blue" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Best Time to Post</h3>
                <p className="text-white/40 text-sm">Peak engagement windows</p>
              </div>
            </div>

            <div className="flex items-end justify-between space-x-4">
              {insights.best_times.map((item, i) => (
                <div key={i} className="flex-1 space-y-2 text-center">
                  <div className="text-2xl font-bold text-neon-blue">{item.hour}:00</div>
                  <div className="text-xs text-white/40">
                    {item.avg_engagement}% Avg. Eng.
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neon-blue"
                      style={{ width: `${Math.min(item.avg_engagement * 10, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              {insights.best_times.length === 0 && (
                <div className="text-white/40 italic w-full text-center">Not enough data</div>
              )}
            </div>
          </motion.div>

          {/* Best Day Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-neon-purple/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-neon-purple" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Best Day</h3>
                <p className="text-white/40 text-sm">Optimal posting day</p>
              </div>
            </div>

            <div className="text-center py-4">
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-pink mb-2">
                {insights.best_day.day}
              </div>
              <div className="text-sm text-white/60">
                {insights.best_day.avg_engagement}% Avg. Engagement
              </div>
            </div>
          </motion.div>

          {/* Predicted Engagement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 rounded-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
              <Sparkles className="w-12 h-12 text-white/5" />
            </div>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-neon-green/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">AI Prediction</h3>
                <p className="text-white/40 text-sm">Expected performance</p>
              </div>
            </div>

            <div className="text-center py-4">
              <div className="text-4xl font-bold text-neon-green mb-2">
                {insights.predicted_engagement ? `${insights.predicted_engagement}%` : '--'}
              </div>
              <p className="text-xs text-white/40">
                Based on current filters & historical performance
              </p>
            </div>
          </motion.div>

          {/* Top Hashtags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 rounded-2xl lg:col-span-2"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-neon-pink/20 flex items-center justify-center">
                <Hash className="w-5 h-5 text-neon-pink" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Winning Hashtags</h3>
                <p className="text-white/40 text-sm">Tags driving diverse reach</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {insights.best_hashtags.map((tag, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center space-x-2"
                >
                  <span className="text-neon-pink font-medium">#{tag.hashtag}</span>
                  <span className="text-xs text-white/40">({tag.avg_engagement}%)</span>
                </div>
              ))}
              {insights.best_hashtags.length === 0 && (
                <div className="text-white/40 italic">No hashtag data found</div>
              )}
            </div>
          </motion.div>

          {/* Engagement Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 rounded-2xl lg:col-span-2"
          >
            <h3 className="text-lg font-semibold mb-6">Engagement Distribution</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={insights.engagement_distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis
                    dataKey="range"
                    stroke="rgba(255,255,255,0.4)"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.4)"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a2e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {insights.engagement_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#gradient-${index % 3})`} />
                    ))}
                  </Bar>
                  <defs>
                    <linearGradient id="gradient-0" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00f2ff" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#00f2ff" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="gradient-1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#bd00ff" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#bd00ff" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="gradient-2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff00c8" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#ff00c8" stopOpacity={0.3} />
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
