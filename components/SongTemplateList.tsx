"use client"

import { useState } from "react"
import { PlusCircle, Edit2, Trash2, GripVertical, Save, X } from "lucide-react"
import {
    addSongToTemplate,
    updateSongTemplate,
    deleteSongTemplate,
} from "@/app/actions/book-template"
import { useRouter } from "next/navigation"

interface Song {
    id: string
    title: string
    order: number
}

interface SongTemplateListProps {
    bookTemplateId: string
    songs: Song[]
}

export function SongTemplateList({ bookTemplateId, songs: initialSongs }: SongTemplateListProps) {
    const router = useRouter()
    const [songs, setSongs] = useState(initialSongs)
    const [isAdding, setIsAdding] = useState(false)
    const [newSongTitle, setNewSongTitle] = useState("")
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editTitle, setEditTitle] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleAddSong = async () => {
        if (!newSongTitle.trim()) return

        setIsSubmitting(true)
        const result = await addSongToTemplate(bookTemplateId, {
            title: newSongTitle,
            order: songs.length + 1,
        })

        if (result.success && result.data) {
            setSongs([...songs, result.data])
            setNewSongTitle("")
            setIsAdding(false)
            router.refresh()
        } else {
            alert(result.error)
        }
        setIsSubmitting(false)
    }

    const handleUpdateSong = async (songId: string) => {
        if (!editTitle.trim()) return

        setIsSubmitting(true)
        const result = await updateSongTemplate(songId, { title: editTitle })

        if (result.success && result.data) {
            setSongs(songs.map((s) => (s.id === songId ? result.data! : s)))
            setEditingId(null)
            router.refresh()
        } else {
            alert(result.error)
        }
        setIsSubmitting(false)
    }

    const handleDeleteSong = async (songId: string) => {
        if (!confirm("¿Estás seguro de eliminar esta canción?")) return

        setIsSubmitting(true)
        const result = await deleteSongTemplate(songId)

        if (result.success) {
            setSongs(songs.filter((s) => s.id !== songId))
            router.refresh()
        } else {
            alert(result.error)
        }
        setIsSubmitting(false)
    }

    const startEdit = (song: Song) => {
        setEditingId(song.id)
        setEditTitle(song.title)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditTitle("")
    }

    return (
        <div>
            {/* Songs List */}
            <div className="space-y-2 mb-4">
                {songs.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <p className="mb-2">No hay canciones todavía</p>
                        <p className="text-sm">Añade la primera canción para empezar</p>
                    </div>
                ) : (
                    songs
                        .sort((a, b) => a.order - b.order)
                        .map((song, index) => (
                            <div
                                key={song.id}
                                className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
                            >
                                <GripVertical className="w-5 h-5 text-slate-400" />

                                <span className="text-sm font-medium text-slate-500 w-8">
                                    {index + 1}.
                                </span>

                                {editingId === song.id ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleUpdateSong(song.id)
                                                if (e.key === "Escape") cancelEdit()
                                            }}
                                        />
                                        <button
                                            onClick={() => handleUpdateSong(song.id)}
                                            disabled={isSubmitting}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        >
                                            <Save className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            disabled={isSubmitting}
                                            className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className="flex-1 text-slate-800">{song.title}</span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => startEdit(song)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSong(song.id)}
                                                disabled={isSubmitting}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                )}
            </div>

            {/* Add New Song */}
            {isAdding ? (
                <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                    <span className="text-sm font-medium text-slate-500 w-8">
                        {songs.length + 1}.
                    </span>
                    <input
                        type="text"
                        value={newSongTitle}
                        onChange={(e) => setNewSongTitle(e.target.value)}
                        className="flex-1 px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900"
                        placeholder="Título de la canción"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddSong()
                            if (e.key === "Escape") {
                                setIsAdding(false)
                                setNewSongTitle("")
                            }
                        }}
                    />
                    <button
                        onClick={handleAddSong}
                        disabled={isSubmitting || !newSongTitle.trim()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => {
                            setIsAdding(false)
                            setNewSongTitle("")
                        }}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                >
                    <PlusCircle className="w-5 h-5" />
                    Añadir Canción
                </button>
            )}
        </div>
    )
}
