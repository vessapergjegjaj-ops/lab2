import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await authService.login({ identifier: identifier.trim(), password })
      navigate('/dashboard')
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card form">
        <h2>Login</h2>
        {error && <div style={{ color: 'salmon' }}>{error}</div>}
        <form onSubmit={submit}>
          <input value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="Email or username" disabled={loading} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" disabled={loading} />
          <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        </form>
      </div>
    </div>
  )
}
