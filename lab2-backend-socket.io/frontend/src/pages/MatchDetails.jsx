import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import matchService from '../services/matchService'

export default function MatchDetails(){
  const { id } = useParams()
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(()=>{
    setLoading(true)
    setError(null)
    matchService.getMatchById(id)
      .then(data => setMatch(data || null))
      .catch((err) => {
        setError(err?.response?.data?.error || 'Unable to load match details')
      })
      .finally(()=>setLoading(false))
  },[id])

  if(loading) return <div className="container"><div>Loading match...</div></div>
  if(error) return <div className="container"><div style={{color:'salmon'}}>{error}</div></div>
  if(!match) return <div className="container"><div className="card">Match details are not available.</div></div>

  return (
    <div className="container">
      <h2>Match details</h2>
      <div className="card">
        <div className="match-title">{match?.homeTeam || 'Home'} vs {match?.awayTeam || 'Away'}</div>
        <div><strong>Stadium:</strong> {match?.stadium || 'TBD'}</div>
        <div><strong>League:</strong> {match?.league || 'N/A'}</div>
        <div><strong>Event:</strong> {match?.event || 'N/A'}</div>
        <div><strong>Kickoff:</strong> {match?.kickoffDate ? new Date(match.kickoffDate).toLocaleString() : 'TBD'}</div>
        <div><strong>Status:</strong> {match?.status || 'Scheduled'}</div>
        <div><strong>Price:</strong> {typeof match?.baseTicketPrice === 'number' ? `$${match.baseTicketPrice.toFixed(2)}` : match?.baseTicketPrice || 'TBD'}</div>
        <div style={{marginTop:12}}>
          <Link to={`/matches/${id}/seats`}><button style={{padding:'10px 16px',borderRadius:8,border:'none',background:'#06b6d4',color:'#001'}}>Select Seats</button></Link>
        </div>
      </div>
    </div>
  )
}
