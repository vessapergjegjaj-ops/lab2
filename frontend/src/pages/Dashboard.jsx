import React, { useCallback, useEffect, useState } from 'react'
import dashboardService from '../services/dashboardService'
import socketService from '../services/socketService'

const getData = (response, fallback) => response?.data?.data ?? fallback

export default function Dashboard(){
  const [stats, setStats] = useState({
    activeBookings: [],
    upcomingReservations: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadDashboard = useCallback(() => {
    setLoading(true)
    setError(null)

    dashboardService.stats()
      .then((response) => {
        const data = getData(response, {})
        setStats({
          activeBookings: Array.isArray(data.activeBookings) ? data.activeBookings : [],
          upcomingReservations: Array.isArray(data.upcomingReservations) ? data.upcomingReservations : [],
        })
      })
      .catch((err) => {
        setStats({ activeBookings: [], upcomingReservations: [] })
        setError(err?.response?.data?.error || 'Unable to load dashboard data')
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

    return () => {
      socketService.off('bookingCreated', loadDashboard)
      socketService.off('bookingUpdated', loadDashboard)
      socketService.off('paymentCompleted', loadDashboard)
    }
  }, [loadDashboard])

  const bookings = stats.activeBookings
  const reservations = stats.upcomingReservations
  const bookingCount = bookings.length
  const ticketCount = reservations.length
  const totalReserved = reservations.length

  return (
    <div className="container">
      <h2>Dashboard</h2>
      {loading && <div>Loading dashboard...</div>}
      {error && <div style={{ color: 'salmon', marginBottom: 16 }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <h3>My Bookings</h3>
          <div>{bookingCount}</div>
        </div>
        <div className="card">
          <h3>My Tickets</h3>
          <div>{ticketCount}</div>
        </div>
        <div className="card">
          <h3>Reservations</h3>
          <div>{totalReserved}</div>
          <div style={{marginTop:8}}>Active reservations</div>
        </div>
      </div>

      <div className="card">
        <h3>Recent bookings</h3>
        {bookings.length === 0 ? (
          <div>No bookings yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {bookings.slice(0, 5).map((booking) => (
              <div key={booking.id || booking._id || booking.bookingId} style={{ padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.04)' }}>
                <div><strong>Booking:</strong> {booking.id || booking._id || booking.bookingId || 'N/A'}</div>
                <div><strong>Match:</strong> {booking.matchId || booking.match_id || booking.match?.title || 'Match info'}</div>
                <div><strong>Total:</strong> ${Number(booking.total_price || booking.totalPrice || 0).toFixed(2)}</div>
                <div><strong>Status:</strong> {booking.status || 'Confirmed'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
