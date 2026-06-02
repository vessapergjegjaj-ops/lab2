import api from './api'

const TOKEN_KEY = 'token'

const authService = {
  async login(credentials){
    const res = await api.post('/auth/login', credentials)
    if(res?.data?.token){
      localStorage.setItem(TOKEN_KEY, res.data.token)
      // notify app about auth change
      try{ window.dispatchEvent(new Event('authChanged')) }catch(e){}
    }
    return res.data
  },
  async register(payload){
    const res = await api.post('/auth/register', payload)
    // if backend returns a token upon register, store it and notify
    if(res?.data?.token){
      localStorage.setItem(TOKEN_KEY, res.data.token)
      try{ window.dispatchEvent(new Event('authChanged')) }catch(e){}
    }
    return res.data
  },
  logout(){
    localStorage.removeItem(TOKEN_KEY)
    try{ window.dispatchEvent(new Event('authChanged')) }catch(e){}
  },
  getToken(){
    return localStorage.getItem(TOKEN_KEY)
  },
  isAuthenticated(){
    return !!localStorage.getItem(TOKEN_KEY)
  },
  getUser(){
    try{
      const token = localStorage.getItem(TOKEN_KEY)
      if(!token) return null
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload
    }catch(e){return null}
  }
}

export default authService
