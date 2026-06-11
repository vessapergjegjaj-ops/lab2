import api from './api'

const bookingService = {
  create(payload){
    return api.post('/bookings', payload)
  },
  createBooking(payload){
    return api.post('/bookings', payload)
  },
  list(params){
    return api.get('/bookings', { params })
  }
}

export default bookingService
