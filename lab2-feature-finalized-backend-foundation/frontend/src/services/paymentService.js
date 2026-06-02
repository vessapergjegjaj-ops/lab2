import api from './api'

const paymentService = {
  create(payment){
    return api.post('/payments', payment)
  },
  createPayment(payment){
    return api.post('/payments', payment)
  },
  list(params){
    return api.get('/payments', { params })
  }
}

export default paymentService
