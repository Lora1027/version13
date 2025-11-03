
'use client'
import { useEffect, useState } from 'react'
import { supabase, fmt } from '../lib/supabase'
import AuthGate from '../components/AuthGate'
import Nav from '../components/Nav'

type Item = { id:string; sku:string; name:string; unit_cost:number; qty:number }

export default function Inventory(){
  const [rows,setRows]=useState<Item[]>([])
  const [form,setForm]=useState({sku:'',name:'',unit_cost:0,qty:0})
  const [bulk,setBulk]=useState('')

  async function load(){
    const { data } = await supabase.from('inventory').select('*').order('name',{ascending:true})
    setRows(data||[])
  }
  useEffect(()=>{load()},[])

  async function addOne(){
    const { error } = await supabase.from('inventory').insert(form)
    if(error) alert(error.message); else { setForm({sku:'',name:'',unit_cost:0,qty:0}); load() }
  }
  async function addBulk(){
    const lines = bulk.split('\n').map(l=>l.trim()).filter(Boolean)
    const items = lines.map(l=>{ const [sku,name,cost,qty]=l.split(','); return { sku, name, unit_cost:Number(cost), qty:Number(qty) } })
    const { error } = await supabase.from('inventory').insert(items)
    if(error) alert(error.message); else { setBulk(''); load() }
  }
  function download(){
    const header = ['sku','name','unit_cost','qty']
    const csv = [header.join(',')].concat(rows.map(r=> header.map(h=> (r as any)[h]).join(','))).join('\n')
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'})
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='inventory.csv'; a.click(); URL.revokeObjectURL(url)
  }

  const stockValue = rows.reduce((s,r)=>s + (r.unit_cost||0)*(r.qty||0), 0)

  return (
    <AuthGate>
      <Nav/>
      <div className="container">
        <h1>Inventory</h1>
        <div className="row">
          <div className="card kpi"><div className="title">RUNNING STOCK VALUE</div><div className="value">{fmt.format(stockValue)}</div></div>
        </div>

        <div className="card">
          <h2>Add Single Item</h2>
          <div className="row">
            <input placeholder="SKU" value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})}/>
            <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{minWidth:220}}/>
            <input type="number" placeholder="Unit Cost" value={form.unit_cost} onChange={e=>setForm({...form,unit_cost:e.target.valueAsNumber})}/>
            <input type="number" placeholder="Qty" value={form.qty} onChange={e=>setForm({...form,qty:e.target.valueAsNumber})}/>
            <button onClick={addOne}>Add</button>
          </div>
        </div>

        <div className="card">
          <h2>Bulk Add (CSV lines)</h2>
          <textarea rows={6} placeholder="SKU001,Coffee Large,120,10" value={bulk} onChange={e=>setBulk(e.target.value)} style={{width:'100%'}}/>
          <div className="actions"><button onClick={addBulk}>Add All</button></div>
        </div>

        <div className="card">
          <h2>Items</h2>
          <div className="actions" style={{marginBottom:12}}>
            <button onClick={download}>Download CSV</button>
            <button onClick={()=>window.print()}>Print</button>
          </div>
          <table>
            <thead><tr><th>SKU</th><th>Name</th><th>Unit Cost</th><th>Qty</th><th>Value</th></tr></thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.id}>
                  <td>{r.sku}</td><td>{r.name}</td><td>{fmt.format(r.unit_cost)}</td><td>{r.qty}</td><td>{fmt.format((r.unit_cost||0)*(r.qty||0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AuthGate>
  )
}
