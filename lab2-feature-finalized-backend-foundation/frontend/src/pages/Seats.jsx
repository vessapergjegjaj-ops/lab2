import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import matchService from '../services/matchService'
import SeatMap from '../components/SeatMap'

export default function Seats(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [seats,setSeats]=useState([])
  const [selectedSeats,setSelectedSeats]=useState([])
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState(null)

  useEffect(()=>{
    setLoading(true)
    setError(null)
    matchService.getMatchSeats(id)
      .then(response => setSeats(response.data))
      .catch(err => setError(err?.response?.data?.message || 'Unable to load seats'))
      .finally(()=>setLoading(false))
  },[id])

  function handleSelect(seat){
    if(seat.status !== 'available') return
    setSelectedSeats(prev => {
      const exists = prev.find(item => item.id === seat.id)
      if(exists) return prev.filter(item => item.id !== seat.id)
      return [...prev, seat]
    })
  }

  function continueToBooking(){
    if(selectedSeats.length === 0) return
    navigate('/booking', { state: { matchId: id, selectedSeats } })
  }

  return (
    <div className="container">
      <h2>Choose seats</h2>
      {loading && <div>Loading seats...</div>}
      {error && <div style={{color:'salmon', marginBottom:16}}>{error}</div>}
      <div className="card">
        <SeatMap seats={seats} selectedSeats={selectedSeats} onSelect={handleSelect} />
      </div>
      <div className="card" style={{marginTop:16}}>
        <h3>Selected seats</h3>
        {selectedSeats.length === 0 ? (
          <div>No seats selected yet.</div>
        ) : (
          <div>
            <div>{selectedSeats.map(seat => seat.label).join(', ')}</div>
            <div>{selectedSeats.length} seat(s) selected</div>
          </div>
        )}
        <button onClick={continueToBooking} disabled={selectedSeats.length===0} style={{marginTop:12}}>
          Continue to Booking
        </button>
      </div>
    </div>
  )
}
