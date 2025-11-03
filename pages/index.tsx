
'use client'
import { useEffect, useState } from 'react'
import { supabase, fmt } from '../lib/supabase'
import AuthGate from '../components/AuthGate'
import Nav from '../components/Nav'

type Tx = { id:string; date:string; type:string; category:string|null; method:string|null; amount:number; notes:string|null }
type Bal = { id:string; kind:'capital'|'cash'|'gcash'|'bank'; label:string; amount:number }

export default function Home(){
  const [tx,setTx]=useState<Tx[]>([])
  const [bal,setBal]=useState<Bal[]>([])
  useEffect(()=>{
    (async()=>{
      const { data:txs } = await supabase.from('transactions').select('*').order('date',{ascending:true})
      setTx(txs||[])
      const { data:bs } = await supabase.from('balances').select('*')
      setBal(bs||[])
    })()
  },[])

  const sales = tx.filter(t=>t.type==='income').reduce((s,t)=>s+(t.amount||0),0)
  const cogs  = tx.filter(t=>t.type==='expense' && (t.category||'').toLowerCase()==='cogs').reduce((s,t)=>s+(t.amount||0),0)
  const opex  = tx.filter(t=>t.type==='expense' && (t.category||'').toLowerCase()!=='cogs').reduce((s,t)=>s+(t.amount||0),0)
  const gross = sales - cogs
  const net   = gross - opex

  const capital = bal.filter(b=>b.kind==='capital').reduce((s,b)=>s+b.amount,0)
  const cashonhand = bal.filter(b=>b.kind!=='capital').reduce((s,b)=>s+b.amount,0)

  return (
    <AuthGate>
      <Nav/>
      <div className="container">
        <h1>Dashboard</h1>
        <div className="row">
          <div className="card kpi"><div className="title">TOTAL REVENUE</div><div className="value">{fmt.format(sales)}</div></div>
          <div className="card kpi"><div className="title">GROSS PROFIT</div><div className="value">{fmt.format(gross)}</div></div>
          <div className="card kpi"><div className="title">OPEX</div><div className="value">{fmt.format(opex)}</div></div>
          <div className="card kpi"><div className="title">NET PROFIT</div><div className="value">{fmt.format(net)}</div></div>
          <div className="card kpi"><div className="title">BEGINNING (Capital)</div><div className="value">{fmt.format(capital)}</div></div>
          <div className="card kpi"><div className="title">CASH ON HAND (Cash+GCash+Bank)</div><div className="value">{fmt.format(cashonhand)}</div></div>
        </div>
        <div className="card">
          <h2>Quick Add — Transaction</h2>
          <QuickAdd/>
        </div>
      </div>
    </AuthGate>
  )
}

function QuickAdd(){
  const [date,setDate]=useState<string>(new Date().toISOString().slice(0,10))
  const [type,setType]=useState<'income'|'expense'>('income')
  const [category,setCategory]=useState('Sales')
  const [method,setMethod]=useState('cash')
  const [amount,setAmount]=useState<number>(0)
  const [notes,setNotes]=useState('')
  async function save(){
    const { error } = await supabase.from('transactions').insert({ date, type, category, method, amount, notes })
    if(error) alert('Save failed: '+error.message); else { alert('Saved'); location.reload() }
  }
  return (
    <div className="row">
      <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
      <select value={type} onChange={e=>setType(e.target.value as any)}>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      <input placeholder="Category (e.g., Sales or COGS)" value={category} onChange={e=>setCategory(e.target.value)} style={{minWidth:200}}/>
      <select value={method} onChange={e=>setMethod(e.target.value)}>
        <option value="cash">cash</option><option value="gcash">gcash</option><option value="bank">bank</option>
      </select>
      <input type="number" placeholder="Amount" value={amount} onChange={e=>setAmount(parseFloat(e.target.value))}/>
      <input placeholder="Notes" value={notes} onChange={e=>setNotes(e.target.value)} style={{flex:1}}/>
      <button onClick={save}>Add</button>
    </div>
  )
}
