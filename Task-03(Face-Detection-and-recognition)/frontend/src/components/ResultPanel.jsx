// src/components/ResultPanel.jsx
import React from 'react';
import { motion } from 'framer-motion';

function FaceChip({ face, index }) {
  const isRecognition = 'recognized' in face;
  const isKnown = face.recognized;

  return (
    <motion.div
      className={`face-chip ${isRecognition ? (isKnown ? 'recognized' : 'unknown') : ''}`}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      <span className="face-chip-dot" />
      {isRecognition ? (
        <>
          <strong>{face.identity}</strong>
          <span style={{ opacity: 0.6 }}>
            {isKnown ? `${(face.similarity * 100).toFixed(0)}%` : 'Unknown'}
          </span>
        </>
      ) : (
        <>
          Face {index + 1}
          <span style={{ opacity: 0.6 }}>{(face.confidence * 100).toFixed(0)}%</span>
        </>
      )}
    </motion.div>
  );
}

export default function ResultPanel({ result, mode = 'detect' }) {
  if (!result) return null;

  const faces = mode === 'recognize' ? result.recognitions : result.faces;
  const imgSrc = `data:image/jpeg;base64,${result.annotated_image}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Stats Row */}
      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.25rem' }}>
        <div className="stat-card">
          <div className="stat-value">{result.face_count}</div>
          <div className="stat-label">Faces Found</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '1.4rem' }}>
            {result.processing_time_ms?.toFixed(0)}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ms</span>
          </div>
          <div className="stat-label">Process Time</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ fontSize: '1.4rem' }}>
            {mode === 'recognize'
              ? `${faces?.filter(f => f.recognized).length || 0}/${result.face_count}`
              : `${faces?.reduce((a, f) => a + (f.confidence || 0), 0) / (faces?.length || 1) * 100 | 0}%`
            }
          </div>
          <div className="stat-label">{mode === 'recognize' ? 'Recognized' : 'Avg Confidence'}</div>
        </div>
      </div>

      {/* Annotated Image */}
      <div className="image-preview-wrap" style={{ marginBottom: '1rem' }}>
        <img src={imgSrc} alt="Result" />
        <div style={{
          position: 'absolute', bottom: 8, right: 8,
          background: 'rgba(4,13,10,0.85)',
          border: '1px solid var(--border-emerald)',
          borderRadius: '100px',
          padding: '0.2rem 0.7rem',
          fontSize: '0.65rem',
          color: 'var(--emerald-400)',
          fontFamily: 'var(--font-mono)',
          display: 'flex', alignItems: 'center', gap: '0.4rem'
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--emerald-500)', display: 'inline-block' }} />
          AI PROCESSED
        </div>
      </div>

      {/* Face chips */}
      {faces && faces.length > 0 && (
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
            DETECTED FACES
          </p>
          <div className="face-list">
            {faces.map((face, i) => (
              <FaceChip key={i} face={face} index={i} />
            ))}
          </div>
        </div>
      )}

      {result.face_count === 0 && (
        <div className="empty-state" style={{ padding: '2rem' }}>
          <span className="empty-icon">🔍</span>
          <p className="empty-title">No faces detected</p>
          <p className="empty-sub">Try a clearer image with a visible face</p>
        </div>
      )}
    </motion.div>
  );
}
