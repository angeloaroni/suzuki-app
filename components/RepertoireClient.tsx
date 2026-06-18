'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Music, Users, BookOpen, CheckCircle, Clock, Search, Filter, X } from 'lucide-react'

interface Song {
    id: string
    title: string
    order: number
    studentSongs: Array<{
        id: string
        studentId: string
        completed: boolean
        learnedLeft: boolean
        learnedRight: boolean
        learnedBoth: boolean
        student: { id: string; name: string }
    }>
}

interface BookGroup {
    book: { id: string; title: string; number: number }
    songs: Song[]
}

interface RepertoireClientProps {
    bookGroups: BookGroup[]
}

export function RepertoireClient({ bookGroups }: RepertoireClientProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedBook, setSelectedBook] = useState('')

    const filteredGroups = useMemo(() => {
        return bookGroups
            .filter(group => selectedBook === '' || group.book.id === selectedBook)
            .map(group => ({
                ...group,
                songs: group.songs.filter(song =>
                    searchQuery === '' ||
                    song.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
            }))
            .filter(group => group.songs.length > 0)
    }, [bookGroups, searchQuery, selectedBook])

    const totalStudentsPlaying = new Set(
        bookGroups.flatMap(g => g.songs.flatMap(s => s.studentSongs.map(ss => ss.studentId)))
    ).size
    const totalSongsInProgress = bookGroups.flatMap(g => g.songs).filter(s =>
        s.studentSongs.some(ss => !ss.completed && (ss.learnedLeft || ss.learnedRight || ss.learnedBoth))
    ).length
    const totalSongsCompleted = bookGroups.flatMap(g => g.songs).filter(s =>
        s.studentSongs.some(ss => ss.completed)
    ).length

    const hasFilters = searchQuery !== '' || selectedBook !== ''

    return (
        <>
            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Estudiantes Activos</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalStudentsPlaying}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Canciones en Progreso</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalSongsInProgress}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Canciones Completadas</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalSongsCompleted}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar canción..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="relative min-w-[200px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                            value={selectedBook}
                            onChange={(e) => setSelectedBook(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Todos los libros</option>
                            {bookGroups.map(group => (
                                <option key={group.book.id} value={group.book.id}>
                                    Libro {group.book.number}: {group.book.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    {hasFilters && (
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedBook('') }}
                            className="flex items-center gap-2 px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            {/* Books and Songs */}
            {filteredGroups.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {hasFilters ? 'No se encontraron canciones' : 'No hay repertorio aún'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {hasFilters ? 'Intenta con otros términos de búsqueda' : 'Crea libros y asigna canciones a tus estudiantes'}
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {filteredGroups.map(({ book, songs }) => (
                        <div key={book.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="w-6 h-6 text-white" />
                                    <div>
                                        <h2 className="text-lg font-bold text-white">
                                            Libro {book.number}: {book.title}
                                        </h2>
                                        <p className="text-emerald-100 text-sm">{songs.length} canciones</p>
                                    </div>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {songs.map(song => {
                                    const playingStudents = song.studentSongs.filter(ss =>
                                        !ss.completed && (ss.learnedLeft || ss.learnedRight || ss.learnedBoth)
                                    )
                                    const completedStudents = song.studentSongs.filter(ss => ss.completed)
                                    const notStartedStudents = song.studentSongs.filter(ss =>
                                        !ss.completed && !ss.learnedLeft && !ss.learnedRight && !ss.learnedBoth
                                    )

                                    return (
                                        <div key={song.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 rounded-lg flex items-center justify-center">
                                                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{song.order}</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{song.title}</h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{song.studentSongs.length} estudiantes asignados</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {completedStudents.length > 0 && (
                                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                            <span className="text-sm font-medium text-green-700 dark:text-green-300">{completedStudents.length} completado</span>
                                                        </div>
                                                    )}
                                                    {playingStudents.length > 0 && (
                                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                                            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                                            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">{playingStudents.length} en progreso</span>
                                                        </div>
                                                    )}
                                                    {notStartedStudents.length > 0 && (
                                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{notStartedStudents.length} sin empezar</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {playingStudents.length > 0 && (
                                                <div className="mt-3 pl-14">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tocando actualmente:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {playingStudents.map(ss => (
                                                            <Link
                                                                key={ss.id}
                                                                href={`/students/${ss.student.id}`}
                                                                className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800/40 transition-colors"
                                                            >
                                                                {ss.student.name}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}