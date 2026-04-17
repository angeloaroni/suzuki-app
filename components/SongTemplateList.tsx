"use client"

import { useState } from "react"
import { PlusCircle, Edit2, Trash2, GripVertical, Save, X } from "lucide-react"
import {
    addSongToTemplate,
    updateSongTemplate,
    deleteSongTemplate,
    moveSongTemplate,
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

    const handleMoveSong = async (songId: string, direction: 'up' | 'down') => {
        setIsSubmitting(true);
        // Optimistic update
        setSongs(currentSongs => {
            const index = currentSongs.findIndex(s => s.id === songId);
            if (index < 0) return currentSongs;
            if (direction === 'up' && index === 0) return currentSongs;
            if (direction === 'down' && index === currentSongs.length - 1) return currentSongs;
            
            const newSongs = [...currentSongs];
            const swapIndex = direction === 'up' ? index - 1 : index + 1;
            
            // Swap orders
            const tempOrder = newSongs[index].order;
            newSongs[index].order = newSongs[swapIndex].order;
            newSongs[swapIndex].order = tempOrder;
            
            return newSongs;
        });

        const result = await moveSongTemplate(songId, direction);

        if (result.success) {
            router.refresh();
        } else {
            alert(result.error);
            // Revert state on error by refreshing from server
            router.refresh();
        }
        setIsSubmitting(false);
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
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        <p className="mb-2">No hay canciones todavía</p>
                        <p className="text-sm">Añade la primera canción para empezar</p>
                    </div>
                ) : (
                    songs
                        .sort((a, b) => a.order - b.order)
                        .map((song, index) => (
                            <div
                                key={song.id}
                                className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-gray-800 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-750 transition-colors group border border-transparent dark:border-gray-700"
                            >
                                <GripVertical className="w-5 h-5 text-slate-400 dark:text-gray-500" />

                                <span className="text-sm font-medium text-slate-500 dark:text-gray-400 w-8">
                                    {index + 1}.
                                </span>

                                {editingId === song.id ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-indigo-300 dark:border-indigo-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-slate-900"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleUpdateSong(song.id)
                                                if (e.key === "Escape") cancelEdit()
                                            }}
                                        />
                                        <button
                                            onClick={() => handleUpdateSong(song.id)}
                                            disabled={isSubmitting}
                                            className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                        >
                                            <Save className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            disabled={isSubmitting}
                                            className="p-2 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className="flex-1 text-slate-800 dark:text-gray-200">{song.title}</span>
                                        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <div className="flex flex-col mr-2">
                                                <button
                                                    onClick={() => handleMoveSong(song.id, 'up')}
                                                    disabled={isSubmitting || index === 0}
                                                    className="p-1 text-slate-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded disabled:opacity-30"
                                                    title="Mover arriba"
                                                >
                                                    <GripVertical className="w-3 h-3 rotate-90" />
                                                </button>
                                                <button
                                                    onClick={() => handleMoveSong(song.id, 'down')}
                                                    disabled={isSubmitting || index === songs.length - 1}
                                                    className="p-1 text-slate-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded disabled:opacity-30"
                                                    title="Mover abajo"
                                                >
                                                    <GripVertical className="w-3 h-3 -rotate-90" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => startEdit(song)}
                                                className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSong(song.id)}
                                                disabled={isSubmitting}
                                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
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
                <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border-2 border-indigo-200 dark:border-indigo-800">
                    <span className="text-sm font-medium text-slate-500 dark:text-gray-400 w-8">
                        {songs.length + 1}.
                    </span>
                    <input
                        type="text"
                        value={newSongTitle}
                        onChange={(e) => setNewSongTitle(e.target.value)}
                        className="flex-1 px-3 py-2 border border-indigo-300 dark:border-indigo-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white text-slate-900"
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
                        className="px-4 py-2 bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 dark:border-gray-600 rounded-lg text-slate-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all font-medium"
                >
                    <PlusCircle className="w-5 h-5" />
                    Añadir Canción
                </button>
            )}
        </div>
    )
}
