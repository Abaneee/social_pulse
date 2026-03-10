import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, BarChart2, Hash, AlertCircle, RefreshCw } from 'lucide-react';
import { useData } from '../../context/DataContext';
import api from '../../services/api';

const EDA = () => {
    const { activeDataset, theme } = useData();
    const isDark = theme === 'dark';
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (activeDataset) {
            fetchReport();
        }
    }, [activeDataset]);

    const fetchReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/eda/');
            setReport(res.data.eda.report_json);
        } catch (err) {
            console.error('EDA failed:', err);
            setError('Failed to generate analysis report.');
        } finally {
            setLoading(false);
        }
    };

    const VariableCard = ({ name, data }) => (
        <div className={`p-6 rounded-3xl border transition-all ${isDark ? 'bg-slate-900/50 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'}`}>
            <div className="flex justify-between items-start mb-6">
                <h4 className={`font-black text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{name}</h4>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-white/10 text-white/50' : 'bg-slate-100 text-slate-500'}`}>
                    {data.type}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm font-medium">
                <div className={isDark ? 'text-slate-500' : 'text-slate-400'}>Missing:</div>
                <div className="text-right text-rose-500 font-bold">{data.n_missing} ({data.p_missing}%)</div>

                <div className={isDark ? 'text-slate-500' : 'text-slate-400'}>Distinct:</div>
                <div className="text-right text-blue-500 font-bold">{data.n_distinct}</div>

                {data.mean !== undefined && (
                    <>
                        <div className={isDark ? 'text-slate-500' : 'text-slate-400'}>Mean:</div>
                        <div className={`text-right font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{data.mean}</div>
                    </>
                )}
            </div>

            {data.top_values && (
                <div className="mt-8 pt-6 border-t border-slate-200/5 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Top Frequency</p>
                    {Object.entries(data.top_values).map(([val, count]) => (
                        <div key={val} className="flex justify-between text-xs font-bold items-center">
                            <span className={`truncate max-w-[140px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`} title={val}>{val}</span>
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] ${isDark ? 'bg-white/5 text-slate-500' : 'bg-slate-50 text-slate-400'}`}>{count}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    if (!activeDataset) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
                <FileText className={`w-16 h-16 mb-4 animate-pulse ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
                <h2 className={`text-2xl font-black italic tracking-tighter ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>NO ACTIVE DATASET</h2>
                <p className={`mt-2 max-w-xs uppercase text-xs tracking-[0.2em] font-medium ${isDark ? 'text-slate-600' : 'text-slate-500'}`}>Initiate a mission in the Studio to unlock tactical analysis.</p>
            </div>
        );
    }

    return (
        <div className={`p-8 max-w-7xl mx-auto space-y-10 transition-colors duration-500`}>
            <div className="flex justify-between items-center border-b pb-10 border-slate-500/10">
                <div>
                    <h1 className="text-5xl font-black bg-gradient-to-r from-rose-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent italic tracking-tighter leading-none">
                        EXPLORATORY ANALYSIS
                    </h1>
                    <p className={`mt-3 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Scan distributions and audit data quality signals.</p>
                </div>
                <button
                    onClick={fetchReport}
                    className={`p-4 rounded-2xl transition-all shadow-xl ${isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 shadow-slate-200/50'}`}
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {loading && !report ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-blue-600 font-black text-xs uppercase tracking-widest animate-pulse">Running Neural Scan...</p>
                </div>
            ) : error ? (
                <div className={`p-8 rounded-[2.5rem] border flex items-center space-x-6 ${isDark ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-200'}`}>
                    <AlertCircle className="w-10 h-10 text-rose-500 flex-shrink-0" />
                    <div>
                        <p className="text-rose-500 font-black text-xs uppercase tracking-widest mb-1">Audit Failure</p>
                        <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{error}</p>
                    </div>
                </div>
            ) : report ? (
                <div className="space-y-12">
                    {/* Overview Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className={`p-8 rounded-3xl border transition-all ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'}`}>
                            <div className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{report.table.n}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Total Signals (Rows)</div>
                        </div>
                        <div className={`p-8 rounded-3xl border transition-all ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'}`}>
                            <div className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{report.table.n_var}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Dimensions (Columns)</div>
                        </div>
                        <div className={`p-8 rounded-3xl border transition-all ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'}`}>
                            <div className="text-4xl font-black tracking-tighter text-rose-500">{report.table.p_cells_missing}%</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Noise Density (Missing)</div>
                        </div>
                        <div className={`p-8 rounded-3xl border transition-all ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'}`}>
                            <div className="text-4xl font-black tracking-tighter text-indigo-500">{report.table.n_duplicates}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Signal Echoes (Duplicates)</div>
                        </div>
                    </div>

                    <div>
                        <h3 className={`text-2xl font-black mb-8 flex items-center space-x-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            <Hash className="w-6 h-6 text-blue-600" />
                            <span>Variable Forensics</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {Object.entries(report.variables).map(([name, data]) => (
                                <VariableCard key={name} name={name} data={data} />
                            ))}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default EDA;
