
'use client'
import { useEffect, useState } from 'react'
import { supabase, fmt } from '../lib/supabase'
import AuthGate from '../components/AuthGate'
import Nav from '../components/Nav'

type Bal = { id:string; kind:'capital'|'cash'|'gcash'|'bank'; label:string; amount:number }

export default function Balances(){
  const [rows,setRows]=useState<Bal[]>([])
  const [form,setForm]=useState({kind:'capital', label:'', amount:0})

  async function load(){
    const { data } = await supabase.from('balances').select('*').order('kind', {ascending:true})
    setRows(data||[])
  }
  useEffect(()=>{load()},[])

  async function upsert(b?:Bal){
    const payload = b ? b : { kind: form.kind as any, label: form.label, amount: Number(form.amount) }
    const { error } = await supabase.from('balances').upsert(payload).select()
    if(error) alert(error.message); else load()
  }
  async function del(id:string){
    if(!confirm('Delete?')) return
    const { error } = await supabase.from('balances').delete().eq('id', id)
    if(error) alert(error.message); else load()
  }
  const totals = {
    capital: rows.filter(r=>r.kind==='capital').reduce((s,r)=>s+r.amount,0),
    wallets: rows.filter(r=>r.kind!=='capital').reduce((s,r)=>s+r.amount,0)
  }

  return (
    <AuthGate>
      <Nav/>
      <div className="container">
        <h1>Balances</h1>
        <div className="row">
          <div className="card kpi"><div className="title">TOTAL CAPITAL</div><div className="value">{fmt.format(totals.capital)}</div></div>
          <div className="card kpi"><div className="title">CASH ON HAND (Cash + GCash + Bank)</div><div className="value">{fmt.format(totals.wallets)}</div></div>
        </div>
        <div className="card">
          <h2>Add / Update Balance</h2>
          <div className="row">
            <select value={form.kind} onChange={e=>setForm({...form, kind:e.target.value})}>
              <option value="capital">capital</option><option value="cash">cash</option><option value="gcash">gcash</option><option value="bank">bank</option>
            </select>
            <input placeholder="Label" value={form.label} onChange={e=>setForm({...form, label:e.target.value})}/>
            <input type="number" placeholder="Amount" value={form.amount} onChange={e=>setForm({...form, amount:e.target.valueAsNumber})}/>
            <button onClick={()=>upsert()}>Save</button>
          </div>
        </div>
        <div className="card">
          <table>
            <thead><tr><th>Kind</th><th>Label</th><th>Amount</th><th/></tr></thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.id}>
                  <td>{r.kind}</td>
                  <td><input value={r.label} onChange={e=>setRows(rows.map(x=>x.id===r.id?{...x,label:e.target.value}:x))}/></td>
                  <td><input type="number" value={r.amount} onChange={e=>setRows(rows.map(x=>x.id===r.id?{...x,amount:e.target.valueAsNumber}:x))}/></td>
                  <td>
                    <button onClick={()=>upsert(r)}>Update</button>
                    <button onClick={()=>del(r.id)} style={{marginLeft:8}}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="actions" style={{marginTop:12}}>
            <button onClick={()=>downloadCSV(rows)}>Download CSV</button>
            <button onClick={()=>window.print()}>Print</button>
          </div>
        </div>
      </div>
    </AuthGate>
  )
}

function downloadCSV(rows:any[]){
  if(!rows.length) return
  const header = ['kind','label','amount']
  const csv = [header.join(',')].concat(rows.map(r=> header.map(h=> (r[h]??'')).join(','))).join('\n')
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'})
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='balances.csv'; a.click(); URL.revokeObjectURL(url)
}
