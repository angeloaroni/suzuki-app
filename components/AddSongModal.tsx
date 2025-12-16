'use client'

import { useState } from 'react'
import { X, Music, Check } from 'lucide-react'
import { createCustomSong } from '@/app/actions/song'

interface AddSongModalProps {
    isOpen: boolean
    onClose: () => void
    bookId: string
    bookTitle: string
    nextOrder: number
}

export default function AddSongModal({ isOpen, onClose, bookId, bookTitle, nextOrder }: AddSongModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        order: nextOrder,
        notes: '',
        youtubeUrl: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)

        if (!formData.title.trim()) {
            setError('El título es obligatorio')
            setLoading(false)
            return
        }

        const result = await createCustomSong(bookId, {
            title: formData.title,
            order: formData.order,
            notes: formData.notes || undefined,
            youtubeUrl: formData.youtubeUrl || undefined
        })

        if (result.success) {
            setSuccess(true)
            setTimeout(() => {
                onClose()
                window.location.reload()
            }, 1000)
        } else {
            setError(result.error || 'Error al crear la canción')
        }

        setLoading(false)
    }

    const handleClose = () => {
        setFormData({
            title: '',
            order: nextOrder,
            notes: '',
            youtubeUrl: ''
        })
        setError(null)
        setSuccess(false)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Agregar Canción</h3>
                        <p className="text-sm text-gray-600 mt-1">A {bookTitle}</p>
                    </div>
                    <button
                        onClick={handleClose}
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
                            ¡Canción creada exitosamente!
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Título de la Canción *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            placeholder="Ej: Minuet in G"
                            required
                        />
                    </div>

                    {/* Order */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Orden
                        </label>
                        <input
                            type="number"
                            value={formData.order}
                            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            min="1"
                        />
                        <p className="text-xs text-gray-500 mt-1">Posición de la canción en el libro</p>
                    </div>

                    {/* YouTube URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            URL de YouTube (opcional)
                        </label>
                        <input
                            type="url"
                            value={formData.youtubeUrl}
                            onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            placeholder="https://youtube.com/watch?v=..."
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notas (opcional)
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                            rows={3}
                            placeholder="Notas sobre la canción..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Music className="w-4 h-4" />
                            {loading ? 'Creando...' : 'Crear Canción'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
