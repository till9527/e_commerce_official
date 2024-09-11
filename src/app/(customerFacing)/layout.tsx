import { Nav, NavLink } from "@/components/Nav"

export const dynamic = "force-dynamic"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Nav>
        <img 
          src="https://e-commerce-official-bucket.s3.us-east-2.amazonaws.com/logo/DAFTlogo.png" 
          alt="DAFT Logo" 
          style={{ height: '100px', marginRight: '15px' }} 
        />
        <NavLink href="/admin" prefetch={false}>Admin Dashboard</NavLink>
        <NavLink href="/">Home</NavLink>
        <NavLink href="/products">Products</NavLink>
        <NavLink href="/orders">My Orders</NavLink>
      </Nav>
      <div className="container my-6">{children}</div>
    </>
  )
}
