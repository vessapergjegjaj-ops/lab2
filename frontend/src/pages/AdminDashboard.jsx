import React, { useCallback, useEffect, useState } from 'react'
import dashboardService from '../services/dashboardService'
import socketService from '../services/socketService'

const getData = (response, fallback) => response?.data?.data ?? fallback

export default function AdminDashboard(){
  const [stats, setStats] = useState(null)
  const [recentBookings, setRecentBookings] = useState([])
  const [recentPayments, setRecentPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadDashboard = useCallback(() => {
    setLoading(true)
    setError(null)

    dashboardService.stats()
      .then((response) => {
        const data = getData(response, {})
        setStats({
          totalUsers: Number(data.totalUsers || data.systemUserCount || 0),
          totalMatches: Number(data.totalMatches || data.activeMatches || 0),
          totalTickets: Number(data.totalTickets || 0),
          totalBookings: Number(data.totalBookings || 0),
          totalPayments: Number(data.totalPayments || 0),
          revenue: Number(data.revenue || 0),
          occupancyPercentage: Number(data.occupancyPercentage || 0),
        })
        setRecentBookings(Array.isArray(data.recentBookings) ? data.recentBookings : [])
        setRecentPayments(Array.isArray(data.recentPayments) ? data.recentPayments : [])
      })
      .catch((err) => {
        setStats({ totalUsers: 0, totalMatches: 0, totalTickets: 0, totalBookings: 0, revenue: 0 })
        setRecentBookings([])
        setRecentPayments([])
        setError(err?.response?.data?.error || 'Unable to load admin dashboard')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  useEffect(() => {
    socketService.connect()
    socketService.on('bookingCreated', loadDashboard)
    socketService.on('bookingUpdated', loadDashboard)
    socketService.on('paymentCompleted', loadDashboard)
    socketService.on('dashboardUpdated', loadDashboard)

    return () => {
      socketService.off('bookingCreated', loadDashboard)
      socketService.off('bookingUpdated', loadDashboard)
      socketService.off('paymentCompleted', loadDashboard)
      socketService.off('dashboardUpdated', loadDashboard)
    }
  }, [loadDashboard])

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      {loading && <div>Loading admin statistics...</div>}
      {error && <div style={{ color: 'salmon', marginBottom: 16 }}>{error}</div>}
      {stats && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginBottom: 24 }}>
            <div className="card">
              <h3>Total Users</h3>
              <div>{stats.totalUsers}</div>
            </div>
            <div className="card">
              <h3>Total Matches</h3>
              <div>{stats.totalMatches}</div>
            </div>
            <div className="card">
              <h3>Total Tickets</h3>
              <div>{stats.totalTickets}</div>
            </div>
            <div className="card">
              <h3>Total Bookings</h3>
              <div>{stats.totalBookings}</div>
            </div>
            <div className="card">
              <h3>Revenue</h3>
              <div>${stats.revenue.toFixed(2)}</div>
            </div>
            <div className="card">
              <h3>Payments</h3>
              <div>{stats.totalPayments || 0}</div>
            </div>
            <div className="card">
              <h3>Occupancy</h3>
              <div>{stats.occupancyPercentage || 0}%</div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            <div className="card">
              <h3>Recent Bookings</h3>
              {recentBookings.length === 0 ? (
                <div>No recent bookings available.</div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {recentBookings.map((booking) => (
                    <div key={booking.id || booking._id || booking.bookingId} style={{ padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.04)' }}>
                      <div><strong>Booking:</strong> {booking.id || booking._id || booking.bookingId || 'N/A'}</div>
                      <div><strong>User:</strong> {booking.user_email || booking.userId || 'N/A'}</div>
                      <div><strong>Match:</strong> {[booking.home_team_name, booking.away_team_name].filter(Boolean).join(' vs ') || booking.matchId || 'N/A'}</div>
                      <div><strong>Total:</strong> ${Number(booking.total_price || 0).toFixed(2)}</div>
                      <div><strong>Status:</strong> {booking.status || 'pending'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h3>Recent Payments</h3>
              {recentPayments.length === 0 ? (
                <div>No recent payments available.</div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {recentPayments.map((payment) => (
                    <div key={payment.id || payment._id || payment.paymentId} style={{ padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.04)' }}>
                      <div><strong>Payment:</strong> {payment.id || payment._id || payment.paymentId || 'N/A'}</div>
                      <div><strong>User:</strong> {payment.user_email || payment.userId || 'N/A'}</div>
                      <div><strong>Amount:</strong> ${Number(payment.amount || 0).toFixed(2)}</div>
                      <div><strong>Method:</strong> {payment.method || 'card'}</div>
                      <div><strong>Status:</strong> {payment.status || 'pending'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
