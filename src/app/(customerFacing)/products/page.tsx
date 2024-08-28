// app/products/page.tsx

import { ProductCard } from "@/components/ProductCard";
import db from "@/db/db";
import PaginationControls from "@/components/PaginationControls";

const ITEMS_PER_PAGE = 6;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams.page || "1");
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const [products, totalCount] = await Promise.all([
    db.product.findMany({
      where: { isAvailableForPurchase: true },
      orderBy: { name: "asc" },
      take: ITEMS_PER_PAGE,
      skip: offset,
    }),
    db.product.count({
      where: { isAvailableForPurchase: true },
    })
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}

      <PaginationControls currentPage={page} totalPages={totalPages} />
    </div>
  );
}
