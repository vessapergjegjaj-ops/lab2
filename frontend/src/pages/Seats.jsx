import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import matchService from '../services/matchService'
import SeatMap from '../components/SeatMap'
import socketService from '../services/socketService'

export default function Seats(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [seats,setSeats]=useState([])
  const [selectedSeats,setSelectedSeats]=useState([])
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState(null)
  const [busySeatIds,setBusySeatIds]=useState([])

  useEffect(()=>{
    setLoading(true)
    setError(null)
    matchService.getMatchSeats(id)
      .then(data => setSeats(Array.isArray(data) ? data : []))
      .catch(err => {
        setSeats([])
        setError(err?.response?.data?.error || 'Unable to load seats')
      })
      .finally(()=>setLoading(false))
  },[id])

  useEffect(()=>{
    socketService.connect()
    socketService.joinMatch(id)

    const handleSeatUpdated = (payload) => {
      if(String(payload.matchId) !== String(id)) return
      setSeats(Array.isArray(payload.seats) ? payload.seats : [])
      setSelectedSeats(current => current.filter(selected => {
        const updated = (payload.seats || []).find(seat => seat.id === selected.id)
        if(!updated) return true
        if(updated.status === 'available') return true
        return updated.reservationId && updated.reservationId === selected.reservationId
      }))
    }

    socketService.on('seatUpdated', handleSeatUpdated)
    return () => socketService.off('seatUpdated', handleSeatUpdated)
  },[id])

  async function handleSelect(seat){
    const existing = selectedSeats.find(item => item.id === seat.id)
    setBusySeatIds(current => [...current, seat.id])
    setError(null)

    try {
      if(existing){
        if(existing.reservationId){
          await matchService.releaseReservation(id, existing.reservationId)
        }
        setSelectedSeats(prev => prev.filter(item => item.id !== seat.id))
        return
      }

      if(seat.status !== 'available') return

      const result = await socketService.selectSeat({ matchId: id, seatId: seat.id })
      if(!result?.success){
        throw new Error(result?.error || 'Seat is no longer available')
      }

      setSelectedSeats(prev => [...prev, { ...seat, reservationId: result.reservation?.id }])
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Unable to reserve seat')
    } finally {
      setBusySeatIds(current => current.filter(seatId => seatId !== seat.id))
    }
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
        <SeatMap seats={seats} selectedSeats={selectedSeats} busySeatIds={busySeatIds} onSelect={handleSelect} />
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
