import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DefectList from './pages/DefectList'
import DefectForm from './pages/DefectForm'
import DefectDetail from './pages/DefectDetail'
import { setAuthToken } from './services/api'

function AppShell(){
  const nav = useNavigate()
  useEffect(()=>{
    const t = localStorage.getItem('token')
    if(t){ setAuthToken(t) }
    // simple redirect to login if no token
    if(!t) nav('/login')
  },[])

  function logout(){ localStorage.removeItem('token'); setAuthToken(null); nav('/login') }

  return (
    <div>
      <nav style={{padding:10,background:'#eee'}}>
        <Link to="/dashboard" style={{marginRight:10}}>Dashboard</Link>
        <Link to="/defects" style={{marginRight:10}}>Defects</Link>
        <button onClick={logout}>Logout</button>
      </nav>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/defects" element={<DefectList/>} />
        <Route path="/defects/new" element={<DefectForm/>} />
        <Route path="/defects/:id" element={<DefectDetail/>} />
        <Route path="/" element={<Dashboard/>} />
      </Routes>
    </div>
  )
}

export default function App(){
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
