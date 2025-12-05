import { useState, useEffect, useMemo } from "react";

interface UsePaginationProps<T> {
  data: T[];
  filterFn?: (item: T) => boolean;
  itemsPerPageDefault?: number;
  dependencies?: any[];
}

interface PaginationReturn<T> {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  currentItems: T[];
  filteredItems: T[];
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  goToPage: (page: number) => void;
}

export function usePagination<T>({
  data,
  filterFn,
  itemsPerPageDefault = 10,
  dependencies = []
}: UsePaginationProps<T>): PaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageDefault);

  // Reset to first page when dependencies change (filters, search, etc.)
  useEffect(() => {
    setCurrentPage(1);
  }, dependencies);

  // Filter data
  const filteredItems = useMemo(() => {
    if (!filterFn) return data;
    return data.filter(filterFn);
  }, [data, filterFn]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // Pagination handler with bounds checking
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Reset to page 1 if current page exceeds total pages after filtering
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    startIndex,
    endIndex,
    currentItems,
    filteredItems,
    setCurrentPage,
    setItemsPerPage,
    goToPage,
  };
} 