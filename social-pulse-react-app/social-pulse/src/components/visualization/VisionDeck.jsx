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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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

      <div className="flex items-baseline space-x-2">
        <h3 className="text-3xl font-bold">{value}</h3>
      </div>
    </div>
  </motion.div>
);

const ChartCard = ({ title, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card p-6 rounded-2xl h-80 flex flex-col"
  >
    <h3 className="text-lg font-bold mb-4 text-white/90">{title}</h3>
    <div className="flex-grow w-full h-full min-h-0">
      {children}
    </div>
  </motion.div>
);

const VisionDeck = () => {
  const { activeDataset } = useData();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState('');

  // Fetch Filters (Platforms)
  useEffect(() => {
    if (activeDataset) {
      getFilters()
        .then(res => {
          setPlatforms(res.data.platforms || []);
        })
        .catch(err => console.error('Filters error:', err));
    }
  }, [activeDataset]);

  // Fetch Dashboard Data
  useEffect(() => {
    if (activeDataset) {
      setLoading(true);
      const params = selectedPlatform ? { platform: selectedPlatform } : {};
      getDashboardData(params)
        .then(res => setData(res.data))
        .catch(err => console.error('Dashboard error:', err))
        .finally(() => setLoading(false));
    }
  }, [activeDataset, selectedPlatform]);

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
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink">
            Vision Deck
          </h1>
          <p className="text-white/60 mt-2">Real-time performance metrics</p>
        </div>

        <div className="flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
          <Filter className="w-4 h-4 text-neon-blue" />
          <span className="text-sm font-medium text-white/80">Platform:</span>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
          >
            <option value="" className="bg-[#0f172a]">All Platforms</option>
            {platforms.map(p => (
              <option key={p} value={p} className="bg-[#0f172a]">{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Reach" value={data.kpis.totalReach.toLocaleString()} icon={Users} color="neon-blue" />
        <StatCard title="Avg Engagement" value={`${data.kpis.avgEngagement}%`} icon={Activity} color="neon-purple" />
        <StatCard title="Top Hashtag" value={data.kpis.topHashtag} icon={Hash} color="neon-pink" />
        <StatCard title="Peak Time" value={data.kpis.peakTime} icon={Clock} color="neon-green" />
      </div>

      {/* Charts Grid - 8 Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">

        {/* 1. Pie Chart: Engagement by Content Type */}
        <ChartCard title="Engagement by Content Type" delay={0.1}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: 'none', borderRadius: '8px' }} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2. Bar Chart: Engagement by Day */}
        <ChartCard title="Engagement by Day" delay={0.2}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.dayBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1a1a2e', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="engagement" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 3. Line Chart: Engagement Trend */}
        <ChartCard title="Engagement Trend" delay={0.3}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.4)' }}
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
              <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: 'none', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="engagement" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 4. Horizontal Bar: Reach by Hashtags */}
        <ChartCard title="Top Hashtags by Reach" delay={0.4}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.hashtagData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
              <XAxis type="number" stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} hide />
              <YAxis dataKey="hashtag" type="category" stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} width={100} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1a1a2e', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="reach" fill="#FF8042" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 5. Area Chart: Reach Over Time */}
        <ChartCard title="Total Reach Growth" delay={0.5}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.areaData}>
              <defs>
                <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00f2ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.4)"
                tick={{ fill: 'rgba(255,255,255,0.4)' }}
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
              <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: 'none', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="reach" stroke="#00f2ff" fillOpacity={1} fill="url(#colorReach)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 6. Bar Chart: Posts by Hour */}
        <ChartCard title="Posting Activity by Hour" delay={0.6}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.hourData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="hour" stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1a1a2e', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="posts" fill="#FFBB28" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 7. Scatter Chart: Reach vs Engagement */}
        <ChartCard title="Reach vs Engagement Correlation" delay={0.7}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" dataKey="reach" name="Reach" stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <YAxis type="number" dataKey="engagement" name="Engagement" unit="%" stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1a1a2e', border: 'none', borderRadius: '8px' }} />
              <Scatter name="Posts" data={data.scatterData} fill="#00C49F" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 8. Bar Chart: Caption Length Impact */}
        <ChartCard title="Engagement by Caption Length" delay={0.8}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.captionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="category" stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.4)" tick={{ fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1a1a2e', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="engagement" fill="#bd00ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  );
};

export default VisionDeck;
