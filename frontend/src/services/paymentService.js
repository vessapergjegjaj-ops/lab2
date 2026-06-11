import api from './api'

const paymentService = {
  create(payment){
    if(payment.bookingId){
      return api.post(`/bookings/${payment.bookingId}/payments`, payment)
    }
    return api.post('/payments', payment)
  },
  createPayment(payment){
    if(payment.bookingId){
      return api.post(`/bookings/${payment.bookingId}/payments`, payment)
    }
    return api.post('/payments', payment)
  },
  list(params){
    return api.get('/payments', { params })
  }
}

export default paymentService
