'use client'

import { useState, useEffect } from 'react'
import { Share2, Copy, Check, RefreshCw, ExternalLink } from 'lucide-react'
import { generateAccessCode, regenerateAccessCode } from '@/app/actions/portal'
import Link from 'next/link'
import { createPortal } from 'react-dom'

interface SharePortalButtonProps {
    studentId: string
    studentName: string
    existingCode?: string | null
    compact?: boolean
    showLabel?: boolean // New prop
}

export default function SharePortalButton({ studentId, studentName, existingCode, compact, showLabel }: SharePortalButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [code, setCode] = useState<string | null>(existingCode || null)
    const [isLoading, setIsLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

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
                className={compact 
                    ? `p-2 ${showLabel ? 'flex-1 gap-2 px-3' : ''} bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl transition-all shadow-md flex items-center justify-center`
                    : "flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl transition-all shadow-lg font-medium text-sm"
                }
                title="Compartir Portal"
            >
                <Share2 className="w-4 h-4 flex-shrink-0" />
                {(showLabel || !compact) && (
                    <span className={compact ? "text-[10px] font-black uppercase tracking-tight" : "hidden sm:inline sm:text-sm"}>
                        Portal
                    </span>
                )}
                {!compact && <span className="hidden sm:inline">Padres</span>}
            </button>

            {/* Modal */}
            {mounted && isOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div 
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsOpen(false)
                        }}
                    />
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200 relative z-10">
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
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setIsOpen(false)
                                }}
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

                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/portal/${code}`}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                Ver Portal
                                            </Link>
                                            <button
                                                onClick={handleRegenerate}
                                                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-medium text-sm transition-all"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                                Nuevo código
                                            </button>
                                        </div>
                                        
                                        <a
                                            href={`https://wa.me/?text=${encodeURIComponent(`¡Hola! 😊 Aquí puedes seguir el progreso de ${studentName} en sus clases de música a través de Musivo: ${getPortalUrl()}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl font-bold text-sm transition-all shadow-md active:scale-[0.98]"
                                        >
                                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 0 5.415 0 12.054c0 2.123.555 4.194 1.612 6.012L0 24l6.135-1.61c1.767.962 3.751 1.469 5.771 1.469h.005c6.634 0 12.048-5.415 12.048-12.054 0-3.217-1.252-6.242-3.525-8.514z" />
                                            </svg>
                                            Compartir por WhatsApp
                                        </a>
                                    </div>

                                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                                        Los padres podrán ver el progreso, las notas del profesor y registrar la práctica en casa.
                                    </p>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}
