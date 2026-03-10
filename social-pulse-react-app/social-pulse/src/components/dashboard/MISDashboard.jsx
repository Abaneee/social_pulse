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
  const { activeDataset } = useData();
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
        <LayoutDashboard className="w-16 h-16 text-slate-700 mb-4 animate-pulse" />
        <h2 className="text-2xl font-bold text-slate-500 italic">OFFLINE MODE</h2>
        <p className="text-slate-600 mt-2 max-w-xs uppercase text-xs tracking-[0.2em]">Upload and Activate a Dataset in the Studio to generate MIS Intelligence</p>
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
      <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl max-w-md">
        <p className="text-rose-400 font-medium mb-2">INTELLIGENCE GAP DETECTED</p>
        <p className="text-slate-500 text-sm whitespace-pre-wrap">{error || "The processing engine encountered an issue while generating reports."}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors text-sm font-semibold"
        >
          RETRY ENGINE
        </button>
      </div>
    </div>
  );

  const { kpis, platform_summaries, dataset_info } = data;

  return (
    <div className="p-6 space-y-8 bg-slate-950/20 min-h-screen text-slate-100">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800/50 pb-8">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-white via-cyan-400 to-blue-600 bg-clip-text text-transparent italic tracking-tighter">
            EXECUTIVE REPORT
          </h1>
          <p className="text-slate-500 mt-2 font-mono text-xs uppercase tracking-[0.3em]">Source: {dataset_info.filename}</p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-bold mb-1">Compute Scale</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <p className="text-2xl font-bold font-mono text-white">{dataset_info.rows.toLocaleString()}</p>
            <span className="text-slate-600 text-xs font-bold">PTS</span>
          </div>
        </div>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Net Engagement" value={kpis.total_engagement} icon={<TrendingUp size={22} />} color="cyan" />
        <KPICard title="Efficiency Index" value={`${kpis.avg_engagement}%`} icon={<Users size={22} />} color="blue" />
        <KPICard title="Business ROI" value={`${kpis.avg_roi}%`} icon={<Target size={22} />} color="indigo" />
        <KPICard
          title="Growth Velocity"
          value={`${kpis.growth_rate}%`}
          icon={kpis.growth_rate >= 0 ? <ArrowUpRight size={22} /> : <ArrowDownRight size={22} />}
          color={kpis.growth_rate >= 0 ? "emerald" : "rose"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PLATFORM PERFORMANCE TABLE */}
        <div className="lg:col-span-2 bg-slate-900/40 rounded-[2rem] border border-white/5 p-8 backdrop-blur-3xl shadow-2xl">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-white">
            <Award className="text-cyan-400" /> Platform Multi-Metric Analytics
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-600 border-b border-white/5 text-[10px] uppercase tracking-[0.2em]">
                  <th className="pb-6 font-black">ENTITY</th>
                  <th className="pb-6 font-black text-center">AVG ENGAGEMENT</th>
                  <th className="pb-6 font-black text-center">PEAK IMPACT</th>
                  <th className="pb-6 font-black text-right">GROSS REACH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {platform_summaries.map((item, idx) => (
                  <tr key={idx} className="group hover:bg-white/[0.02] transition-all duration-300">
                    <td className="py-6 font-bold text-sm text-slate-300 group-hover:text-cyan-400 transition-colors">{item.Platform}</td>
                    <td className="py-6 text-center">
                      <span className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-tighter">
                        {item['Avg Engagement']}%
                      </span>
                    </td>
                    <td className="py-6 text-center text-blue-400 font-mono text-sm font-bold">{item['Max Engagement']}%</td>
                    <td className="py-6 text-right text-slate-400 font-mono text-xs">{item['Total Reach'].toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SUMMARY CHART */}
        <div className="bg-slate-900/40 rounded-[2rem] border border-white/5 p-8 backdrop-blur-3xl shadow-2xl flex flex-col">
          <h2 className="text-xl font-bold mb-8 text-white">Reach Distribution</h2>
          <div className="flex-1 min-h-[300px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platform_summaries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="Platform" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Total Reach" fill="#22d3ee" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, icon, color }) => {
  const colorMap = {
    cyan: 'from-cyan-500/20 to-transparent text-cyan-400 border-cyan-500/10',
    blue: 'from-blue-500/20 to-transparent text-blue-400 border-blue-500/10',
    indigo: 'from-indigo-500/20 to-transparent text-indigo-400 border-indigo-500/10',
    emerald: 'from-emerald-500/20 to-transparent text-emerald-400 border-emerald-500/10',
    rose: 'from-rose-500/20 to-transparent text-rose-400 border-rose-500/10',
  };

  return (
    <div className={`p-8 rounded-[2rem] border bg-gradient-to-br ${colorMap[color]} backdrop-blur-3xl group hover:scale-[1.02] transition-transform duration-500`}>
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 shadow-xl text-white group-hover:text-cyan-400 transition-colors">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">{title}</p>
        <p className="text-4xl font-black font-mono tracking-tighter text-white group-hover:text-cyan-400 transition-colors tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default MISDashboard;
