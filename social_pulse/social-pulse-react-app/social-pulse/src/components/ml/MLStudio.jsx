import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Target, BarChart2, Play, CheckCircle, AlertCircle,
  Activity, Sparkles, Clock, Calendar, Hash, Type, TrendingUp,
  MessageSquare, Share2, Layers
} from 'lucide-react';
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Legend
} from 'recharts';
import { useData } from '../../context/DataContext';
import { trainModels, getFilters, predictInsights } from '../../services/api';

const MLStudio = () => {
  const { activeDataset, mlResults, setMlResults } = useData();

  // State Management
  const [trainingReg, setTrainingReg] = useState(false);
  const [trainingClass, setTrainingClass] = useState(false);

  // Model Results State (Separate for Clarity)
  const [regResults, setRegResults] = useState(null);
  const [classResults, setClassResults] = useState(null);

  const [error, setError] = useState(null);

  // Insights State
  const [showInsightsForm, setShowInsightsForm] = useState(false);
  const [filters, setFilters] = useState({ platforms: [], content_types: [] });
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insights, setInsights] = useState(null);


  useEffect(() => {
    if (activeDataset) {
      loadFilters();
    }
  }, [activeDataset]);

  const loadFilters = async () => {
    try {
      const res = await getFilters();
      setFilters(res.data);
      if (res.data.platforms.length > 0) setSelectedPlatform(res.data.platforms[0]);
      if (res.data.content_types.length > 0) setSelectedType(res.data.content_types[0]);
    } catch (err) {
      console.error("Failed to load filters", err);
    }
  };

  const handleTrainRegression = async () => {
    if (!activeDataset) return;
    setTrainingReg(true);
    setRegResults(null);
    setError(null);
    try {
      const response = await trainModels({ model_type: 'regression' });
      const res = response.data.results['regression'];
      if (res.error) throw new Error(res.error);
      setRegResults(res);
      // Auto-open insights form on success? Optional.
      setShowInsightsForm(true);
    } catch (err) {
      setError(err.message || 'Regression training failed.');
    } finally {
      setTrainingReg(false);
    }
  };

  const handleTrainClassification = async () => {
    if (!activeDataset) return;
    setTrainingClass(true);
    setClassResults(null);
    setError(null);
    try {
      const response = await trainModels({ model_type: 'classification' });
      const res = response.data.results['classification'];
      if (res.error) throw new Error(res.error);
      setClassResults(res);
    } catch (err) {
      setError(err.message || 'Classification training failed.');
    } finally {
      setTrainingClass(false);
    }
  };

  const handleGenerateInsights = async () => {
    setInsightsLoading(true);
    setInsights(null);
    try {
      const res = await predictInsights({
        platform: selectedPlatform,
        content_type: selectedType
      });
      setInsights(res.data.insights);
    } catch (err) {
      console.error("Insights generation failed", err);
    } finally {
      setInsightsLoading(false);
    }
  };

  if (!activeDataset) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Brain className="w-16 h-16 text-white/20 mb-4" />
        <h2 className="text-2xl font-bold text-white/40">No Active Dataset</h2>
        <p className="text-white/20 mt-2">Upload a dataset to access ML Studio.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1800px] mx-auto space-y-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-green">
            ML Studio
            </h1>
            <p className="text-white/40 mt-1">Train models and generate predictive insights</p>
        </div>
        {error && (
            <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-200 rounded-lg flex items-center space-x-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
            </div>
        )}
      </div>

      {/* Main Grid Layout for Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">

        {/* =================================================================================
            CARD 1: REGRESSION (LIGHTGBM)
           ================================================================================= */}
        <div className="group relative bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden flex flex-col">
            {/* Card Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/10 blur-[80px] rounded-full pointer-events-none -mr-32 -mt-32" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-50" />

            <div className="p-6 md:p-8 space-y-6">
                {/* Card Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-neon-blue/10 rounded-2xl border border-neon-blue/20 shadow-[0_0_15px_rgba(0,242,255,0.15)]">
                            <TrendingUp className="w-8 h-8 text-neon-blue" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Engagement Forecast</h2>
                            <p className="text-xs text-neon-blue font-medium mt-1">LightGBM Regression</p>
                        </div>
                    </div>
                    <button
                        onClick={handleTrainRegression}
                        disabled={trainingReg}
                        className="px-5 py-2.5 rounded-xl bg-neon-blue/10 border border-neon-blue/20 text-neon-blue font-bold hover:bg-neon-blue hover:text-black transition-all flex items-center space-x-2 disabled:opacity-50 text-sm"
                    >
                        {trainingReg ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        <span>{trainingReg ? 'Training...' : 'Train'}</span>
                    </button>
                </div>

                <p className="text-white/60 text-sm">
                    Predict numerical engagement scores based on historical data patterns.
                </p>

                {/* Regression Results Area */}
                <AnimatePresence>
                {regResults && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6 pt-4 border-t border-white/5">
                    
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">R² Score</p>
                            <p className="text-xl font-bold text-neon-blue mt-1">{regResults.metrics.r2_score?.toFixed(3)}</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">RMSE</p>
                            <p className="text-xl font-bold text-neon-blue mt-1">{regResults.metrics.rmse?.toFixed(3)}</p>
                        </div>
                        <div className="flex flex-col justify-center">
                            <button
                                onClick={() => setShowInsightsForm(!showInsightsForm)}
                                className={`w-full h-full rounded-xl flex items-center justify-center text-sm font-bold border transition-all ${
                                    showInsightsForm 
                                    ? 'bg-neon-blue/20 border-neon-blue text-neon-blue' 
                                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                }`}
                            >
                                <Sparkles className={`w-4 h-4 mr-2 ${showInsightsForm ? 'animate-pulse' : ''}`} />
                                {showInsightsForm ? 'Active' : 'Insights'}
                            </button>
                        </div>
                    </div>

                    {/* Scatter Chart */}
                    {regResults.visualization?.scatter_data && (
                        <div className="h-[250px] w-full bg-black/20 rounded-xl p-4 border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-semibold text-white/60">Actual vs Predicted</h4>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis type="number" dataKey="actual" tick={{fontSize: 10, fill: '#666'}} stroke="rgba(255,255,255,0.2)" />
                            <YAxis type="number" dataKey="predicted" tick={{fontSize: 10, fill: '#666'}} stroke="rgba(255,255,255,0.2)" />
                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }}
                            />
                            <Scatter name="Test Data" data={regResults.visualization.scatter_data} fill="#00f2ff" r={3} />
                            </ScatterChart>
                        </ResponsiveContainer>
                        </div>
                    )}

                    {/* INSIGHTS FORM (Regression Context) */}
                    {showInsightsForm && (
                        <div className="pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-white/40 uppercase">Platform</label>
                                        <select
                                            value={selectedPlatform}
                                            onChange={(e) => setSelectedPlatform(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-neon-blue outline-none"
                                        >
                                            {filters.platforms.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-white/40 uppercase">Type</label>
                                        <select
                                            value={selectedType}
                                            onChange={(e) => setSelectedType(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-neon-blue outline-none"
                                        >
                                            {filters.content_types.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <button
                                    onClick={handleGenerateInsights}
                                    disabled={insightsLoading}
                                    className="w-full py-2.5 bg-gradient-to-r from-neon-blue to-cyan-600 rounded-lg text-white text-sm font-bold shadow-lg shadow-neon-blue/20 hover:brightness-110 transition-all disabled:opacity-50"
                                >
                                    {insightsLoading ? 'Analyzing...' : 'Generate Prediction'}
                                </button>

                                {/* Insights Display */}
                                {insights && (
                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                        <div className="col-span-2 p-3 bg-neon-blue/5 border border-neon-blue/10 rounded-lg">
                                             <div className="flex items-center space-x-2 mb-1 text-neon-blue">
                                                <Clock className="w-3 h-3" />
                                                <span className="text-xs font-bold uppercase">Best Time</span>
                                            </div>
                                            <p className="text-lg font-bold text-white">
                                                {insights.best_times?.[0]?.hour ? `${insights.best_times[0].hour}:00` : '--:--'}
                                            </p>
                                        </div>
                                        <div className="col-span-1 p-3 bg-white/5 border border-white/10 rounded-lg">
                                             <div className="flex items-center space-x-2 mb-1 text-neon-purple">
                                                <Hash className="w-3 h-3" />
                                                <span className="text-xs font-bold uppercase">Hashtag</span>
                                            </div>
                                            <p className="text-xs text-white truncate">
                                                #{insights.best_hashtags?.[0]?.hashtag || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="col-span-1 p-3 bg-white/5 border border-white/10 rounded-lg">
                                             <div className="flex items-center space-x-2 mb-1 text-neon-pink">
                                                <Share2 className="w-3 h-3" />
                                                <span className="text-xs font-bold uppercase">Reach</span>
                                            </div>
                                            <p className="text-sm font-bold text-white">
                                                {insights.average_reach?.toLocaleString() || 0}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
        </div>

        {/* =================================================================================
            CARD 2: CLASSIFICATION (CATBOOST)
           ================================================================================= */}
        <div className="group relative bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden flex flex-col">
            {/* Card Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-green/10 blur-[80px] rounded-full pointer-events-none -mr-32 -mt-32" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-green to-transparent opacity-50" />

            <div className="p-6 md:p-8 space-y-6">
                 {/* Card Header */}
                 <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-neon-green/10 rounded-2xl border border-neon-green/20 shadow-[0_0_15px_rgba(0,255,157,0.15)]">
                            <Layers className="w-8 h-8 text-neon-green" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Virality Classifier</h2>
                            <p className="text-xs text-neon-green font-medium mt-1">CatBoost Classification</p>
                        </div>
                    </div>
                    <button
                        onClick={handleTrainClassification}
                        disabled={trainingClass}
                        className="px-5 py-2.5 rounded-xl bg-neon-green/10 border border-neon-green/20 text-neon-green font-bold hover:bg-neon-green hover:text-black transition-all flex items-center space-x-2 disabled:opacity-50 text-sm"
                    >
                        {trainingClass ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        <span>{trainingClass ? 'Training...' : 'Train'}</span>
                    </button>
                </div>

                <p className="text-white/60 text-sm">
                    Categorize posts into performance tiers (Low, Avg, High) for strategy.
                </p>

                {/* Classification Results Area */}
                <AnimatePresence>
                {classResults && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6 pt-4 border-t border-white/5">
                    
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">Accuracy</p>
                            <p className="text-xl font-bold text-neon-green mt-1">{classResults.metrics.accuracy}%</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest">F1 Score</p>
                            <p className="text-xl font-bold text-neon-green mt-1">{classResults.metrics.f1_score?.toFixed(3)}</p>
                        </div>
                        <div className="flex flex-col justify-center">
                            <button
                                onClick={() => setShowInsightsForm(!showInsightsForm)}
                                className={`w-full h-full rounded-xl flex items-center justify-center text-sm font-bold border transition-all ${
                                    showInsightsForm 
                                    ? 'bg-neon-green/20 border-neon-green text-neon-green' 
                                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                }`}
                            >
                                <Sparkles className={`w-4 h-4 mr-2 ${showInsightsForm ? 'animate-pulse' : ''}`} />
                                {showInsightsForm ? 'Active' : 'Insights'}
                            </button>
                        </div>
                    </div>

                    {/* Confusion Matrix Chart */}
                    {classResults.visualization?.confusion_matrix && (
                        <div className="h-[250px] w-full bg-black/20 rounded-xl p-4 border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-semibold text-white/60">Confusion Matrix</h4>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={classResults.visualization.confusion_matrix} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{fontSize: 10, fill: '#666'}} />
                                <YAxis stroke="rgba(255,255,255,0.2)" tick={{fontSize: 10, fill: '#666'}} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }}
                                />
                                <Legend wrapperStyle={{fontSize: '10px'}} />
                                {Object.keys(classResults.visualization.confusion_matrix[0] || {})
                                    .filter(key => key !== 'name')
                                    .map((key, index) => (
                                    <Bar key={key} dataKey={key} stackId="a" fill={index % 2 === 0 ? "#00FF9D" : "#00F2FF"} radius={[2, 2, 0, 0]} />
                                    ))
                                }
                            </BarChart>
                        </ResponsiveContainer>
                        </div>
                    )}

                    {/* INSIGHTS FORM (Classification Context) */}
                    {showInsightsForm && (
                        <div className="pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-white/40 uppercase">Platform</label>
                                        <select
                                            value={selectedPlatform}
                                            onChange={(e) => setSelectedPlatform(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-neon-green outline-none"
                                        >
                                            {filters.platforms.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-white/40 uppercase">Type</label>
                                        <select
                                            value={selectedType}
                                            onChange={(e) => setSelectedType(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-neon-green outline-none"
                                        >
                                            {filters.content_types.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <button
                                    onClick={handleGenerateInsights}
                                    disabled={insightsLoading}
                                    className="w-full py-2.5 bg-gradient-to-r from-neon-green to-emerald-600 rounded-lg text-black text-sm font-bold shadow-lg shadow-neon-green/20 hover:brightness-110 transition-all disabled:opacity-50"
                                >
                                    {insightsLoading ? 'Analyzing...' : 'Predict Virality'}
                                </button>

                                {/* Insights Display */}
                                {insights && (
                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                        <div className="col-span-2 p-3 bg-neon-green/5 border border-neon-green/10 rounded-lg relative overflow-hidden">
                                             <div className="flex items-center space-x-2 mb-1 text-neon-green">
                                                <Target className="w-3 h-3" />
                                                <span className="text-xs font-bold uppercase">Predicted Class</span>
                                            </div>
                                            <p className="text-lg font-bold text-white uppercase tracking-wider">
                                                {insights.predicted_class || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="col-span-1 p-3 bg-white/5 border border-white/10 rounded-lg">
                                             <div className="flex items-center space-x-2 mb-1 text-neon-purple">
                                                <Hash className="w-3 h-3" />
                                                <span className="text-xs font-bold uppercase">Hashtag</span>
                                            </div>
                                            <p className="text-xs text-white truncate">
                                                #{insights.best_hashtags?.[0]?.hashtag || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="col-span-1 p-3 bg-white/5 border border-white/10 rounded-lg">
                                             <div className="flex items-center space-x-2 mb-1 text-neon-blue">
                                                <Clock className="w-3 h-3" />
                                                <span className="text-xs font-bold uppercase">Best Time</span>
                                            </div>
                                            <p className="text-sm font-bold text-white">
                                                 {insights.best_times?.[0]?.hour ? `${insights.best_times[0].hour}:00` : '--:--'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
        </div>

      </div>
      
      {/* Bottom Spacer */}
      <div className="h-10" />
    </div>
  );
};

export default MLStudio;