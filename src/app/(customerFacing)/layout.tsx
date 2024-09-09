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
