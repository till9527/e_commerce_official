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
      <Button> 
        <Nav>
          <NavLink href="/admin" prefetch={false}>Button</NavLink>
        </Nav>
        
      </Button>
      <Nav>
        <NavLink href="/admin" prefetch={false}>Admin Dashboard</NavLink>
        <NavLink href="/">Home</NavLink>
        <NavLink href="/products">Products</NavLink>
        <NavLink href="/orders">My Orders</NavLink>
      </Nav>
      <div className="container my-6">{children}</div>
    </>
  )
}
