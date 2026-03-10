import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Database, BarChart3, Activity, Layers, ArrowUpRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { uploadDataset, activateDataset, getDatasets } from '../../services/api';

const DatasetStudio = () => {
  const { updateDatasetState, theme } = useData();
  const isDark = theme === 'dark';
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Animation Variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await uploadDataset(formData);
      const { dataset, preview, dataHealth } = response.data;

      updateDatasetState(dataset, dataHealth, preview);
      setSuccess(true);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.error || 'Failed to upload dataset.');
    } finally {
      setUploading(false);
    }
  }, [updateDatasetState]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false
  });

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`p-8 max-w-7xl mx-auto space-y-8 transition-colors duration-500`}
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Dataset Studio
          </h1>
          <p className={`mt-2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Upload, validate, and manage your high-dimensional data.</p>
        </div>
        <div className={`hidden md:flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold border transition-colors ${isDark ? 'text-blue-400 border-blue-500/20 bg-blue-500/5' : 'text-blue-600 border-blue-200 bg-blue-50'
          }`}>
          <Activity className="w-4 h-4" />
          <span>System Operational</span>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Database, label: 'Active Datasets', value: '12', color: isDark ? 'text-blue-400' : 'text-blue-600' },
          { icon: Layers, label: 'Total Rows', value: '8.4M', color: isDark ? 'text-purple-400' : 'text-purple-600' },
          { icon: BarChart3, label: 'Analysis Ready', value: '98%', color: isDark ? 'text-emerald-400' : 'text-emerald-600' },
        ].map((stat, index) => (
          <div key={index} className={`p-6 rounded-3xl border transition-all ${isDark ? 'bg-slate-900/50 border-white/5 hover:bg-slate-900' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50 hover:border-slate-300'
            }`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</p>
                <h4 className={`text-3xl font-black mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</h4>
              </div>
              <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-slate-50'} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Upload Area */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div
            className={`p-12 rounded-[2.5rem] border-2 border-dashed transition-all duration-300 relative overflow-hidden group cursor-pointer
                ${isDragActive ? 'border-blue-500 bg-blue-500/5' : isDark ? 'border-white/10 bg-slate-900/50 hover:border-blue-500/50' : 'border-slate-200 bg-white hover:border-blue-500/30'}`}
            {...getRootProps()}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity`} />
            <input {...getInputProps()} />

            <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6">
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl ${isDark ? 'bg-white/5' : 'bg-slate-50'
                }`}>
                {uploading ? (
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : success ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                  </motion.div>
                ) : (
                  <Upload className="w-12 h-12 text-blue-500" />
                )}
              </div>

              <div className="space-y-2">
                <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  {uploading ? 'Processing Data...' : isDragActive ? 'Drop File Here' : 'Upload Dataset'}
                </h3>
                <p className={`max-w-md mx-auto text-sm font-medium leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                  Drag and drop your CSV files here. Our engine automatically detects schemas and validates data integrity. Max size 50MB.
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 text-red-500 bg-red-100/50 px-4 py-2 rounded-xl border border-red-200"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-bold text-xs">{error}</span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Sidebar / Recent Activity */}
        <motion.div variants={itemVariants} className="space-y-6 h-full">
          <div className={`p-8 rounded-[2.5rem] border h-full transition-all ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white border-slate-200'
            }`}>
            <h3 className={`text-lg font-black mb-10 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Activity className="w-5 h-5 text-purple-600" />
              Recent Activity
            </h3>

            <div className="space-y-3">
              {[
                { name: 'sales_q3_2024.csv', size: '2.4 MB', status: 'Ready' },
                { name: 'customer_churn_v2.csv', size: '1.1 MB', status: 'Processing' },
                { name: 'social_metrics.csv', size: '4.8 MB', status: 'Failed' },
              ].map((file, i) => (
                <div key={i} className={`flex items-center justify-between p-4 rounded-2xl transition-all cursor-default group ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl text-blue-500 transition-colors ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm font-black tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{file.name}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{file.size}</p>
                    </div>
                  </div>
                  {file.status === 'Ready' && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
                  {file.status === 'Processing' && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                  {file.status === 'Failed' && <div className="w-2 h-2 rounded-full bg-red-500" />}
                </div>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200/10">
              <button className={`w-full py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 ${isDark ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                }`}>
                View All History <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DatasetStudio;