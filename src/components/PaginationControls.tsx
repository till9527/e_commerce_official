// components/PaginationControls.tsx

"use client"; // This directive makes this a client component

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 6;

export default function PaginationControls() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || "1");
    setCurrentPage(page);
  }, [searchParams]);

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
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink
              href="#"
              onClick={() => handlePagination(1)}
              className={currentPage === 1 ? "text-blue-500" : ""}
            >
              1
            </PaginationLink>
          </PaginationItem>
          {/* Add logic here to conditionally render additional pages if needed */}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={() => handlePagination(currentPage + 1)}
              className={currentPage === 1 ? "cursor-not-allowed opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
