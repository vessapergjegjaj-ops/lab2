import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import paymentService from '../services/paymentService'

export default function Payment(){
  const { state } = useLocation()
  const navigate = useNavigate()
  const [cardHolder, setCardHolder] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if(!state) return <div className="container"><div className="card">No payment details available.</div></div>

  const { bookingId, matchId, selectedSeats = [], totalPrice } = state
  const seatLabels = selectedSeats.map(seat => seat.label).join(', ')

  async function pay(){
    setError(null)
    setLoading(true)

    try{
      const payload = {
        bookingId,
        matchId,
        seats: selectedSeats.map(seat => ({ id: seat.id, label: seat.label, price: seat.price })),
        amount: totalPrice,
        status: 'paid',
        provider: 'card',
        method: 'card',
        paidAt: new Date().toISOString(),
        paymentDetails: {
          cardHolder,
          cardNumber,
          expiryDate,
          cvv
        }
      }

      await paymentService.createPayment(payload)
      navigate('/dashboard')
    }catch(err){
      setError(err?.response?.data?.error || 'Payment could not be processed')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card form">
        <h3>Payment</h3>
        <div style={{marginBottom:16}}>
          <div><strong>Booking ID:</strong> {bookingId || 'N/A'}</div>
          <div><strong>Match ID:</strong> {matchId || 'N/A'}</div>
          <div><strong>Seats:</strong> {seatLabels || 'None'}</div>
          <div><strong>Total:</strong> ${Number(totalPrice || 0).toFixed(2)}</div>
        </div>
        {error && <div style={{color:'salmon', marginBottom:12}}>{error}</div>}
        <form onSubmit={(e)=>{e.preventDefault(); pay()}}>
          <input
            value={cardHolder}
            onChange={e=>setCardHolder(e.target.value)}
            placeholder="Card holder"
            disabled={loading}
          />
          <input
            value={cardNumber}
            onChange={e=>setCardNumber(e.target.value)}
            placeholder="Card number"
            disabled={loading}
          />
          <input
            value={expiryDate}
            onChange={e=>setExpiryDate(e.target.value)}
            placeholder="Expiry date (MM/YY)"
            disabled={loading}
          />
          <input
            value={cvv}
            onChange={e=>setCvv(e.target.value)}
            placeholder="CVV"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !cardHolder || !cardNumber || !expiryDate || !cvv}>
            {loading ? 'Processing...' : 'Confirm Payment'}
          </button>
        </form>
      </div>
    </div>
  )
}
