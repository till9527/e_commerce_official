// server-side only
import { ProductCard } from "@/components/ProductCard";
import db from "@/db/db";
import { GetServerSideProps } from "next";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 6; // Number of items per page

export const getServerSideProps: GetServerSideProps = async (context) => {
  const page = parseInt(context.query.page as string) || 1;
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const products = await db.product.findMany({
    where: { isAvailableForPurchase: true },
    orderBy: { name: "asc" },
    take: ITEMS_PER_PAGE,
    skip: offset,
  });

  return {
    props: {
      products,
      page,
    },
  };
};

export default function ProductsPage({ products, page }: { products: any[]; page: number }) {
  const handlePagination = (page: number) => {
    window.location.href = `/products?page=${page}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={page > 1 ? () => handlePagination(page - 1) : undefined}
              className={page === 1 ? "cursor-not-allowed opacity-50" : ""}
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

