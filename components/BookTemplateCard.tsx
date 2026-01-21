"use client"

import Link from "next/link"
import { BookOpen, Music, Users, Edit, Trash2 } from "lucide-react"
import { useState } from "react"
import { deleteBookTemplate } from "@/app/actions/book-template"
import { useRouter } from "next/navigation"

interface BookTemplateCardProps {
    template: {
        id: string
        title: string
        number: number
        coverImage?: string | null
        songs?: Array<{ id: string; title: string }>
        _count?: {
            assignments: number
        }
    }
}

export function BookTemplateCard({ template }: BookTemplateCardProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        setIsDeleting(true)
        const result = await deleteBookTemplate(template.id)

        if (result.success) {
            router.refresh()
        } else {
            alert(result.error)
            setIsDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    const assignmentCount = template._count?.assignments || 0
    const songCount = template.songs?.length || 0

    return (
        <>
            <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-gray-700 overflow-hidden transform hover:-translate-y-1">
                {/* Cover Image or Placeholder */}
                <div className="relative h-48 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden">
                    {template.coverImage ? (
                        <img
                            src={template.coverImage}
                            alt={template.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center text-white">
                                <BookOpen className="w-16 h-16 mx-auto mb-2 opacity-80" />
                                <p className="text-6xl font-bold opacity-90">{template.number}</p>
                            </div>
                        </div>
                    )}

                    {/* Number Badge */}
                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">Vol. {template.number}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 line-clamp-2">
                        {template.title}
                    </h3>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-gray-400">
                            <Music className="w-4 h-4" />
                            <span>{songCount} {songCount === 1 ? 'canción' : 'canciones'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-gray-400">
                            <Users className="w-4 h-4" />
                            <span>{assignmentCount} {assignmentCount === 1 ? 'estudiante' : 'estudiantes'}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Link
                            href={`/books/${template.id}`}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-center font-medium"
                        >
                            Ver Detalles
                        </Link>
                        <Link
                            href={`/books/${template.id}/edit`}
                            className="px-4 py-2 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            <Edit className="w-4 h-4" />
                        </Link>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                            disabled={isDeleting}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                            ¿Eliminar libro?
                        </h3>
                        <p className="text-slate-600 dark:text-gray-400 mb-6">
                            ¿Estás seguro de que quieres eliminar "{template.title}"?
                            {assignmentCount > 0 && (
                                <span className="block mt-2 text-red-600 dark:text-red-400 font-medium">
                                    Este libro está asignado a {assignmentCount} estudiante(s).
                                </span>
                            )}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors font-medium"
                                disabled={isDeleting}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Eliminando..." : "Eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
        </>
    )
}
