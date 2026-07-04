// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getHealth } from '../utils/api';

export default function Navbar() {
  const [online, setOnline] = useState(false);
  const [faceCount, setFaceCount] = useState(0);

  useEffect(() => {
    const check = async () => {
      try {
        const h = await getHealth();
        setOnline(true);
        setFaceCount(h.database_count || 0);
      } catch {
        setOnline(false);
      }
    };
    check();
    const id = setInterval(check, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <NavLink to="/" className="nav-logo">
        <span className="logo-icon">👁️</span>
        <span>
          <span className="highlight">Face</span>
          <span className="accent">AI</span>
        </span>
      </NavLink>

      <ul className="nav-links">
        {[
          { to: '/',          label: '🏠 Home' },
          { to: '/detect',    label: '🔍 Detect' },
          { to: '/recognize', label: '⚡ Recognize' },
          { to: '/register',  label: '➕ Register' },
          { to: '/database',  label: '🗄️ Database' },
          { to: '/live',      label: '📷 Live' },
        ].map(({ to, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) => isActive ? 'active' : ''}
              end={to === '/'}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="nav-status">
        <span className={`status-dot ${online ? '' : 'offline'}`} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
          {online ? `API ONLINE · ${faceCount} faces` : 'API OFFLINE'}
        </span>
      </div>
    </motion.nav>
  );
}
