"use client";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import db from "@/db/db";
import { cache } from "@/lib/cache";
import { Suspense, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const getProducts = cache(() => {
  return db.product.findMany({
    where: { isAvailableForPurchase: true },
    orderBy: { name: "asc" },
  });
}, ["/products", "getProducts"]);

export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  const handleNextPage = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Suspense
        fallback={
          <>
            {Array.from({ length: productsPerPage }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </>
        }
      >
        <ProductsSuspense currentPage={currentPage} productsPerPage={productsPerPage} />
      </Suspense>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" onClick={handlePreviousPage} />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">{currentPage}</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" onClick={handleNextPage} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

async function ProductsSuspense({ currentPage, productsPerPage }) {
  const products = await getProducts();
  const startIndex = (currentPage - 1) * productsPerPage;
  const selectedProducts = products.slice(startIndex, startIndex + productsPerPage);

  return selectedProducts.map(product => <ProductCard key={product.id} {...product} />);
}
