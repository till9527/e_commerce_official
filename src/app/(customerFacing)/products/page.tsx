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

  const products = await db.product.findMany({
    where: { isAvailableForPurchase: true },
    orderBy: { name: "asc" },
    take: ITEMS_PER_PAGE,
    skip: offset,
  });

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
      <div className="flex justify-center mt-8 mb-4">
        <PaginationControls />
      </div>
    </div>
  );
}
