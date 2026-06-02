import axios from 'axios'

// Use VITE_API_BASE_URL to point to the backend API (default to local mysql API)
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/mysql'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// Add interceptor to attach token
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch (e) {}
  return config
})

export default api
