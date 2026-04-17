'use client'

import { useState, useRef } from "react"
import { toggleSongProgress, uploadSongImage } from "@/app/actions/song"
import Image from "next/image"
import SongDetailModal from "./SongDetailModal"
import { GripVertical, ChevronDown, ChevronUp, Music, Image as ImageIcon } from "lucide-react"

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

export default function SongCard({ song, studentId, dragHandleProps }: { song: SongProps, studentId?: string, dragHandleProps?: any }) {
    const [isExpanded, setIsExpanded] = useState(false)
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

    const progressPercent = Math.round(
        progress.both ? 100 : (progress.left && progress.right ? 66 : (progress.left || progress.right ? 33 : 0))
    )

    return (
        <>
            <div className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 group flex flex-col border ${isExpanded ? 'border-indigo-300 dark:border-indigo-700 shadow-md ring-1 ring-indigo-500/20' : 'border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600'}`}>
                
                {/* Compact Header */}
                <div 
                    className="flex items-center p-3 gap-3 cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {/* Drag Handle */}
                    {dragHandleProps && (
                        <div 
                            {...dragHandleProps} 
                            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <GripVertical className="w-5 h-5" />
                        </div>
                    )}

                    {/* Thumbnail */}
                    <div 
                        className="relative w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsModalOpen(true);
                        }}
                    >
                        {song.imageUrl ? (
                            <Image src={song.imageUrl} alt={song.title} fill className="object-cover" />
                        ) : (
                            <Music className="w-5 h-5 m-auto text-gray-400 dark:text-gray-500 absolute inset-0 mt-[14px]" />
                        )}
                        {completed && (
                            <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" title="Completada" />
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{song.title}</h3>
                        
                        <div className="flex items-center gap-2 mt-1">
                            {completed ? (
                                <span className="text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-md">Completada</span>
                            ) : (
                                <div className="flex items-center gap-2 w-full max-w-[120px]">
                                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                                            style={{ width: `${progressPercent}%` }} 
                                        />
                                    </div>
                                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{progressPercent}%</span>
                                </div>
                            )}

                            {/* Icons Indicators */}
                            <div className="hidden sm:flex gap-1 ml-auto">
                                {(song.progressNotesCount ?? 0) > 0 && <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 px-1 rounded flex items-center" title={`${song.progressNotesCount} notas`}>📊 {song.progressNotesCount}</span>}
                                {song.notes && <span className="text-[10px] bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 px-1 rounded flex items-center" title="Tiene notas">📝</span>}
                            </div>
                        </div>
                    </div>

                    {/* Expand Toggle */}
                    <div className="p-1 text-gray-400 flex-shrink-0">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col gap-4">
                        
                        {/* Action buttons */}
                        <div className="flex justify-between items-center gap-3">
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 text-left flex-1"
                            >
                                Ver Ficha Completa →
                            </button>
                            
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                                {isUploading ? (
                                    <span className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <ImageIcon className="w-3.5 h-3.5" />
                                )}
                                {song.imageUrl ? 'Cambiar Portada' : 'Añadir Portada'}
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </div>

                        {/* Toggles */}
                        <div className="flex justify-between space-x-2">
                            <ProgressButton label="✋ Izq" active={progress.left} onClick={() => handleToggle('left')} color="bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" activeColor="bg-blue-600 text-white hover:bg-blue-700" />
                            <ProgressButton label="✋ Der" active={progress.right} onClick={() => handleToggle('right')} color="bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-400" activeColor="bg-green-600 text-white hover:bg-green-700" />
                            <ProgressButton label="👐 Ambas" active={progress.both} onClick={() => handleToggle('both')} color="bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400" activeColor="bg-purple-600 text-white hover:bg-purple-700" />
                        </div>

                        {/* Completed button */}
                        <button
                            onClick={handleToggleCompleted}
                            className={`w-full py-2 px-3 rounded-lg text-sm font-bold transition-colors duration-200 ${completed
                                ? 'bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-200/50 dark:shadow-none'
                                : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                }`}
                        >
                            {completed ? '✓ Canción Completada' : 'Marcar como Completada'}
                        </button>

                    </div>
                )}
            </div>

            <SongDetailModal song={song as any} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
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
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition-all duration-200 border ${active ? activeColor + ' border-transparent' : color + ' border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
        >
            {label}
        </button>
    )
}
