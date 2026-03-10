import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Droplets, Copy, Calendar, Play, CheckCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { processData } from '../../services/api';

const Refinery = () => {
  const { activeDataset, updateDatasetState, theme } = useData();
  const isDark = theme === 'dark';
  const [processing, setProcessing] = useState(false);
  const [options, setOptions] = useState({
    removeNulls: true,
    deduplicate: true,
    standardizeDates: true
  });

  const handleProcess = async () => {
    if (!activeDataset) return;

    setProcessing(true);
    try {
      const response = await processData(options);
      const { preview, dataHealth, preprocessing } = response.data;

      // Update context with processed data
      updateDatasetState(activeDataset, dataHealth, preview);

      // Could show a success toast here
      console.log('Preprocessing complete:', preprocessing);
    } catch (err) {
      console.error('Processing failed:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (!activeDataset) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
        <Sparkles className={`w-16 h-16 mb-4 animate-pulse ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
        <h2 className={`text-2xl font-black italic tracking-tighter ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>NO ACTIVE DATASET</h2>
        <p className={`mt-2 max-w-xs uppercase text-xs tracking-[0.2em] font-medium ${isDark ? 'text-slate-600' : 'text-slate-500'}`}>Initiate a mission in the Studio to unlock tactical data refining.</p>
      </div>
    );
  }

  return (
    <div className={`p-8 max-w-7xl mx-auto space-y-10 transition-colors duration-500`}>
      <div className="flex justify-between items-center border-b pb-10 border-slate-500/10">
        <div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 bg-clip-text text-transparent italic tracking-tighter leading-none">
            REFINERY
          </h1>
          <p className={`mt-3 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Clean and standardize your raw data signals.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cleaning Options */}
        <div className="md:col-span-1 space-y-4">
          <div className={`p-8 rounded-[2.5rem] border transition-all ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'}`}>
            <h3 className={`text-xl font-black mb-8 flex items-center space-x-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Sparkles className="w-6 h-6 text-pink-500" />
              <span>Neural Pipeline</span>
            </h3>

            <div className="space-y-4">
              <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50'}`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${options.removeNulls ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : isDark ? 'bg-white/5 text-slate-500' : 'bg-white text-slate-300'}`}>
                    <Droplets className="w-5 h-5" />
                  </div>
                  <span className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Remove Nulls</span>
                </div>
                <input
                  type="checkbox"
                  checked={options.removeNulls}
                  onChange={(e) => setOptions({ ...options, removeNulls: e.target.checked })}
                  className="rounded-lg border-slate-200 bg-white text-pink-500 focus:ring-pink-500/50 w-5 h-5"
                />
              </label>

              <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50'}`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${options.deduplicate ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : isDark ? 'bg-white/5 text-slate-500' : 'bg-white text-slate-300'}`}>
                    <Copy className="w-5 h-5" />
                  </div>
                  <span className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Deduplicate</span>
                </div>
                <input
                  type="checkbox"
                  checked={options.deduplicate}
                  onChange={(e) => setOptions({ ...options, deduplicate: e.target.checked })}
                  className="rounded-lg border-slate-200 bg-white text-purple-500 focus:ring-purple-500/50 w-5 h-5"
                />
              </label>

              <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50'}`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${options.standardizeDates ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : isDark ? 'bg-white/5 text-slate-500' : 'bg-white text-slate-300'}`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Date Standard</span>
                </div>
                <input
                  type="checkbox"
                  checked={options.standardizeDates}
                  onChange={(e) => setOptions({ ...options, standardizeDates: e.target.checked })}
                  className="rounded-lg border-slate-200 bg-white text-blue-500 focus:ring-blue-500/50 w-5 h-5"
                />
              </label>
            </div>

            <button
              onClick={handleProcess}
              disabled={processing}
              className={`w-full mt-10 py-5 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white font-black uppercase tracking-[0.2em] text-xs hover:opacity-90 transition-all flex items-center justify-center space-x-3 shadow-2xl shadow-purple-600/20 disabled:opacity-50`}
            >
              {processing ? (
                <>
                  <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Activating...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Execute Pipeline</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status / Log */}
        <div className="md:col-span-2">
          <div className={`p-10 rounded-[3rem] border h-full flex flex-col items-center justify-center text-center transition-all ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'}`}>
            <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 transition-colors ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
              <CheckCircle className={`w-12 h-12 ${isDark ? 'text-slate-800' : 'text-slate-100'}`} />
            </div>
            <p className={`text-sm font-black uppercase tracking-[0.2em] max-w-xs leading-loose ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Configure neural operations and execute the pipeline to calibrate your data engine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Refinery;
