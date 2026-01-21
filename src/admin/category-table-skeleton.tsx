export function CategoryTableSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-full max-w-md"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-40"></div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-amber-200 dark:border-amber-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-950 dark:to-orange-950 border-b-2 border-amber-200 dark:border-amber-800">
              <tr>
                <th className="px-6 py-4 text-left">
                  <div className="h-4 bg-amber-200 dark:bg-amber-800 rounded w-32"></div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="h-4 bg-amber-200 dark:bg-amber-800 rounded w-24"></div>
                </th>
                <th className="px-6 py-4 text-left">
                  <div className="h-4 bg-amber-200 dark:bg-amber-800 rounded w-28"></div>
                </th>
                <th className="px-6 py-4 text-right">
                  <div className="h-4 bg-amber-200 dark:bg-amber-800 rounded w-24 ml-auto"></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100 dark:divide-amber-900">
              {[1, 2, 3, 4].map((i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-28"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
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
