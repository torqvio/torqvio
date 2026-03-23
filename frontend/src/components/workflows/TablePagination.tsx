'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TablePaginationProps {
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

const PAGE_SIZES = [10, 20, 50]

export function TablePagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  if (total <= 10) return null

  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  const pageNumbers: (number | '...')[] = []
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
      if (pageNumbers.length > 0 && typeof pageNumbers[pageNumbers.length - 1] === 'number') {
        const prev = pageNumbers[pageNumbers.length - 1] as number
        if (p - prev > 1) pageNumbers.push('...')
      }
      pageNumbers.push(p)
    }
  }

  return (
    <div className="h-10 border-t border-border px-4 flex items-center justify-between flex-shrink-0 text-xs text-text-muted">
      <span>
        Showing {start}–{end} of {total} workflows
      </span>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span>Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1) }}
            className="h-[22px] px-1 text-xs bg-surface border border-border rounded text-text-secondary focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="h-[22px] w-[22px] flex items-center justify-center rounded border border-border hover:border-border/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>

          {pageNumbers.map((p, i) =>
            p === '...' ? (
              <span key={`el-${i}`} className="px-1">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                className={cn(
                  'h-[22px] min-w-[22px] px-1 rounded border text-xs transition-colors',
                  page === p
                    ? 'bg-primary/20 border-primary/40 text-primary'
                    : 'border-border hover:border-border/80'
                )}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="h-[22px] w-[22px] flex items-center justify-center rounded border border-border hover:border-border/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
