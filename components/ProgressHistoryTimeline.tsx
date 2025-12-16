'use client'

import { Clock, TrendingUp, Trash2 } from "lucide-react"
import { deleteProgressNote } from "@/app/actions/progress"
import { useState } from "react"
import ConfirmDialog from "./ConfirmDialog"

type ProgressNote = {
    id: string
    songId: string
    leftHand: number
    rightHand: number
    bothHands: number
    note: string | null
    date: Date
}

type ProgressHistoryTimelineProps = {
    progressHistory: ProgressNote[]
    onUpdate: () => void
}

export default function ProgressHistoryTimeline({ progressHistory, onUpdate }: ProgressHistoryTimelineProps) {
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
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Sin notas de progreso aún
                </h3>
                <p className="text-sm text-gray-500">
                    Agrega tu primera nota para comenzar a registrar el avance
                </p>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {progressHistory.map((progress, index) => (
                    <div
                        key={progress.id}
                        className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all duration-200"
                    >
                        {/* Timeline connector */}
                        {index < progressHistory.length - 1 && (
                            <div className="absolute left-6 top-full w-0.5 h-4 bg-gradient-to-b from-indigo-200 to-transparent" />
                        )}

                        {/* Header with date and delete button */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                                    <Clock className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {formatDate(progress.date)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {formatTime(progress.date)}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setDeleteId(progress.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Eliminar nota"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
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
                            <div className="bg-white rounded-lg p-3 border border-gray-100">
                                <p className="text-sm text-gray-700 leading-relaxed">
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
                <span className="text-xs font-medium text-gray-600">{label}</span>
                <span className="text-xs font-bold text-gray-900">{value}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                    className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    )
}
