"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Pagination, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"; // Adjust the import as needed

const ITEMS_PER_PAGE = 6;

const PaginationControls = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || "1");

  const handlePagination = (page: number) => {
    if (page < 1) return;
    router.push(`/products?page=${page}`);
  };

  return (
    <div className="flex justify-center mt-8 mb-4">
      <Pagination className="flex list-none space-x-2">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={() => handlePagination(currentPage > 1 ? currentPage - 1 : 1)}
            className={`pagination-button ${currentPage === 1 ? "cursor-not-allowed opacity-50" : ""}`}
          >
            Previous
          </PaginationPrevious>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink
            href="#"
            onClick={() => handlePagination(1)}
            className={`pagination-button ${currentPage === 1 ? "text-blue-500" : ""}`}
          >
            1
          </PaginationLink>
        </PaginationItem>
        {/* Add logic for additional pages if necessary */}
        <PaginationItem>
          <PaginationLink
            href="#"
            onClick={() => handlePagination(currentPage + 1)}
            className={`pagination-button ${false ? "cursor-not-allowed opacity-50" : ""}`}
          >
            Next
          </PaginationLink>
        </PaginationItem>
      </Pagination>
    </div>
  );
};

export default PaginationControls;


