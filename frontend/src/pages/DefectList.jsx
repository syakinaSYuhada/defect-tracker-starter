import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'

export default function DefectList(){
  const [defects,setDefects]=useState([])
  useEffect(()=>{
    api.get('/defects').then(r=>setDefects(r.data)).catch(()=>setDefects([]))
  },[])

  return (
    <div style={{padding:20}}>
      <h2>Defects</h2>
      <p><Link to="/defects/new">Create defect</Link></p>
      <table border="1" cellPadding="6">
        <thead><tr><th>ID</th><th>Batch</th><th>Severity</th><th>Description</th><th>Created</th></tr></thead>
        <tbody>
          {defects.map(d=> (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>{d.batch_number}</td>
              <td>{d.severity}</td>
              <td>{d.description}</td>
              <td>{new Date(d.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
