// src/pages/LivePage.jsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { WS_URL } from '../utils/api';

const WS_ENDPOINT = WS_URL || 'ws://localhost:8000/ws/video';

export default function LivePage() {
  const webcamRef = useRef(null);
  const wsRef = useRef(null);
  const intervalRef = useRef(null);
  const canvasRef = useRef(null);

  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('detect'); // detect | recognize
  const [faceCount, setFaceCount] = useState(0);
  const [fps, setFps] = useState(0);
  const [processedFrame, setProcessedFrame] = useState(null);
  const [wsStatus, setWsStatus] = useState('disconnected');
  const fpsRef = useRef({ count: 0, last: Date.now() });

  const connectWS = useCallback(() => {
    try {
      wsRef.current = new WebSocket(WS_ENDPOINT);
      wsRef.current.onopen = () => {
        setWsStatus('connected');
        toast.success('WebSocket connected');
      };
      wsRef.current.onclose = () => {
        setWsStatus('disconnected');
      };
      wsRef.current.onerror = () => {
        setWsStatus('error');
      };
      wsRef.current.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'result') {
          setProcessedFrame(msg.frame);
          setFaceCount(msg.face_count || 0);
          // FPS calc
          fpsRef.current.count++;
          const now = Date.now();
          if (now - fpsRef.current.last >= 1000) {
            setFps(fpsRef.current.count);
            fpsRef.current = { count: 0, last: now };
          }
        }
      };
    } catch (e) {
      toast.error('Failed to connect to WebSocket');
    }
  }, []);

  const startStream = useCallback(() => {
    connectWS();
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      if (webcamRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
        const screenshot = webcamRef.current.getScreenshot();
        if (screenshot) {
          wsRef.current.send(JSON.stringify({ type: 'frame', frame: screenshot, mode }));
        }
      }
    }, 100); // 10 fps target
  }, [connectWS, mode]);

  const stopStream = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (wsRef.current) wsRef.current.close();
    setProcessedFrame(null);
    setFaceCount(0);
    setFps(0);
    setWsStatus('disconnected');
  }, []);

  useEffect(() => () => stopStream(), [stopStream]);

  return (
    <div className="page-content">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="section-header">
          <p className="section-eyebrow">Real-time Vision</p>
          <h1 className="section-title">Live Camera <span className="accent">Stream</span></h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Real-time face detection and recognition via WebSocket stream
          </p>
        </div>

        {/* Controls */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="tabs" style={{ flex: '0 0 auto', margin: 0, width: 'auto' }}>
              {['detect', 'recognize'].map(m => (
                <button
                  key={m}
                  className={`tab-btn ${mode === m ? 'active' : ''}`}
                  onClick={() => setMode(m)}
                  disabled={isRunning}
                  style={{ minWidth: 110 }}
                >
                  {m === 'detect' ? '🔍 Detect' : '⚡ Recognize'}
                </button>
              ))}
            </div>

            {!isRunning ? (
              <button className="btn btn-emerald" onClick={startStream}>
                ▶ Start Stream
              </button>
            ) : (
              <button className="btn btn-danger" onClick={stopStream} style={{ background: 'rgba(239,68,68,0.1)' }}>
                ⏹ Stop Stream
              </button>
            )}

            {/* Status indicators */}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: wsStatus === 'connected' ? 'var(--emerald-500)' : '#ef4444',
                  boxShadow: wsStatus === 'connected' ? '0 0 8px var(--emerald-500)' : 'none',
                  display: 'inline-block'
                }} />
                <span style={{ color: 'var(--text-muted)' }}>
                  WS: <span style={{ color: wsStatus === 'connected' ? 'var(--emerald-400)' : '#ef4444' }}>
                    {wsStatus.toUpperCase()}
                  </span>
                </span>
              </div>

              {isRunning && (
                <>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    👁️ <span style={{ color: 'var(--emerald-400)' }}>{faceCount}</span> faces
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ⚡ <span style={{ color: 'var(--pink-400)' }}>{fps}</span> fps
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Camera Views */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Raw feed */}
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
              RAW CAMERA FEED
            </p>
            <div className="webcam-container">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
                style={{ width: '100%' }}
              />
              <div className="webcam-overlay">
                <div className="corner-tl" /><div className="corner-tr" />
                <div className="corner-bl" /><div className="corner-br" />
                <div className="webcam-status">
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--emerald-500)', display: 'inline-block', boxShadow: '0 0 6px var(--emerald-500)' }} />
                  LIVE
                </div>
              </div>
            </div>
          </div>

          {/* Processed feed */}
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
              AI PROCESSED OUTPUT
            </p>
            <div
              style={{
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                border: '2px solid var(--border-pink)',
                boxShadow: isRunning ? 'var(--glow-pink)' : 'none',
                background: 'var(--bg-mid)',
                minHeight: 300,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}
            >
              {processedFrame ? (
                <img
                  src={`data:image/jpeg;base64,${processedFrame}`}
                  alt="processed"
                  style={{ width: '100%', display: 'block' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>
                    {isRunning ? '⏳' : '📷'}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {isRunning ? 'Connecting to AI backend…' : 'Start stream to see AI output'}
                  </p>
                </div>
              )}

              {isRunning && processedFrame && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  background: 'rgba(4,13,10,0.85)',
                  border: '1px solid var(--border-pink)',
                  borderRadius: '100px',
                  padding: '0.2rem 0.7rem',
                  fontSize: '0.65rem',
                  color: 'var(--pink-400)',
                  fontFamily: 'var(--font-mono)',
                }}>
                  🤖 {mode.toUpperCase()} MODE
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info note */}
        <div style={{
          marginTop: '1.5rem', padding: '1rem 1.25rem',
          background: 'rgba(16,185,129,0.05)',
          border: '1px solid var(--border-emerald)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.7
        }}>
          <strong style={{ color: 'var(--emerald-400)' }}>ℹ️ Live Stream Notes:</strong> Frames are sent over WebSocket at ~10fps for processing.
          Detection uses Haar Cascade + DeepFace. Recognition compares against your registered database.
          For best results, ensure good lighting and face the camera directly.
        </div>
      </motion.div>
    </div>
  );
}
