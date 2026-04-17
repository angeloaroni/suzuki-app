'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, Square, RotateCcw } from 'lucide-react'
import { logPracticeSession } from '@/app/actions/practice'

interface PracticeTimerProps {
    accessCode: string
}

export default function PracticeTimer({ accessCode }: PracticeTimerProps) {
    const [seconds, setSeconds] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [notes, setNotes] = useState('')
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setSeconds(prev => prev + 1)
            }, 1000)
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [isRunning])

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600)
        const mins = Math.floor((totalSeconds % 3600) / 60)
        const secs = totalSeconds % 60
        if (hrs > 0) {
            return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleStart = () => {
        setIsRunning(true)
        setSaved(false)
    }

    const handlePause = () => {
        setIsRunning(false)
    }

    const handleReset = () => {
        setIsRunning(false)
        setSeconds(0)
        setSaved(false)
        setNotes('')
    }

    const handleSave = async () => {
        if (seconds < 60) {
            alert('La sesión debe ser de al menos 1 minuto')
            return
        }

        setIsSaving(true)
        const today = new Date()
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

        const result = await logPracticeSession({
            accessCode,
            date: dateStr,
            duration: Math.ceil(seconds / 60),
            notes: notes || undefined
        })

        if (result.success) {
            setSaved(true)
            setIsRunning(false)
        } else {
            alert(result.error || 'Error al guardar')
        }
        setIsSaving(false)
    }

    // Progress ring for visual feedback
    const circumference = 2 * Math.PI * 54
    const progressMinutes = seconds / 60
    const targetMinutes = 30 // 30 min target
    const progress = Math.min(progressMinutes / targetMinutes, 1)

    return (
        <div className="flex flex-col items-center space-y-6">
            {/* Timer Display */}
            <div className="relative">
                <svg className="w-48 h-48 -rotate-90" viewBox="0 0 120 120">
                    {/* Background circle */}
                    <circle
                        cx="60" cy="60" r="54"
                        fill="none"
                        stroke="currentColor"
                        className="text-gray-200 dark:text-gray-700"
                        strokeWidth="8"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="60" cy="60" r="54"
                        fill="none"
                        strokeWidth="8"
                        strokeLinecap="round"
                        className={`transition-all duration-500 ${progress >= 1
                                ? 'text-green-500'
                                : isRunning
                                    ? 'text-indigo-500'
                                    : 'text-gray-400 dark:text-gray-600'
                            }`}
                        stroke="currentColor"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * (1 - progress)}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl sm:text-4xl font-mono font-bold transition-colors ${isRunning ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-gray-100'}`}>
                        {formatTime(seconds)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {progress >= 1 ? '🎉 ¡Meta alcanzada!' : `Meta: ${targetMinutes} min`}
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
                {!isRunning ? (
                    <button
                        onClick={handleStart}
                        disabled={saved}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Play className="w-5 h-5" />
                        {seconds > 0 ? 'Continuar' : 'Empezar'}
                    </button>
                ) : (
                    <button
                        onClick={handlePause}
                        className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium shadow-lg transition-all"
                    >
                        <Pause className="w-5 h-5" />
                        Pausar
                    </button>
                )}

                {seconds > 0 && !isRunning && (
                    <>
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                        {!saved && (
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium shadow-lg transition-all disabled:opacity-50"
                            >
                                <Square className="w-4 h-4" />
                                {isSaving ? 'Guardando...' : 'Guardar Sesión'}
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Notes input (visible when timer stopped with time) */}
            {seconds > 0 && !isRunning && !saved && (
                <div className="w-full max-w-sm">
                    <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="¿Qué has practicado? (opcional)"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-colors"
                    />
                </div>
            )}

            {/* Success message */}
            {saved && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center animate-fade-in max-w-sm">
                    <p className="text-green-800 dark:text-green-300 font-medium">
                        🎉 ¡Sesión guardada! {Math.ceil(seconds / 60)} minutos de práctica registrados.
                    </p>
                    <button
                        onClick={handleReset}
                        className="mt-2 text-sm text-green-600 dark:text-green-400 hover:underline"
                    >
                        Iniciar nueva sesión
                    </button>
                </div>
            )}
        </div>
    )
}
