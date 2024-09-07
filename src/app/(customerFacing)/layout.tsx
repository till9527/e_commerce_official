"use server"
import { Nav, NavLink } from "@/components/Nav"
import{AdminNavLink} from "@/components/AdminNavLink"

export const dynamic = "force-dynamic"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Nav>
        <AdminNavLink href="/admin" prefetch={false}>Admin Dashboard</AdminNavLink>
        <NavLink href="/">Home</NavLink>
        <NavLink href="/products">Products</NavLink>
        <NavLink href="/orders">My Orders</NavLink>
      </Nav>
      <div className="container my-6">{children}</div>
    </>
  )
}
