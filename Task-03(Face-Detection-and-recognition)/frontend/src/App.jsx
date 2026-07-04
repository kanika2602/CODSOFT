// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DetectPage from './pages/DetectPage';
import RecognizePage from './pages/RecognizePage';
import RegisterPage from './pages/RegisterPage';
import DatabasePage from './pages/DatabasePage';
import LivePage from './pages/LivePage';

import './styles/globals.css';

export default function App() {
  return (
    <BrowserRouter>
      {/* Animated background layers */}
      <div className="bg-grid" />
      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="app-wrapper">
        <Navbar />

        <Routes>
          <Route path="/"          element={<HomePage />} />
          <Route path="/detect"    element={<DetectPage />} />
          <Route path="/recognize" element={<RecognizePage />} />
          <Route path="/register"  element={<RegisterPage />} />
          <Route path="/database"  element={<DatabasePage />} />
          <Route path="/live"      element={<LivePage />} />
        </Routes>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'toast-custom',
          duration: 3500,
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-emerald)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: 'white' },
          },
          error: {
            iconTheme: { primary: '#ec4899', secondary: 'white' },
          },
        }}
      />
    </BrowserRouter>
  );
}
