import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import authService from '../services/authService'

const getRoleNames = (user = {}) => {
  const roles = Array.isArray(user.roles) ? user.roles : []
  return roles
    .map(role => String(role?.name || role || '').toLowerCase())
    .concat(String(user.role || '').toLowerCase())
    .filter(Boolean)
}

export default function ProtectedRoute({ children, roles = [] }) {
  const [status, setStatus] = useState(authService.isAuthenticated() ? 'authenticated' : 'checking')
  const [user, setUser] = useState(authService.getUser())

  useEffect(() => {
    let alive = true

    const verify = async () => {
      if (authService.isAuthenticated()) {
        if (alive) setStatus('authenticated')
        return
      }

      if (!authService.hasRefreshToken()) {
        if (alive) setStatus('unauthenticated')
        return
      }

      try {
        await authService.refresh()
        if (alive) setStatus('authenticated')
      } catch (error) {
        if (alive) setStatus('unauthenticated')
      }
    }

    const handler = () => {
      setStatus(authService.isAuthenticated() ? 'authenticated' : 'unauthenticated')
      setUser(authService.getUser())
    }

    verify()
    window.addEventListener('authChanged', handler)
    window.addEventListener('storage', handler)

    return () => {
      alive = false
      window.removeEventListener('authChanged', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  if (status === 'checking') {
    return null
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  const requiredRoles = roles.map(role => String(role).toLowerCase())
  if (requiredRoles.length && !requiredRoles.some(role => getRoleNames(user).includes(role))) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
