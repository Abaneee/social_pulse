import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Droplets, Copy, Calendar, Play, CheckCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { processData } from '../../services/api';

const Refinery = () => {
  const { activeDataset, updateDatasetState } = useData();
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
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Sparkles className="w-16 h-16 text-white/20 mb-4" />
        <h2 className="text-2xl font-bold text-white/40">No Active Dataset</h2>
        <p className="text-white/20 mt-2">Upload a dataset to start refining.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-purple">
            Refinery
          </h1>
          <p className="text-white/60 mt-2">Clean and standardize your data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cleaning Options */}
        <div className="md:col-span-1 space-y-4">
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-neon-pink" />
              <span>Cleaning Operations</span>
            </h3>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${options.removeNulls ? 'bg-neon-pink/20 text-neon-pink' : 'bg-white/5 text-white/40'}`}>
                    <Droplets className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">Remove Nulls</span>
                </div>
                <input
                  type="checkbox"
                  checked={options.removeNulls}
                  onChange={(e) => setOptions({ ...options, removeNulls: e.target.checked })}
                  className="rounded border-white/20 bg-white/5 text-neon-pink focus:ring-neon-pink/50"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${options.deduplicate ? 'bg-neon-purple/20 text-neon-purple' : 'bg-white/5 text-white/40'}`}>
                    <Copy className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">Deduplicate</span>
                </div>
                <input
                  type="checkbox"
                  checked={options.deduplicate}
                  onChange={(e) => setOptions({ ...options, deduplicate: e.target.checked })}
                  className="rounded border-white/20 bg-white/5 text-neon-purple focus:ring-neon-purple/50"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${options.standardizeDates ? 'bg-neon-blue/20 text-neon-blue' : 'bg-white/5 text-white/40'}`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">Standardize Dates</span>
                </div>
                <input
                  type="checkbox"
                  checked={options.standardizeDates}
                  onChange={(e) => setOptions({ ...options, standardizeDates: e.target.checked })}
                  className="rounded border-white/20 bg-white/5 text-neon-blue focus:ring-neon-blue/50"
                />
              </label>
            </div>

            <button
              onClick={handleProcess}
              disabled={processing}
              className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue font-bold hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run Pipeline</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status / Log - could be expanded */}
        <div className="md:col-span-2">
          {/* Placeholder for results or logs */}
          <div className="glass-card p-6 rounded-2xl h-full flex flex-col items-center justify-center text-center">
            <CheckCircle className="w-16 h-16 text-white/10 mb-4" />
            <p className="text-white/40">Select options and run the pipeline to clean your data.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Refinery;
