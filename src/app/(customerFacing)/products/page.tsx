"use client";

import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import db from "@/db/db";
import { cache } from "@/lib/cache";
import { Suspense } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter, useSearchParams } from "next/navigation"; // <-- Updated imports

const ITEMS_PER_PAGE = 6;

const getProducts = cache((page) => {
  const offset = (page - 1) * ITEMS_PER_PAGE;
  return db.product.findMany({
    where: { isAvailableForPurchase: true },
    orderBy: { name: "asc" },
    take: ITEMS_PER_PAGE,
    skip: offset,
  });
}, ["/products", "getProducts"]);

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // <-- Get search parameters
  const page = parseInt(searchParams.get("page") || "1"); // <-- Get the 'page' parameter

  const handlePagination = (page) => {
    router.push(`/products?page=${page}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Suspense
        fallback={
          <>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </>
        }
      >
        <ProductsSuspense page={page} />
      </Suspense>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={() => handlePagination(page > 1 ? page - 1 : 1)}
              disabled={page === 1}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" onClick={() => handlePagination(1)}>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" onClick={() => handlePagination(page + 1)} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

async function ProductsSuspense({ page }) {
  const products = await getProducts(page);

  return products.map((product) => <ProductCard key={product.id} {...product} />);
}
