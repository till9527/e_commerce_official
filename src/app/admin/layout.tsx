import { Nav, NavLink } from "@/components/Nav"

export const dynamic = "force-dynamic"

export default function AdminLayout({
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
          style={{ height: '50px', marginRight: '15px' }} 
        />
        <NavLink href="/">User Dashboard</NavLink>
        <NavLink href="/admin">Dashboard</NavLink>
        <NavLink href="/admin/products">Products</NavLink>
        <NavLink href="/admin/users">Customers</NavLink>
        <NavLink href="/admin/orders">Sales</NavLink>
      </Nav>
      <div className="container my-6">{children}</div>
    </>
  )
}
