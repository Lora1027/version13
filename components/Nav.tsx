
import Link from 'next/link'

export default function Nav(){
  return (
    <nav className="container">
      <Link href="/">Dashboard</Link>
      <Link href="/transactions">Transactions</Link>
      <Link href="/inventory">Inventory</Link>
      <Link href="/comparison">Comparison</Link>
      <Link href="/balances">Balances</Link>
      <Link href="/login">Login</Link>
    </nav>
  )
}
