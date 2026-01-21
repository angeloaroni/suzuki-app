
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

import { motion, AnimatePresence } from "framer-motion"

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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6 transition-all duration-200 hover:shadow-md">
            {/* Header Section - Always visible */}
            <div
                className={`p-6 cursor-pointer transition-colors ${isExpanded ? 'bg-gray-50/50 dark:bg-gray-900/50' : 'hover:bg-gray-50 dark:hover:bg-gray-900/50'}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex-shrink-0 flex items-center justify-center transition-colors ${book.isGraduated
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500'
                            : 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                            }`}>
                            {book.isGraduated ? <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" /> : <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />}
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 truncate">
                                <span className="truncate">{book.title}</span>
                                {book.isGraduated && (
                                    <span className="flex-shrink-0 text-[10px] sm:text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-500 px-2 py-0.5 sm:py-1 rounded-full font-medium">
                                        Graduado
                                    </span>
                                )}
                            </h2>

                            {!isExpanded && (
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-1.5" title="Progreso total">
                                        <div className="w-16 sm:w-24 h-1.5 sm:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                                style={{ width: `${progressPercentage}%` }}
                                            />
                                        </div>
                                        <span className="font-medium">{progressPercentage}%</span>
                                    </div>

                                    <div className="hidden sm:block w-px h-4 bg-gray-300 dark:bg-gray-700" />

                                    <div className="flex gap-2 sm:gap-3">
                                        <span className="flex items-center gap-1" title="Mano Derecha">
                                            <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded">R</span>
                                            {learnedRight}/{totalSongs}
                                        </span>
                                        <span className="flex items-center gap-1" title="Mano Izquierda">
                                            <span className="text-[10px] font-bold bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded">L</span>
                                            {learnedLeft}/{totalSongs}
                                        </span>
                                        <span className="flex items-center gap-1" title="Ambas Manos">
                                            <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded">👐</span>
                                            {learnedBoth}/{totalSongs}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4">
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800/50">
                            {/* Actions Toolbar */}
                            <div className="flex flex-wrap justify-start sm:justify-end gap-2 mb-6 sm:mb-8">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onToggleGraduation(book.id, book.title, book.isGraduated)
                                    }}
                                    className={`flex-1 sm:flex-none px-3 py-2 rounded-lg transition-all border flex items-center justify-center gap-2 text-xs sm:text-sm font-medium ${book.isGraduated
                                        ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 border-yellow-200 dark:border-yellow-900/50 hover:bg-yellow-100'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'}`}
                                >
                                    <GraduationCap className="w-4 h-4" />
                                    <span className="whitespace-nowrap">{book.isGraduated ? "Deshacer" : "Graduar"}</span>
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onEditBook(book)
                                    }}
                                    className="flex-1 sm:flex-none px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium flex items-center justify-center gap-2 text-xs sm:text-sm"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>Editar</span>
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onAddSong(book)
                                    }}
                                    className="flex-1 sm:flex-none px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all font-medium flex items-center justify-center gap-2 text-xs sm:text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="whitespace-nowrap">Agregar Canción</span>
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onRemoveBook(book.id, book.title)
                                    }}
                                    className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 border border-transparent hover:border-red-100 dark:hover:border-red-900/50 rounded-lg transition-all flex items-center justify-center"
                                    title="Eliminar libro"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Songs Grid */}
                            {book.songs.length === 0 ? (
                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 text-center">
                                    <Music className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">No hay canciones en este libro</p>
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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
        </div >
    )
}
