// components/PaginationControls.tsx
"use client"

import { useRouter } from 'next/navigation';

const PaginationControls = ({ currentPage }: { currentPage: number }) => {
  const router = useRouter();

  const handlePagination = (page: number) => {
    router.push(`/products?page=${page}`);
  };

  return (
    <div className="pagination">
      <button
        onClick={() => handlePagination(currentPage > 1 ? currentPage - 1 : 1)}
        className="pagination-button"
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <span className="pagination-page">{currentPage}</span>
      <button
        onClick={() => handlePagination(currentPage + 1)}
        className="pagination-button"
        disabled={false} // Replace with logic to disable if on last page
      >
        Next
      </button>
    </div>
  );
};

export default PaginationControls;

