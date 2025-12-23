// src/lib/api.js
// Central place for backend URLs and shared headers.
// If you ever deploy to a different host/port, change API_BASE only.

export const API_BASE = "http://127.0.0.1:8000";

export const API_COMPUTE = `${API_BASE}/scores/compute`;
export const API_SAVE     = `${API_BASE}/scores/save`;
export const API_HISTORY  = `${API_BASE}/scores/history`;
export const API_DELETE   = (id) => `${API_BASE}/scores/delete/${id}`;
export const API_CLEAR    = `${API_BASE}/scores/clear`;

export const jsonHeaders = { "Content-Type": "application/json" };

// Small helpers
export const http = {
  async get(url) {
    const r = await fetch(url);
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || r.statusText);
    return r.json();
  },
  async post(url, body) {
    const r = await fetch(url, { method: "POST", headers: jsonHeaders, body: JSON.stringify(body) });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || r.statusText);
    return r.json();
  },
  async del(url) {
    const r = await fetch(url, { method: "DELETE" });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || r.statusText);
    return r.json().catch(() => ({}));
  },
};
