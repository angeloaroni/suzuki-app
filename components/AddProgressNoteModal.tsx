'use client'

import { useState } from "react"
import { createProgressNote } from "@/app/actions/progress"
import { X, Save, TrendingUp } from "lucide-react"

type AddProgressNoteModalProps = {
    songId: string
    songTitle: string
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function AddProgressNoteModal({
    songId,
    songTitle,
    isOpen,
    onClose,
    onSuccess
}: AddProgressNoteModalProps) {
    const [leftHand, setLeftHand] = useState(0)
    const [rightHand, setRightHand] = useState(0)
    const [bothHands, setBothHands] = useState(0)
    const [note, setNote] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        const result = await createProgressNote({
            studentSongId: songId,
            leftHand,
            rightHand,
            bothHands,
            note: note.trim() || undefined
        })

        setIsSaving(false)

        if (result.success) {
            // Reset form
            setLeftHand(0)
            setRightHand(0)
            setBothHands(0)
            setNote("")
            onSuccess()
            onClose()
        } else {
            alert(result.error || "Error al guardar la nota")
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Nueva Nota de Progreso</h2>
                                <p className="text-indigo-100 text-sm mt-1">{songTitle}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            disabled={isSaving}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Progress Sliders */}
                    <div className="space-y-5">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Nivel de Progreso
                        </h3>

                        <SliderInput
                            label="Mano Izquierda"
                            value={leftHand}
                            onChange={setLeftHand}
                            color="blue"
                        />

                        <SliderInput
                            label="Mano Derecha"
                            value={rightHand}
                            onChange={setRightHand}
                            color="green"
                        />

                        <SliderInput
                            label="Ambas Manos"
                            value={bothHands}
                            onChange={setBothHands}
                            color="purple"
                        />
                    </div>

                    {/* Note textarea */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Notas y Observaciones
                            <span className="text-gray-400 font-normal ml-2">(opcional)</span>
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Escribe observaciones sobre la práctica, dificultades encontradas, logros, etc..."
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-400"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {note.length} caracteres
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Guardar Nota
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function SliderInput({
    label,
    value,
    onChange,
    color
}: {
    label: string
    value: number
    onChange: (value: number) => void
    color: 'blue' | 'green' | 'purple'
}) {
    const colorClasses = {
        blue: 'from-blue-400 to-blue-600',
        green: 'from-green-400 to-green-600',
        purple: 'from-purple-400 to-purple-600'
    }

    const thumbColors = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500'
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">{label}</label>
                <span className="text-lg font-bold text-gray-900 min-w-[3rem] text-right">
                    {value}%
                </span>
            </div>
            <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full transition-all duration-200`}
                        style={{ width: `${value}%` }}
                    />
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
                />
            </div>
        </div>
    )
}
