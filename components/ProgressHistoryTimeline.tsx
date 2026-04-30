'use client'

import { Clock, TrendingUp, Trash2 } from "lucide-react"
import { deleteProgressNote } from "@/app/actions/progress"
import { useState } from "react"
import ConfirmDialog from "./ConfirmDialog"

type ProgressNote = {
    id: string
    studentSongId: string
    leftHand: number
    rightHand: number
    bothHands: number
    note: string | null
    date: Date
}

type ProgressHistoryTimelineProps = {
    progressHistory: ProgressNote[]
    onUpdate: () => void
    onEdit: (progress: ProgressNote) => void
}

import { Edit3 } from "lucide-react"

export default function ProgressHistoryTimeline({ progressHistory, onUpdate, onEdit }: ProgressHistoryTimelineProps) {
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!deleteId) return

        setIsDeleting(true)
        const result = await deleteProgressNote(deleteId)
        setIsDeleting(false)

        if (result.success) {
            setDeleteId(null)
            onUpdate()
        } else {
            alert(result.error || "Error al eliminar la nota")
        }
    }

    const formatDate = (date: Date) => {
        const d = new Date(date)
        return d.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const formatTime = (date: Date) => {
        const d = new Date(date)
        return d.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (progressHistory.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Sin notas de progreso aún
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Agrega tu primera nota para comenzar a registrar el avance
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
                {progressHistory.map((progress, index) => (
                    <div
                        key={progress.id}
                        className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl p-3 sm:p-4 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-lg transition-all duration-300"
                    >
                        {/* Timeline connector */}
                        {index < progressHistory.length - 1 && (
                            <div className="absolute left-5 sm:left-6 top-full w-0.5 h-4 bg-gradient-to-b from-indigo-200 to-transparent dark:from-indigo-900/30 dark:to-transparent" />
                        )}

                        {/* Header with date and actions */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                                        {formatDate(progress.date)}
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                                        {formatTime(progress.date)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onEdit(progress)}
                                    className="p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                                    title="Editar nota"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setDeleteId(progress.id)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                    title="Eliminar nota"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Progress bars */}
                        <div className="space-y-2 mb-3">
                            <ProgressBar
                                label="Mano Izquierda"
                                value={progress.leftHand}
                                color="from-blue-400 to-blue-600"
                            />
                            <ProgressBar
                                label="Mano Derecha"
                                value={progress.rightHand}
                                color="from-green-400 to-green-600"
                            />
                            <ProgressBar
                                label="Ambas Manos"
                                value={progress.bothHands}
                                color="from-purple-400 to-purple-600"
                            />
                        </div>

                        {/* Note */}
                        {progress.note && (
                            <div className="bg-white dark:bg-gray-700/50 rounded-lg p-3 border border-gray-100 dark:border-gray-600">
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {progress.note}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <ConfirmDialog
                isOpen={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Eliminar nota de progreso"
                message="¿Estás seguro de que deseas eliminar esta nota? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                isLoading={isDeleting}
            />
        </>
    )
}

function ProgressBar({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{value}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                    className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    )
}
