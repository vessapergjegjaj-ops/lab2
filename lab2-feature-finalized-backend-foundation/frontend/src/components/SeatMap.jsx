import React from 'react'

export default function SeatMap({ seats = [], selectedSeats = [], onSelect = () => {} }){
  const selectedIds = selectedSeats.map(seat => seat.id)

  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(80px,1fr))',gap:8}}>
      {seats.map((s) => {
        const isSelected = selectedIds.includes(s.id)
        const isAvailable = s.status === 'available'
        const isBooked = s.status === 'booked' || s.status === 'reserved'
        const background = isSelected ? '#0ea5f7'
          : isBooked ? '#ef4444'
          : isAvailable ? '#22c55e'
          : '#64748b'
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            style={{padding:12,background,border:'none',borderRadius:8,color:'#fff',cursor:isAvailable ? 'pointer' : 'not-allowed'}}
            disabled={!isAvailable && !isSelected}
          >
            {s.label}
          </button>
        )
      })}
    </div>
  )
}
