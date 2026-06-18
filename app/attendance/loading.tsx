export default function AttendanceLoading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="animate-pulse">
                    <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                    <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8"></div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
                        <div className="h-64 w-full bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
