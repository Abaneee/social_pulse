import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Activity,
  Hash,
  Clock,
  Filter
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, Legend
} from 'recharts';
import { useData } from '../../context/DataContext';
import { getDashboardData, getFilters } from '../../services/api';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#f43f5e'];

const CustomTooltip = ({ active, payload, label, unit = "", isDark }) => {
  if (active && payload && payload.length) {
    return (
      <div className={`backdrop-blur-md border p-4 rounded-[2rem] shadow-2xl transition-all duration-300 ${isDark ? 'bg-slate-900/90 border-white/10' : 'bg-white/90 border-slate-200'}`}>
        <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
        <div className="space-y-2">
          {payload.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
              <p className={`text-sm font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {item.name}: {item.value.toLocaleString()}{unit}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const StatCard = ({ title, value, icon: Icon, color, isDark }) => {
  const colorMap = {
    'neon-blue': 'text-blue-500 bg-blue-500/10',
    'neon-purple': 'text-purple-500 bg-purple-500/10',
    'neon-pink': 'text-pink-500 bg-pink-500/10',
    'neon-green': 'text-emerald-500 bg-emerald-500/10'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-8 rounded-[2.5rem] border relative overflow-hidden group transition-all duration-500 ${isDark ? 'bg-slate-900/50 border-white/5 hover:border-white/10' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50 hover:border-slate-300'}`}
    >
      <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity`}>
        <Icon className="w-24 h-24" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center space-x-4 mb-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{title}</span>
        </div>

        <h3 className={`text-4xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</h3>
      </div>
    </motion.div>
  );
};

const ChartCard = ({ title, children, delay = 0, isDark }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`p-10 rounded-[3rem] border flex flex-col transition-all duration-500 ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'}`}
  >
    <h3 className={`text-2xl font-black mb-10 italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
    <div className="flex-grow w-full h-[300px] min-h-0">
      {children}
    </div>
  </motion.div>
);

const VisionDeck = () => {
  const { activeDataset, theme } = useData();
  const isDark = theme === 'dark';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState('');

  // Fetch Filters (Platforms)
  useEffect(() => {
    if (activeDataset) {
      getFilters()
        .then(res => {
          setPlatforms(res.data.platforms || []);
        })
        .catch(err => {
          console.error('Filters error:', err);
          // Non-critical error, filters just won't show
        });
    }
  }, [activeDataset]);

  // Fetch Dashboard Data
  useEffect(() => {
    if (activeDataset) {
      fetchDashboard();
    }
  }, [activeDataset, selectedPlatform]);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    const params = selectedPlatform ? { platform: selectedPlatform } : {};
    try {
      const res = await getDashboardData(params);
      if (res.data.error) {
        setError(res.data.error);
      } else {
        setData(res.data);
      }
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.response?.data?.error || 'Failed to aggregate visualization data. The signal may be too weak or the dataset corrupted.');
    } finally {
      setLoading(false);
    }
  };

  if (!activeDataset) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
        <LayoutDashboard className={`w-16 h-16 mb-4 animate-pulse ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
        <h2 className={`text-2xl font-black italic tracking-tighter ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>NO ACTIVE DATASET</h2>
        <p className={`mt-2 max-w-xs uppercase text-xs tracking-[0.2em] font-medium ${isDark ? 'text-slate-600' : 'text-slate-50'}`}>Initiate a mission in the Studio to unlock tactical visualizations.</p>
      </div>
    );
  }

  if (loading || (!data && !error)) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className={`w-16 h-16 border-8 border-t-transparent rounded-full animate-spin ${isDark ? 'border-indigo-500' : 'border-indigo-600'}`} />
      </div>
    );
  }

  if (error && !data) {

    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
        <div className={`w-16 h-16 mb-6 rounded-3xl flex items-center justify-center ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
          <LayoutDashboard className="w-8 h-8 text-indigo-500" />
        </div>
        <h2 className={`text-2xl font-black italic tracking-tighter ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>AGGREGATION FAILURE</h2>
        <p className={`mt-3 max-w-md uppercase text-[10px] tracking-[0.2em] font-black leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {error}
        </p>
        <button
          onClick={fetchDashboard}
          className={`mt-10 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
        >
          Retry Data Feed
        </button>
      </div>
    );
  }

  const chartAxisStroke = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
  const chartGridStroke = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

  return (
    <div className={`p-8 max-w-7xl mx-auto space-y-12 transition-colors duration-500`}>
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b pb-12 border-slate-500/10">
        <div>
          <h1 className="text-6xl font-black bg-gradient-to-r from-blue-500 via-purple-500 to-pink-600 bg-clip-text text-transparent italic tracking-tighter leading-none">
            VISION DECK
          </h1>
          <p className={`mt-4 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Real-time neural intelligence and performance signals.</p>
        </div>

        <div className={`flex items-center space-x-4 p-4 rounded-2xl border transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'}`}>
          <Filter className={`w-5 h-5 text-blue-500`} />
          <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Platform:</span>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className={`bg-transparent text-sm font-bold focus:outline-none cursor-pointer ${isDark ? 'text-white' : 'text-slate-800'}`}
          >
            <option value="" className={isDark ? "bg-slate-900" : "bg-white"}>All Platforms</option>
            {platforms.map(p => (
              <option key={p} value={p} className={isDark ? "bg-slate-900" : "bg-white"}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Total Reach" value={data.kpis.totalReach.toLocaleString()} icon={Users} color="neon-blue" isDark={isDark} />
        <StatCard title="Avg Engagement" value={`${data.kpis.avgEngagement}%`} icon={Activity} color="neon-purple" isDark={isDark} />
        <StatCard title="Top Hashtag" value={data.kpis.topHashtag} icon={Hash} color="neon-pink" isDark={isDark} />
        <StatCard title="Peak Time" value={data.kpis.peakTime} icon={Clock} color="neon-green" isDark={isDark} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* 1. Pie Chart: Engagement by Content Type */}
        <ChartCard title="Engagement x Content" delay={0.1} isDark={isDark}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.pieData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={95}
                paddingAngle={8}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                stroke="none"
              >
                {data.pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontWeight: 900, fontSize: 10, textTransform: 'uppercase' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2. Bar Chart: Engagement by Day */}
        <ChartCard title="Temporal Performance" delay={0.2} isDark={isDark}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.dayBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
              <XAxis dataKey="day" stroke={chartAxisStroke} tick={{ fill: chartAxisStroke, fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
              <YAxis stroke={chartAxisStroke} tick={{ fill: chartAxisStroke, fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} content={<CustomTooltip unit="%" isDark={isDark} />} />
              <Bar dataKey="engagement" fill="#8884d8" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 3. Line Chart: Engagement Trend */}
        <ChartCard title="Strategic Roadmap" delay={0.3} isDark={isDark}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
              <XAxis
                dataKey="date"
                stroke={chartAxisStroke}
                tick={{ fill: chartAxisStroke, fontSize: 10, fontWeight: 900 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => {
                  try {
                    const [year, month] = value.split('-');
                    const date = new Date(parseInt(year), parseInt(month) - 1);
                    return date.toLocaleString('default', { month: 'short' });
                  } catch (e) {
                    return value;
                  }
                }}
              />
              <YAxis stroke={chartAxisStroke} tick={{ fill: chartAxisStroke, fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
              <Line type="monotone" dataKey="engagement" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 10 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 4. Horizontal Bar: Reach by Hashtags */}
        <ChartCard title="Hashtag Reach Index" delay={0.4} isDark={isDark}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.hashtagData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="hashtag" type="category" stroke={chartAxisStroke} tick={{ fill: chartAxisStroke, fontSize: 10, fontWeight: 900 }} width={100} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(236, 72, 153, 0.05)' }} content={<CustomTooltip unit="%" isDark={isDark} />} />
              <Bar dataKey="reach" fill="#ec4899" radius={[0, 12, 12, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 5. Area Chart: Reach Over Time */}
        <ChartCard title="Growth Trajectory" delay={0.5} isDark={isDark}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.areaData}>
              <defs>
                <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
              <XAxis
                dataKey="date"
                stroke={chartAxisStroke}
                tick={{ fill: chartAxisStroke, fontSize: 10, fontWeight: 900 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => {
                  try {
                    const [year, month] = value.split('-');
                    const date = new Date(parseInt(year), parseInt(month) - 1);
                    return date.toLocaleString('default', { month: 'short' });
                  } catch (e) {
                    return value;
                  }
                }}
              />
              <YAxis stroke={chartAxisStroke} tick={{ fill: chartAxisStroke, fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
              <Area type="monotone" dataKey="reach" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReach)" strokeWidth={4} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 6. Bar Chart: Posts by Hour */}
        <ChartCard title="Activity Intensity" delay={0.6} isDark={isDark}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.hourData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
              <XAxis dataKey="hour" stroke={chartAxisStroke} tick={{ fill: chartAxisStroke, fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
              <YAxis stroke={chartAxisStroke} tick={{ fill: chartAxisStroke, fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(245, 158, 11, 0.05)' }} content={<CustomTooltip unit="%" isDark={isDark} />} />
              <Bar dataKey="posts" fill="#f59e0b" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  );
};

export default VisionDeck;
