// components/PaginationControls.tsx

"use client"; // This directive makes this a client component

import { useRouter } from 'next/navigation';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 6;

export default function PaginationControls({ currentPage }: { currentPage: number }) {
  const router = useRouter();

  const handlePagination = (page: number) => {
    router.push(`/products?page=${page}`);
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={() => handlePagination(currentPage > 1 ? currentPage - 1 : 1)}
            className={currentPage === 1 ? "cursor-not-allowed opacity-50" : ""}
          />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" onClick={() => handlePagination(1)}>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={() => handlePagination(currentPage + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
