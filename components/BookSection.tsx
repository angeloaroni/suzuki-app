
'use client'

import { useState } from "react"
import { BookOpen, Plus, Edit, Music, Trash2, GraduationCap, ChevronDown, ChevronUp } from "lucide-react"
import SongCard from "@/components/SongCard"

interface Book {
    id: string
    templateId: string
    title: string
    number: number
    isGraduated: boolean
    graduationDate: Date | null
    songs: Array<{
        id: string
        templateId?: string
        title: string
        order: number
        imageUrl: string | null
        completed: boolean
        learnedLeft: boolean
        learnedRight: boolean
        learnedBoth: boolean
        notes: string | null
        youtubeUrl: string | null
        audioUrl: string | null
        progresses?: Array<{ id: string }>
    }>
}

interface BookSectionProps {
    book: Book
    studentId: string
    onEditBook: (book: Book) => void
    onAddSong: (book: Book) => void
    onRemoveBook: (assignmentId: string, bookTitle: string) => void
    onToggleGraduation: (assignmentId: string, bookTitle: string, currentStatus: boolean) => void
}

export default function BookSection({
    book,
    studentId,
    onEditBook,
    onAddSong,
    onRemoveBook,
    onToggleGraduation
}: BookSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    // Calculate stats
    const totalSongs = book.songs.length
    const completedSongs = book.songs.filter(s => s.completed).length
    const progressPercentage = totalSongs > 0 ? Math.round((completedSongs / totalSongs) * 100) : 0

    const learnedRight = book.songs.filter(s => s.learnedRight).length
    const learnedLeft = book.songs.filter(s => s.learnedLeft).length
    const learnedBoth = book.songs.filter(s => s.learnedBoth).length

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 transition-all duration-200 hover:shadow-md">
            {/* Header Section - Always visible */}
            <div
                className={`p-6 cursor-pointer transition-colors ${isExpanded ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${book.isGraduated
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                            }`}>
                            {book.isGraduated ? <GraduationCap className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                {book.title}
                                {book.isGraduated && (
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                                        Graduado
                                    </span>
                                )}
                            </h2>

                            {!isExpanded && (
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-1.5" title="Progreso total">
                                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                                style={{ width: `${progressPercentage}%` }}
                                            />
                                        </div>
                                        <span className="font-medium">{progressPercentage}%</span>
                                    </div>

                                    <div className="w-px h-4 bg-gray-300" />

                                    <div className="flex gap-3">
                                        <span className="flex items-center gap-1" title="Mano Derecha">
                                            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">R</span>
                                            {learnedRight}/{totalSongs}
                                        </span>
                                        <span className="flex items-center gap-1" title="Mano Izquierda">
                                            <span className="text-xs font-bold bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">L</span>
                                            {learnedLeft}/{totalSongs}
                                        </span>
                                        <span className="flex items-center gap-1" title="Ambas Manos">
                                            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">👐</span>
                                            {learnedBoth}/{totalSongs}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="p-6 border-t border-gray-100 bg-white animate-in slide-in-from-top-2 duration-200">
                    {/* Actions Toolbar */}
                    <div className="flex justify-end gap-2 mb-8">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onToggleGraduation(book.id, book.title, book.isGraduated)
                            }}
                            className={`px-3 py-2 rounded-lg transition-all border flex items-center gap-2 text-sm font-medium ${book.isGraduated
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                                : 'text-gray-600 hover:bg-gray-50 border-gray-200'}`}
                        >
                            <GraduationCap className="w-4 h-4" />
                            {book.isGraduated ? "Deshacer Graduación" : "Graduar Libro"}
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onEditBook(book)
                            }}
                            className="px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium flex items-center gap-2 text-sm"
                        >
                            <Edit className="w-4 h-4" />
                            Editar
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onAddSong(book)
                            }}
                            className="px-3 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-all font-medium flex items-center gap-2 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Agregar Canción
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onRemoveBook(book.id, book.title)
                            }}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all"
                            title="Eliminar libro"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Songs Grid */}
                    {book.songs.length === 0 ? (
                        <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
                            <Music className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 mb-4">No hay canciones en este libro</p>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onAddSong(book)
                                }}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
                            >
                                Agregar Primera Canción
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {book.songs.map(song => (
                                <SongCard
                                    key={song.id}
                                    studentId={studentId}
                                    song={{
                                        id: song.id,
                                        templateId: song.templateId,
                                        title: song.title,
                                        imageUrl: song.imageUrl,
                                        completed: song.completed,
                                        learnedLeft: song.learnedLeft,
                                        learnedRight: song.learnedRight,
                                        learnedBoth: song.learnedBoth,
                                        notes: song.notes,
                                        youtubeUrl: song.youtubeUrl,
                                        audioUrl: song.audioUrl,
                                        progressNotesCount: song.progresses?.length ?? 0
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
