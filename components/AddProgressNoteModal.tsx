'use client'

import { useState, useEffect } from "react"
import { createProgressNote, updateProgressNote } from "@/app/actions/progress"
import { X, Save, TrendingUp, Edit3 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getInstrumentLabels } from '@/lib/instrument-labels'

type AddProgressNoteModalProps = {
    songId: string
    songTitle: string
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    instrument?: string
    initialData?: {
        id: string
        metric1: number
        metric2: number
        metric3: number
        note: string | null
    }
}

const QUICK_PHRASES = [
    "¡Excelente postura!",
    "Repasar ritmo lento",
    "Cuidar afinación",
    "Buen progreso",
    "Buen sonido",
    "Pieza terminada 🎻"
]

export default function AddProgressNoteModal({
    songId,
    songTitle,
    isOpen,
    onClose,
    onSuccess,
    instrument,
    initialData
}: AddProgressNoteModalProps) {
    const isEditing = !!initialData
    const labels = getInstrumentLabels(instrument)
    const [metric1, setMetric1] = useState(0)
    const [metric2, setMetric2] = useState(0)
    const [metric3, setMetric3] = useState(0)
    const [note, setNote] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    // Reset values when initialData changes or modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setMetric1(initialData.metric1)
                setMetric2(initialData.metric2)
                setMetric3(initialData.metric3)
                setNote(initialData.note ?? "")
            } else {
                setMetric1(0)
                setMetric2(0)
                setMetric3(0)
                setNote("")
            }
        }
    }, [isOpen, initialData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        let result;
        if (isEditing && initialData) {
            result = await updateProgressNote(initialData.id, {
                metric1,
                metric2,
                metric3,
                note: note.trim() || undefined
            })
        } else {
            result = await createProgressNote({
                studentSongId: songId,
                metric1,
                metric2,
                metric3,
                note: note.trim() || undefined
            })
        }

        setIsSaving(false)

        if (result.success) {
            onSuccess()
            onClose()
        } else {
            alert(result.error || "Error al guardar la nota")
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-3 sm:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto border border-gray-100 dark:border-gray-700">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 sm:p-6 rounded-t-2xl z-10">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                                {isEditing ? <Edit3 className="w-5 h-5 sm:w-6 sm:h-6" /> : <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />}
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-xl sm:text-2xl font-bold line-clamp-1">
                                    {isEditing ? 'Editar Nota' : 'Nueva Nota'}
                                </h2>
                                <p className="text-indigo-100/80 text-[10px] sm:text-sm mt-0.5 leading-tight">{songTitle}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 sm:p-2 hover:bg-white/20 rounded-lg transition-colors"
                            disabled={isSaving}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6 sm:space-y-8">
                    {/* Progress Sliders */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 pb-2">
                            Nivel de Progreso
                        </h3>

                        <SliderInput
                            label={labels.metric2}
                            value={metric2}
                            onChange={setMetric2}
                            color="blue"
                        />

                        <SliderInput
                            label={labels.metric1}
                            value={metric1}
                            onChange={setMetric1}
                            color="green"
                        />

                        <SliderInput
                            label={labels.metric3}
                            value={metric3}
                            onChange={setMetric3}
                            color="purple"
                        />
                    </div>

                    {/* Note textarea */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">
                            Notas y Observaciones
                            <span className="text-gray-400 dark:text-gray-500 font-normal ml-2">(opcional)</span>
                        </label>
                        
                        {/* Quick Phrases */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {QUICK_PHRASES.map((phrase) => (
                                <button
                                    key={phrase}
                                    type="button"
                                    onClick={() => setNote(prev => prev ? `${prev}. ${phrase}` : phrase)}
                                    className="text-[10px] sm:text-xs font-semibold px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 rounded-full hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
                                >
                                    {phrase}
                                </button>
                            ))}
                        </div>

                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Escribe observaciones sobre la práctica..."
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent resize-none text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 placeholder-gray-400 dark:placeholder-gray-500"
                        />
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-[2] px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    {isEditing ? 'Actualizar Nota' : 'Guardar Nota'}
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

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">{label}</label>
                <motion.span 
                    key={value}
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-xl font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-0.5 rounded-lg min-w-[3.5rem] text-center shadow-sm"
                >
                    {value}%
                </motion.span>
            </div>
            <div className="relative group">
                <div className="w-full bg-gray-100 dark:bg-gray-900 rounded-full h-4 overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner">
                    <div
                        className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full transition-all duration-300 shadow-lg`}
                        style={{ width: `${value}%` }}
                    />
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="absolute inset-0 w-full h-4 opacity-0 cursor-pointer z-20"
                />
            </div>
        </div>
    )
}
