import { Nav, NavLink } from "@/components/Nav"
import { Button } from "@/components/ui/button"
export const dynamic = "force-dynamic"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <div className="flex justify-center"> 
        <div className = "flex gap-4 items-center max-w-3xl w-full justify-between px-4 py-3">
          <Nav>
            <NavLink href="/admin" prefetch={false}>Admin Dashboard</NavLink>
            <NavLink href="/">Home</NavLink>
            <NavLink href="/products">Products</NavLink>
            <NavLink href="/orders">My Orders</NavLink>
          </Nav>
        </div>
      </div>
      <div className="container my-6">{children}</div>
    </>
  )
}
