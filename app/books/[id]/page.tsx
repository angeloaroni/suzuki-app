import { getBookTemplate } from "@/app/actions/book-template"
import { ArrowLeft, Edit, Music, Users, BookOpen } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { SongTemplateList } from "@/components/SongTemplateList"

export default async function BookDetailPage({
    params,
}: {
    params: { id: string }
}) {
    const result = await getBookTemplate(params.id)

    if (!result.success || !result.data) {
        notFound()
    }

    const template = result.data

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/books"
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver a Biblioteca
                    </Link>
                </div>

                {/* Book Info Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border border-slate-200">
                    <div className="md:flex">
                        {/* Cover */}
                        <div className="md:w-1/3 h-64 md:h-auto bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative">
                            {template.coverImage ? (
                                <img
                                    src={template.coverImage}
                                    alt={template.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-center text-white">
                                        <BookOpen className="w-20 h-20 mx-auto mb-3 opacity-80" />
                                        <p className="text-7xl font-bold opacity-90">{template.number}</p>
                                    </div>
                                </div>
                            )}
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
                                <span className="text-sm font-bold text-indigo-600">Vol. {template.number}</span>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="md:w-2/3 p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-800 mb-2">
                                        {template.title}
                                    </h1>
                                    <p className="text-slate-600">
                                        Libro global • Volumen {template.number}
                                    </p>
                                </div>
                                <Link
                                    href={`/books/${template.id}/edit`}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    Editar
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-indigo-50 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                            <Music className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-slate-800">
                                                {template.songs.length}
                                            </p>
                                            <p className="text-sm text-slate-600">
                                                {template.songs.length === 1 ? 'Canción' : 'Canciones'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-purple-50 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Users className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-slate-800">
                                                {template.assignments.length}
                                            </p>
                                            <p className="text-sm text-slate-600">
                                                {template.assignments.length === 1 ? 'Estudiante' : 'Estudiantes'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Assigned Students */}
                            {template.assignments.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-sm font-semibold text-slate-700 mb-3">
                                        Asignado a:
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {template.assignments.map((assignment) => (
                                            <Link
                                                key={assignment.id}
                                                href={`/students/${assignment.student.id}`}
                                                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm hover:bg-slate-200 transition-colors"
                                            >
                                                {assignment.student.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Songs List */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                        <Music className="w-6 h-6 text-indigo-600" />
                        Canciones
                    </h2>
                    <SongTemplateList
                        bookTemplateId={template.id}
                        songs={template.songs}
                    />
                </div>
            </div>
        </div>
    )
}
