import { Button, HStack, Text } from "@chakra-ui/react";

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2;
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <HStack spacing={1} justify="center" mt={8}>
      <Button
        size="sm"
        variant="ghost"
        isDisabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        이전
      </Button>
      {getPageNumbers()[0] > 1 && (
        <>
          <Button size="sm" variant="ghost" onClick={() => onPageChange(1)}>1</Button>
          {getPageNumbers()[0] > 2 && <Text px={1} color="gray.400">…</Text>}
        </>
      )}
      {getPageNumbers().map((page) => (
        <Button
          key={page}
          size="sm"
          variant={page === currentPage ? "solid" : "ghost"}
          colorScheme={page === currentPage ? "blue" : undefined}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}
      {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
        <>
          {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
            <Text px={1} color="gray.400">…</Text>
          )}
          <Button size="sm" variant="ghost" onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </Button>
        </>
      )}
      <Button
        size="sm"
        variant="ghost"
        isDisabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        다음
      </Button>
    </HStack>
  );
}
