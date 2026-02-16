import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Share2, MessageCircle, TrendingUp,
  Activity, Globe, Hash, Clock, PieChart as PieIcon, BarChart2, Calendar
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { useData } from '../../context/DataContext';
import { getDashboardData } from '../../services/api';

const COLORS = ['#00F2FF', '#BD00FF', '#FF0055', '#00FF9D', '#FFD700', '#FF8C00'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a2e] border border-white/10 p-3 rounded-xl shadow-xl">
        <p className="font-bold text-white mb-1">{label || payload[0].name}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const StatCard = ({ title, value, icon: Icon, color }) => (
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
      <h3 className="text-3xl font-bold">{value}</h3>
    </div>
  </motion.div>
);

const ChartCard = ({ title, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card p-6 rounded-2xl h-[350px] flex flex-col"
  >
    <h3 className="text-lg font-bold text-white/90 mb-4 flex items-center space-x-2">
      <span>{title}</span>
    </h3>
    <div className="flex-1 w-full min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  </motion.div>
);

const VisionDeck = () => {
  const { activeDataset } = useData();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('All');

  useEffect(() => {
    if (activeDataset) {
      setLoading(true);
      // Fetch data with specific platform parameter (or 'All')
      getDashboardData(selectedPlatform === 'All' ? '' : selectedPlatform)
        .then(res => setData(res.data))
        .catch(err => console.error('Dashboard error:', err))
        .finally(() => setLoading(false));
    }
  }, [activeDataset, selectedPlatform]);

  if (!activeDataset) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <LayoutDashboard className="w-16 h-16 text-white/20 mb-4" />
      <h2 className="text-2xl font-bold text-white/40">No Active Dataset</h2>
      <p className="text-white/20 mt-2">Upload a dataset to view the dashboard.</p>
    </div>
  );

  if (loading || !data) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const pieDataRaw = data.pieData || {};
  // When filtered globally, the backend returns data in 'All' (which represents the context of the filter)
  // or checks specifically for the platform key if logic warrants.
  // Based on updated backend, 'pieData' might just have 'All' populated with data for the selected platform.
  // Let's handle both cases flexibly.
  const currentPieData = pieDataRaw['All'] || [];

  // Use platforms from API response (populated even when filtered)
  const platforms = ['All', ...(data.platforms || [])];

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink">
            Vision Deck
          </h1>
          <p className="text-white/60 mt-2">Comprehensive Analytics Overview</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Global Platform Dropdown */}
          <div className="relative">
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="bg-black/40 border border-white/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-neon-blue transition-colors appearance-none pr-8 hover:bg-white/5 cursor-pointer min-w-[150px]"
            >
              {platforms.map(p => <option key={p} value={p} className="bg-[#1a1a2e]">{p}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
              ▼
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <Globe className="w-4 h-4 text-neon-blue" />
            <span className="text-sm font-medium">Global Overview</span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Reach" value={data.kpis.totalReach.toLocaleString()} icon={Users} color="neon-blue" />
        <StatCard title="Avg Engagement" value={`${data.kpis.avgEngagement}%`} icon={Activity} color="neon-purple" />
        <StatCard title="Top Hashtag" value={data.kpis.topHashtag} icon={Hash} color="neon-pink" />
        <StatCard title="Peak Time" value={data.kpis.peakTime} icon={Clock} color="neon-green" />
      </div>

      {/* Grid Layout for Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {/* 1. Pie Chart: Engagement by Content Type */}
        <div className="glass-card p-6 rounded-2xl h-[350px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white/90">Engagement Dist.</h3>
            {/* Removed Local Dropdown */}
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={currentPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {currentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Bar Chart: Engagement by Day */}
        <ChartCard title="Engagement by Day" delay={0.1}>
          <BarChart data={data.barDayData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#fff', opacity: 0.5 }} axisLine={false} tickLine={false} tickFormatter={v => v.substring(0, 3)} />
            <YAxis tick={{ fill: '#fff', opacity: 0.5 }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
            <Bar dataKey="engagement" fill="#00FF9D" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        {/* 3. Line Chart: Engagement by Month */}
        <ChartCard title="Engagement Trend (Monthly)" delay={0.2}>
          <LineChart data={data.lineMonthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#fff', opacity: 0.5 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#fff', opacity: 0.5 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="engagement" stroke="#FF0055" strokeWidth={3} dot={{ r: 4, fill: '#FF0055' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ChartCard>

        {/* 4. Vertical Bar: Reach by Hashtags */}
        <ChartCard title="Top Hashtags by Reach" delay={0.3}>
          <BarChart layout="vertical" data={data.barHashtagData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#fff', opacity: 0.5 }} axisLine={false} tickLine={false} />
            <YAxis dataKey="hashtag" type="category" width={80} tick={{ fill: '#fff', opacity: 0.5, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
            <Bar dataKey="reach" fill="#BD00FF" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartCard>

        {/* 5. Scatter: Engagement vs Reach */}
        <ChartCard title="Engagement vs Reach" delay={0.4}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" dataKey="x" name="Reach" tick={{ fill: '#fff', opacity: 0.5 }} axisLine={false} tickLine={false} />
            <YAxis type="number" dataKey="y" name="Engagement" tick={{ fill: '#fff', opacity: 0.5 }} axisLine={false} tickLine={false} />
            <ZAxis type="category" dataKey="name" name="Type" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
            <Scatter name="Posts" data={data.scatterData} fill="#00F2FF" />
          </ScatterChart>
        </ChartCard>

        {/* 6. Bar Chart: Top 5 Posts */}
        <ChartCard title="Top 5 Performing Posts" delay={0.5}>
          <BarChart layout="vertical" data={data.topPostsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#fff', opacity: 0.5 }} axisLine={false} tickLine={false} />
            <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#fff', opacity: 0.5, fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
            <Bar dataKey="engagement" fill="#FFD700" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartCard>

        {/* 7. Area Chart: Reach Trends */}
        <div className="md:col-span-2 xl:col-span-2">
          <ChartCard title="Reach Growth Trajectory" delay={0.6}>
            <AreaChart data={data.areaReachData}>
              <defs>
                <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00f2ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#fff', opacity: 0.5 }} axisLine={false} tickLine={false} tickFormatter={v => v.substring(5)} />
              <YAxis tick={{ fill: '#fff', opacity: 0.5 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="reach" stroke="#00f2ff" fillOpacity={1} fill="url(#colorReach)" strokeWidth={2} />
            </AreaChart>
          </ChartCard>
        </div>

        {/* 8. Bar Chart: Hourly Engagement */}
        <ChartCard title="Peak Hours Activity" delay={0.7}>
          <BarChart data={data.barHourData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="hour" tick={{ fill: '#fff', opacity: 0.5 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#fff', opacity: 0.5 }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
            <Bar dataKey="engagement" fill="#FF8C00" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

      </div>
    </div>
  );
};

export default VisionDeck;
