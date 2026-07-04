// src/pages/DatabasePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { listFaces, deleteFace } from '../utils/api';

function FaceCard({ face, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${face.name}"?`)) return;
    setDeleting(true);
    try {
      await deleteFace(face.id);
      toast.success(`Deleted ${face.name}`);
      onDelete(face.id);
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      className="face-card"
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
    >
      {face.face_image ? (
        <img
          className="face-card-img"
          src={`data:image/jpeg;base64,${face.face_image}`}
          alt={face.name}
        />
      ) : (
        <div className="face-card-img-placeholder">👤</div>
      )}
      <div className="face-card-body">
        <div className="face-card-name">{face.name}</div>
        <div className="face-card-date">
          {new Date(face.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          <span className="badge badge-emerald" style={{ fontSize: '0.6rem' }}>
            {face.id.slice(0, 8)}…
          </span>
        </div>
      </div>
      <button
        className="face-card-delete btn btn-sm btn-danger"
        onClick={handleDelete}
        disabled={deleting}
      >
        {deleting ? '…' : '🗑️'}
      </button>
    </motion.div>
  );
}

export default function DatabasePage() {
  const [faces, setFaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listFaces();
      setFaces(data.faces || []);
    } catch {
      toast.error('Failed to load database');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (id) => setFaces(prev => prev.filter(f => f.id !== id));

  const filtered = faces.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-content">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="section-header" style={{ marginBottom: 0 }}>
            <p className="section-eyebrow">Storage</p>
            <h1 className="section-title">Face <span className="accent">Database</span></h1>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span className="badge badge-emerald">{faces.length} registered</span>
            <button className="btn btn-ghost btn-sm" onClick={load}>🔄 Refresh</button>
          </div>
        </div>

        {/* Search */}
        <div className="input-group" style={{ marginBottom: '1.5rem', maxWidth: 360 }}>
          <input
            className="input-field"
            type="text"
            placeholder="🔍 Search by name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="spinner" style={{ width: 48, height: 48 }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <span className="empty-icon">🗄️</span>
              <p className="empty-title">{search ? 'No matches found' : 'Database is empty'}</p>
              <p className="empty-sub">
                {search ? 'Try a different search term' : 'Register faces to see them here'}
              </p>
            </div>
          </div>
        ) : (
          <motion.div className="face-grid" layout>
            <AnimatePresence>
              {filtered.map(face => (
                <FaceCard key={face.id} face={face} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
