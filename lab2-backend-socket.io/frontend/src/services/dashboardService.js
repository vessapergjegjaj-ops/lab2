import api from './api'

const dashboardService = {
  stats(){
    return api.get('/dashboard/stats')
  },
}

export default dashboardService
