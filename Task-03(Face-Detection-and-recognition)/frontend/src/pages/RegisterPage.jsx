// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
import { registerFace } from '../utils/api';

export default function RegisterPage() {
  const [imageFile, setImageFile] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState([]);

  const handleRegister = async () => {
    if (!imageFile) return toast.error('Please upload an image');
    if (!name.trim()) return toast.error('Please enter a name');
    setLoading(true);
    try {
      const data = await registerFace(imageFile, name.trim());
      toast.success(`✅ ${name} registered successfully!`);
      setRegistered(prev => [{ name, id: data.face_id, time: new Date().toLocaleTimeString() }, ...prev]);
      setName('');
      setImageFile(null);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Registration failed — ensure a clear face is visible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="section-header">
          <p className="section-eyebrow">Database Management</p>
          <h1 className="section-title">Register <span className="accent">New Face</span></h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Add faces to the recognition database with ArcFace embedding extraction
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Registration Form */}
          <div className="card">
            <div className="card-header">
              <div className="card-icon">➕</div>
              <div>
                <div className="card-title">Add New Person</div>
                <div className="card-subtitle">Stores ArcFace embedding vector</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="input-group">
                <label className="input-label">Person's Name</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="e.g. John Smith"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRegister()}
                />
              </div>

              <div>
                <p className="input-label" style={{ marginBottom: '0.4rem' }}>Face Photo</p>
                <ImageUploader
                  onImageSelect={setImageFile}
                  label="Upload a clear face photo"
                />
              </div>

              <button
                className="btn btn-emerald"
                onClick={handleRegister}
                disabled={!imageFile || !name.trim() || loading}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Extracting Embedding…
                  </>
                ) : '➕ Register Face'}
              </button>
            </div>

            <div style={{
              marginTop: '1.25rem',
              padding: '1rem',
              background: 'var(--bg-mid)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              lineHeight: 1.7
            }}>
              <p style={{ color: 'var(--emerald-400)', fontWeight: 600, marginBottom: '0.4rem' }}>
                📸 Photo Tips
              </p>
              • Use a well-lit, front-facing photo<br />
              • Ensure face takes up &gt;30% of image<br />
              • No heavy occlusion (sunglasses, mask)<br />
              • One face per registration image
            </div>
          </div>

          {/* Recent registrations */}
          <div className="card card-pink">
            <div className="card-header">
              <div className="card-icon pink">✅</div>
              <div>
                <div className="card-title">Session Registrations</div>
                <div className="card-subtitle">Faces added this session</div>
              </div>
            </div>

            {registered.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">👤</span>
                <p className="empty-title">No faces registered yet</p>
                <p className="empty-sub">Register your first face using the form on the left</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {registered.map((r, i) => (
                  <motion.div
                    key={r.id}
                    className="face-chip recognized"
                    style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <span className="face-chip-dot" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{r.name}</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.7, fontFamily: 'var(--font-mono)' }}>
                        {r.id.slice(0, 8)}… · {r.time}
                      </div>
                    </div>
                    ✅
                  </motion.div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
              <Link to="/database" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                🗄️ View Full Database
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
