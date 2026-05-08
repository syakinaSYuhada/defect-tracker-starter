import React, { useState } from 'react'
import api, { setAuthToken } from '../services/api'
import { useNavigate } from 'react-router-dom'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login(){
  const [email,setEmail]=useState('admin@example.com')
  const [password,setPassword]=useState('adminpass')
  const [err,setErr]=useState(null)
  const [fieldErr,setFieldErr]=useState({})
  const [loading,setLoading]=useState(false)
  const nav = useNavigate()

  function validate(){
    const e = {}
    if(!email || !emailRe.test(email)) e.email = 'Enter a valid email'
    if(!password || password.length < 4) e.password = 'Password too short'
    setFieldErr(e)
    return Object.keys(e).length === 0
  }

  async function submit(e){
    e.preventDefault()
    setErr(null)
    if(!validate()) return
    setLoading(true)
    try{
      const res = await api.post('/auth/login',{ email, password })
      const token = res.data.token
      localStorage.setItem('token', token)
      setAuthToken(token)
      nav('/dashboard')
    }catch(e){
      setErr(e.response?.data?.error || 'Login failed')
    }finally{setLoading(false)}
  }

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={submit} noValidate>
        <div>
          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} />
          {fieldErr.email && <div className="error">{fieldErr.email}</div>}
        </div>
        <div style={{marginTop:10}}>
          <label>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          {fieldErr.password && <div className="error">{fieldErr.password}</div>}
        </div>
        <div style={{marginTop:12}}>
          <button disabled={loading}>{loading? 'Signing...' : 'Sign in'}</button>
        </div>
      </form>
      {err && <p className="error">{err}</p>}
    </div>
  )
}
