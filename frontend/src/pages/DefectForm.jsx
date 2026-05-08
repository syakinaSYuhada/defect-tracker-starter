import React, { useState } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function DefectForm(){
  const [batch,setBatch]=useState('')
  const [desc,setDesc]=useState('')
  const [severity,setSeverity]=useState('low')
  const [files,setFiles]=useState(null)
  const [attachments,setAttachments]=useState([])
  const [errors,setErrors]=useState({})
  const [loading,setLoading]=useState(false)
  const nav = useNavigate()

  function validate(){
    const e = {}
    if(!desc || desc.trim().length < 5) e.description = 'Please enter a description (min 5 chars)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit(e){
    e.preventDefault()
    if(!validate()) return
    setLoading(true)
    try{
      // Create defect first
      const res = await api.post('/defects',{ batch_number: batch, description: desc, severity })
      const defect = res.data

      // If files selected, upload each and link to defect
      if(files && files.length){
        const uploaded = []
        for(const f of files){
          const fd = new FormData()
          fd.append('file', f)
          fd.append('defect_id', defect.id)
          const r = await api.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
          uploaded.push(r.data)
        }
        setAttachments(uploaded.map(u => ({ id: u.attachment.id, url: u.url, filename: u.attachment.filename })))
      }

      nav('/defects')
    }catch(err){
      console.error(err)
      alert('Failed to create defect or upload files')
    }finally{setLoading(false)}
  }

  return (
    <div className="container">
      <h2>Create Defect</h2>
      <form onSubmit={submit} noValidate>
        <div>
          <label>Batch number</label>
          <input value={batch} onChange={e=>setBatch(e.target.value)} />
        </div>
        <div style={{marginTop:10}}>
          <label>Description</label>
          <textarea value={desc} onChange={e=>setDesc(e.target.value)} />
          {errors.description && <div className="error">{errors.description}</div>}
        </div>
        <div style={{marginTop:10}}>
          <label>Severity</label>
          <select value={severity} onChange={e=>setSeverity(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div style={{marginTop:10}}>
          <label>Attach photos / PDF (optional)</label>
          <input type="file" accept="image/*,application/pdf" onChange={e=>setFiles(e.target.files)} />
        </div>
        <div style={{marginTop:12}}>
          <button disabled={loading}>{loading? 'Creating...' : 'Create'}</button>
        </div>
      </form>
    </div>
    {attachments.length > 0 && (
      <div className="container" style={{marginTop:12}}>
        <h3>Uploaded files</h3>
        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          {attachments.map(a => (
            <div key={a.id} style={{width:120}}>
              {a.url && a.url.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                <img src={a.url} alt={a.filename} style={{width:'100%',borderRadius:6}} />
              ) : (
                <a href={a.url} target="_blank" rel="noreferrer">{a.filename}</a>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  )
}
