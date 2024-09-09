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
      <Button className="inline-flex items-center justify-center px-5 py-3 sm:ms-4" variant="outline" asChild> 
        <Nav>
          <NavLink href="/admin" prefetch={false}>Admin Dashboard</NavLink>
        </Nav>    
      </Button>
      <Button> 
        <Nav>
          <NavLink href="/">Home</NavLink>
        </Nav>    
      </Button>
      <Button> 
        <Nav>
          <NavLink href="/products">Products</NavLink>
        </Nav>    
      </Button>
      <Button> 
        <Nav>
          <NavLink href="/orders">My Orders</NavLink>
        </Nav>    
      </Button>
      <div className="container my-6">{children}</div>
    </>
  )
}
