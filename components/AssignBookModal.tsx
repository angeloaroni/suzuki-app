'use client'

import { useState, useEffect } from 'react'
import { X, BookOpen, Check } from 'lucide-react'
import { assignBookToStudent, getAvailableBooksForStudent } from '@/app/actions/book-assignment'

interface BookTemplate {
    id: string
    title: string
    number: number
    coverImage?: string | null
    songs: Array<{ id: string; title: string; order: number }>
}

interface AssignBookModalProps {
    isOpen: boolean
    onClose: () => void
    studentId: string
    studentName: string
}

export default function AssignBookModal({ isOpen, onClose, studentId, studentName }: AssignBookModalProps) {
    const [availableBooks, setAvailableBooks] = useState<BookTemplate[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (isOpen) {
            loadAvailableBooks()
        }
    }, [isOpen, studentId])

    const loadAvailableBooks = async () => {
        const result = await getAvailableBooksForStudent(studentId)
        if (result.success) {
            setAvailableBooks(result.data)
        }
    }

    const handleAssignBook = async (bookTemplateId: string) => {
        setLoading(true)
        setError(null)
        setSuccess(false)

        const result = await assignBookToStudent(studentId, bookTemplateId)

        if (result.success) {
            setSuccess(true)
            setTimeout(() => {
                onClose()
                window.location.reload() // Refresh to show new book
            }, 1000)
        } else {
            setError(result.error || 'Error al asignar el libro')
        }

        setLoading(false)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">Asignar Libro</h3>
                            <p className="text-sm text-gray-600 mt-1">Para {studentName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-2">
                            <Check className="w-5 h-5" />
                            ¡Libro asignado exitosamente!
                        </div>
                    )}

                    {availableBooks.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600">No hay libros disponibles para asignar</p>
                            <p className="text-sm text-gray-500 mt-2">Todos los libros ya han sido asignados a este estudiante</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {availableBooks.map((book) => (
                                <button
                                    key={book.id}
                                    onClick={() => handleAssignBook(book.id)}
                                    disabled={loading}
                                    className="group text-left p-6 border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <BookOpen className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900 mb-1">{book.title}</h4>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {book.songs.length} canciones incluidas
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {book.songs.slice(0, 3).map((song, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg"
                                                    >
                                                        {song.title}
                                                    </span>
                                                ))}
                                                {book.songs.length > 3 && (
                                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">
                                                        +{book.songs.length - 3} más
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 p-6">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}
