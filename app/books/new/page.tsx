import { BookTemplateForm } from "@/components/BookTemplateForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getNextBookNumber } from "@/app/actions/book-template"

export const dynamic = 'force-dynamic'

export default async function NewBookPage() {
    const result = await getNextBookNumber()
    const nextNumber = result.data || 1

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/books"
                        className="inline-flex items-center gap-2 text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver a Biblioteca
                    </Link>
                    <h1 className="text-4xl font-bold text-slate-800 dark:text-gray-100 mb-2">
                        Crear Nuevo Libro
                    </h1>
                    <p className="text-slate-600 dark:text-gray-400 text-lg">
                        Crea una plantilla de libro global que podrás asignar a tus estudiantes
                    </p>
                </div>

                {/* Form */}
                <BookTemplateForm initialNumber={nextNumber} />
            </div>
        </div>
    )
}
