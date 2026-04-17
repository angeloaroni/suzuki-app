"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { checkBookNumberAvailability, createBookTemplate, updateBookTemplate } from "@/app/actions/book-template"
import { PlusCircle, X, GripVertical, Save, Image as ImageIcon, Upload, Link as LinkIcon } from "lucide-react"

interface Song {
    title: string
    order: number
    id?: string
}

interface BookTemplateFormProps {
    initialData?: {
        id: string
        title: string
        number: number
        coverImage?: string | null
        songs: Array<{ id: string; title: string; order: number }>
    }
    isEdit?: boolean
    initialNumber?: number
}

export function BookTemplateForm({ initialData, isEdit = false, initialNumber = 1 }: BookTemplateFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    // Validation state
    const [numberError, setNumberError] = useState("")
    const [checkingNumber, setCheckingNumber] = useState(false)

    // Form state
    const [title, setTitle] = useState(initialData?.title || "")
    const [number, setNumber] = useState(initialData?.number || initialNumber)
    const [coverImage, setCoverImage] = useState(initialData?.coverImage || "")
    const [imageMode, setImageMode] = useState<'url' | 'upload'>('url')
    const [uploading, setUploading] = useState(false)
    const [songs, setSongs] = useState<Song[]>(
        initialData?.songs || [{ title: "", order: 1 }]
    )

    const addSong = () => {
        setSongs([...songs, { title: "", order: songs.length + 1 }])
    }

    const removeSong = (index: number) => {
        const newSongs = songs.filter((_, i) => i !== index)
        // Reorder
        setSongs(newSongs.map((song, i) => ({ ...song, order: i + 1 })))
    }

    const updateSong = (index: number, title: string) => {
        const newSongs = [...songs]
        newSongs[index] = { ...newSongs[index], title }
        setSongs(newSongs)
    }

    const moveSong = (index: number, direction: "up" | "down") => {
        if (
            (direction === "up" && index === 0) ||
            (direction === "down" && index === songs.length - 1)
        ) {
            return
        }

        const newSongs = [...songs]
        const targetIndex = direction === "up" ? index - 1 : index + 1
            ;[newSongs[index], newSongs[targetIndex]] = [newSongs[targetIndex], newSongs[index]]

        // Reorder
        setSongs(newSongs.map((song, i) => ({ ...song, order: i + 1 })))
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        setError("")

        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Error al subir imagen")
            }

            setCoverImage(data.url)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setUploading(false)
        }
    }
    // ... (keep other state)

    // Check number availability
    useEffect(() => {
        const checkNumber = async () => {
            if (!number || number < 1) return

            // Don't check if it's the same number as initial (edit mode)
            if (isEdit && initialData && number === initialData.number) {
                setNumberError("")
                return
            }

            setCheckingNumber(true)
            setNumberError("")

            const result = await checkBookNumberAvailability(number, initialData?.id)
            if (result.success && !result.available) {
                setNumberError("Este número de volumen ya está en uso")
            }
            setCheckingNumber(false)
        }

        const timer = setTimeout(checkNumber, 500)
        return () => clearTimeout(timer)
    }, [number, isEdit, initialData])

    // ... (keep handlers)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsSubmitting(true)

        // Validation
        if (!title.trim()) {
            setError("El título es requerido")
            setIsSubmitting(false)
            return
        }

        if (number < 1) {
            setError("El número debe ser mayor a 0")
            setIsSubmitting(false)
            return
        }

        if (numberError) {
            setError("Por favor corrige los errores antes de guardar")
            setIsSubmitting(false)
            return
        }

        // ... (keep rest of submit logic)
        const validSongs = songs.filter(s => s.title.trim())
        if (validSongs.length === 0) {
            setError("Debes agregar al menos una canción")
            setIsSubmitting(false)
            return
        }

        try {
            if (isEdit && initialData) {
                // Update only book info (songs are managed separately)
                const result = await updateBookTemplate(initialData.id, {
                    title,
                    number,
                    coverImage: coverImage || undefined
                })

                if (!result.success) {
                    setError(result.error || "Error al actualizar")
                    setIsSubmitting(false)
                    return
                }

                router.push(`/books/${initialData.id}`)
            } else {
                // Create new book
                const result = await createBookTemplate({
                    title,
                    number,
                    coverImage: coverImage || undefined,
                    songs: validSongs
                })

                if (!result.success) {
                    setError(result.error || "Error al crear")
                    setIsSubmitting(false)
                    return
                }

                router.push("/books")
            }

            router.refresh()
        } catch (err) {
            setError("Error inesperado")
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-gray-700 transition-colors">
            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium">
                    {error}
                </div>
            )}

            {/* Basic Info */}
            <div className="space-y-6 mb-8">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">
                        Título del Libro
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white bg-white dark:bg-gray-700"
                        placeholder="Ej: Suzuki Piano School Vol. 1"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">
                        Número de Volumen
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={number}
                            onChange={(e) => setNumber(parseInt(e.target.value) || 0)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all text-slate-900 dark:text-white bg-white dark:bg-gray-700 ${numberError
                                ? 'border-red-300 focus:ring-red-500 dark:bg-red-900/20'
                                : 'border-slate-300 dark:border-gray-600 focus:ring-indigo-500'
                                }`}
                            min="1"
                            required
                        />
                        {checkingNumber && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                            </div>
                        )}
                    </div>
                    {numberError && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400 font-medium">
                            {numberError}
                        </p>
                    )}
                </div>


                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2">
                        Imagen de Portada
                    </label>

                    <div className="flex gap-2 mb-3">
                        <button
                            type="button"
                            onClick={() => setImageMode('url')}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${imageMode === 'url'
                                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                : 'bg-slate-50 dark:bg-gray-700 text-slate-600 dark:text-gray-300 border border-slate-200 dark:border-gray-600 hover:bg-slate-100 dark:hover:bg-gray-600'
                                }`}
                        >
                            <LinkIcon className="w-4 h-4" />
                            URL Externa
                        </button>
                        <button
                            type="button"
                            onClick={() => setImageMode('upload')}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${imageMode === 'upload'
                                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                : 'bg-slate-50 dark:bg-gray-700 text-slate-600 dark:text-gray-300 border border-slate-200 dark:border-gray-600 hover:bg-slate-100 dark:hover:bg-gray-600'
                                }`}
                        >
                            <Upload className="w-4 h-4" />
                            Subir Imagen
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            {imageMode === 'url' ? (
                                <>
                                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-500" />
                                    <input
                                        type="url"
                                        value={coverImage}
                                        onChange={(e) => setCoverImage(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white bg-white dark:bg-gray-700"
                                        placeholder="https://ejemplo.com/portada.jpg"
                                    />
                                </>
                            ) : (
                                <div className="border-2 border-dashed border-slate-300 dark:border-gray-600 rounded-lg p-4 text-center hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={uploading}
                                    />
                                    <div className="flex flex-col items-center gap-2">
                                        {uploading ? (
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                                        ) : (
                                            <Upload className="w-6 h-6 text-slate-400 dark:text-gray-500" />
                                        )}
                                        <p className="text-sm text-slate-600 dark:text-gray-400">
                                            {uploading ? "Subiendo..." : "Click o arrastra para subir imagen"}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        {coverImage && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-300 dark:border-gray-600 relative group">
                                <img src={coverImage} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setCoverImage("")}
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Songs */}
            {!isEdit && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300">
                            Canciones
                        </label>
                        <button
                            type="button"
                            onClick={addSong}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Añadir Canción
                        </button>
                    </div>

                    <div className="space-y-2">
                        {songs.map((song, index) => (
                            <div key={index} className="flex items-center gap-2 group">
                                <div className="flex flex-col gap-1">
                                    <button
                                        type="button"
                                        onClick={() => moveSong(index, "up")}
                                        disabled={index === 0}
                                        className="p-1 hover:bg-slate-100 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <GripVertical className="w-4 h-4 text-slate-400 dark:text-gray-500 rotate-90" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveSong(index, "down")}
                                        disabled={index === songs.length - 1}
                                        className="p-1 hover:bg-slate-100 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <GripVertical className="w-4 h-4 text-slate-400 dark:text-gray-500 -rotate-90" />
                                    </button>
                                </div>

                                <span className="text-sm font-medium text-slate-500 dark:text-gray-400 w-8">
                                    {index + 1}.
                                </span>

                                <input
                                    type="text"
                                    value={song.title}
                                    onChange={(e) => updateSong(index, e.target.value)}
                                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 dark:text-white bg-white dark:bg-gray-700"
                                    placeholder="Título de la canción"
                                />

                                <button
                                    type="button"
                                    onClick={() => removeSong(index)}
                                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    disabled={songs.length === 1}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {isEdit && (
                        <p className="text-sm text-slate-500 dark:text-gray-400 mt-4">
                            Las canciones se gestionan desde la página de detalles del libro
                        </p>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-6 py-3 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors font-medium border border-transparent dark:border-gray-600"
                    disabled={isSubmitting}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                >
                    <Save className="w-5 h-5" />
                    {isSubmitting ? "Guardando..." : isEdit ? "Guardar Cambios" : "Crear Libro"}
                </button>
            </div>
        </form>
    )
}
