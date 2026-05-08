import axios from 'axios';

const rawBase = import.meta.env.VITE_API_BASE || '';
// If user provides a backend root (e.g. https://api.example.com), ensure we call its /api path.
const base = rawBase
  ? (rawBase.replace(/\/$/, '').endsWith('/api') ? rawBase.replace(/\/$/, '') : `${rawBase.replace(/\/$/, '')}/api`)
  : '/api';

const api = axios.create({
  baseURL: base,
  headers: { 'Content-Type': 'application/json' }
});

export function setAuthToken(token){
  if(token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
}

export default api;
