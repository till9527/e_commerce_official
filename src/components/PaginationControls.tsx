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

export default function PaginationControls({ currentPage, totalPages }: { currentPage: number, totalPages: number }) {
  const router = useRouter();

  const handlePagination = (page: number) => {
    router.push(`/products?page=${page}`);
  };

  return (
    <div className="flex justify-center mt-8 mb-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={() => handlePagination(currentPage > 1 ? currentPage - 1 : 1)}
              className={currentPage === 1 ? "cursor-not-allowed opacity-50" : ""}
              disabled={currentPage === 1}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" onClick={() => handlePagination(currentPage)} className="px-4">
              {currentPage}
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" onClick={() => handlePagination(totalPages)} className="px-4">
              / {totalPages}
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={() => handlePagination(currentPage < totalPages ? currentPage + 1 : totalPages)}
              className={currentPage === totalPages ? "cursor-not-allowed opacity-50" : ""}
              disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
