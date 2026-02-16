import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Target, BarChart2, Play, CheckCircle, AlertCircle,
  Activity, Sparkles, Clock, Calendar, Hash, Type, Zap
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { trainModels, getFilters, predictInsights } from '../../services/api';

const ModelCard = ({ title, description, modelType, icon: Icon, color, filters }) => {
  const { activeDataset } = useData();
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

  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col h-full relative overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className={`text-2xl font-bold text-${color} flex items-center gap-2`}>
            <Icon className="w-6 h-6" />
            {title}
          </h3>
          <p className="text-white/60 text-sm mt-1">{description}</p>
        </div>
        {results && <CheckCircle className={`w-6 h-6 text-${color}`} />}
      </div>

      {/* Train Section */}
      {!results ? (
        <div className="flex-1 flex flex-col justify-center items-center space-y-6">
          <div className={`p-8 rounded-full bg-${color}/10 border border-${color}/20`}>
            <Icon className={`w-12 h-12 text-${color}`} />
          </div>
          <button
            onClick={handleTrain}
            disabled={training || !activeDataset}
            className={`px-8 py-3 rounded-xl bg-gradient-to-r from-${color} to-${color === 'neon-blue' ? 'purple-500' : 'emerald-400'} font-bold text-white shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:transform-none flex items-center gap-2`}
          >
            {training ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Training...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                Start Training
              </>
            )}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 space-y-6"
        >
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(results.metrics).map(([key, value]) => (
              <div key={key} className="bg-white/5 p-3 rounded-xl border border-white/10">
                <p className="text-xs text-white/40 uppercase font-bold">{key.replace('_', ' ')}</p>
                <p className={`text-xl font-bold text-${color}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="h-px bg-white/10 w-full" />

          {/* Prediction Form */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white/90">Predict Future Performance</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-white/60 ml-1">Platform</label>
                <select
                  value={predPlatform}
                  onChange={(e) => setPredPlatform(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-neon-blue outline-none"
                >
                  {filters.platforms.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/60 ml-1">Content Type</label>
                <select
                  value={predType}
                  onChange={(e) => setPredType(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-neon-blue outline-none"
                >
                  {filters.content_types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <button
              onClick={handlePredict}
              disabled={predicting}
              className={`w-full py-3 rounded-xl bg-white/10 border border-${color}/30 hover:bg-${color}/20 text-${color} font-bold transition-all flex justify-center items-center gap-2`}
            >
              {predicting ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Zap className="w-4 h-4" />}
              Generate Insights
            </button>
          </div>

          {/* Prediction Results */}
          <AnimatePresence>
            {prediction && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 rounded-xl p-4 border border-white/10 space-y-4"
              >
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <span className="text-sm text-white/60">Predicted Outcome</span>
                  <span className={`text-xl font-bold text-${color}`}>
                    {modelType === 'regression'
                      ? `${prediction.predicted_engagement || 0}% Rate`
                      : `${prediction.predicted_class || 'N/A'} Impact`
                    }
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white/5 p-2 rounded-lg">
                    <p className="text-white/40 text-xs">Best Time</p>
                    <p className="text-white font-medium">
                      {prediction.best_times?.[0]?.hour ? `${prediction.best_times[0].hour}:00` : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg">
                    <p className="text-white/40 text-xs">Best Day</p>
                    <p className="text-white font-medium">{prediction.best_day?.day || 'N/A'}</p>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg">
                    <p className="text-white/40 text-xs">Avg Reach</p>
                    <p className="text-white font-medium">{prediction.predicted_reach?.toLocaleString() || 'N/A'}</p>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg">
                    <p className="text-white/40 text-xs">Best Hashtag</p>
                    <p className="text-white font-medium truncate">#{prediction.best_hashtags?.[0]?.hashtag || 'N/A'}</p>
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
  const { activeDataset } = useData();
  const [filters, setFilters] = useState({ platforms: [], content_types: [] });

  useEffect(() => {
    if (activeDataset) {
      getFilters().then(res => setFilters(res.data)).catch(console.error);
    }
  }, [activeDataset]);

  if (!activeDataset) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Brain className="w-16 h-16 text-white/20 mb-4" />
        <h2 className="text-2xl font-bold text-white/40">No Active Dataset</h2>
        <p className="text-white/20 mt-2">Upload a dataset to start training models.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-green">
            AI Studio
          </h1>
          <p className="text-white/60 mt-2">Train models and generate predictive insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ModelCard
          title="Regression Analysis"
          description="Predict engagement rates using LightGBM"
          modelType="regression"
          icon={Activity}
          color="neon-blue"
          filters={filters}
        />
        <ModelCard
          title="Classification"
          description="Classify virality potential using CatBoost"
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
