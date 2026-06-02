import React, { useEffect, useState } from 'react'
import bookingService from '../services/bookingService'
import paymentService from '../services/paymentService'

export default function AdminDashboard(){
  const [stats, setStats] = useState(null)
  const [recentBookings, setRecentBookings] = useState([])
  const [recentPayments, setRecentPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    Promise.all([
      bookingService.list({ adminStats: true }),
      paymentService.list({ adminStats: true })
    ])
      .then(([bookingRes, paymentRes]) => {
        const bookingData = bookingRes.data || []
        const paymentData = paymentRes.data || []

        const totalBookings = bookingData.length
        const totalTickets = bookingData.reduce(
          (sum, booking) => sum + (Array.isArray(booking.seats) ? booking.seats.length : 1),
          0
        )
        const totalMatches = bookingData.reduce((set, booking) => {
          if (booking.matchId) set.add(booking.matchId)
          if (booking.match?.id) set.add(booking.match.id)
          return set
        }, new Set()).size
        const totalUsers = bookingData.reduce((set, booking) => {
          if (booking.userId) set.add(booking.userId)
          if (booking.user?.id) set.add(booking.user.id)
          return set
        }, new Set()).size
        const revenue = paymentData.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0)

        setStats({
          totalUsers,
          totalMatches,
          totalTickets,
          totalBookings,
          revenue
        })
        setRecentBookings(bookingData.slice(0, 5))
        setRecentPayments(paymentData.slice(0, 5))
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Unable to load admin dashboard')
      })
      .finally(() => setLoading(false))
  }, [])

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
                      <div><strong>User:</strong> {booking.userId || booking.user?.email || 'N/A'}</div>
                      <div><strong>Match:</strong> {booking.matchId || booking.match?.title || 'N/A'}</div>
                      <div><strong>Seats:</strong> {Array.isArray(booking.seats) ? booking.seats.map(seat => seat.label).join(', ') : booking.seat?.label || 'N/A'}</div>
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
                      <div><strong>User:</strong> {payment.userId || payment.user?.email || 'N/A'}</div>
                      <div><strong>Amount:</strong> ${Number(payment.amount || 0).toFixed(2)}</div>
                      <div><strong>Status:</strong> {payment.status || 'Completed'}</div>
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
