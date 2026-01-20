'use client'

import { useState, useRef, useEffect } from "react"
import { updateSongDetails, uploadSongAudio } from "@/app/actions/song"
import { getSongProgressHistory } from "@/app/actions/progress"
import ConfirmDialog from "./ConfirmDialog"
import ProgressHistoryTimeline from "./ProgressHistoryTimeline"
import AddProgressNoteModal from "./AddProgressNoteModal"
import { Trash2, FileText, TrendingUp, Plus } from "lucide-react"

interface SongDetailModalProps {
    song: {
        id: string
        title: string
        notes?: string | null
        youtubeUrl?: string | null
        audioUrl?: string | null
    }
    isOpen: boolean
    onClose: () => void
}

type ProgressNote = {
    id: string
    studentSongId: string
    leftHand: number
    rightHand: number
    bothHands: number
    note: string | null
    date: Date
}

export default function SongDetailModal({ song, isOpen, onClose }: SongDetailModalProps) {
    const [activeTab, setActiveTab] = useState<'details' | 'progress'>('details')
    const [title, setTitle] = useState(song.title)
    const [notes, setNotes] = useState(song.notes || "")
    const [youtubeUrl, setYoutubeUrl] = useState(song.youtubeUrl || "")
    const [isSaving, setIsSaving] = useState(false)
    const [isUploadingAudio, setIsUploadingAudio] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showAddProgressModal, setShowAddProgressModal] = useState(false)
    const [progressHistory, setProgressHistory] = useState<ProgressNote[]>([])
    const [isLoadingProgress, setIsLoadingProgress] = useState(false)
    const audioInputRef = useRef<HTMLInputElement>(null)

    // Load progress history when switching to progress tab
    useEffect(() => {
        if (activeTab === 'progress' && isOpen) {
            loadProgressHistory()
        }
    }, [activeTab, isOpen])

    const loadProgressHistory = async () => {
        setIsLoadingProgress(true)
        const result = await getSongProgressHistory(song.id)
        if (result.success) {
            setProgressHistory(result.data)
        }
        setIsLoadingProgress(false)
    }

    if (!isOpen) return null

    async function handleSave() {
        setIsSaving(true)
        const result = await updateSongDetails(song.id, { notes, youtubeUrl })
        if (result.error) {
            alert(result.error)
        } else {
            onClose()
        }
        setIsSaving(false)
    }

    async function handleAudioUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        if (!file) return

        setIsUploadingAudio(true)

        try {
            // Convert file to base64
            const reader = new FileReader()
            const base64Promise = new Promise<string>((resolve, reject) => {
                reader.onload = () => resolve(reader.result as string)
                reader.onerror = reject
                reader.readAsDataURL(file)
            })

            const base64Data = await base64Promise

            const result = await uploadSongAudio(song.id, base64Data, file.name)

            if (result.success) {
                window.location.reload()
            } else {
                alert(result.error || "Error al subir audio")
            }
        } catch (error: any) {
            console.error("Upload error:", error)
            alert("Error al subir audio: " + error.message)
        }
        setIsUploadingAudio(false)
    }

    // Helper to extract video ID from YouTube URL
    const getYoutubeEmbedUrl = (url: string) => {
        if (!url) return null
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&?]*).*/
        const match = url.match(regExp)
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null
    }

    const embedUrl = getYoutubeEmbedUrl(youtubeUrl)

    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-2xl font-bold">{song.title}</h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'details'
                                    ? 'bg-white text-indigo-600 shadow-lg'
                                    : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                            >
                                <FileText className="w-4 h-4" />
                                Detalles
                            </button>
                            <button
                                onClick={() => setActiveTab('progress')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'progress'
                                    ? 'bg-white text-indigo-600 shadow-lg'
                                    : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                            >
                                <TrendingUp className="w-4 h-4" />
                                Historial de Progreso
                                {progressHistory.length > 0 && (
                                    <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                                        {progressHistory.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === 'details' ? (
                            <div className="space-y-6">
                                {/* Title Section - Read Only */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Título de la Canción</label>
                                    <input
                                        type="text"
                                        value={song.title}
                                        readOnly
                                        className="w-full rounded-lg border-gray-200 bg-gray-50 text-gray-500 p-3 border"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">El título se gestiona desde la plantilla del libro</p>
                                </div>

                                {/* Notes Section */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Notas / Observaciones</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border text-gray-900"
                                        rows={4}
                                        placeholder="Escribe aquí el progreso, tareas o comentarios..."
                                    />
                                </div>

                                {/* YouTube Section */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Video de YouTube</label>
                                    <input
                                        type="text"
                                        value={youtubeUrl}
                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border mb-3 text-gray-900"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                    />
                                    {embedUrl && (
                                        <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-100">
                                            <iframe
                                                src={embedUrl}
                                                title="YouTube video player"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="w-full h-64"
                                            ></iframe>
                                        </div>
                                    )}
                                </div>

                                {/* Audio Section */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Audio (MP3)</label>
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => audioInputRef.current?.click()}
                                            disabled={isUploadingAudio}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center"
                                        >
                                            {isUploadingAudio ? 'Subiendo...' : '📂 Subir Audio'}
                                        </button>
                                        <input
                                            type="file"
                                            ref={audioInputRef}
                                            className="hidden"
                                            accept="audio/*"
                                            onChange={handleAudioUpload}
                                        />
                                        {song.audioUrl && (
                                            <audio controls className="flex-1 h-10">
                                                <source src={song.audioUrl} type="audio/mpeg" />
                                                Tu navegador no soporta el elemento de audio.
                                            </audio>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Registro de Progreso
                                    </h3>
                                    <button
                                        onClick={() => setShowAddProgressModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg font-medium"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Agregar Nota
                                    </button>
                                </div>

                                {isLoadingProgress ? (
                                    <div className="flex justify-center items-center py-12">
                                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                                    </div>
                                ) : (
                                    <ProgressHistoryTimeline
                                        progressHistory={progressHistory}
                                        onUpdate={loadProgressHistory}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer - only show on details tab */}
                    {activeTab === 'details' && (
                        <div className="border-t border-gray-200 p-6 bg-gray-50">
                            <div className="flex justify-end items-center">
                                <div className="flex space-x-3">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>



            <AddProgressNoteModal
                songId={song.id}
                songTitle={song.title}
                isOpen={showAddProgressModal}
                onClose={() => setShowAddProgressModal(false)}
                onSuccess={loadProgressHistory}
            />
        </>
    )
}
