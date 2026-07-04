// src/pages/RecognizePage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
import ResultPanel from '../components/ResultPanel';
import { recognizeFaces } from '../utils/api';

export default function RecognizePage() {
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRecognize = async () => {
    if (!imageFile) return toast.error('Please upload an image first');
    setLoading(true);
    setResult(null);
    try {
      const data = await recognizeFaces(imageFile);
      setResult(data);
      const known = data.recognitions?.filter(r => r.recognized).length || 0;
      toast.success(`${data.face_count} face(s), ${known} recognized`);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Recognition failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="section-header">
          <p className="section-eyebrow">Biometric Identification</p>
          <h1 className="section-title">Face <span className="accent">Recognition</span></h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Match faces against your registered database using ArcFace embeddings
          </p>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.875rem 1.25rem',
          background: 'rgba(236,72,153,0.06)',
          border: '1px solid var(--border-pink)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          color: 'var(--pink-300)'
        }}>
          💡 <strong>Tip:</strong> Register faces first in the{' '}
          <Link to="/register" style={{ color: 'var(--pink-400)', fontWeight: 600 }}>Register page</Link>{' '}
          to enable recognition matching.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="card card-pink">
            <div className="card-header">
              <div className="card-icon pink">📁</div>
              <div>
                <div className="card-title">Upload for Recognition</div>
                <div className="card-subtitle">Matched against database</div>
              </div>
            </div>
            <ImageUploader
              onImageSelect={setImageFile}
              label="Drop image to recognize faces"
            />
            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-pink"
                onClick={handleRecognize}
                disabled={!imageFile || loading}
                style={{ flex: 1 }}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Recognizing…
                  </>
                ) : '⚡ Recognize Faces'}
              </button>
              {result && (
                <button className="btn btn-ghost" onClick={() => setResult(null)}>Clear</button>
              )}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <div className="face-chip recognized" style={{ fontSize: '0.75rem' }}>
                <span className="face-chip-dot" /> Known Face
              </div>
              <div className="face-chip unknown" style={{ fontSize: '0.75rem' }}>
                <span className="face-chip-dot" /> Unknown Face
              </div>
            </div>
          </div>

          <div className="card" style={{ position: 'relative' }}>
            <div className="card-header">
              <div className="card-icon pink">🎯</div>
              <div>
                <div className="card-title">Recognition Result</div>
                <div className="card-subtitle">Identity matches</div>
              </div>
            </div>

            {loading && (
              <div className="loading-overlay" style={{ borderRadius: 'var(--radius-xl)' }}>
                <div className="spinner" style={{ borderTopColor: 'var(--pink-500)' }} />
                <p className="loading-text" style={{ color: 'var(--pink-400)' }}>
                  MATCHING EMBEDDINGS…
                </p>
              </div>
            )}

            {result ? (
              <ResultPanel result={result} mode="recognize" />
            ) : !loading ? (
              <div className="empty-state">
                <span className="empty-icon">⚡</span>
                <p className="empty-title">No result yet</p>
                <p className="empty-sub">Upload an image and click Recognize</p>
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
