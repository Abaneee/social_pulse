import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, BarChart2, Hash, AlertCircle, RefreshCw } from 'lucide-react';
import { useData } from '../../context/DataContext';
import api from '../../services/api';

const EDA = () => {
    const { activeDataset } = useData();
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
        <div className="glass-card p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-start">
                <h4 className="font-bold text-lg text-white">{name}</h4>
                <div className="px-2 py-1 rounded text-xs bg-white/10 text-white/60">
                    {data.type}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-white/60">Missing:</div>
                <div className="text-right text-neon-pink">{data.n_missing} ({data.p_missing}%)</div>

                <div className="text-white/60">Distinct:</div>
                <div className="text-right text-neon-blue">{data.n_distinct}</div>

                {data.mean !== undefined && (
                    <>
                        <div className="text-white/60">Mean:</div>
                        <div className="text-right text-white">{data.mean}</div>
                    </>
                )}
            </div>

            {data.top_values && (
                <div className="mt-2 space-y-1">
                    <p className="text-xs text-white/40 uppercase">Top Values</p>
                    {Object.entries(data.top_values).map(([val, count]) => (
                        <div key={val} className="flex justify-between text-xs">
                            <span className="truncate max-w-[120px]" title={val}>{val}</span>
                            <span className="text-white/40">{count}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    if (!activeDataset) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <FileText className="w-16 h-16 text-white/20 mb-4" />
                <h2 className="text-2xl font-bold text-white/40">No Active Dataset</h2>
                <p className="text-white/20 mt-2">Upload a dataset to view analysis.</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-blue">
                        Exploratory Analysis
                    </h1>
                    <p className="text-white/60 mt-2">Deep dive into data distribution and quality</p>
                </div>
                <button
                    onClick={fetchReport}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {loading && !report ? (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin" />
                </div>
            ) : error ? (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center space-x-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                    <p className="text-red-200">{error}</p>
                </div>
            ) : report ? (
                <div className="space-y-8">
                    {/* Overview Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass-card p-4 rounded-xl text-center">
                            <div className="text-3xl font-bold text-white">{report.table.n}</div>
                            <div className="text-xs text-white/40 uppercase tracking-wider">Rows</div>
                        </div>
                        <div className="glass-card p-4 rounded-xl text-center">
                            <div className="text-3xl font-bold text-white">{report.table.n_var}</div>
                            <div className="text-xs text-white/40 uppercase tracking-wider">Columns</div>
                        </div>
                        <div className="glass-card p-4 rounded-xl text-center">
                            <div className="text-3xl font-bold text-neon-pink">{report.table.p_cells_missing}%</div>
                            <div className="text-xs text-white/40 uppercase tracking-wider">Missing Cells</div>
                        </div>
                        <div className="glass-card p-4 rounded-xl text-center">
                            <div className="text-3xl font-bold text-neon-purple">{report.table.n_duplicates}</div>
                            <div className="text-xs text-white/40 uppercase tracking-wider">Duplicates</div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                            <Hash className="w-5 h-5 text-neon-blue" />
                            <span>Variables Analysis</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
