import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '../services/authService'

export default function Navbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState(authService.getUser())

  useEffect(() => {
    const handler = () => setUser(authService.getUser())
    window.addEventListener('authChanged', handler)
    window.addEventListener('storage', handler)

    return () => {
      window.removeEventListener('authChanged', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  async function logout() {
    await authService.logout()
    navigate('/login')
  }

  const roles = Array.isArray(user?.roles) ? user.roles : []
  const isAdmin =
    user?.role === 'admin' ||
    roles.some(role => String(role?.name || role).toLowerCase() === 'admin')

  return (
    <nav className="navbar container">
      <div className="brand">
        <Link to="/matches">Stadium Booking</Link>
      </div>

      <div className="nav-links">
        {authService.isAuthenticated() && (
          <>
            <Link to="/matches">Matches</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/notifications">Notifications</Link>
          </>
        )}

        {isAdmin && (
          <>
            <Link to="/advanced-search">Search</Link>
            <Link to="/reports">Reports</Link>
            <Link to="/export-import">Export</Link>
            <Link to="/admin">Admin</Link>
          </>
        )}

        {authService.isAuthenticated() ? (
          <button onClick={logout}>Logout</button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}
