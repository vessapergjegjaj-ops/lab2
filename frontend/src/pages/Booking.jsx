import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import bookingService from '../services/bookingService'
import matchService from '../services/matchService'

export default function Booking(){
  const { state } = useLocation()
  const navigate = useNavigate()
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const selectedSeats = state?.selectedSeats || []
  const matchId = state?.matchId

  useEffect(()=>{
    if(!matchId) return
    setLoading(true)
    setError(null)
    matchService.getMatchById(matchId)
      .then(data => setMatch(data || null))
      .catch(err => setError(err?.response?.data?.error || 'Unable to load match info'))
      .finally(()=>setLoading(false))
  },[matchId])

  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => {
      const price = typeof seat.price === 'number' ? seat.price : seat.price ? Number(seat.price) : match?.baseTicketPrice
      return sum + (Number(price) || 0)
    }, 0)
  }, [selectedSeats, match])

  async function confirm(){
    if(!matchId || selectedSeats.length === 0) return
    setSubmitting(true)
    setError(null)
    try{
      const payload = {
        matchId,
        seatIds: selectedSeats.map(seat => seat.id),
      }
      const response = await bookingService.createBooking(payload)
      const booking = response?.data?.data || response?.data || {}
      const bookingId = booking.id || booking.bookingId
      navigate('/payment', {
        state: {
          bookingId,
          matchId,
          selectedSeats: booking.seats || selectedSeats,
          totalPrice: Number(booking.totalPrice || booking.total_price || totalPrice),
          status: booking.status,
        },
      })
    }catch(err){
      setError(err?.response?.data?.error || 'Booking failed')
    }finally{
      setSubmitting(false)
    }
  }

  if(!state || !matchId) return <div className="container">No booking data available.</div>

  if(loading) return <div className="container"><div>Loading booking details...</div></div>
  if(error) return <div className="container"><div style={{color:'salmon'}}>{error}</div></div>

  return (
    <div className="container">
      <div className="card">
        <h3>Confirm booking</h3>
        <div><strong>Match:</strong> {match?.homeTeam || 'Home'} vs {match?.awayTeam || 'Away'}</div>
        <div><strong>Stadium:</strong> {match?.stadium || 'TBD'}</div>
        <div><strong>Kickoff:</strong> {match?.kickoffDate ? new Date(match.kickoffDate).toLocaleString() : 'TBD'}</div>
        <div style={{marginTop:12}}><strong>Selected seats:</strong></div>
        <ul>
          {selectedSeats.map(seat => (
            <li key={seat.id}>{seat.label} - ${Number(seat.price ?? match?.baseTicketPrice ?? 0).toFixed(2)}</li>
          ))}
        </ul>
        <div style={{marginTop:12}}><strong>Total:</strong> ${totalPrice.toFixed(2)}</div>
        <button onClick={confirm} disabled={submitting || selectedSeats.length===0} style={{marginTop:16}}>
          {submitting ? 'Confirming...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  )
}
