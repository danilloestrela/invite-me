import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination";

  type GuestListPaginationProps = {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    ellipsisNumberShow?: number;
  }

  export const GuestListPagination = ({page, totalPages, onPageChange, ellipsisNumberShow = 3}: GuestListPaginationProps) => {

    const handlePageChange = (pageNumber: number) => {
        if(pageNumber < 1 || pageNumber > totalPages) return;
        onPageChange(pageNumber);
    }

    const renderPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = ellipsisNumberShow;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            href="#"
                            isActive={page === i}
                            onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(i);
                            }}
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }
        } else {
            // Always show the first page
            pages.push(
                <PaginationItem key={1}>
                    <PaginationLink
                        href="#"
                        isActive={page === 1}
                        onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(1);
                        }}
                    >
                        1
                    </PaginationLink>
                </PaginationItem>
            );

            // Show ellipsis if current page is beyond the second page
            if (page > 3) {
                pages.push(
                    <PaginationItem key="ellipsis-start">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

            // Show pages around the current page
            for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
                pages.push(
                    <PaginationItem key={i}>
                        <PaginationLink
                            href="#"
                            isActive={page === i}
                            onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(i);
                            }}
                        >
                            {i}
                        </PaginationLink>
                    </PaginationItem>
                );
            }

            // Show ellipsis if current page is before the last few pages
            if (page < totalPages - 2) {
                pages.push(
                    <PaginationItem key="ellipsis-end">
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

            // Always show the last page
            pages.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink
                        href="#"
                        isActive={page === totalPages}
                        onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(totalPages);
                        }}
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return pages;
    }

    return (
        <Pagination>
            <PaginationContent>
                {page > 1 && (
                    <PaginationItem>
                        <PaginationPrevious onClick={() => handlePageChange(page - 1)} />
                    </PaginationItem>
                )}
                {renderPageNumbers()}
                {page < totalPages && (
                    <PaginationItem>
                        <PaginationNext onClick={() => handlePageChange(page + 1)} />
                    </PaginationItem>
                )}
            </PaginationContent>
        </Pagination>
    )
  }