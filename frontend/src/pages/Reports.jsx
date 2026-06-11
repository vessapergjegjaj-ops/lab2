import React, { useEffect, useState } from 'react'
import adminDataService from '../services/adminDataService'

const money = value => `$${Number(value || 0).toFixed(2)}`

export default function Reports() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    adminDataService.reports({ dateFrom, dateTo })
      .then(setReports)
      .catch(err => setError(err?.response?.data?.error || 'Unable to load reports'))
      .finally(() => setLoading(false))
  }, [dateFrom, dateTo])

  const payment = reports?.paymentReport || {}
  const occupancy = reports?.stadiumOccupancyReport || {}
  const revenue = reports?.revenueReport || {}
  const booking = reports?.bookingReport || {}
  const ticket = reports?.ticketSalesReport || {}

  return (
    <div className="container">
      <h2>Reports</h2>

      <div className="card filter-grid" style={{ marginBottom: 16 }}>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        <button type="button" onClick={() => { setDateFrom(''); setDateTo('') }}>Reset</button>
      </div>

      {loading && <div>Loading reports...</div>}
      {error && <div style={{ color: 'salmon', marginBottom: 16 }}>{error}</div>}

      {reports && (
        <>
          <div className="stats-grid">
            <div className="card"><h3>Total Bookings</h3><div>{booking.totalBookings || 0}</div></div>
            <div className="card"><h3>Total Revenue</h3><div>{money(revenue.totalRevenue)}</div></div>
            <div className="card"><h3>Paid Payments</h3><div>{payment.paidPayments || 0}</div></div>
            <div className="card"><h3>Pending Payments</h3><div>{payment.pendingPayments || 0}</div></div>
            <div className="card"><h3>Failed Payments</h3><div>{payment.failedPayments || 0}</div></div>
            <div className="card"><h3>Tickets Sold</h3><div>{ticket.totalTickets || 0}</div></div>
            <div className="card"><h3>Available Seats</h3><div>{occupancy.availableSeats || 0}</div></div>
            <div className="card"><h3>Booked Seats</h3><div>{occupancy.bookedSeats || 0}</div></div>
            <div className="card"><h3>Occupancy</h3><div>{occupancy.occupancyPercentage || 0}%</div></div>
          </div>

          <div className="card table-card" style={{ marginTop: 16 }}>
            <h3>Revenue by Match</h3>
            {(revenue.revenueByMatch || []).length === 0 ? (
              <div>No revenue data available.</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Match</th><th>Bookings</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {revenue.revenueByMatch.map(row => (
                      <tr key={row.match_id}>
                        <td>{row.match_name}</td>
                        <td>{row.bookings}</td>
                        <td>{money(row.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
