import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Database, BarChart3, Activity, Layers, ArrowUpRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { uploadDataset, activateDataset, getDatasets } from '../../services/api';

const DatasetStudio = () => {
  const { updateDatasetState } = useData();
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
      className="p-8 max-w-7xl mx-auto space-y-8"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
            Dataset Studio
          </h1>
          <p className="text-white/60 mt-2">Upload, validate, and manage your high-dimensional data.</p>
        </div>
        <div className="hidden md:flex items-center space-x-2 text-neon-blue/80 bg-neon-blue/10 px-4 py-2 rounded-full text-sm font-medium">
          <Activity className="w-4 h-4" />
          <span>System Operational</span>
        </div>
      </motion.div>

      {/* Quick Stats Grid (New Content) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Database, label: 'Active Datasets', value: '12', color: 'text-neon-blue' },
          { icon: Layers, label: 'Total Rows', value: '8.4M', color: 'text-neon-purple' },
          { icon: BarChart3, label: 'Analysis Ready', value: '98%', color: 'text-neon-green' },
        ].map((stat, index) => (
          <div key={index} className="glass-card p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/40 text-sm font-medium">{stat.label}</p>
                <h4 className="text-3xl font-bold mt-2 text-white">{stat.value}</h4>
              </div>
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Upload Area (Span 2 columns) */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
            <div
                className={`glass-card p-12 rounded-3xl border-2 border-dashed transition-all duration-300 relative overflow-hidden group cursor-pointer
                ${isDragActive ? 'border-neon-blue bg-neon-blue/5' : 'border-white/10 hover:border-neon-blue/50'}`}
                {...getRootProps()}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <input {...getInputProps()} />

                <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-black/20">
                    {uploading ? (
                    <div className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin" />
                    ) : success ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle className="w-12 h-12 text-neon-green" />
                    </motion.div>
                    ) : (
                    <Upload className="w-12 h-12 text-neon-blue" />
                    )}
                </div>

                <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">
                    {uploading ? 'Processing Data...' : isDragActive ? 'Drop File Here' : 'Upload Dataset'}
                    </h3>
                    <p className="text-white/40 max-w-md mx-auto text-sm leading-relaxed">
                    Drag and drop your CSV files here. Our engine automatically detects schemas and validates data integrity. Max size 50MB.
                    </p>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20"
                    >
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                    </motion.div>
                )}
                </div>
            </div>
        </motion.div>

        {/* Sidebar / Recent Activity (New Content) */}
        <motion.div variants={itemVariants} className="space-y-6">
            <div className="glass-card p-6 rounded-3xl border border-white/5 bg-white/5 h-full">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-neon-purple" />
                    Recent Activity
                </h3>
                
                <div className="space-y-4">
                    {[
                        { name: 'sales_q3_2024.csv', size: '2.4 MB', status: 'Ready' },
                        { name: 'customer_churn_v2.csv', size: '1.1 MB', status: 'Processing' },
                        { name: 'social_metrics.csv', size: '4.8 MB', status: 'Failed' },
                    ].map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-default">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-white/5 text-neon-blue group-hover:text-white transition-colors">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white/90">{file.name}</p>
                                    <p className="text-xs text-white/40">{file.size}</p>
                                </div>
                            </div>
                            {file.status === 'Ready' && <div className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_8px_rgba(0,255,0,0.5)]" />}
                            {file.status === 'Processing' && <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />}
                            {file.status === 'Failed' && <div className="w-2 h-2 rounded-full bg-red-500" />}
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-6 border-t border-white/5">
                    <button className="w-full py-2 text-sm text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center justify-center gap-2">
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