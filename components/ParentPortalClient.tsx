'use client'

import { useState, useMemo } from 'react'
import { Music, BookOpen, CheckCircle, Clock, Flame, Star, ChevronDown, ChevronUp } from 'lucide-react'
import PracticeTimer from './PracticeTimer'
import PracticeCalendar from './PracticeCalendar'
import { calculateStreak } from '@/lib/practice-utils'
import { ThemeToggle } from './ThemeToggle'

interface Song {
    id: string
    title: string
    order: number
    completed: boolean
    learnedLeft: boolean
    learnedRight: boolean
    learnedBoth: boolean
    notes: string | null
    lastProgress: {
        leftHand: number
        rightHand: number
        bothHands: number
        note: string | null
        date: string
    } | null
}

interface Book {
    title: string
    number: number
    isGraduated: boolean
    songs: Song[]
}

interface PracticeSessionData {
    id: string
    date: string
    duration: number
    notes: string | null
}

interface ParentPortalData {
    name: string
    accessCode: string
    books: Book[]
    practiceSessions: PracticeSessionData[]
}

export default function ParentPortalClient({ data }: { data: ParentPortalData }) {
    const [expandedBook, setExpandedBook] = useState<number | null>(
        data.books.length > 0 ? data.books[data.books.length - 1].number : null
    )

    // Calculate stats
    const stats = useMemo(() => {
        const allSongs = data.books.flatMap(b => b.songs)
        const completed = allSongs.filter(s => s.completed).length
        const inProgress = allSongs.filter(s => !s.completed && (s.learnedLeft || s.learnedRight || s.learnedBoth)).length
        const total = allSongs.length
        const streak = calculateStreak(data.practiceSessions.map(s => ({ date: s.date })))
        const totalPracticeMinutes = data.practiceSessions.reduce((acc, s) => acc + s.duration, 0)

        return { completed, inProgress, total, streak, totalPracticeMinutes }
    }, [data])

    // Get songs currently being worked on
    const currentSongs = useMemo(() => {
        return data.books.flatMap(b =>
            b.songs.filter(s => !s.completed && (s.learnedLeft || s.learnedRight || s.learnedBoth))
                .map(s => ({ ...s, bookTitle: b.title, bookNumber: b.number }))
        )
    }, [data])

    // Get latest teacher notes
    const latestNotes = useMemo(() => {
        return data.books.flatMap(b =>
            b.songs.filter(s => s.lastProgress?.note || s.notes)
                .map(s => ({
                    songTitle: s.title,
                    bookTitle: b.title,
                    teacherNote: s.lastProgress?.note || null,
                    songNote: s.notes,
                    date: s.lastProgress?.date || null
                }))
        ).sort((a, b) => {
            if (!a.date) return 1
            if (!b.date) return -1
            return new Date(b.date).getTime() - new Date(a.date).getTime()
        }).slice(0, 5)
    }, [data])

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 transition-colors duration-300">
            {/* Header */}
            <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Music className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                    Portal del Alumno
                                </h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{data.name}</p>
                            </div>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard
                        icon={<Flame className="w-5 h-5" />}
                        label="Racha"
                        value={`${stats.streak}`}
                        suffix="días"
                        gradient="from-orange-500 to-red-500"
                        bgColor="bg-orange-50 dark:bg-orange-900/20"
                    />
                    <StatCard
                        icon={<CheckCircle className="w-5 h-5" />}
                        label="Completadas"
                        value={`${stats.completed}`}
                        suffix={`/ ${stats.total}`}
                        gradient="from-green-500 to-emerald-500"
                        bgColor="bg-green-50 dark:bg-green-900/20"
                    />
                    <StatCard
                        icon={<Star className="w-5 h-5" />}
                        label="En progreso"
                        value={`${stats.inProgress}`}
                        suffix="piezas"
                        gradient="from-amber-500 to-yellow-500"
                        bgColor="bg-amber-50 dark:bg-amber-900/20"
                    />
                    <StatCard
                        icon={<Clock className="w-5 h-5" />}
                        label="Tiempo total"
                        value={`${Math.floor(stats.totalPracticeMinutes / 60)}`}
                        suffix={`h ${stats.totalPracticeMinutes % 60}m`}
                        gradient="from-blue-500 to-cyan-500"
                        bgColor="bg-blue-50 dark:bg-blue-900/20"
                    />
                </div>

                {/* Current Work Section */}
                {currentSongs.length > 0 && (
                    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <span className="text-xl">🎯</span> Trabajando Actualmente
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Estas son las piezas que hay que repasar esta semana
                            </p>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {currentSongs.map(song => (
                                <div key={song.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <div className="flex-shrink-0">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${song.learnedBoth
                                                ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                                                : song.learnedLeft && song.learnedRight
                                                    ? 'bg-gradient-to-br from-blue-500 to-green-500'
                                                    : song.learnedLeft
                                                        ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                                                        : 'bg-gradient-to-br from-green-400 to-green-600'
                                            }`}>
                                            <Music className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{song.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Libro {song.bookNumber} · {song.bookTitle}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${song.learnedLeft ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}>
                                            Izq
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${song.learnedRight ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}>
                                            Der
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${song.learnedBoth ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}>
                                            Ambas
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Teacher Notes Section */}
                {latestNotes.length > 0 && (
                    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <span className="text-xl">📝</span> Notas del Profesor
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {latestNotes.map((note, i) => (
                                <div key={i} className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{note.songTitle}</span>
                                        <span className="text-xs text-gray-400 dark:text-gray-500">· {note.bookTitle}</span>
                                        {note.date && (
                                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                                                {new Date(note.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                            </span>
                                        )}
                                    </div>
                                    {note.teacherNote && (
                                        <p className="text-sm text-gray-700 dark:text-gray-300 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3">
                                            {note.teacherNote}
                                        </p>
                                    )}
                                    {note.songNote && !note.teacherNote && (
                                        <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                            {note.songNote}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Practice Section (Gamification) */}
                <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <span className="text-xl">🎹</span> Práctica en Casa
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Usa el temporizador para medir tu sesión de práctica
                        </p>
                    </div>
                    <div className="p-5">
                        <PracticeTimer accessCode={data.accessCode} />
                    </div>
                </section>

                {/* Practice Calendar */}
                <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <span className="text-xl">📅</span> Historial de Práctica
                        </h2>
                    </div>
                    <div className="p-5">
                        <PracticeCalendar sessions={data.practiceSessions} streak={stats.streak} />
                    </div>
                </section>

                {/* Books / Progress Section */}
                <section className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <span className="text-xl">📚</span> Repertorio Completo
                    </h2>
                    {data.books.map(book => (
                        <div key={book.number} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <button
                                onClick={() => setExpandedBook(expandedBook === book.number ? null : book.number)}
                                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                                        <BookOpen className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                                            {book.title}
                                            {book.isGraduated && <span className="ml-2 text-yellow-500">🎓</span>}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Libro {book.number} · {book.songs.filter(s => s.completed).length}/{book.songs.length} completadas
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Mini progress bar */}
                                    <div className="hidden sm:block w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                                            style={{ width: `${book.songs.length > 0 ? (book.songs.filter(s => s.completed).length / book.songs.length * 100) : 0}%` }}
                                        />
                                    </div>
                                    {expandedBook === book.number ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                            </button>

                            {expandedBook === book.number && (
                                <div className="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700/50">
                                    {book.songs.map(song => (
                                        <div key={song.id} className="px-4 py-3 flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${song.completed
                                                    ? 'bg-green-100 dark:bg-green-900/30'
                                                    : (song.learnedLeft || song.learnedRight || song.learnedBoth)
                                                        ? 'bg-amber-100 dark:bg-amber-900/30'
                                                        : 'bg-gray-100 dark:bg-gray-700'
                                                }`}>
                                                {song.completed ? (
                                                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                ) : (song.learnedLeft || song.learnedRight || song.learnedBoth) ? (
                                                    <span className="text-sm">🎵</span>
                                                ) : (
                                                    <Music className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium truncate ${song.completed ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                                                    {song.title}
                                                </p>
                                            </div>
                                            {!song.completed && (song.learnedLeft || song.learnedRight || song.learnedBoth) && (
                                                <div className="flex gap-1">
                                                    {song.learnedLeft && <span className="w-2 h-2 rounded-full bg-blue-500" title="Izq" />}
                                                    {song.learnedRight && <span className="w-2 h-2 rounded-full bg-green-500" title="Der" />}
                                                    {song.learnedBoth && <span className="w-2 h-2 rounded-full bg-purple-500" title="Ambas" />}
                                                </div>
                                            )}
                                            {song.completed && (
                                                <span className="text-xs text-green-600 dark:text-green-400 font-medium">✓</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </section>

                {/* Footer */}
                <footer className="text-center py-6">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        SuzukiTracker · Portal de seguimiento para padres y alumnos
                    </p>
                </footer>
            </div>
        </div>
    )
}

function StatCard({ icon, label, value, suffix, gradient, bgColor }: {
    icon: React.ReactNode
    label: string
    value: string
    suffix: string
    gradient: string
    bgColor: string
}) {
    return (
        <div className={`${bgColor} rounded-xl p-4 border border-gray-100 dark:border-gray-700 transition-colors`}>
            <div className={`w-8 h-8 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center text-white mb-2`}>
                {icon}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
            <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{suffix}</span>
            </div>
        </div>
    )
}
