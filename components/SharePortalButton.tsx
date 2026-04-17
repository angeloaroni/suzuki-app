'use client'

import { useState } from 'react'
import { Share2, Copy, Check, RefreshCw, ExternalLink } from 'lucide-react'
import { generateAccessCode, regenerateAccessCode } from '@/app/actions/portal'

interface SharePortalButtonProps {
    studentId: string
    studentName: string
    existingCode?: string | null
}

export default function SharePortalButton({ studentId, studentName, existingCode }: SharePortalButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [code, setCode] = useState<string | null>(existingCode || null)
    const [isLoading, setIsLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleGenerate = async () => {
        setIsLoading(true)
        const result = await generateAccessCode(studentId)
        if (result.success && result.code) {
            setCode(result.code)
        } else {
            alert(result.error || 'Error al generar código')
        }
        setIsLoading(false)
    }

    const handleRegenerate = async () => {
        if (!confirm('¿Regenerar el código? El enlace anterior dejará de funcionar.')) return
        setIsLoading(true)
        const result = await regenerateAccessCode(studentId)
        if (result.success && result.code) {
            setCode(result.code)
        } else {
            alert(result.error || 'Error al regenerar código')
        }
        setIsLoading(false)
    }

    const getPortalUrl = () => {
        if (typeof window === 'undefined') return ''
        return `${window.location.origin}/portal/${code}`
    }

    const handleCopy = async () => {
        await navigator.clipboard.writeText(getPortalUrl())
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <>
            <button
                onClick={() => {
                    setIsOpen(true)
                    if (!code) handleGenerate()
                }}
                className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl transition-all shadow-lg font-medium text-sm"
            >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Portal Padres</span>
                <span className="sm:hidden">Portal</span>
            </button>

            {/* Modal */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsOpen(false)
                    }}
                >
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-6 text-white relative">
                            <div className="flex justify-between items-start pr-8">
                                <div>
                                    <h2 className="text-xl font-bold">Portal para Padres</h2>
                                    <p className="text-teal-100 text-sm mt-1">
                                        Comparte este enlace con los padres de {studentName}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 p-2.5 bg-black/10 hover:bg-black/20 rounded-xl transition-colors flex items-center justify-center"
                                aria-label="Cerrar modal"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
                                </div>
                            ) : code ? (
                                <>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                            Enlace del portal:
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 text-sm text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-700 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 truncate">
                                                {getPortalUrl()}
                                            </code>
                                            <button
                                                onClick={handleCopy}
                                                className={`flex-shrink-0 p-2 rounded-lg transition-all ${copied
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                        : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                                                    }`}
                                            >
                                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Código:</span>
                                        <span className="font-mono font-bold text-gray-900 dark:text-gray-100 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded">{code}</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <a
                                            href={getPortalUrl()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Ver Portal
                                        </a>
                                        <button
                                            onClick={handleRegenerate}
                                            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-medium text-sm transition-all"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Nuevo código
                                        </button>
                                    </div>

                                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                                        Los padres podrán ver el progreso, las notas del profesor y registrar la práctica en casa.
                                    </p>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
