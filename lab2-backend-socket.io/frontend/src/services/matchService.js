import api from './api'

const getPayload = (response, fallback) => response?.data?.data ?? fallback

const normalizeMatch = (match = {}) => ({
  ...match,
  homeTeam: match.homeTeam || match.home_team_name,
  awayTeam: match.awayTeam || match.away_team_name,
  stadium: match.stadium || match.stadium_name,
  league: match.league || match.league_name,
  event: match.event || match.event_name,
  kickoffDate: match.kickoffDate || match.kickoff_at,
  status: match.status || 'scheduled',
  baseTicketPrice: Number(match.baseTicketPrice || match.base_ticket_price || match.ticket_price || 0),
})

const normalizeSeat = (seat = {}) => ({
  ...seat,
  rowLabel: seat.rowLabel || seat.row_label || '',
  seatNumber: seat.seatNumber || seat.seat_number,
  reservationId: seat.reservationId || seat.reservation_id,
  status: seat.status || seat.reservation_status || 'available',
  label: seat.label || [seat.section, seat.row_label || seat.rowLabel, seat.seat_number || seat.seatNumber].filter(Boolean).join('-'),
})

const matchService = {
  list(params){
    return api.get('/matches', { params }).then(response => getPayload(response, []).map(normalizeMatch))
  },
  getMatches(params){
    return api.get('/matches', { params }).then(response => getPayload(response, []).map(normalizeMatch))
  },
  getMatchById(id){
    return api.get(`/matches/${id}`).then(response => normalizeMatch(getPayload(response, null) || {}))
  },
  getMatchSeats(matchId){
    return api.get(`/matches/${matchId}/seats`).then(response => getPayload(response, []).map(normalizeSeat))
  },
  reserveSeat(matchId, payload){
    return api.post(`/matches/${matchId}/reservations`, payload)
  },
  releaseReservation(matchId, reservationId){
    return api.delete(`/matches/${matchId}/reservations/${reservationId}`)
  },
  get(id){
    return api.get(`/matches/${id}`).then(response => normalizeMatch(getPayload(response, null) || {}))
  },
  seats(matchId){
    return api.get(`/matches/${matchId}/seats`).then(response => getPayload(response, []).map(normalizeSeat))
  }
}

export default matchService
