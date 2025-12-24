"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginatorProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
  showPreviousNext?: boolean;
  className?: string;
}

export default function Paginator({
  currentPage,
  totalPages,
  onPageChange,
  showPreviousNext = true,
  className,
}: PaginatorProps) {
  return (
    <div className={cn("flex items-center justify-end gap-2", className)}>
      <div className="flex items-center text-sm font-medium text-muted-foreground mr-4">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center space-x-2">
        {showPreviousNext && (
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Simple page numbers for now */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          // Logic to show pages around current page could happen here
          // For simplicity, just showing first 5 or logic needs to be robust
          // keeping it simple: valid pages
          let pageNum = currentPage;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }

          return (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "default" : "outline"}
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </Button>
          );
        })}

        {showPreviousNext && (
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
