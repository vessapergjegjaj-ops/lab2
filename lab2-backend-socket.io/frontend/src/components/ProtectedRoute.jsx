import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import authService from '../services/authService'

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState(authService.isAuthenticated() ? 'authenticated' : 'checking')

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

  return children
}
