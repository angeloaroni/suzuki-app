import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Music, Users, ArrowLeft, BookOpen, CheckCircle, Clock } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import LogoutButton from "@/components/LogoutButton"

export const dynamic = 'force-dynamic'

export default async function RepertoirePage() {
    const session = await getSession()

    if (!session) {
        redirect("/login")
    }

    // Get all song templates with student progress data
    const songTemplates = await prisma.songTemplate.findMany({
        where: {
            bookTemplate: {
                teacherId: session.user.id
            }
        },
        include: {
            bookTemplate: true,
            studentSongs: {
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }
        },
        orderBy: [
            { bookTemplate: { number: 'asc' } },
            { order: 'asc' }
        ]
    })

    // Group songs by book
    const bookGroups = songTemplates.reduce((acc, song) => {
        const bookId = song.bookTemplate.id
        if (!acc[bookId]) {
            acc[bookId] = {
                book: song.bookTemplate,
                songs: []
            }
        }
        acc[bookId].songs.push(song)
        return acc
    }, {} as Record<string, { book: typeof songTemplates[0]['bookTemplate'], songs: typeof songTemplates }>)

    // Calculate totals
    const totalStudentsPlaying = new Set(
        songTemplates.flatMap(s => s.studentSongs.map(ss => ss.studentId))
    ).size
    const totalSongsInProgress = songTemplates.filter(s =>
        s.studentSongs.some(ss => !ss.completed && (ss.learnedLeft || ss.learnedRight || ss.learnedBoth))
    ).length
    const totalSongsCompleted = songTemplates.filter(s =>
        s.studentSongs.some(ss => ss.completed)
    ).length

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950 transition-colors duration-300">
            {/* Header */}
            <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg">
                                <Music className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 truncate">
                                    Repertorio Global
                                </h1>
                                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">Vista de todas las canciones</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all font-medium text-sm"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Dashboard</span>
                            </Link>
                            <ThemeToggle />
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
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

                {/* Books and Songs */}
                {Object.keys(bookGroups).length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            No hay repertorio aún
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Crea libros y asigna canciones a tus estudiantes para ver el repertorio global
                        </p>
                        <Link
                            href="/books"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg font-medium"
                        >
                            <BookOpen className="w-5 h-5" />
                            Ir a Libros
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.values(bookGroups).map(({ book, songs }) => (
                            <div key={book.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                {/* Book Header */}
                                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="w-6 h-6 text-white" />
                                        <div>
                                            <h2 className="text-lg font-bold text-white">
                                                Libro {book.number}: {book.title}
                                            </h2>
                                            <p className="text-emerald-100 text-sm">
                                                {songs.length} canciones
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Songs List */}
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
                                                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                                {song.order}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                                {song.title}
                                                            </h3>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {song.studentSongs.length} estudiantes asignados
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Progress Indicators */}
                                                    <div className="flex items-center gap-4">
                                                        {completedStudents.length > 0 && (
                                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                                                    {completedStudents.length} completado
                                                                </span>
                                                            </div>
                                                        )}
                                                        {playingStudents.length > 0 && (
                                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                                                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                                                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                                                    {playingStudents.length} en progreso
                                                                </span>
                                                            </div>
                                                        )}
                                                        {notStartedStudents.length > 0 && (
                                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                                    {notStartedStudents.length} sin empezar
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Students Names (expandable) */}
                                                {playingStudents.length > 0 && (
                                                    <div className="mt-3 pl-14">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                            Tocando actualmente:
                                                        </p>
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
            </div>
        </div>
    )
}
