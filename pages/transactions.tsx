
'use client'
import { useEffect, useMemo, useState } from 'react'
import { supabase, fmt } from '../lib/supabase'
import AuthGate from '../components/AuthGate'
import Nav from '../components/Nav'

type Tx = { id:string; date:string; type:string; category:string|null; method:string|null; amount:number; notes:string|null }

export default function Transactions(){
  const [tx,setTx]=useState<Tx[]>([])
  const [q,setQ]=useState('')
  const [tfilter,setTfilter]=useState('all')
  const [mfilter,setMfilter]=useState('all')

  useEffect(()=>{ (async()=>{
    const { data } = await supabase.from('transactions').select('*').order('date',{ascending:false})
    setTx(data||[])
  })() },[])

  const filtered = useMemo(()=>{
    return tx.filter(t=> (tfilter==='all'||t.type===tfilter) && (mfilter==='all'||t.method===mfilter) && ( (t.category||'').toLowerCase().includes(q.toLowerCase()) || (t.notes||'').toLowerCase().includes(q.toLowerCase()) ))
  },[tx,q,tfilter,mfilter])

  async function del(id:string){
    if(!confirm('Delete this transaction?')) return
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if(error) alert(error.message); else setTx(tx=>tx.filter(x=>x.id!==id))
  }

  return (
    <AuthGate>
      <Nav/>
      <div className="container">
        <h1>Transactions</h1>
        <div className="card row">
          <input placeholder="Search (category/notes)" value={q} onChange={e=>setQ(e.target.value)} style={{flex:1}}/>
          <select value={tfilter} onChange={e=>setTfilter(e.target.value)}>
            <option value="all">All</option><option value="income">Income</option><option value="expense">Expense</option>
          </select>
          <select value={mfilter} onChange={e=>setMfilter(e.target.value)}>
            <option value="all">All methods</option><option value="cash">cash</option><option value="gcash">gcash</option><option value="bank">bank</option>
          </select>
          <button onClick={()=>downloadCSV(filtered)}>Download CSV</button>
          <button onClick={()=>window.print()}>Print</button>
        </div>
        <div className="card">
          <table>
            <thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Method</th><th>Amount</th><th>Notes</th><th/></tr></thead>
            <tbody>
              {filtered.map(t=>(
                <tr key={t.id}>
                  <td>{t.date}</td><td>{t.type}</td><td>{t.category}</td><td>{t.method}</td><td>{fmt.format(t.amount||0)}</td><td>{t.notes}</td>
                  <td><button onClick={()=>del(t.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AuthGate>
  )
}

function downloadCSV(rows:any[]){
  const header = ['date','type','category','method','amount','notes']
  const csv = [header.join(',')].concat(rows.map(r=> header.map(h=> (r[h]??'')).join(','))).join('\n')
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'})
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='transactions.csv'; a.click(); URL.revokeObjectURL(url)
}
