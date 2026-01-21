import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import LogoutButton from "@/components/LogoutButton"
import { Music, Users, TrendingUp, Award, Plus, ArrowRight, BookOpen } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { AnimatedList, AnimatedItem } from "@/components/AnimatedList"

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
    const session = await getSession()

    if (!session) {
        redirect("/login")
    }

    // Fetch students with their book assignments and songs
    const students = await prisma.student.findMany({
        where: {
            teacherId: session.user.id
        },
        include: {
            bookAssignments: {
                include: {
                    bookTemplate: true
                }
            },
            studentSongs: {
                include: {
                    songTemplate: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    // Calculate real statistics
    const totalStudents = students.length
    const allSongs = students.flatMap(s => s.studentSongs)
    const completedSongs = allSongs.filter(song => song.completed).length
    const inProgressSongs = allSongs.filter(song =>
        !song.completed && (song.learnedLeft || song.learnedRight || song.learnedBoth)
    ).length
    const activeStudents = students.filter(s =>
        s.studentSongs.some(song => !song.completed)
    ).length

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Header */}
            <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg">
                                <Music className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 truncate">
                                    SuzukiTracker
                                </h1>
                                <p className="text-[10px] sm:text-xs text-gray-500 truncate">Panel de Control</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <Link
                                href="/books"
                                className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg hover:from-indigo-200 hover:to-purple-200 transition-all font-medium text-sm"
                            >
                                <BookOpen className="w-4 h-4" />
                                <span className="hidden sm:inline">Libros</span>
                            </Link>
                            <div className="text-right hidden md:block">
                                <p className="text-xs text-gray-600 dark:text-gray-400">Bienvenido,</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
                                    {session.user.name || session.user.email}
                                </p>
                            </div>
                            <ThemeToggle />
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        ¡Hola de nuevo! 👋
                    </h2>
                    <p className="text-gray-600">
                        Aquí está el resumen de tu progreso musical
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard
                        title="Total Estudiantes"
                        value={totalStudents}
                        icon={<Users className="w-6 h-6" />}
                        gradient="from-blue-500 to-blue-600"
                        bgGradient="from-blue-50 to-blue-100"
                    />
                    <StatCard
                        title="En Progreso"
                        value={inProgressSongs}
                        icon={<TrendingUp className="w-6 h-6" />}
                        gradient="from-amber-500 to-orange-600"
                        bgGradient="from-amber-50 to-orange-100"
                    />
                    <StatCard
                        title="Completadas"
                        value={completedSongs}
                        icon={<Award className="w-6 h-6" />}
                        gradient="from-green-500 to-emerald-600"
                        bgGradient="from-green-50 to-emerald-100"
                    />
                    <StatCard
                        title="Activos"
                        value={activeStudents}
                        icon={<Music className="w-6 h-6" />}
                        gradient="from-purple-500 to-purple-600"
                        bgGradient="from-purple-50 to-purple-100"
                    />
                </div>

                {/* Students Section */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Mis Estudiantes</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {totalStudents} {totalStudents === 1 ? 'estudiante registrado' : 'estudiantes registrados'}
                        </p>
                    </div>
                    <Link
                        href="/students/new"
                        className="group px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transform hover:-translate-y-0.5 flex items-center gap-2 font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo Alumno
                    </Link>
                </div>

                {students.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            No tienes estudiantes aún
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                            Comienza tu viaje musical añadiendo tu primer alumno y empieza a seguir su progreso
                        </p>
                        <Link
                            href="/students/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Añadir Primer Alumno
                        </Link>
                    </div>
                ) : (
                    <AnimatedList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {students.map(student => {
                            const studentSongs = student.studentSongs
                            const completedCount = studentSongs.filter(s => s.completed).length
                            const totalCount = studentSongs.length
                            const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

                            return (
                                <AnimatedItem key={student.id}>
                                    <Link
                                        href={`/students/${student.id}`}
                                        className="group block h-full"
                                    >
                                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl hover:border-indigo-100 dark:hover:border-indigo-500/50 transition-all duration-300 transform hover:-translate-y-1 h-full">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1 truncate">
                                                        {student.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {student.dob
                                                            ? `${Math.floor((Date.now() - student.dob.getTime()) / (365 * 24 * 60 * 60 * 1000))} años`
                                                            : 'Sin edad'}
                                                    </p>
                                                </div>
                                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                                                    <Music className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mb-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Progreso</span>
                                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                                        {completedCount}/{totalCount}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                                        style={{ width: `${progressPercentage}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
                                                <div className="text-center flex-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Canciones</p>
                                                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{totalCount}</p>
                                                </div>
                                                <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                                                <div className="text-center flex-1">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Graduado</p>
                                                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center gap-1">
                                                        {student.bookAssignments.filter(a => a.isGraduated).length}
                                                        {student.bookAssignments.some(a => a.isGraduated) && <Award className="w-3 h-3 text-yellow-500" />}
                                                    </p>
                                                </div>
                                                <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
                                                <div className="flex-1 flex justify-center">
                                                    <ArrowRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </AnimatedItem>
                            )
                        })}
                    </AnimatedList>
                )}
            </div>
        </div>
    )
}

function StatCard({
    title,
    value,
    icon,
    gradient,
    bgGradient
}: {
    title: string
    value: number
    icon: React.ReactNode
    gradient: string
    bgGradient: string
}) {
    return (
        <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
            {/* Background decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bgGradient} rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500`}></div>

            <div className="relative">
                <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <div className="text-white">
                            {icon}
                        </div>
                    </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    )
}
