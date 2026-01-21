export function PriceFilterTableSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="h-12 bg-stone-200 dark:bg-stone-800 rounded-xl w-full max-w-md"></div>
        <div className="h-14 bg-stone-200 dark:bg-stone-800 rounded-xl w-full sm:w-48"></div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-yellow-200/50 dark:border-yellow-900/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 dark:bg-stone-950 border-b border-yellow-200/50 dark:border-yellow-900/30">
              <tr>
                <th className="px-6 py-4 text-left">
                  <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-32"></div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-28"></div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-28"></div>
                </th>
                <th className="px-6 py-4 text-right">
                  <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-20 ml-auto"></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yellow-100 dark:divide-yellow-900/20">
              {[...Array(5)].map((_, index) => (
                <tr key={index} className="border-b border-yellow-100/50 dark:border-yellow-900/20">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800"></div>
                      <div className="h-5 bg-stone-200 dark:bg-stone-800 rounded w-40"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 bg-stone-200 dark:bg-stone-800 rounded w-24"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 bg-stone-200 dark:bg-stone-800 rounded w-24"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-9 h-9 rounded-lg bg-stone-200 dark:bg-stone-800"></div>
                      <div className="w-9 h-9 rounded-lg bg-stone-200 dark:bg-stone-800"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
