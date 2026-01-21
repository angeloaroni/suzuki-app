'use client'

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createStudent } from "@/app/actions/student"
import { ArrowLeft, User, Calendar, FileText, Loader2 } from "lucide-react"

export default function NewStudentPage() {
    const [isLoading, setIsLoading] = useState(false)
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
            const result = await createStudent(data)

            if (result.error) {
                throw new Error(result.error)
            }

            router.push('/dashboard')
            router.refresh()
        } catch (e: any) {
            console.error("Error en submit:", e)
            setError(e.message || "Error al crear el estudiante.")
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 transition-colors duration-500">
            <div className="max-w-3xl mx-auto px-6 py-12">
                {/* Back Button */}
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium mb-8 group transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Volver al Dashboard
                </Link>

                {/* Main Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-1">
                                    Registrar Nuevo Alumno
                                </h1>
                                <p className="text-indigo-100">
                                    Completa la información del estudiante
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 flex items-start gap-3">
                                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <p className="font-medium">Error al crear estudiante</p>
                                    <p className="text-sm mt-1">{error}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name Field */}
                            <div>
                                <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    Nombre del Alumno
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
                                    placeholder="Ej. Juan Pérez"
                                />
                            </div>

                            {/* Date of Birth Field */}
                            <div>
                                <label htmlFor="dob" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    Fecha de Nacimiento
                                </label>
                                <input
                                    type="date"
                                    name="dob"
                                    id="dob"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all outline-none text-gray-900 dark:text-gray-100"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Opcional - Nos ayuda a personalizar el aprendizaje</p>
                            </div>

                            {/* Notes Field */}
                            <div>
                                <label htmlFor="notes" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    Notas Iniciales
                                </label>
                                <textarea
                                    name="notes"
                                    id="notes"
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 resize-none"
                                    placeholder="Observaciones sobre el alumno, nivel inicial, objetivos..."
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Opcional - Añade cualquier información relevante</p>
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-4 pt-4">
                                <Link
                                    href="/dashboard"
                                    className="flex-1 px-6 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium text-center"
                                >
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl hover:shadow-indigo-300 dark:hover:shadow-indigo-900/30 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <User className="w-5 h-5" />
                                            Guardar Alumno
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Info Card */}
                <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-6">
                    <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        ¿Qué sucede después?
                    </h3>
                    <ul className="text-sm text-indigo-800 dark:text-indigo-400 space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-600 dark:text-indigo-500 mt-0.5">•</span>
                            <span>Se asignará automáticamente el <strong>Libro 1</strong> del método Suzuki</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-600 dark:text-indigo-500 mt-0.5">•</span>
                            <span>Podrás empezar a seguir el progreso de cada pieza musical</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-600 dark:text-indigo-500 mt-0.5">•</span>
                            <span>Registrar el avance de mano izquierda, derecha y ambas manos</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

