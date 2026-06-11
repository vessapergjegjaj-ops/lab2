import api from './api'

const TOKEN_KEY = 'token'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_KEY = 'user'

function emitAuthChanged() {
  window.dispatchEvent(new Event('authChanged'))
}

function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    return JSON.parse(atob(padded))
  } catch (error) {
    return null
  }
}

function isExpired(token) {
  const payload = decodeToken(token)
  return !payload?.exp || payload.exp * 1000 <= Date.now()
}

function getSessionPayload(response) {
  return response?.data?.data || {}
}

function storeSession(session) {
  if (session.accessToken) {
    localStorage.setItem(TOKEN_KEY, session.accessToken)
  }

  if (session.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken)
  }

  if (session.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(session.user))
  }

  emitAuthChanged()
}

const authService = {
  async login(credentials) {
    const res = await api.post('/auth/login', credentials)
    const session = getSessionPayload(res)
    storeSession(session)
    return res.data
  },

  async register(payload) {
    const res = await api.post('/auth/register', payload)
    const session = getSessionPayload(res)
    storeSession(session)
    return res.data
  },

  async refresh() {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!refreshToken) return null

    const res = await api.post('/auth/refresh', { refreshToken })
    const session = getSessionPayload(res)
    storeSession(session)
    return session
  },

  async loadCurrentUser() {
    const res = await api.get('/auth/me')
    const user = getSessionPayload(res)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    emitAuthChanged()
    return user
  },

  async logout() {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken })
      }
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      emitAuthChanged()
    }
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },

  hasRefreshToken() {
    return Boolean(localStorage.getItem(REFRESH_TOKEN_KEY))
  },

  isAuthenticated() {
    const token = localStorage.getItem(TOKEN_KEY)
    return Boolean(token && !isExpired(token))
  },

  getUser() {
    try {
      const storedUser = localStorage.getItem(USER_KEY)
      if (storedUser) {
        return JSON.parse(storedUser)
      }
    } catch (error) {
      localStorage.removeItem(USER_KEY)
    }

    return decodeToken(localStorage.getItem(TOKEN_KEY))
  },
}

export default authService
