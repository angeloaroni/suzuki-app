'use client'

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { updateStudent, deleteStudent } from "@/app/actions/student"
import { ArrowLeft, User, Calendar, FileText, Loader2, Trash2, AlertTriangle } from "lucide-react"

interface Student {
    id: string
    name: string
    dob: Date | null
    notes: string | null
}

export default function EditStudentPage({ student }: { student: Student }) {
    const [isLoading, setIsLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const data = {
            name: formData.get('name') as string,
            dob: formData.get('dob') as string,
            notes: formData.get('notes') as string
        }

        try {
            const result = await updateStudent(student.id, data)

            if (result.error) {
                throw new Error(result.error)
            }

            router.push(`/students/${student.id}`)
            router.refresh()
        } catch (e: any) {
            console.error("Error en submit:", e)
            setError(e.message || "Error al actualizar el estudiante.")
            setIsLoading(false)
        }
    }

    async function handleDelete() {
        setIsDeleting(true)
        setError(null)

        try {
            const result = await deleteStudent(student.id)

            if (result.error) {
                throw new Error(result.error)
            }

            router.push('/dashboard')
            router.refresh()
        } catch (e: any) {
            console.error("Error al eliminar:", e)
            setError(e.message || "Error al eliminar el estudiante.")
            setIsDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    const dobString = student.dob ? new Date(student.dob).toISOString().split('T')[0] : ''

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="max-w-3xl mx-auto px-6 py-12">
                {/* Back Button */}
                <Link
                    href={`/students/${student.id}`}
                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-8 group transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Volver al Estudiante
                </Link>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-1">
                                    Editar Estudiante
                                </h1>
                                <p className="text-indigo-100">
                                    Actualiza la información de {student.name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-start gap-3">
                                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <p className="font-medium">Error</p>
                                    <p className="text-sm mt-1">{error}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name Field */}
                            <div>
                                <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <User className="w-4 h-4 text-indigo-600" />
                                    Nombre del Alumno
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    defaultValue={student.name}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-gray-900 placeholder-gray-400"
                                    placeholder="Ej. Juan Pérez"
                                />
                            </div>

                            {/* Date of Birth Field */}
                            <div>
                                <label htmlFor="dob" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4 text-indigo-600" />
                                    Fecha de Nacimiento
                                </label>
                                <input
                                    type="date"
                                    name="dob"
                                    id="dob"
                                    defaultValue={dobString}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-gray-900"
                                />
                            </div>

                            {/* Notes Field */}
                            <div>
                                <label htmlFor="notes" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <FileText className="w-4 h-4 text-indigo-600" />
                                    Notas
                                </label>
                                <textarea
                                    name="notes"
                                    id="notes"
                                    rows={4}
                                    defaultValue={student.notes || ''}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-gray-900 placeholder-gray-400 resize-none"
                                    placeholder="Observaciones sobre el alumno..."
                                />
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-4 pt-4">
                                <Link
                                    href={`/students/${student.id}`}
                                    className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium text-center"
                                >
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <User className="w-5 h-5" />
                                            Guardar Cambios
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-8 bg-red-50 border-2 border-red-200 rounded-3xl p-8">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-red-900 mb-2">Zona de Peligro</h3>
                            <p className="text-sm text-red-700 mb-4">
                                Eliminar este estudiante borrará permanentemente toda su información, incluyendo su progreso en todas las canciones y libros. Esta acción no se puede deshacer.
                            </p>

                            {!showDeleteConfirm ? (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium flex items-center gap-2"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    Eliminar Estudiante
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-sm font-semibold text-red-900">
                                        ¿Estás seguro? Esta acción es irreversible.
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="px-5 py-2.5 bg-white border-2 border-red-200 text-red-700 rounded-xl hover:bg-red-50 transition-all font-medium"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                            className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isDeleting ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Eliminando...
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 className="w-5 h-5" />
                                                    Sí, Eliminar Permanentemente
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
