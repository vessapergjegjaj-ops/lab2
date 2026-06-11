import api from './api'

const notificationService = {
  list(params){
    return api.get('/notifications/me', { params })
  },
  markAsRead(id){
    return api.put(`/notifications/${id}/read`)
  },
  markAllAsRead(){
    return api.put('/notifications/read-all')
  }
}

export default notificationService
