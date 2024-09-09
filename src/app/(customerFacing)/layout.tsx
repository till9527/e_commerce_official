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
      <div className="inline-flex items-center justify-center gap-4 px-5 py-3 sm:ms-4">
        <Button  variant="outline" asChild> 
          <Nav>
            <NavLink href="/admin" prefetch={false}>Admin Dashboard</NavLink>
          </Nav>    
        </Button>
        <Button variant="outline" asChild> 
          <Nav>
            <NavLink href="/">Home</NavLink>
          </Nav>    
        </Button>
        <Button variant="outline" asChild> 
          <Nav>
            <NavLink href="/products">Products</NavLink>
          </Nav>    
        </Button>
        <Button variant="outline" asChild> 
          <Nav>
            <NavLink href="/orders">My Orders</NavLink>
          </Nav>    
        </Button>
      </div>
      <div className="container my-6">{children}</div>
    </>
  )
}
