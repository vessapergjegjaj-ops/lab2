import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '../services/authService'

export default function Navbar(){
  const navigate = useNavigate()
  const [user, setUser] = useState(authService.getUser())

  useEffect(()=>{
    const handler = () => setUser(authService.getUser())
    window.addEventListener('authChanged', handler)
    return () => window.removeEventListener('authChanged', handler)
  },[])

  function logout(){
    authService.logout()
    navigate('/login')
  }

  return (
    <nav className="navbar container">
      <div className="brand">
        <Link to="/matches" style={{color:'var(--white)',textDecoration:'none',fontWeight:700}}>Stadium Booking</Link>
      </div>
      <div className="nav-links">
        <Link to="/matches">Matches</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/notifications">Notifications</Link>
        {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
        {authService.isAuthenticated() ? (
          <button onClick={logout} style={{marginLeft:12}}>Logout</button>
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
