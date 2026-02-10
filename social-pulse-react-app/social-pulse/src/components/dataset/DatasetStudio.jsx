import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { uploadDataset, activateDataset, getDatasets } from '../../services/api';

const DatasetStudio = () => {
  const { updateDatasetState } = useData();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
            Dataset Studio
          </h1>
          <p className="text-white/60 mt-2">Upload and manage your datasets</p>
        </div>
      </div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-12 rounded-3xl border-2 border-dashed border-white/10 hover:border-neon-blue/50 transition-all duration-300 relative overflow-hidden group"
        {...getRootProps()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <input {...getInputProps()} />

        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            {uploading ? (
              <div className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin" />
            ) : success ? (
              <CheckCircle className="w-12 h-12 text-neon-green" />
            ) : (
              <Upload className="w-12 h-12 text-neon-blue" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold">
              {uploading ? 'Uploading...' : isDragActive ? 'Drop it here!' : 'Drag & Drop your CSV'}
            </h3>
            <p className="text-white/40 max-w-md mx-auto">
              Support for specialized social media exports. Max file size 50MB.
            </p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DatasetStudio;
