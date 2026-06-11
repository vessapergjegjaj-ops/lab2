import React from 'react'
import { Link } from 'react-router-dom'

export default function MatchCard({ match }){
  const kickoff = match?.kickoffDate || match?.kickoff || match?.date
  const kickoffText = kickoff ? new Date(kickoff).toLocaleString() : 'TBD'
  const price = match?.baseTicketPrice || match?.price || match?.ticketPrice || 'TBD'

  return (
    <div className="card">
      <div className="match-title">{match?.homeTeam || 'Home'} vs {match?.awayTeam || 'Away'}</div>
      <div className="muted">{match?.stadium || 'Stadium'}</div>
      <div style={{marginTop:8}}><strong>Kickoff:</strong> {kickoffText}</div>
      <div><strong>Status:</strong> {match?.status || 'Scheduled'}</div>
      <div><strong>Price:</strong> {typeof price === 'number' ? `$${price.toFixed(2)}` : price}</div>
      <div style={{marginTop:12}}>
        <Link to={`/matches/${match?.id || ''}`}><button style={{padding:'8px 12px',borderRadius:8,border:'none',background:'#06b6d4',color:'#001'}}>View details</button></Link>
      </div>
    </div>
  )
}
