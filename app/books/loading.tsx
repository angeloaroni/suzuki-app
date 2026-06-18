export default function BooksLoading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="animate-pulse">
                    <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
                                <div className="h-40 w-full bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
