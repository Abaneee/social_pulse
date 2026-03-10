import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Target, BarChart2, Play, CheckCircle, AlertCircle,
  Activity, Sparkles, Clock, Calendar, Hash, Type, Zap
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { trainModels, getFilters, predictInsights } from '../../services/api';

const ModelCard = ({ title, description, modelType, icon: Icon, color, filters }) => {
  const { activeDataset, theme } = useData();
  const isDark = theme === 'dark';
  const [training, setTraining] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Predict state
  const [predPlatform, setPredPlatform] = useState('');
  const [predType, setPredType] = useState('');
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);

  // Initialize filters
  useEffect(() => {
    if (filters.platforms.length > 0 && !predPlatform) setPredPlatform(filters.platforms[0]);
    if (filters.content_types.length > 0 && !predType) setPredType(filters.content_types[0]);
  }, [filters]);

  const handleTrain = async () => {
    if (!activeDataset) return;
    setTraining(true);
    setError(null);
    setResults(null);
    try {
      const response = await trainModels({ model_type: modelType });
      const resultData = response.data.results[modelType];
      if (resultData && resultData.error) {
        setError(resultData.error);
      } else {
        setResults(resultData);
      }
    } catch (err) {
      setError('Training failed. Check dataset.');
      console.error(err);
    } finally {
      setTraining(false);
    }
  };

  const handlePredict = async () => {
    if (!predPlatform || !predType) return;
    setPredicting(true);
    try {
      const res = await predictInsights({
        platform: predPlatform,
        content_type: predType
      });
      setPrediction(res.data.insights);
    } catch (err) {
      console.error("Prediction failed", err);
    } finally {
      setPredicting(false);
    }
  };

  // Dynamic colors based on prop
  const colorMap = {
    'neon-blue': {
      primary: '#3b82f6',
      gradient: 'from-blue-600 to-indigo-600',
      text: isDark ? 'text-blue-400' : 'text-blue-600',
      bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50',
      border: isDark ? 'border-blue-500/20' : 'border-blue-200'
    },
    'neon-green': {
      primary: '#10b981',
      gradient: 'from-emerald-600 to-green-600',
      text: isDark ? 'text-emerald-400' : 'text-emerald-600',
      bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50',
      border: isDark ? 'border-emerald-500/20' : 'border-emerald-200'
    }
  };

  const activeColor = colorMap[color] || colorMap['neon-blue'];

  return (
    <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden group ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'}`}>

      {/* Live Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className={`absolute top-[-20%] left-[-20%] w-[140%] h-[140%] blur-[100px] rounded-full opacity-20 ${color === 'neon-blue' ? 'bg-blue-500' : 'bg-emerald-500'}`}
        />
        {training && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-10 relative z-10">
        <div>
          <h3 className={`text-3xl font-black italic tracking-tighter flex items-center gap-3 ${activeColor.text}`}>
            <Icon className="w-8 h-8" />
            {title}
          </h3>
          <p className={`text-xs font-black uppercase tracking-[0.2em] mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{description}</p>
        </div>
        {results && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${activeColor.bg}`}
          >
            <CheckCircle className={`w-6 h-6 ${activeColor.text}`} />
          </motion.div>
        )}
      </div>

      {/* Train Section */}
      {!results ? (
        <div className="flex-1 flex flex-col justify-center items-center space-y-10 relative z-10">
          <div className={`p-10 rounded-[2rem] transition-all relative group-hover:scale-110 duration-500 ${activeColor.bg} border ${activeColor.border}`}>
            <Icon className={`w-16 h-16 ${activeColor.text}`} />
            {/* Pulsing signal lines */}
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`absolute inset-0 rounded-[2rem] border-2 ${activeColor.border}`}
            />
          </div>

          <div className="text-center space-y-6 w-full">
            <button
              onClick={handleTrain}
              disabled={training || !activeDataset}
              className={`w-full py-5 rounded-2xl bg-gradient-to-r ${activeColor.gradient} text-white font-black uppercase tracking-[0.2em] text-xs hover:opacity-90 transition-all flex items-center justify-center space-x-3 shadow-2xl disabled:opacity-50 disabled:transform-none`}
              style={{ boxShadow: `0 20px 40px -10px ${activeColor.primary}4D` }}
            >
              {training ? (
                <>
                  <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Neural Weights...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Launch Training Mission</span>
                </>
              )}
            </button>
            {error && <p className="text-rose-500 text-xs font-black uppercase tracking-widest">{error}</p>}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 space-y-8 relative z-10"
        >
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(results.metrics).map(([key, value]) => (
              <div key={key} className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                <p className={`text-[10px] uppercase font-black tracking-widest leading-none mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {key.replace('_', ' ')}
                </p>
                <p className={`text-2xl font-black italic tracking-tighter ${activeColor.text}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className={`h-px w-full ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />

          {/* Prediction Form */}
          <div className="space-y-6">
            <h4 className={`text-sm font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Predict Future Signal</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Platform</label>
                <select
                  value={predPlatform}
                  onChange={(e) => setPredPlatform(e.target.value)}
                  className={`w-full rounded-xl p-3 text-xs font-bold transition-all outline-none border ${isDark ? 'bg-slate-900 border-white/10 text-white focus:border-blue-500' : 'bg-white border-slate-200 text-slate-800 focus:border-blue-400'}`}
                >
                  {filters.platforms.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Content Type</label>
                <select
                  value={predType}
                  onChange={(e) => setPredType(e.target.value)}
                  className={`w-full rounded-xl p-3 text-xs font-bold transition-all outline-none border ${isDark ? 'bg-slate-900 border-white/10 text-white focus:border-blue-500' : 'bg-white border-slate-200 text-slate-800 focus:border-blue-400'}`}
                >
                  {filters.content_types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={handlePredict}
              disabled={predicting}
              className={`w-full py-4 rounded-xl border-2 font-black uppercase tracking-[0.2em] text-[10px] transition-all flex justify-center items-center gap-3 ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10 text-white' : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-800'}`}
            >
              {predicting ? <div className="w-4 h-4 border-4 border-current border-t-transparent rounded-full animate-spin" /> : <Zap className={`w-4 h-4 ${activeColor.text}`} />}
              <span>Execute Neural Inference</span>
            </button>
          </div>

          {/* Prediction Results */}
          <AnimatePresence>
            {prediction && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`rounded-2xl p-6 border shadow-2xl space-y-5 ${isDark ? 'bg-slate-900/80 border-white/10' : 'bg-white border-slate-200'}`}
              >
                <div className={`flex justify-between items-center pb-4 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Predicted Outcome</span>
                  <span className={`text-2xl font-black italic tracking-tighter ${activeColor.text}`}>
                    {modelType === 'regression'
                      ? `${prediction.predicted_engagement || 0}% ENG.`
                      : `${prediction.predicted_class || 'N/A'} IMPACT`
                    }
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-[9px] uppercase font-black tracking-widest mb-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Best Time</p>
                    <p className={isDark ? 'text-white' : 'text-slate-900'}>
                      {prediction.best_times?.[0]?.hour ? `${prediction.best_times[0].hour}:00` : 'N/A'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-[9px] uppercase font-black tracking-widest mb-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Optimal Day</p>
                    <p className={isDark ? 'text-white' : 'text-slate-900'}>{prediction.best_day?.day || 'N/A'}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-[9px] uppercase font-black tracking-widest mb-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Avg Reach</p>
                    <p className={isDark ? 'text-white' : 'text-slate-900'}>{prediction.predicted_reach?.toLocaleString() || 'N/A'}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-[9px] uppercase font-black tracking-widest mb-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Viral Tag</p>
                    <p className={`${activeColor.text} truncate font-black`}>#{prediction.best_hashtags?.[0]?.hashtag || 'N/A'}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

const MLStudio = () => {
  const { activeDataset, theme } = useData();
  const isDark = theme === 'dark';
  const [filters, setFilters] = useState({ platforms: [], content_types: [] });

  useEffect(() => {
    if (activeDataset) {
      getFilters().then(res => setFilters(res.data)).catch(console.error);
    }
  }, [activeDataset]);

  if (!activeDataset) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
        <Brain className={`w-16 h-16 mb-4 animate-pulse ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
        <h2 className={`text-2xl font-black italic tracking-tighter ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>NO ACTIVE DATASET</h2>
        <p className={`mt-2 max-w-xs uppercase text-xs tracking-[0.2em] font-medium ${isDark ? 'text-slate-600' : 'text-slate-500'}`}>Initiate a mission in the Studio to unlock AI model training.</p>
      </div>
    );
  }

  return (
    <div className={`p-8 max-w-7xl mx-auto space-y-10 transition-colors duration-500`}>
      <div className="flex justify-between items-center border-b pb-10 border-slate-500/10">
        <div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-600 bg-clip-text text-transparent italic tracking-tighter leading-none">
            AI STUDIO
          </h1>
          <p className={`mt-3 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Train advanced neural models and extract predictive signals.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <ModelCard
          title="Regression Analysis"
          description="Predict engagement rates via LightGBM"
          modelType="regression"
          icon={Activity}
          color="neon-blue"
          filters={filters}
        />
        <ModelCard
          title="Classification"
          description="Classify virality potential via CatBoost"
          modelType="classification"
          icon={Target}
          color="neon-green"
          filters={filters}
        />
      </div>
    </div>
  );
};

export default MLStudio;
