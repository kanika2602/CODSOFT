// src/components/ImageUploader.jsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImageUploader({ onImageSelect, label = 'Upload Image', accept = 'image/*' }) {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
    onImageSelect(f);
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.bmp'] },
    maxFiles: 1,
  });

  const clear = (e) => {
    e.stopPropagation();
    setPreview(null);
    setFile(null);
    onImageSelect(null);
  };

  return (
    <div>
      {!preview ? (
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'active' : ''}`}
        >
          <input {...getInputProps()} />
          <motion.span
            className="dropzone-icon"
            animate={{ y: isDragActive ? -8 : 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            📁
          </motion.span>
          <p className="dropzone-text">
            {isDragActive ? 'Drop it here!' : label}
          </p>
          <p className="dropzone-sub">
            Drag & drop or click · JPG, PNG, WEBP, BMP
          </p>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            className="image-preview-wrap"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="scan-line" />
            <img src={preview} alt="preview" />
            <div style={{
              position: 'absolute', bottom: 8, right: 8,
              display: 'flex', gap: '0.5rem'
            }}>
              <button
                className="btn btn-sm btn-danger"
                onClick={clear}
              >
                ✕ Clear
              </button>
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <button className="btn btn-sm btn-ghost">
                  🔄 Change
                </button>
              </div>
            </div>
            {file && (
              <div style={{
                position: 'absolute', top: 8, left: 8,
                background: 'rgba(4,13,10,0.85)',
                border: '1px solid var(--border-emerald)',
                borderRadius: '100px',
                padding: '0.2rem 0.6rem',
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)'
              }}>
                {file.name} · {(file.size / 1024).toFixed(0)}KB
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
