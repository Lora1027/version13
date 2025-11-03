
IN K H A L E — Version 13 (Averages + Orders + Balances) — 2025-11-03

1) Supabase
   • SQL Editor → paste supabase/schema.sql → Run (safe to re-run).

2) Env (.env.local)
   • Duplicate .env.local.example → rename to .env.local
   • Fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
   • Currency/Locale already PHP/en-PH

3) Local
   • npm install
   • npm run dev
   • Open http://localhost:3000/login (sign up, confirm email, then sign in)

4) Deploy (Vercel)
   • Import project, set the two env vars in Vercel, redeploy

Pages
  /           Dashboard + Quick Add
  /transactions  Filter/search, delete, CSV/Print
  /inventory     Single add + bulk add, stock value, CSV/Print
  /comparison    Average Sales, Average Gross Profit, Growth %, Monthly Orders + table
  /balances      Edit Capital/Cash/GCash/Bank; totals shown (CSV/Print)

Rules
  • Mark expense rows as COGS (category = "COGS") to be included in Gross Profit calc.
  • Growth = (last month Sales - first month Sales) / first month Sales.
  • Orders = count of income rows in each month.
