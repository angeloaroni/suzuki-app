'use client'

import { useState, useRef } from "react"
import { toggleSongProgress, uploadSongImage } from "@/app/actions/song"
import Image from "next/image"
import SongDetailModal from "./SongDetailModal"

interface SongProps {
    id: string
    templateId?: string
    title: string
    imageUrl?: string | null
    completed: boolean
    learnedLeft: boolean
    learnedRight: boolean
    learnedBoth: boolean
    notes?: string | null
    youtubeUrl?: string | null
    audioUrl?: string | null
    progressNotesCount?: number
}

export default function SongCard({ song, studentId }: { song: SongProps, studentId?: string }) {
    const [isUploading, setIsUploading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [progress, setProgress] = useState({
        left: song.learnedLeft,
        right: song.learnedRight,
        both: song.learnedBoth
    })
    const [completed, setCompleted] = useState(song.completed)
    const fileInputRef = useRef<HTMLInputElement>(null)

    async function handleToggle(field: 'left' | 'right' | 'both') {
        const context = studentId && song.templateId ? { studentId, templateId: song.templateId } : undefined
        const result = await toggleSongProgress(song.id, field, context)
        if (result.success) {
            if (result.updatedFields) {
                setProgress(prev => ({
                    ...prev,
                    left: result.updatedFields.learnedLeft !== undefined ? result.updatedFields.learnedLeft : prev.left,
                    right: result.updatedFields.learnedRight !== undefined ? result.updatedFields.learnedRight : prev.right,
                    both: result.updatedFields.learnedBoth !== undefined ? result.updatedFields.learnedBoth : prev.both
                }))
            } else {
                // Fallback for older behavior if needed
                setProgress(prev => ({ ...prev, [field]: result.newValue }))
            }
        } else {
            setProgress(prev => ({ ...prev, [field]: !prev[field] }))
            alert(result.error)
        }
    }

    async function handleToggleCompleted() {
        const context = studentId && song.templateId ? { studentId, templateId: song.templateId } : undefined
        const result = await toggleSongProgress(song.id, 'completed', context)
        if (result.success) {
            setCompleted(result.newValue as boolean)
        } else {
            setCompleted(!completed)
            alert(result.error)
        }
    }

    async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        if (!file) return

        setIsUploading(true)

        try {
            // Convert file to base64
            const reader = new FileReader()
            const base64Promise = new Promise<string>((resolve, reject) => {
                reader.onload = () => resolve(reader.result as string)
                reader.onerror = reject
                reader.readAsDataURL(file)
            })

            const base64Data = await base64Promise

            const result = await uploadSongImage(song.id, base64Data, file.name)

            if (result.success) {
                window.location.reload()
            } else {
                alert(result.error || "Error al subir imagen")
            }
        } catch (error: any) {
            console.error("Upload error:", error)
            alert("Error al subir imagen: " + error.message)
        }
        setIsUploading(false)
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group relative flex flex-col">
                {/* Image Section */}
                <div className="relative h-48 w-full bg-gray-200 cursor-pointer group-hover:opacity-90 transition">
                    {song.imageUrl ? (
                        <Image
                            src={song.imageUrl}
                            alt={song.title}
                            fill
                            className="object-cover"
                            onClick={() => setIsModalOpen(true)}
                        />
                    ) : (
                        <div
                            className="flex items-center justify-center h-full text-gray-400"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                        </div>
                    )}

                    {/* Edit Image Button (Top Right) */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            fileInputRef.current?.click()
                        }}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-opacity-70"
                        title="Cambiar portada"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>

                    {/* Completed Badge (Top Left) */}
                    {song.completed && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center space-x-1">
                            <span>✓</span>
                            <span>Completada</span>
                        </div>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />

                    {/* Indicators (Bottom Left) */}
                    <div className="absolute bottom-2 left-2 flex space-x-1">
                        {(song.progressNotesCount ?? 0) > 0 && (
                            <span className="bg-indigo-100 text-indigo-800 text-xs px-1.5 py-0.5 rounded shadow-sm font-semibold" title={`${song.progressNotesCount} notas de progreso`}>
                                📊 {song.progressNotesCount}
                            </span>
                        )}
                        {song.notes && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5 rounded shadow-sm" title="Tiene notas">📝</span>
                        )}
                        {song.youtubeUrl && (
                            <span className="bg-red-100 text-red-800 text-xs px-1.5 py-0.5 rounded shadow-sm" title="Tiene video">▶️</span>
                        )}
                        {song.audioUrl && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded shadow-sm" title="Tiene audio">🎵</span>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex-1 flex flex-col">
                    <div
                        className="cursor-pointer hover:text-indigo-600 transition mb-3"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <h3 className="font-bold text-gray-900 truncate" title={song.title}>{song.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">Click para ver detalles</p>
                    </div>

                    <div className="mt-auto space-y-2">
                        {/* Progress Toggles */}
                        <div className="flex justify-between space-x-2">
                            <ProgressButton
                                label="✋ Izq"
                                active={progress.left}
                                onClick={() => handleToggle('left')}
                                color="bg-blue-50 text-blue-600 hover:bg-blue-100"
                                activeColor="bg-blue-600 text-white hover:bg-blue-700"
                            />
                            <ProgressButton
                                label="✋ Der"
                                active={progress.right}
                                onClick={() => handleToggle('right')}
                                color="bg-green-50 text-green-600 hover:bg-green-100"
                                activeColor="bg-green-600 text-white hover:bg-green-700"
                            />
                            <ProgressButton
                                label="👐 Ambas"
                                active={progress.both}
                                onClick={() => handleToggle('both')}
                                color="bg-purple-50 text-purple-600 hover:bg-purple-100"
                                activeColor="bg-purple-600 text-white hover:bg-purple-700"
                            />
                        </div>

                        {/* Completed Toggle */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                handleToggleCompleted()
                            }}
                            className={`w-full py-2 px-3 rounded text-xs font-bold transition-colors duration-200 ${completed
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {completed ? '✓ Completada' : 'Marcar como completada'}
                        </button>
                    </div>
                </div>
            </div>

            <SongDetailModal
                song={song}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    )
}

function ProgressButton({ label, active, onClick, color, activeColor }: any) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation()
                onClick()
            }}
            className={`flex-1 py-1.5 px-1 rounded text-[10px] sm:text-xs font-bold transition-colors duration-200 ${active ? activeColor : color}`}
        >
            {label}
        </button>
    )
}
