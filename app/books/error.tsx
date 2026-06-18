'use client'

import { useEffect } from 'react'

export default function BooksError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Error al cargar libros
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    No se pudieron cargar los datos. Intenta de nuevo.
                </p>
                <button
                    onClick={reset}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium"
                >
                    Intentar de nuevo
                </button>
            </div>
        </div>
    )
}
