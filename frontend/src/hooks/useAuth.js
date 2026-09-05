'use client';
import { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:8000/api/v1';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('oceaniq_token');
    const storedUser = localStorage.getItem('oceaniq_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('oceaniq_token', data.token);
    localStorage.setItem('oceaniq_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password, institution, role) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, institution, role }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Registration failed');
    }
    const data = await res.json();
    localStorage.setItem('oceaniq_token', data.token);
    localStorage.setItem('oceaniq_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    const t = localStorage.getItem('oceaniq_token');
    if (t) {
      try {
        await fetch(`${API}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${t}` },
        });
      } catch {}
    }
    localStorage.removeItem('oceaniq_token');
    localStorage.removeItem('oceaniq_user');
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    const t = localStorage.getItem('oceaniq_token');
    const res = await fetch(`${API}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Update failed');
    const updated = await res.json();
    localStorage.setItem('oceaniq_user', JSON.stringify(updated));
    setUser(updated);
    return updated;
  }, []);

  const saveQuery = useCallback(async (queryData) => {
    const t = localStorage.getItem('oceaniq_token');
    if (!t) return null;
    try {
      const res = await fetch(`${API}/users/me/queries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify(queryData),
      });
      return res.ok ? await res.json() : null;
    } catch { return null; }
  }, []);

  const getMyQueries = useCallback(async () => {
    const t = localStorage.getItem('oceaniq_token');
    if (!t) return [];
    try {
      const res = await fetch(`${API}/users/me/queries`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      return res.ok ? await res.json() : [];
    } catch { return []; }
  }, []);

  const deleteQuery = useCallback(async (id) => {
    const t = localStorage.getItem('oceaniq_token');
    if (!t) return;
    await fetch(`${API}/users/me/queries/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${t}` },
    });
  }, []);

  const getMyStats = useCallback(async () => {
    const t = localStorage.getItem('oceaniq_token');
    if (!t) return null;
    try {
      const res = await fetch(`${API}/users/me/stats`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      return res.ok ? await res.json() : null;
    } catch { return null; }
  }, []);

  return { user, token, loading, login, register, logout, updateProfile, saveQuery, getMyQueries, deleteQuery, getMyStats, isLoggedIn: !!user };
}
