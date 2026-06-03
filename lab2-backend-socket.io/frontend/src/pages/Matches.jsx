import React, { useEffect, useState } from 'react'
import matchService from '../services/matchService'
import MatchCard from '../components/MatchCard'

export default function Matches(){
  const [matches,setMatches]=useState([])
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState(null)

  useEffect(()=>{
    setLoading(true)
    setError(null)
    matchService.getMatches()
      .then(data => setMatches(Array.isArray(data) ? data : []))
      .catch((err) => {
        setMatches([])
        setError(err?.response?.data?.error || 'Unable to load matches')
      })
      .finally(()=>setLoading(false))
  },[])

  return (
    <div className="container">
      <h2>Upcoming Matches</h2>
      {loading && <div>Loading matches...</div>}
      {error && <div style={{color:'salmon', marginBottom:16}}>{error}</div>}
      {!loading && !error && matches.length === 0 && <div className="card">No matches available.</div>}
      <div className="grid">
        {matches.map(m=> <MatchCard key={m.id} match={m} />)}
      </div>
    </div>
  )
}
