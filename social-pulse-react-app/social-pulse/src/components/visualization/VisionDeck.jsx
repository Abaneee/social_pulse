import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Share2,
  MessageCircle,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Activity,
  Globe,
  Hash,
  Clock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';
import { getDashboardData } from '../../services/api';

const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-300"
  >
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
      <Icon className={`w-16 h-16 text-${color}`} />
    </div>

    <div className="relative z-10">
      <div className="flex items-center space-x-3 mb-4">
        <div className={`p-2 rounded-lg bg-${color}/20`}>
          <Icon className={`w-5 h-5 text-${color}`} />
        </div>
        <span className="text-white/60 font-medium">{title}</span>
      </div>

      <div className="flex items-baseline space-x-2">
        <h3 className="text-3xl font-bold">{value}</h3>
      </div>

      <div className="mt-4 flex items-center space-x-2">
        <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${change >= 0 ? 'bg-neon-green/20 text-neon-green' : 'bg-red-500/20 text-red-500'}`}>
          {change >= 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
          {Math.abs(change)}%
        </div>
        <span className="text-white/40 text-xs">vs last month</span>
      </div>
    </div>
  </motion.div>
);

const VisionDeck = () => {
  const { activeDataset } = useData();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeDataset) {
      setLoading(true);
      getDashboardData()
        .then(res => setData(res.data))
        .catch(err => console.error('Dashboard error:', err))
        .finally(() => setLoading(false));
    }
  }, [activeDataset]);

  if (!activeDataset) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <LayoutDashboard className="w-16 h-16 text-white/20 mb-4" />
        <h2 className="text-2xl font-bold text-white/40">No Active Dataset</h2>
        <p className="text-white/20 mt-2">Upload a dataset to view the dashboard.</p>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink">
            Vision Deck
          </h1>
          <p className="text-white/60 mt-2">Real-time performance metrics</p>
        </div>

        <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
          <Globe className="w-4 h-4 text-neon-blue" />
          <span className="text-sm font-medium">Global Overview</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Reach"
          value={data.kpis.totalReach.toLocaleString()}
          change={12.5}
          icon={Users}
          color="neon-blue"
        />
        <StatCard
          title="Engagement Rate"
          value={`${data.kpis.avgEngagement}%`}
          change={-2.4}
          icon={Activity}
          color="neon-purple"
        />
        <StatCard
          title="Top Hashtag"
          value={data.kpis.topHashtag}
          change={0}
          icon={Hash}
          color="neon-pink"
        />
        <StatCard
          title="Peak Time"
          value={data.kpis.peakTime}
          change={0}
          icon={Clock}
          color="neon-green"
        />
      </div>

      {/* Main Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-8 rounded-2xl"
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-neon-blue" />
            <span>Growth Trajectory</span>
          </h3>
          <select className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-neon-blue/50">
            <option>Last 30 Days</option>
            <option>Last Quarter</option>
            <option>Year to Date</option>
          </select>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.areaData}>
              <defs>
                <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00f2ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#bd00ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#bd00ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis
                dataKey="date"
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
              <Area
                type="monotone"
                dataKey="reach"
                stroke="#00f2ff"
                fillOpacity={1}
                fill="url(#colorReach)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="reach"
                stroke="#00f2ff"
                fillOpacity={1}
                fill="url(#colorReach)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default VisionDeck;
