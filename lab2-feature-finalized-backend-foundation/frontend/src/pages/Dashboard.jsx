import React, { useEffect, useState } from 'react'
import bookingService from '../services/bookingService'
import paymentService from '../services/paymentService'

export default function Dashboard(){
  const [bookings, setBookings] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    Promise.all([
      bookingService.list(),
      paymentService.list()
    ])
      .then(([bookingRes, paymentRes]) => {
        setBookings(bookingRes.data || [])
        setPayments(paymentRes.data || [])
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Unable to load dashboard data')
      })
      .finally(() => setLoading(false))
  }, [])

  const bookingCount = bookings.length
  const ticketCount = bookings.reduce((count, booking) => {
    if (Array.isArray(booking.seats)) return count + booking.seats.length
    return count + 1
  }, 0)
  const paymentCount = payments.length
  const totalPaid = payments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0)

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
          <h3>My Payments</h3>
          <div>{paymentCount}</div>
          <div style={{marginTop:8}}>Total paid: ${totalPaid.toFixed(2)}</div>
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
                <div><strong>Match:</strong> {booking.matchId || booking.match?.title || 'Match info'}</div>
                <div><strong>Seats:</strong> {Array.isArray(booking.seats) ? booking.seats.map(s => s.label).join(', ') : booking.seat?.label || 'N/A'}</div>
                <div><strong>Status:</strong> {booking.status || 'Confirmed'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
