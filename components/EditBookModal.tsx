'use client'

import { useState } from 'react'
import { X, BookOpen, Trash2, Check } from 'lucide-react'
import { updateBookTemplate } from '@/app/actions/book-template'
import { removeBookFromStudent } from '@/app/actions/book-assignment'
import ConfirmDialog from './ConfirmDialog'

interface EditBookModalProps {
    isOpen: boolean
    onClose: () => void
    book: {
        id: string
        templateId: string
        title: string
        number: number
        songCount: number
    }
}

export default function EditBookModal({ isOpen, onClose, book }: EditBookModalProps) {
    const [formData, setFormData] = useState({
        title: book.title,
        number: book.number
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)

        const result = await updateBookTemplate(book.templateId, {
            title: formData.title,
            number: formData.number
        })

        if (result.success) {
            setSuccess(true)
            setTimeout(() => {
                onClose()
                window.location.reload()
            }, 1000)
        } else {
            setError(result.error || 'Error al actualizar el libro')
        }

        setLoading(false)
    }

    const handleDelete = async () => {
        setLoading(true)
        setError(null)

        const result = await removeBookFromStudent(book.id)

        if (result.success) {
            window.location.reload()
        } else {
            setError(result.error || 'Error al eliminar el libro')
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Editar Libro</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-2 text-sm">
                                <Check className="w-5 h-5" />
                                ¡Libro actualizado exitosamente!
                            </div>
                        )}

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Título del Libro
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                required
                            />
                        </div>

                        {/* Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Número del Libro
                            </label>
                            <input
                                type="number"
                                value={formData.number}
                                onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                min="1"
                                required
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>

                    {/* Delete Section */}
                    <div className="border-t border-gray-100 p-6">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <h4 className="font-semibold text-red-900 mb-2">Zona de Peligro</h4>
                            <p className="text-sm text-red-700 mb-4">
                                Eliminar este libro también eliminará todas las {book.songCount} canciones asociadas. Esta acción no se puede deshacer.
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={loading}
                                className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Eliminar Libro
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="¿Eliminar Libro?"
                message={`¿Estás seguro de que deseas eliminar "${book.title}"? Esto también eliminará todas las ${book.songCount} canciones asociadas. Esta acción no se puede deshacer.`}
                confirmText="Sí, Eliminar"
                cancelText="Cancelar"
                variant="danger"
            />
        </>
    )
}
