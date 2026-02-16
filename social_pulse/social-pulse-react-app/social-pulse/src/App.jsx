import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import Layout from './components/common/Layout';
import AuthPage from './components/auth/AuthPage';
import DatasetStudio from './components/dataset/DatasetStudio';
import Refinery from './components/refinery/Refinery';
import InsightsLab from './components/insights/InsightsLab';
import MLStudio from './components/ml/MLStudio';
import VisionDeck from './components/visualization/VisionDeck';
import EDA from './components/eda/EDA';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useData();
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/dataset" element={
        <ProtectedRoute>
          <Layout><DatasetStudio /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/refinery" element={
        <ProtectedRoute>
          <Layout><Refinery /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/insights" element={
        <ProtectedRoute>
          <Layout><InsightsLab /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/ml" element={
        <ProtectedRoute>
          <Layout><MLStudio /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/eda" element={
        <ProtectedRoute>
          <Layout><EDA /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/vision" element={
        <ProtectedRoute>
          <Layout><VisionDeck /></Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <DataProvider>
      <Router>
        <AppRoutes />
      </Router>
    </DataProvider>
  );
}

export default App;
