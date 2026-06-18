import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center p-8">
                <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Página no encontrada
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    La página que buscas no existe o ha sido movida.
                </p>
                <Link
                    href="/dashboard"
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium inline-block"
                >
                    Volver al Dashboard
                </Link>
            </div>
        </div>
    )
}
