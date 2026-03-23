'use client'

import { cn } from '@/lib/utils'

function SkeletonBar({ className }: { className?: string }) {
  return <div className={cn('rounded bg-surface-light animate-pulse', className)} />
}

export function WorkflowListSkeleton() {
  return (
    <div className="overflow-auto flex-1">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-background z-10">
          <tr className="border-b border-border">
            <th className="w-10 p-3"><SkeletonBar className="w-4 h-4" /></th>
            <th className="w-8 p-3" />
            <th className="p-3"><SkeletonBar className="w-12 h-3" /></th>
            <th className="p-3"><SkeletonBar className="w-14 h-3" /></th>
            <th className="p-3"><SkeletonBar className="w-16 h-3" /></th>
            <th className="p-3"><SkeletonBar className="w-20 h-3" /></th>
            <th className="p-3"><SkeletonBar className="w-20 h-3" /></th>
            <th className="p-3"><SkeletonBar className="w-20 h-3" /></th>
            <th className="w-28 p-3" />
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i} className="border-b border-border">
              <td className="w-10 p-3"><SkeletonBar className="w-4 h-4 rounded" /></td>
              <td className="w-8 p-3"><SkeletonBar className="w-2 h-2 rounded-full" /></td>
              <td className="p-3">
                <div className="space-y-1.5">
                  <SkeletonBar className="w-36 h-3" />
                  <SkeletonBar className="w-20 h-2.5" />
                </div>
              </td>
              <td className="p-3"><SkeletonBar className="w-20 h-3" /></td>
              <td className="p-3"><SkeletonBar className="w-24 h-3" /></td>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <SkeletonBar className="w-10 h-3" />
                  <SkeletonBar className="w-10 h-4" />
                </div>
              </td>
              <td className="p-3"><SkeletonBar className="w-12 h-3" /></td>
              <td className="p-3"><SkeletonBar className="w-12 h-3" /></td>
              <td className="p-3" />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function WorkflowGridSkeleton() {
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-auto flex-1 content-start">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-surface border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SkeletonBar className="w-4 h-4 rounded" />
              <SkeletonBar className="w-32 h-4" />
            </div>
            <SkeletonBar className="w-16 h-5 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="space-y-1">
                <SkeletonBar className="w-14 h-2.5" />
                <SkeletonBar className="w-20 h-3" />
              </div>
            ))}
          </div>
          <SkeletonBar className="w-full h-1 rounded-full" />
          <div className="flex justify-end gap-1.5">
            <SkeletonBar className="w-7 h-7 rounded" />
            <SkeletonBar className="w-14 h-7 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
