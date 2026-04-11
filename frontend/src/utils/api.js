/**
 * utils/api.js — Axios instance with auth token injection
 */

import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ─── Request Interceptor: attach JWT ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor: handle 401 globally ───────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear and redirect
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login:  (data) => api.post('/auth/login', data),
  getMe:  ()     => api.get('/auth/me'),
}

// ─── Notes ────────────────────────────────────────────────────────────────────
export const notesAPI = {
  getAll:   (params) => api.get('/notes', { params }),
  search:   (q)      => api.get('/notes/search', { params: { q } }),
  getOne:   (id)     => api.get(`/notes/${id}`),
  create:   (data)   => api.post('/notes', data),
  update:   (id, data) => api.put(`/notes/${id}`, data),
  delete:   (id)     => api.delete(`/notes/${id}`),
  bulkDelete: (ids)  => api.delete('/notes', { data: { ids } }),
}

// ─── Folders ─────────────────────────────────────────────────────────────────
export const foldersAPI = {
  getAll:  ()        => api.get('/folders'),
  create:  (data)    => api.post('/folders', data),
  update:  (id, data) => api.put(`/folders/${id}`, data),
  delete:  (id)      => api.delete(`/folders/${id}`),
}

// ─── Users ───────────────────────────────────────────────────────────────────
export const usersAPI = {
  getProfile:     ()     => api.get('/users/profile'),
  updateProfile:  (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/password', data),
  deleteAccount:  ()     => api.delete('/users/account'),
}

export default api
