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
        <div className="flex gap-4 items-center max-w-3xl w-full justify-between px-4 py-3">
          <Button variant="outline" asChild> 
            <Nav>
              <NavLink href="/admin" prefetch={false}>Admin Dashboard</NavLink>
            </Nav>
          </Button>
          <Button asChild> 
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
      </div>
      <div className="container my-6">{children}</div>
    </>
  )
}
