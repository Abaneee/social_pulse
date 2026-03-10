import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Target, Award, ArrowUpRight, ArrowDownRight, LayoutDashboard } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { getMISData } from '../../services/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{label}</p>
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ backgroundColor: item.color || item.fill }} />
            <p className="text-sm font-bold text-white">
              {item.name}: <span className="text-cyan-400 font-mono">{item.value.toLocaleString()}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const MISDashboard = () => {
  const { activeDataset, theme } = useData();
  const isDark = theme === 'dark';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMISData = async () => {
      if (!activeDataset) return;

      setLoading(true);
      setError(null);
      try {
        const response = await getMISData();
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch MIS data", err);
        setError("Unable to calculate metrics for this dataset. Please ensure it is processed correctly.");
      } finally {
        setLoading(false);
      }
    };
    fetchMISData();
  }, [activeDataset]);

  if (!activeDataset) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
        <LayoutDashboard className={`w-16 h-16 mb-4 animate-pulse ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
        <h2 className={`text-2xl font-bold italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>OFFLINE MODE</h2>
        <p className={`mt-2 max-w-xs uppercase text-xs tracking-[0.2em] font-medium ${isDark ? 'text-slate-600' : 'text-slate-500'}`}>Upload and Activate a Dataset in the Studio to generate MIS Intelligence</p>
      </div>
    );
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-cyan-500 font-mono text-sm animate-pulse tracking-widest">AGGREGATING BUSINESS INTELLIGENCE...</p>
    </div>
  );

  if (error || !data) return (
    <div className="p-8 flex flex-col items-center justify-center h-[60vh] text-center">
      <div className={`p-6 rounded-3xl max-w-md border ${isDark ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-200'}`}>
        <p className="text-rose-500 font-black mb-2 uppercase tracking-widest text-sm">INTELLIGENCE GAP DETECTED</p>
        <p className={`text-sm whitespace-pre-wrap font-medium ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>{error || "The processing engine encountered an issue while generating reports."}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all shadow-xl shadow-blue-500/20 text-xs font-black uppercase tracking-widest"
        >
          RETRY ENGINE
        </button>
      </div>
    </div>
  );

  const { kpis, platform_summaries, dataset_info } = data;

  return (
    <div className={`p-8 space-y-10 min-h-screen transition-colors duration-500 ${isDark ? 'bg-slate-950/20 text-slate-100' : 'bg-transparent text-slate-800'}`}>
      <header className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-10 ${isDark ? 'border-slate-800/50' : 'border-slate-200'}`}>
        <div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent italic tracking-tighter leading-none">
            EXECUTIVE REPORT
          </h1>
          <p className={`mt-3 font-mono text-[10px] uppercase tracking-[0.4em] font-black ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Source: {dataset_info.filename}</p>
        </div>
        <div className="text-left md:text-right">
          <p className={`text-[10px] uppercase tracking-[0.4em] font-black mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Compute Scale</p>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
            <p className={`text-3xl font-black font-mono tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{dataset_info.rows.toLocaleString()}</p>
            <span className="text-slate-500 text-xs font-black uppercase tracking-widest">PTS</span>
          </div>
        </div>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Net Engagement" value={kpis.total_engagement} icon={<TrendingUp size={22} />} color="cyan" isDark={isDark} />
        <KPICard title="Efficiency Index" value={`${kpis.avg_engagement}%`} icon={<Users size={22} />} color="blue" isDark={isDark} />
        <KPICard title="Business ROI" value={`${kpis.avg_roi}%`} icon={<Target size={22} />} color="indigo" isDark={isDark} />
        <KPICard
          title="Growth Velocity"
          value={`${kpis.growth_rate}%`}
          icon={kpis.growth_rate >= 0 ? <ArrowUpRight size={22} /> : <ArrowDownRight size={22} />}
          color={kpis.growth_rate >= 0 ? "emerald" : "rose"}
          isDark={isDark}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PLATFORM PERFORMANCE TABLE */}
        <div className={`lg:col-span-2 rounded-[2.5rem] border p-10 backdrop-blur-3xl shadow-2xl transition-all ${isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-slate-200/50'}`}>
          <h2 className={`text-xl font-black mb-10 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Award className="text-cyan-500" size={24} /> Platform Performance Matrix
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`${isDark ? 'text-slate-600' : 'text-slate-400'} border-b ${isDark ? 'border-white/5' : 'border-slate-100'} text-[10px] font-black uppercase tracking-[0.2em]`}>
                  <th className="pb-6">ENTITY</th>
                  <th className="pb-6 text-center">AVG ENGAGEMENT</th>
                  <th className="pb-6 text-center">PEAK IMPACT</th>
                  <th className="pb-6 text-right">GROSS REACH</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                {platform_summaries.map((item, idx) => (
                  <tr key={idx} className={`group transition-all duration-300 ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}`}>
                    <td className={`py-6 font-black text-sm transition-colors ${isDark ? 'text-slate-300 group-hover:text-cyan-400' : 'text-slate-700 group-hover:text-blue-600'}`}>{item.Platform}</td>
                    <td className="py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-mono font-black tracking-tighter ${isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-50 text-cyan-600'}`}>
                        {item['Avg Engagement']}%
                      </span>
                    </td>
                    <td className={`py-6 text-center font-mono text-sm font-black ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{item['Max Engagement']}%</td>
                    <td className={`py-6 text-right font-mono text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item['Total Reach'].toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SUMMARY CHART */}
        <div className={`rounded-[2.5rem] border p-10 backdrop-blur-3xl shadow-2xl flex flex-col transition-all ${isDark ? 'bg-slate-900/40 border-white/5' : 'bg-white border-slate-200 shadow-slate-200/50'}`}>
          <h2 className={`text-xl font-black mb-10 ${isDark ? 'text-white' : 'text-slate-900'}`}>Reach Distribution</h2>
          <div className="flex-1 min-h-[350px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platform_summaries}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#ffffff05" : "#00000005"} vertical={false} />
                <XAxis dataKey="Platform" stroke={isDark ? "#475569" : "#94a3b8"} fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke={isDark ? "#475569" : "#94a3b8"} fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Total Reach" fill={isDark ? "#22d3ee" : "#2563eb"} radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, icon, color, isDark }) => {
  const colorMap = {
    cyan: isDark ? 'from-cyan-500/20 to-transparent text-cyan-400 border-cyan-500/10' : 'from-cyan-50 to-transparent text-cyan-600 border-cyan-100 shadow-xl shadow-cyan-100/20',
    blue: isDark ? 'from-blue-500/20 to-transparent text-blue-400 border-blue-500/10' : 'from-blue-50 to-transparent text-blue-600 border-blue-100 shadow-xl shadow-blue-100/20',
    indigo: isDark ? 'from-indigo-500/20 to-transparent text-indigo-400 border-indigo-500/10' : 'from-indigo-50 to-transparent text-indigo-600 border-indigo-100 shadow-xl shadow-indigo-100/20',
    emerald: isDark ? 'from-emerald-500/20 to-transparent text-emerald-400 border-emerald-500/10' : 'from-emerald-50 to-transparent text-emerald-600 border-emerald-100 shadow-xl shadow-emerald-100/20',
    rose: isDark ? 'from-rose-500/20 to-transparent text-rose-400 border-rose-500/10' : 'from-rose-50 to-transparent text-rose-600 border-rose-100 shadow-xl shadow-rose-100/20',
  };

  return (
    <div className={`p-10 rounded-[2.5rem] border bg-gradient-to-br ${colorMap[color]} group hover:scale-[1.02] transition-all duration-500`}>
      <div className="flex justify-between items-start mb-8">
        <div className={`p-4 rounded-3xl shadow-2xl transition-all ${isDark ? 'bg-slate-950/80 border border-white/10 text-white group-hover:text-cyan-400' : 'bg-white text-slate-900 shadow-slate-200'}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className={`text-xs font-black uppercase tracking-[0.3em] mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{title}</p>
        <p className={`text-4xl font-black font-mono tracking-tighter transition-colors ${isDark ? 'text-white group-hover:text-cyan-400' : 'text-slate-900'}`}>{value}</p>
      </div>
    </div>
  );
};

export default MISDashboard;
