// src/utils/api.js — Axios API service layer

import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// ─── Face Detection ───────────────────────────────────────────
export const detectFaces = async (imageFile) => {
  const form = new FormData();
  form.append('file', imageFile);
  const { data } = await api.post('/detect', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// ─── Face Recognition ─────────────────────────────────────────
export const recognizeFaces = async (imageFile) => {
  const form = new FormData();
  form.append('file', imageFile);
  const { data } = await api.post('/recognize', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// ─── Register Face ────────────────────────────────────────────
export const registerFace = async (imageFile, name, metadata = {}) => {
  const form = new FormData();
  form.append('file', imageFile);
  form.append('name', name);
  form.append('metadata', JSON.stringify(metadata));
  const { data } = await api.post('/register', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// ─── List Faces ───────────────────────────────────────────────
export const listFaces = async () => {
  const { data } = await api.get('/faces');
  return data;
};

// ─── Delete Face ──────────────────────────────────────────────
export const deleteFace = async (faceId) => {
  const { data } = await api.delete(`/faces/${faceId}`);
  return data;
};

// ─── Health / Stats ───────────────────────────────────────────
export const getHealth = async () => {
  const { data } = await api.get('/health');
  return data;
};

export const getStats = async () => {
  const { data } = await api.get('/stats');
  return data;
};

// ─── WebSocket helper ─────────────────────────────────────────
export const WS_URL = BASE_URL.replace(/^http/, 'ws') + '/ws/video';

export default api;
