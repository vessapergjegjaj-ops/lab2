import api from './api'

const matchService = {
  list(params){
    return api.get('/matches', { params })
  },
  getMatches(params){
    return api.get('/matches', { params })
  },
  getMatchById(id){
    return api.get(`/matches/${id}`)
  },
  getMatchSeats(matchId){
    return api.get(`/matches/${matchId}/seats`)
  },
  get(id){
    return api.get(`/matches/${id}`)
  },
  seats(matchId){
    return api.get(`/matches/${matchId}/seats`)
  }
}

export default matchService
