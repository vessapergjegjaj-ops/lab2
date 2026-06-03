import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Matches from './pages/Matches'
import MatchDetails from './pages/MatchDetails'
import Seats from './pages/Seats'
import Booking from './pages/Booking'
import Payment from './pages/Payment'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import Notifications from './pages/Notifications'
import ToastContainer from './components/ToastContainer'

export default function App() {
  return (
    <div className="app-root">
      <Navbar />
      <ToastContainer />
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/matches" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/matches"
            element={<ProtectedRoute><Matches /></ProtectedRoute>}
          />
          <Route
            path="/matches/:id"
            element={<ProtectedRoute><MatchDetails /></ProtectedRoute>}
          />
          <Route
            path="/matches/:id/seats"
            element={<ProtectedRoute><Seats /></ProtectedRoute>}
          />
          <Route
            path="/booking"
            element={<ProtectedRoute><Booking /></ProtectedRoute>}
          />
          <Route
            path="/payment"
            element={<ProtectedRoute><Payment /></ProtectedRoute>}
          />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/admin"
            element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}
          />
          <Route
            path="/notifications"
            element={<ProtectedRoute><Notifications /></ProtectedRoute>}
          />
        </Routes>
      </main>
    </div>
  )
}
