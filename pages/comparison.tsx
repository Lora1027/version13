
'use client'
import { useEffect, useMemo, useState } from 'react'
import { supabase, fmt } from '../lib/supabase'

import AuthGate from '../components/AuthGate'
import Nav from '../components/Nav'

type Tx = { date:string; type:string; category:string|null; amount:number }

function monthKey(d:string){ return d.slice(0,7) } // YYYY-MM

export default function Comparison(){
  const [tx,setTx]=useState<Tx[]>([])
  useEffect(()=>{(async()=>{
    const { data } = await supabase.from('transactions').select('date,type,category,amount').order('date',{ascending:true})
    setTx(data||[])
  })()},[])

  const monthly = useMemo(()=>{
    const m: Record<string,{sales:number;cogs:number;opex:number;orders:number}> = {}
    tx.forEach(t=>{
      const k = monthKey(t.date)
      m[k] ||= {sales:0,cogs:0,opex:0,orders:0}
      if(t.type==='income'){ m[k].sales += t.amount||0; m[k].orders += 1 }
      else {
        if((t.category||'').toLowerCase()==='cogs'){ m[k].cogs += t.amount||0 }
        else { m[k].opex += t.amount||0 }
      }
    })
    return Object.entries(m).map(([month,v])=>{
      const gross = v.sales - v.cogs
      const net = gross - v.opex
      return { month, sales:v.sales, gross, opex:v.opex, net, orders:v.orders }
    }).sort((a,b)=> a.month.localeCompare(b.month))
  },[tx])

  const avgSales = monthly.length ? monthly.reduce((s,r)=>s+r.sales,0)/monthly.length : 0
  const avgGross = monthly.length ? monthly.reduce((s,r)=>s+r.gross,0)/monthly.length : 0
  const growth = monthly.length>=2 ? ((monthly[monthly.length-1].sales - monthly[0].sales) / Math.max(1, monthly[0].sales)) : 0

  return (
    <AuthGate>
      <Nav/>
      <div className="container">
        <h1>Comparison & Averages</h1>
        <div className="row">
          <div className="card kpi"><div className="title">AVERAGE SALES</div><div className="value">{fmt.format(avgSales)}</div></div>
          <div className="card kpi"><div className="title">AVERAGE GROSS PROFIT</div><div className="value">{fmt.format(avgGross)}</div></div>
          <div className="card kpi"><div className="title">GROWTH</div><div className="value">{(growth*100).toFixed(0)}%</div></div>
        </div>

        <div className="card">
          <h2>Monthly Breakdown</h2>
          <table>
            <thead><tr><th>Month</th><th>Sales</th><th>Gross Profit</th><th>OPEX</th><th>Net</th><th>Orders</th></tr></thead>
            <tbody>
              {monthly.map(r=>(
                <tr key={r.month}>
                  <td>{r.month}</td>
                  <td>{fmt.format(r.sales)}</td>
                  <td>{fmt.format(r.gross)}</td>
                  <td>{fmt.format(r.opex)}</td>
                  <td>{fmt.format(r.net)}</td>
                  <td>{r.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AuthGate>
  )
}
