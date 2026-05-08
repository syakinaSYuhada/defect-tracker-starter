import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function Dashboard(){
  const [summary,setSummary]=useState(null)
  useEffect(()=>{
    api.get('/dashboard/summary').then(r=>setSummary(r.data)).catch(()=>setSummary(null))
  },[])
  return (
    <div style={{padding:20}}>
      <h2>Dashboard</h2>
      {summary ? (
        <pre>{JSON.stringify(summary, null, 2)}</pre>
      ) : (
        <p>No summary data (backend may not implement this endpoint in starter).</p>
      )}
    </div>
  )
}
