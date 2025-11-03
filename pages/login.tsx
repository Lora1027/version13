
'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Nav from '../components/Nav'

export default function Login(){
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [mode,setMode] = useState<'signin'|'signup'>('signup')
  async function go(){
    const auth = mode==='signup' ? supabase.auth.signUp({email,password}) : supabase.auth.signInWithPassword({email,password})
    const { error } = await auth
    if(error){ alert(error.message) } else { window.location.href='/' }
  }
  return (
    <div className="container">
      <Nav/>
      <div className="card" style={{maxWidth:480}}>
        <h1>Sign {mode==='signup'?'Up':'In'}</h1>
        <div className="row">
          <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{flex:1}}/>
          <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{flex:1}}/>
        </div>
        <div className="actions">
          <button onClick={go}>{mode==='signup'?'Sign up':'Sign in'}</button>
          <button onClick={()=>setMode(mode==='signup'?'signin':'signup')} type="button">
            Switch to {mode==='signup'?'Sign in':'Sign up'}
          </button>
        </div>
        <small className="muted">Confirm email if signing up, then sign in.</small>
      </div>
    </div>
  )
}
