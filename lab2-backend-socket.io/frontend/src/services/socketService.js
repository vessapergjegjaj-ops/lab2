import { io } from 'socket.io-client'

const apiBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/mysql'
const socketURL = import.meta.env.VITE_SOCKET_URL || new URL(apiBaseURL).origin

let socket

function getToken(){
  try {
    return localStorage.getItem('token')
  } catch (error) {
    return null
  }
}

function getSocket(){
  const token = getToken()
  if (!socket) {
    socket = io(socketURL, {
      autoConnect: false,
      auth: { token },
      withCredentials: true,
    })
  } else {
    socket.auth = { token }
  }

  if (!socket.connected) {
    socket.connect()
  }

  return socket
}

const socketService = {
  connect(){
    return getSocket()
  },

  disconnect(){
    if (socket) socket.disconnect()
  },

  joinMatch(matchId){
    getSocket().emit('joinMatch', matchId)
  },

  selectSeat(payload){
    return new Promise((resolve) => {
      getSocket().emit('seatSelected', payload, resolve)
    })
  },

  on(eventName, handler){
    getSocket().on(eventName, handler)
  },

  off(eventName, handler){
    if (socket) socket.off(eventName, handler)
  },
}

export default socketService
