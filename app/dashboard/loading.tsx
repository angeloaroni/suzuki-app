import { Skeleton } from "@/components/Skeleton"
import { Music, Plus } from "lucide-react"

export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            {/* Header Skeleton */}
            <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl" />
                            <div>
                                <Skeleton className="h-6 w-32 sm:w-40 mb-1" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <Skeleton className="h-9 w-20 sm:w-24 rounded-lg" />
                            <Skeleton className="h-10 w-10 rounded-xl" />
                            <Skeleton className="h-6 w-12" />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Skeleton */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <Skeleton className="h-10 w-64 mb-2" />
                    <Skeleton className="h-5 w-80" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                            <Skeleton className="w-12 h-12 rounded-xl mb-4" />
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-8 w-16" />
                        </div>
                    ))}
                </div>

                {/* Students Section Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Skeleton className="h-8 w-48 mb-1" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-11 w-40 rounded-xl" />
                </div>

                {/* Students Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                                <Skeleton className="w-12 h-12 rounded-xl" />
                            </div>
                            <div className="mb-4">
                                <div className="flex justify-between mb-2">
                                    <Skeleton className="h-3 w-12" />
                                    <Skeleton className="h-3 w-8" />
                                </div>
                                <Skeleton className="h-2 w-full rounded-full" />
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                                <Skeleton className="h-8 w-12" />
                                <Skeleton className="h-8 w-12" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
