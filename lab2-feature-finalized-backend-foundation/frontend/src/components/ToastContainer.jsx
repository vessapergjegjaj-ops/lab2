import React, { useEffect, useState } from 'react'

export default function ToastContainer(){
  const [toasts, setToasts] = useState([])

  useEffect(()=>{
    const handler = (e) => {
      const id = Date.now() + Math.random()
      const t = { id, ...e.detail }
      setToasts((s)=>[t, ...s])
      setTimeout(()=>{
        setToasts((s)=>s.filter(x=>x.id!==id))
      }, e.detail.duration || 4000)
    }
    window.addEventListener('toast', handler)
    return () => window.removeEventListener('toast', handler)
  },[])

  return (
    <div style={{position:'fixed',top:16,right:16,zIndex:9999,display:'flex',flexDirection:'column',gap:8}}>
      {toasts.map(t=> (
        <div key={t.id} style={{padding:'8px 12px',borderRadius:8,background: t.type==='error' ? '#8b0000' : t.type==='success' ? '#0369a1' : '#334155',color:'#fff',minWidth:200,boxShadow:'0 6px 18px rgba(2,6,23,0.6)'}}>
          {t.message}
        </div>
      ))}
    </div>
  )
}
