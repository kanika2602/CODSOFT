// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getStats } from '../utils/api';

const features = [
  { icon: '🔍', title: 'Real-time Detection', desc: 'Haar Cascade + DeepFace deep learning detects multiple faces instantly with bounding box precision.', color: 'emerald' },
  { icon: '⚡', title: 'Face Recognition', desc: 'ArcFace embeddings match faces against your database with high cosine similarity scores.', color: 'pink' },
  { icon: '📷', title: 'Live Webcam', desc: 'Real-time WebSocket stream for continuous video face detection and recognition.', color: 'emerald' },
  { icon: '🗄️', title: 'Face Database', desc: 'SQLite-powered persistent storage for registered faces with metadata management.', color: 'pink' },
  { icon: '🛡️', title: 'High Accuracy', desc: 'Multi-model pipeline with fallback ensures reliable detection across lighting conditions.', color: 'emerald' },
  { icon: '🚀', title: 'FastAPI Backend', desc: 'Async REST + WebSocket API with sub-100ms detection responses for smooth UX.', color: 'pink' },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } }
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function HomePage() {
  const [stats, setStats] = useState({ registered_faces: 0 });

  useEffect(() => {
    getStats().then(setStats).catch(() => {});
  }, []);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="hero">
        <motion.p
          className="hero-eyebrow"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        >
          AI-Powered Biometric Vision
        </motion.p>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <span className="line-white">Face </span>
          <span className="line-emerald">Detection</span>
          <br />
          <span className="line-white">&amp; </span>
          <span className="line-pink">Recognition</span>
        </motion.h1>

        <motion.p
          className="hero-sub"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        >
          An end-to-end AI system using Haar Cascades, DeepFace, and ArcFace embeddings
          to detect, register, and recognize faces in images and live video streams.
        </motion.p>

        <motion.div
          className="hero-cta"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        >
          <Link to="/detect" className="btn btn-emerald btn-lg">🔍 Try Detection</Link>
          <Link to="/live"   className="btn btn-pink btn-lg">📷 Live Camera</Link>
          <Link to="/register" className="btn btn-ghost btn-lg">➕ Register Face</Link>
        </motion.div>

        {/* Animated face scan illustration */}
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-emerald)',
            padding: '2rem',
            marginTop: '2.5rem',
            width: '100%',
            maxWidth: '520px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div className="scan-line" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { label: 'Detection Model', value: 'Haar + DeepFace', icon: '🧠' },
              { label: 'Recognition',     value: 'ArcFace Embeddings', icon: '🎯' },
              { label: 'Registered Faces', value: stats.registered_faces, icon: '👥' },
              { label: 'Real-time FPS',   value: '~15–30 fps', icon: '⚡' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 + i * 0.1 }}
                style={{
                  background: 'var(--bg-mid)',
                  border: '1px solid var(--border-emerald)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.875rem',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>{item.icon}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--emerald-400)', fontFamily: 'var(--font-display)' }}>
                  {item.value}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  {item.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="page-content">
        <div className="section-header" style={{ textAlign: 'center' }}>
          <p className="section-eyebrow">Capabilities</p>
          <h2 className="section-title">
            Everything You Need for <span className="accent">Face AI</span>
          </h2>
        </div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}
        >
          {features.map((f, i) => (
            <motion.div key={i} variants={fadeUp} className={`card ${f.color === 'pink' ? 'card-pink' : ''}`}>
              <div className="card-header">
                <div className={`card-icon ${f.color === 'pink' ? 'pink' : ''}`}>{f.icon}</div>
                <div>
                  <div className="card-title">{f.title}</div>
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tech stack */}
        <motion.div
          className="card"
          style={{ marginTop: '2rem', textAlign: 'center' }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        >
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Tech Stack
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            {['FastAPI', 'OpenCV', 'DeepFace', 'ArcFace', 'SQLite', 'React 18', 'Framer Motion', 'WebSockets'].map(t => (
              <span key={t} className="badge badge-emerald">{t}</span>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
