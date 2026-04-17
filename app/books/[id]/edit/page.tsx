import { getBookTemplate } from "@/app/actions/book-template"
import { BookTemplateForm } from "@/components/BookTemplateForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function EditBookPage({
    params,
}: {
    params: { id: string }
}) {
    const result = await getBookTemplate(params.id)

    if (!result.success || !result.data) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/books/${params.id}`}
                        className="inline-flex items-center gap-2 text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver a Detalles
                    </Link>
                    <h1 className="text-4xl font-bold text-slate-800 dark:text-gray-100 mb-2">
                        Editar Libro
                    </h1>
                    <p className="text-slate-600 dark:text-gray-400 text-lg">
                        Modifica la información del libro global
                    </p>
                </div>

                {/* Form */}
                <BookTemplateForm initialData={result.data} isEdit />
            </div>
        </div>
    )
}
