import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'

export default function Register(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [firstName,setFirstName]=useState('')
  const [lastName,setLastName]=useState('')
  const [error,setError]=useState(null)
  const [loading,setLoading]=useState(false)
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    setError(null)
    setLoading(true)
    try{
      const payload = { firstName, lastName, email, password }
      const data = await authService.register(payload)
      // if register returned a token we are logged in; otherwise redirect to login
      if(data?.token){
        navigate('/dashboard')
      } else {
        navigate('/login')
      }
    }catch(err){
      setError(err?.response?.data?.message || 'Registration failed')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card form">
        <h2>Create account</h2>
        {error && <div style={{color:'salmon'}}>{error}</div>}
        <form onSubmit={submit}>
          <input value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="First name" disabled={loading} />
          <input value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Last name" disabled={loading} />
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" disabled={loading} />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" disabled={loading} />
          <button type="submit" disabled={loading}>{loading? 'Creating...' : 'Register'}</button>
        </form>
      </div>
    </div>
  )
}
