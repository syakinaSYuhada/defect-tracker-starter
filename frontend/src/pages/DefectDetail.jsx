import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

function parseJwt(token){
  if(!token) return null
  try{ return JSON.parse(atob(token.split('.')[1])) }catch(e){return null}
}

// server-backed comments: handled in component state

export default function DefectDetail(){
  const { id } = useParams()
  const nav = useNavigate()
  const [defect,setDefect]=useState(null)
  const [attachments,setAttachments]=useState([])
  const [loading,setLoading]=useState(true)
  const [user,setUser]=useState(null)
  const [currentIndex,setCurrentIndex]=useState(0)
  const [modalOpen,setModalOpen]=useState(false)
  const [modalAttachment,setModalAttachment]=useState(null)
  const [commentText,setCommentText]=useState('')
  const [comments, setComments] = useState([])

  useEffect(()=>{
    const t = localStorage.getItem('token')
    if(t){ const p = parseJwt(t); if(p) setUser({ id: p.sub, role: p.role, email: p.email }) }

    async function load(){
      try{
        const [dRes, aRes, cRes] = await Promise.all([
          api.get(`/defects/${id}`),
          api.get(`/uploads/defect/${id}`),
          api.get(`/defects/${id}/comments`)
        ])
        setDefect(dRes.data)
        setAttachments(aRes.data || [])
        setComments(cRes.data || [])
      }catch(err){
        console.error(err)
        alert('Failed to load defect')
        nav('/defects')
      }finally{setLoading(false)}
    }
    load()
  },[id])

  const imageAttachments = useMemo(()=> attachments.filter(a => a.url && a.url.match(/\.(jpg|jpeg|png|webp)$/i)),[attachments])

  function openPreview(att, idx){ setModalAttachment(att); setCurrentIndex(idx); setModalOpen(true) }

  async function handleDelete(att){
    if(!confirm('Delete this attachment?')) return
    try{
      await api.delete(`/uploads/${att.id}`)
      setAttachments(prev => prev.filter(a => a.id !== att.id))
    }catch(err){
      console.error(err)
      alert(err.response?.data?.error || 'Delete failed')
    }
  }

  function downloadAttachment(att){ if(att.url) window.open(att.url, '_blank') }

  function submitComment(e){
    e.preventDefault()
    if(!commentText || commentText.trim().length < 1) return
    (async ()=>{
      try{
        const res = await api.post(`/defects/${id}/comments`, { text: commentText })
        setComments(prev => [res.data, ...prev])
        setCommentText('')
      }catch(err){
        console.error(err)
        alert(err.response?.data?.error || 'Failed to post comment')
      }
    })()
  }

  if(loading) return <div style={{padding:20}}>Loading...</div>
  if(!defect) return <div style={{padding:20}}>Not found</div>

  return (
    <div style={{padding:20}}>
      <h2 style={{marginBottom:8}}>Defect {defect.id}</h2>
      <div style={{display:'flex',gap:24}}>
        <div style={{flex:1}}>
          <p><strong>Batch:</strong> {defect.batch_number}</p>
          <p><strong>Severity:</strong> {defect.severity}</p>
          <p><strong>Description:</strong><br/>{defect.description}</p>

          <h3 style={{marginTop:18}}>Attachments</h3>
          {attachments.length === 0 && <p style={{color:'#666'}}>No attachments</p>}

          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {imageAttachments.length > 0 && (
              <div style={{border:'1px solid #eee',padding:12,borderRadius:8,maxWidth:640}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <button onClick={()=>setCurrentIndex(i=> Math.max(0,i-1))} disabled={currentIndex<=0}>◀</button>
                  <div style={{flex:1,textAlign:'center'}}>
                    <img src={imageAttachments[currentIndex]?.url} alt="preview" style={{maxWidth:'100%',maxHeight:360,borderRadius:6}}/>
                  </div>
                  <button onClick={()=>setCurrentIndex(i=> Math.min(imageAttachments.length-1,i+1))} disabled={currentIndex>=imageAttachments.length-1}>▶</button>
                </div>
                <div style={{display:'flex',gap:8,marginTop:8,overflowX:'auto',paddingTop:8}}>
                  {imageAttachments.map((a,idx)=> (
                    <img key={a.id} src={a.url} alt={a.filename} onClick={()=>openPreview(a, idx)} style={{width:96,height:64,objectFit:'cover',borderRadius:6,cursor:'pointer',border: idx===currentIndex ? '2px solid #007bff' : '1px solid #ddd'}} />
                  ))}
                </div>
              </div>
            )}

            <div style={{display:'flex',flexWrap:'wrap',gap:12}}>
              {attachments.filter(a=> !a.url || !a.url.match(/\.(jpg|jpeg|png|webp)$/i)).map(a=> (
                <div key={a.id} style={{border:'1px solid #eee',padding:8,borderRadius:6,width:200}}>
                  <div style={{fontWeight:600}}>{a.filename || a.path}</div>
                  <div style={{fontSize:12,color:'#666',marginTop:6}}>{a.uploaded_by_email || a.uploaded_by}</div>
                  <div style={{marginTop:8,display:'flex',gap:8}}>
                    <a href={a.url} target="_blank" rel="noreferrer"><button>Preview</button></a>
                    <button onClick={()=>downloadAttachment(a)}>Download</button>
                    {(user && (String(user.id) === String(a.uploaded_by) || user.role === 'admin')) && (
                      <button onClick={()=>handleDelete(a)}>Delete</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside style={{width:360}}>
          <div style={{border:'1px solid #eee',padding:12,borderRadius:8}}>
            <h4>Comments</h4>
            <form onSubmit={submitComment}>
              <textarea value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add a comment" style={{width:'100%',height:80}} />
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
                <div style={{fontSize:12,color:'#666'}}>{comments.length} comments</div>
                <div>
                  <button type="submit">Add</button>
                </div>
              </div>
            </form>

            <div style={{marginTop:12,maxHeight:420,overflowY:'auto'}}>
              {comments.map(c=> (
                <div key={c.id} style={{padding:8,borderBottom:'1px solid #f0f0f0'}}>
                  <div style={{fontSize:13,fontWeight:600}}>{c.user_email || 'User'} <span style={{fontWeight:400,fontSize:12,color:'#666'}}>· {new Date(c.created_at).toLocaleString()}</span></div>
                  <div style={{marginTop:6}}>{c.text}</div>
                  {(user && (String(user.id) === String(c.user_id) || user.role === 'admin')) && (
                    <div style={{marginTop:8}}>
                      <button onClick={async()=>{
                        if(!confirm('Delete comment?')) return
                        try{
                          await api.delete(`/comments/${c.id}`)
                          setComments(prev => prev.filter(x => x.id !== c.id))
                        }catch(err){ alert(err.response?.data?.error || 'Delete failed') }
                      }}>Delete</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {modalOpen && modalAttachment && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:80}} onClick={()=>setModalOpen(false)}>
          <div style={{background:'#fff',padding:12,borderRadius:8,maxWidth:'90%',maxHeight:'90%'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontWeight:700}}>{modalAttachment.filename || modalAttachment.path}</div>
              <div>
                <button onClick={()=>downloadAttachment(modalAttachment)}>Download</button>
                <button onClick={()=>setModalOpen(false)} style={{marginLeft:8}}>Close</button>
              </div>
            </div>
            <div style={{marginTop:12}}>
              {modalAttachment.url && modalAttachment.url.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                <img src={modalAttachment.url} alt="preview" style={{maxWidth:'100%',maxHeight:'80vh',display:'block',margin:'0 auto'}}/>
              ) : (
                <a href={modalAttachment.url} target="_blank" rel="noreferrer">Open file</a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
