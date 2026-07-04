// src/pages/DetectPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ImageUploader from '../components/ImageUploader';
import ResultPanel from '../components/ResultPanel';
import { detectFaces } from '../utils/api';

export default function DetectPage() {
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDetect = async () => {
    if (!imageFile) return toast.error('Please upload an image first');
    setLoading(true);
    setResult(null);
    try {
      const data = await detectFaces(imageFile);
      setResult(data);
      toast.success(`Found ${data.face_count} face(s) in ${data.processing_time_ms?.toFixed(0)}ms`);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Detection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="section-header">
          <p className="section-eyebrow">Computer Vision</p>
          <h1 className="section-title">Face <span className="accent">Detection</span></h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Upload any image to detect all faces using Haar Cascade + DeepFace AI
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Left: Upload */}
          <div className="card">
            <div className="card-header">
              <div className="card-icon">📁</div>
              <div>
                <div className="card-title">Upload Image</div>
                <div className="card-subtitle">JPG · PNG · WEBP · BMP</div>
              </div>
            </div>
            <ImageUploader
              onImageSelect={setImageFile}
              label="Drop image here to detect faces"
            />
            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-emerald"
                onClick={handleDetect}
                disabled={!imageFile || loading}
                style={{ flex: 1 }}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Detecting…
                  </>
                ) : '🔍 Detect Faces'}
              </button>
              {result && (
                <button
                  className="btn btn-ghost"
                  onClick={() => setResult(null)}
                >
                  Clear
                </button>
              )}
            </div>
            <div style={{
              marginTop: '1rem',
              padding: '0.875rem',
              background: 'var(--bg-mid)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6
            }}>
              <strong style={{ color: 'var(--emerald-400)' }}>How it works:</strong><br />
              1. Haar Cascade for fast initial detection<br />
              2. DeepFace (if available) refines with deep learning<br />
              3. Annotated image with bounding boxes returned
            </div>
          </div>

          {/* Right: Result */}
          <div className="card" style={{ position: 'relative' }}>
            <div className="card-header">
              <div className="card-icon">🎯</div>
              <div>
                <div className="card-title">Detection Result</div>
                <div className="card-subtitle">AI-annotated output</div>
              </div>
            </div>

            {loading && (
              <div className="loading-overlay" style={{ borderRadius: 'var(--radius-xl)' }}>
                <div className="spinner" />
                <p className="loading-text">SCANNING FOR FACES…</p>
              </div>
            )}

            {result ? (
              <ResultPanel result={result} mode="detect" />
            ) : !loading ? (
              <div className="empty-state">
                <span className="empty-icon">🔍</span>
                <p className="empty-title">No result yet</p>
                <p className="empty-sub">Upload an image and click Detect Faces</p>
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
