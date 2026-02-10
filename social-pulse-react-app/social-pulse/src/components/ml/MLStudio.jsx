import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Target, BarChart2, Play, CheckCircle, AlertCircle,
  Activity, Sparkles, Clock, Calendar, Hash, Type
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { trainModels, getFilters, predictInsights } from '../../services/api';

const MLStudio = () => {
  const { activeDataset, mlResults, setMlResults } = useData();

  // Training State
  const [training, setTraining] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [error, setError] = useState(null);

  // Prediction State
  const [filters, setFilters] = useState({ platforms: [], content_types: [] });
  const [predPlatform, setPredPlatform] = useState('');
  const [predType, setPredType] = useState('');
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [activeTab, setActiveTab] = useState('predict'); // 'train' or 'predict'

  useEffect(() => {
    if (activeDataset) {
      loadFilters();
    }
  }, [activeDataset]);

  const loadFilters = async () => {
    try {
      const res = await getFilters();
      setFilters(res.data);
      if (res.data.platforms.length > 0) setPredPlatform(res.data.platforms[0]);
      if (res.data.content_types.length > 0) setPredType(res.data.content_types[0]);
    } catch (err) {
      console.error("Failed to load filters", err);
    }
  };

  const handleTrain = async () => {
    if (!selectedModel || !activeDataset) return;

    setTraining(true);
    setError(null);
    try {
      const response = await trainModels({ model_type: selectedModel });
      const resultData = response.data.results[selectedModel];

      if (resultData && resultData.error) {
        setError(resultData.error);
        setMlResults(null);
      } else {
        setMlResults(resultData);
      }
    } catch (err) {
      console.error('Training failed:', err);
      setError('Model training failed. Please check your dataset quality.');
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
            AI Engine
          </h1>
          <p className="text-white/60 mt-2">Advanced Predictive Analytics & Training</p>
        </div>

        {/* Toggle Tabs */}
        <div className="flex bg-white/5 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('predict')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'predict'
                ? 'bg-neon-blue text-black shadow-[0_0_15px_rgba(0,242,255,0.4)]'
                : 'text-white/60 hover:text-white'
              }`}
          >
            Prediction Lab
          </button>
          <button
            onClick={() => setActiveTab('train')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'train'
                ? 'bg-neon-green text-black shadow-[0_0_15px_rgba(0,255,157,0.4)]'
                : 'text-white/60 hover:text-white'
              }`}
          >
            Model Training
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'predict' ? (
          <motion.div
            key="predict"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Input Section */}
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-sm text-white/60 font-medium ml-1">Platform</label>
                  <select
                    value={predPlatform}
                    onChange={(e) => setPredPlatform(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-neon-blue focus:outline-none transition-colors"
                  >
                    {filters.platforms.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-sm text-white/60 font-medium ml-1">Content Type</label>
                  <select
                    value={predType}
                    onChange={(e) => setPredType(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-neon-blue focus:outline-none transition-colors"
                  >
                    {filters.content_types.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <button
                  onClick={handlePredict}
                  disabled={predicting}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple font-bold text-white shadow-lg shadow-neon-blue/20 hover:scale-105 transition-transform disabled:opacity-50 disabled:transform-none"
                >
                  {predicting ? 'Analyzing...' : 'Generate Prediction'}
                </button>
              </div>
            </div>

            {/* Results Section */}
            {prediction && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {/* Score Card */}
                <div className="glass-card p-6 rounded-2xl md:col-span-1 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <h3 className="text-lg font-bold text-white/80 mb-6 flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-neon-blue" />
                    <span>Predicted Impact</span>
                  </h3>

                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/10" />
                        <circle
                          cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10"
                          fill="transparent"
                          strokeDasharray={440}
                          strokeDashoffset={440 - (440 * (prediction.predicted_engagement || 0)) / 100} // Assuming 0-100 scale, else needs normalization
                          className="text-neon-blue transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-white">{prediction.predicted_engagement || 0}%</span>
                        <span className="text-xs text-white/40 uppercase tracking-wider mt-1">Engagement</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Strategy Card */}
                <div className="glass-card p-6 rounded-2xl md:col-span-2 space-y-6">
                  <h3 className="text-lg font-bold text-white/80 mb-4 flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-neon-purple" />
                    <span>Optimization Strategy</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-neon-purple/30 transition-colors">
                      <div className="flex items-center space-x-3 mb-2">
                        <Clock className="w-5 h-5 text-neon-purple" />
                        <span className="text-sm text-white/60">Best Time</span>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {prediction.best_times?.[0]?.hour ? `${prediction.best_times[0].hour}:00` : 'N/A'}
                      </p>
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-neon-pink/30 transition-colors">
                      <div className="flex items-center space-x-3 mb-2">
                        <Calendar className="w-5 h-5 text-neon-pink" />
                        <span className="text-sm text-white/60">Best Day</span>
                      </div>
                      <p className="text-xl font-bold text-white">
                        {prediction.best_day?.day || 'N/A'}
                      </p>
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-neon-green/30 transition-colors">
                      <div className="flex items-center space-x-3 mb-2">
                        <Type className="w-5 h-5 text-neon-green" />
                        <span className="text-sm text-white/60">Caption Length</span>
                      </div>
                      <p className="text-lg font-bold text-white leading-tight">
                        {prediction.best_caption_length || 'Medium'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Hash className="w-4 h-4 text-white/40" />
                      <span className="text-sm text-white/60">Recommended Hashtags</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {prediction.best_hashtags?.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-neon-blue hover:bg-neon-blue/10 transition-colors cursor-default">
                          #{tag.hashtag}
                        </span>
                      ))}
                      {(!prediction.best_hashtags || prediction.best_hashtags.length === 0) && (
                        <span className="text-xs text-white/40">No significant hashtag data found.</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="train"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Model Selection */}
            <div className="glass-card p-6 rounded-2xl space-y-6">
              <h3 className="text-xl font-bold flex items-center space-x-2">
                <Target className="w-6 h-6 text-neon-blue" />
                <span>Select Model Architecture</span>
              </h3>

              <div className="space-y-4">
                <div
                  onClick={() => setSelectedModel('regression')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedModel === 'regression' ? 'bg-neon-blue/20 border-neon-blue' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg mb-1">Engagement Forecast</h4>
                      <p className="text-sm text-white/60">LightGBM Regression</p>
                    </div>
                    {selectedModel === 'regression' && <CheckCircle className="w-5 h-5 text-neon-blue" />}
                  </div>
                  <p className="mt-2 text-xs text-white/40">Predicts numerical engagement scores (likes, shares) based on content features.</p>
                </div>

                <div
                  onClick={() => setSelectedModel('classification')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedModel === 'classification' ? 'bg-neon-green/20 border-neon-green' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg mb-1">Virality Classifier</h4>
                      <p className="text-sm text-white/60">CatBoost Classification</p>
                    </div>
                    {selectedModel === 'classification' && <CheckCircle className="w-5 h-5 text-neon-green" />}
                  </div>
                  <p className="mt-2 text-xs text-white/40">Classifies posts into viral/non-viral categories with high precision.</p>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl flex items-center space-x-2 text-sm">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleTrain}
                disabled={!selectedModel || training}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-neon-blue to-neon-green font-bold text-lg hover:shadow-[0_0_20px_rgba(0,242,255,0.3)] transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:transform-none disabled:shadow-none"
              >
                {training ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span className="text-black">Training Model...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 text-black" />
                    <span className="text-black">Start Training</span>
                  </>
                )}
              </button>
            </div>

            {/* Results Area */}
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden min-h-[400px]">
              {!mlResults ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <Activity className="w-16 h-16 text-white/10 mb-4 animate-pulse" />
                  <p className="text-white/40">Select a model and start training to see performance metrics.</p>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-xl font-bold flex items-center space-x-2 border-b border-white/10 pb-4">
                    <BarChart2 className="w-6 h-6 text-neon-green" />
                    <span>Training Results</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Accuracy / R²</p>
                      <p className="text-2xl font-bold text-neon-green">{mlResults.metrics.accuracy || mlResults.metrics.r2_score?.toFixed(3)}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-xs text-white/40 uppercase tracking-wider mb-1">RMSE / F1</p>
                      <p className="text-2xl font-bold text-neon-blue">{mlResults.metrics.rmse?.toFixed(3) || mlResults.metrics.f1_score?.toFixed(3)}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-white/80">Feature Importance</h4>
                    <div className="space-y-3">
                      {Object.entries(mlResults.feature_importance || {})
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([feature, importance], i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-white/60">{feature}</span>
                              <span className="text-neon-green">{importance.toFixed(3)}</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-neon-green"
                                style={{ width: `${Math.min(importance * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>

                  <div className="p-4 bg-neon-green/10 border border-neon-green/20 rounded-xl flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-neon-green" />
                    <p className="text-sm text-neon-green-light">Model saved successfully to registry.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MLStudio;
