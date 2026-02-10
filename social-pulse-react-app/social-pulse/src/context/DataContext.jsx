import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api, { logout as apiLogout } from '../services/api';

const DataContext = createContext(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('access_token')
  );

  // Data state
  const [activeDataset, setActiveDataset] = useState(null);
  const [dataHealth, setDataHealth] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Processing state
  const [processingLog, setProcessingLog] = useState(null);

  // ML state
  const [mlResults, setMlResults] = useState(null);

  // Fetch active dataset on mount
  useEffect(() => {
    const fetchActiveDataset = async () => {
      if (isAuthenticated && !activeDataset) {
        try {
          // Fetch all datasets and find the active one
          const res = await api.get('/datasets/');
          const active = res.data.find(d => d.is_active);

          if (active) {
            setActiveDataset(active);

            // Optionally: hydrate other data? 
            // We might need to fetch the latest processing log or preview?
            // But activeDataset object from list usually contains minimal info.
            // Let's rely on components to fetch specific data if needed, 
            // OR fetch details here. 
            // For now, setting activeDataset is key.
          }
        } catch (err) {
          console.error('Failed to restore active dataset', err);
          // If 401, interceptor handles logout.
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchActiveDataset();
  }, [isAuthenticated]);

  const logoutUser = useCallback(() => {
    apiLogout();
    setIsAuthenticated(false);
    setActiveDataset(null);
    setDataHealth(null);
    setPreviewData([]);
    setProcessingLog(null);
    setMlResults(null);
  }, []);

  const updateDatasetState = useCallback((dataset, health, preview) => {
    setActiveDataset(dataset);
    if (health) setDataHealth(health);
    if (preview) setPreviewData(preview);
  }, []);

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    logoutUser,
    activeDataset,
    dataHealth,
    previewData,
    processingLog,
    setProcessingLog,
    mlResults,
    setMlResults,
    updateDatasetState,
    loading,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
