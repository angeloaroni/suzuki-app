import { getBookTemplates } from "@/app/actions/book-template"
import { BookTemplateCard } from "@/components/BookTemplateCard"
import Link from "next/link"
import { PlusCircle, BookOpen } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function BooksPage() {
    const result = await getBookTemplates()
    const templates = result.data || []

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                                <BookOpen className="w-10 h-10 text-indigo-600" />
                                Biblioteca de Libros
                            </h1>
                            <p className="text-slate-600 text-lg">
                                Gestiona tus plantillas de libros globales
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 px-4 py-3 bg-white text-slate-600 rounded-xl hover:bg-slate-50 border border-slate-200 transition-all font-medium"
                            >
                                Volver al Dashboard
                            </Link>
                            <Link
                                href="/books/new"
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                <PlusCircle className="w-5 h-5" />
                                Nuevo Libro
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-600 text-sm font-medium">Total Libros</p>
                                <p className="text-3xl font-bold text-slate-800 mt-1">{templates.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-600 text-sm font-medium">Total Canciones</p>
                                <p className="text-3xl font-bold text-slate-800 mt-1">
                                    {templates.reduce((sum, t) => sum + (t.songs?.length || 0), 0)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-600 text-sm font-medium">Asignaciones</p>
                                <p className="text-3xl font-bold text-slate-800 mt-1">
                                    {templates.reduce((sum, t) => sum + (t._count?.assignments || 0), 0)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Books Grid */}
                {templates.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-md border border-slate-200">
                        <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">
                            No hay libros todavía
                        </h3>
                        <p className="text-slate-500 mb-6">
                            Crea tu primer libro global para empezar a asignar a estudiantes
                        </p>
                        <Link
                            href="/books/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                        >
                            <PlusCircle className="w-5 h-5" />
                            Crear Primer Libro
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map((template) => (
                            <BookTemplateCard key={template.id} template={template} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
