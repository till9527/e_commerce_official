"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Pagination, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"; // Adjust the import as needed

const ITEMS_PER_PAGE = 6;
interface PaginationControlsProps {
  totalItems: number;
}
const PaginationControls: React.FC<PaginationControlsProps> = ({totalItems}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || "1");
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

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
            onClick={(e) => {
              e.preventDefault(); // Prevent default anchor behavior
              if (currentPage > 1) handlePagination(currentPage - 1);
            }}
            className={`pagination-button ${currentPage === 1 ? "cursor-not-allowed opacity-50" : ""}`}
          >
            Previous
          </PaginationPrevious>
        </PaginationItem>
        <PaginationItem>
            {currentPage}
          </PaginationItem>
        {/* Add logic for additional pages if necessary */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) handlePagination(currentPage + 1);
            }}
            className={`pagination-button ${currentPage === totalPages ? "cursor-not-allowed opacity-50" : ""}`}
          >
            Next
          </PaginationNext>
        </PaginationItem>
      </Pagination>
    </div>
  );
};

export default PaginationControls;


