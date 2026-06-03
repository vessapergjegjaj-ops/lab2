import api from './api'

const notificationService = {
  list(params){
    return api.get('/notifications/me', { params })
  },
  markAsRead(id){
    return api.put(`/notifications/${id}/read`)
  }
}

export default notificationService
