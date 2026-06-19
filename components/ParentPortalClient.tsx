'use client'

import { useState, useMemo } from 'react'
import { Music, BookOpen, CheckCircle, Clock, Flame, Star, ChevronDown, ChevronUp, CalendarCheck } from 'lucide-react'
import PracticeTimer from './PracticeTimer'
import PracticeCalendar from './PracticeCalendar'
import { calculateStreak } from '@/lib/practice-utils'
import { ThemeToggle } from './ThemeToggle'
import { getInstrumentLabels } from '@/lib/instrument-labels'

interface Song {
    id: string
    title: string
    order: number
    completed: boolean
    learned1: boolean
    learned2: boolean
    learned3: boolean
    notes: string | null
    lastProgress: {
        metric1: number
        metric2: number
        metric3: number
        note: string | null
        date: string
    } | null
}

interface Book {
    title: string
    number: number
    isGraduated: boolean
    instrument?: string
    songs: Song[]
}

interface PracticeSessionData {
    id: string
    date: string
    duration: number
    notes: string | null
}

interface AttendanceData {
    id: string
    date: string
    present: boolean
}

interface ParentPortalData {
    name: string
    accessCode: string
    books: Book[]
    practiceSessions: PracticeSessionData[]
    attendances?: AttendanceData[]
}

export default function ParentPortalClient({ data }: { data: ParentPortalData }) {
    const [expandedBook, setExpandedBook] = useState<number | null>(
        data.books.length > 0 ? data.books[data.books.length - 1].number : null
    )

    // Calculate stats
    const stats = useMemo(() => {
        const allSongs = data.books.flatMap(b => b.songs)
        const completed = allSongs.filter(s => s.completed).length
        const inProgress = allSongs.filter(s => !s.completed && (s.learned1 || s.learned2 || s.learned3)).length
        const total = allSongs.length
        const streak = calculateStreak(data.practiceSessions.map(s => ({ date: s.date })))
        const totalPracticeMinutes = data.practiceSessions.reduce((acc, s) => acc + s.duration, 0)

        return { completed, inProgress, total, streak, totalPracticeMinutes }
    }, [data])

    // Get songs currently being worked on
    const currentSongs = useMemo(() => {
        return data.books.flatMap(b =>
            b.songs.filter(s => !s.completed && (s.learned1 || s.learned2 || s.learned3))
                .map(s => ({ ...s, bookTitle: b.title, bookNumber: b.number, instrument: b.instrument }))
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
                            {currentSongs.map(song => {
                                const songLabels = getInstrumentLabels(song.instrument)
                                return (
                                <div key={song.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <div className="flex-shrink-0">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${song.learned3
                                                ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                                                : song.learned1 && song.learned2
                                                    ? 'bg-gradient-to-br from-blue-500 to-green-500'
                                                    : song.learned1
                                                        ? 'bg-gradient-to-br from-green-400 to-green-600'
                                                        : 'bg-gradient-to-br from-blue-400 to-blue-600'
                                            }`}>
                                            <span className="text-white text-lg">{songLabels.emoji}</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{song.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Libro {song.bookNumber} · {song.bookTitle}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${song.learned1 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}>
                                            {songLabels.learned1}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${song.learned2 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}>
                                            {songLabels.learned2}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${song.learned3 ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}>
                                            {songLabels.learned3}
                                        </span>
                                    </div>
                                </div>
                                )
                            })}
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
                            <span className="text-xl">{getInstrumentLabels().emoji}</span> Práctica en Casa
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

                {/* Attendance Section */}
                {data.attendances && data.attendances.length > 0 && (() => {
                    const presentCount = data.attendances.filter(a => a.present).length
                    const percentage = Math.round((presentCount / data.attendances.length) * 100)
                    return (
                        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <CalendarCheck className="w-5 h-5 text-indigo-600" />
                                    Asistencia
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Últimas {Math.min(data.attendances.length, 28)} clases · {percentage}% asistencia
                                </p>
                            </div>
                            <div className="p-5">
                                <div className="grid grid-cols-7 gap-1">
                                    {data.attendances.slice(0, 28).map((a) => (
                                        <div
                                            key={a.id}
                                            className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${
                                                a.present
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                            }`}
                                            title={`${new Date(a.date).toLocaleDateString('es-ES')} - ${a.present ? 'Presente' : 'Ausente'}`}
                                        >
                                            {new Date(a.date).getDate()}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center gap-4 mt-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 rounded"></div>
                                        <span className="text-gray-600 dark:text-gray-400">Presente</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-100 dark:bg-red-900/30 rounded"></div>
                                        <span className="text-gray-600 dark:text-gray-400">Ausente</span>
                                    </div>
                                    <div className="ml-auto">
                                        <span className="text-gray-500 dark:text-gray-400">Presentes: </span>
                                        <span className="font-bold text-gray-900 dark:text-gray-100">{presentCount}/{data.attendances.length}</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )
                })()}

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
                            {book.songs.map(song => {
                                const songLabels = getInstrumentLabels(book.instrument)
                                return (
                                <div key={song.id} className="px-4 py-3 flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${song.completed
                                            ? 'bg-green-100 dark:bg-green-900/30'
                                            : (song.learned1 || song.learned2 || song.learned3)
                                                ? 'bg-amber-100 dark:bg-amber-900/30'
                                                : 'bg-gray-100 dark:bg-gray-700'
                                        }`}>
                                        {song.completed ? (
                                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        ) : (song.learned1 || song.learned2 || song.learned3) ? (
                                            <span className="text-sm">{songLabels.emoji}</span>
                                        ) : (
                                            <Music className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${song.completed ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                                            {song.title}
                                        </p>
                                    </div>
                                    {!song.completed && (song.learned1 || song.learned2 || song.learned3) && (
                                        <div className="flex gap-1">
                                            {song.learned1 && <span className="w-2 h-2 rounded-full bg-green-500" title={songLabels.learned1} />}
                                            {song.learned2 && <span className="w-2 h-2 rounded-full bg-blue-500" title={songLabels.learned2} />}
                                            {song.learned3 && <span className="w-2 h-2 rounded-full bg-purple-500" title={songLabels.learned3} />}
                                        </div>
                                    )}
                                    {song.completed && (
                                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">✓</span>
                                    )}
                                </div>
                                )
                            })}
                                </div>
                            )}
                        </div>
                    ))}
                </section>

                {/* Footer */}
                <footer className="text-center py-6">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        Musivo · Portal de seguimiento para padres y alumnos
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
        <div className={`${bgColor} rounded-xl p-4 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md hover:-translate-y-0.5`}>
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
