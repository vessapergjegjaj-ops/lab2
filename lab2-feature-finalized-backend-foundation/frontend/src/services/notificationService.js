import api from './api'

const notificationService = {
  list(params){
    return api.get('/notifications', { params })
  },
  markAsRead(id){
    return api.post(`/notifications/${id}/read`)
  }
}

export default notificationService
