'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Music, Users, TrendingUp, Award, Plus, ArrowRight, Search, Filter, X } from 'lucide-react'
import { AnimatedList, AnimatedItem } from '@/components/AnimatedList'

interface StudentWithBooks {
    id: string
    name: string
    dob: Date | null
    bookAssignments: Array<{
        id: string
        isGraduated: boolean
        bookTemplate: {
            id: string
            title: string
            number: number
        }
    }>
    studentSongs: Array<{
        id: string
        completed: boolean
        learnedLeft: boolean
        learnedRight: boolean
        learnedBoth: boolean
    }>
}

interface DashboardClientProps {
    students: StudentWithBooks[]
    books: Array<{ id: string; title: string; number: number }>
}

export function DashboardClient({ students, books }: DashboardClientProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedBook, setSelectedBook] = useState<string>('')

    // Filter students based on search and book filter
    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            // Search filter
            const matchesSearch = searchQuery === '' ||
                student.name.toLowerCase().includes(searchQuery.toLowerCase())

            // Book filter
            const matchesBook = selectedBook === '' ||
                student.bookAssignments.some(ba => ba.bookTemplate.id === selectedBook)

            return matchesSearch && matchesBook
        })
    }, [students, searchQuery, selectedBook])

    // Calculate statistics based on filtered students
    const stats = useMemo(() => {
        const allSongs = filteredStudents.flatMap(s => s.studentSongs)
        return {
            totalStudents: filteredStudents.length,
            completedSongs: allSongs.filter(song => song.completed).length,
            inProgressSongs: allSongs.filter(song =>
                !song.completed && (song.learnedLeft || song.learnedRight || song.learnedBoth)
            ).length,
            activeStudents: filteredStudents.filter(s =>
                s.studentSongs.some(song => !song.completed)
            ).length
        }
    }, [filteredStudents])

    const hasFilters = searchQuery !== '' || selectedBook !== ''

    const clearFilters = () => {
        setSearchQuery('')
        setSelectedBook('')
    }

    return (
        <>
            {/* Welcome Section */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    ¡Hola de nuevo! 👋
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Aquí está el resumen de tu progreso musical
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard
                    title="Total Estudiantes"
                    value={stats.totalStudents}
                    icon={<Users className="w-6 h-6" />}
                    gradient="from-blue-500 to-blue-600"
                    bgGradient="from-blue-50 to-blue-100"
                />
                <StatCard
                    title="En Progreso"
                    value={stats.inProgressSongs}
                    icon={<TrendingUp className="w-6 h-6" />}
                    gradient="from-amber-500 to-orange-600"
                    bgGradient="from-amber-50 to-orange-100"
                />
                <StatCard
                    title="Completadas"
                    value={stats.completedSongs}
                    icon={<Award className="w-6 h-6" />}
                    gradient="from-green-500 to-emerald-600"
                    bgGradient="from-green-50 to-emerald-100"
                />
                <StatCard
                    title="Activos"
                    value={stats.activeStudents}
                    icon={<Music className="w-6 h-6" />}
                    gradient="from-purple-500 to-purple-600"
                    bgGradient="from-purple-50 to-purple-100"
                />
            </div>

            {/* Search and Filter Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar alumno por nombre..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Book Filter */}
                    <div className="relative min-w-[200px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                            value={selectedBook}
                            onChange={(e) => setSelectedBook(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Todos los libros</option>
                            {books.map(book => (
                                <option key={book.id} value={book.id}>
                                    Libro {book.number}: {book.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Clear Filters */}
                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-2 px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Limpiar
                        </button>
                    )}
                </div>

                {/* Active Filters Indicator */}
                {hasFilters && (
                    <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                        Mostrando {filteredStudents.length} de {students.length} estudiantes
                    </div>
                )}
            </div>

            {/* Students Section */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mis Estudiantes</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {filteredStudents.length} {filteredStudents.length === 1 ? 'estudiante' : 'estudiantes'}
                        {hasFilters ? ' (filtrado)' : ' registrados'}
                    </p>
                </div>
                <Link
                    href="/students/new"
                    className="group px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-xl hover:shadow-indigo-300 dark:hover:shadow-indigo-900/30 transform hover:-translate-y-0.5 flex items-center gap-2 font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Alumno
                </Link>
            </div>

            {filteredStudents.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
                        {hasFilters ? (
                            <Search className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                            <Users className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                        )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {hasFilters ? 'No se encontraron estudiantes' : 'No tienes estudiantes aún'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                        {hasFilters
                            ? 'Intenta con otros términos de búsqueda o filtros'
                            : 'Comienza tu viaje musical añadiendo tu primer alumno'}
                    </p>
                    {hasFilters ? (
                        <button
                            onClick={clearFilters}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-medium"
                        >
                            <X className="w-5 h-5" />
                            Limpiar Filtros
                        </button>
                    ) : (
                        <Link
                            href="/students/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Añadir Primer Alumno
                        </Link>
                    )}
                </div>
            ) : (
                <AnimatedList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map(student => {
                        const studentSongs = student.studentSongs
                        const completedCount = studentSongs.filter(s => s.completed).length
                        const totalCount = studentSongs.length
                        const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

                        // Get current book (highest non-graduated book)
                        const currentBook = student.bookAssignments
                            .filter(ba => !ba.isGraduated)
                            .sort((a, b) => b.bookTemplate.number - a.bookTemplate.number)[0]

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
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {student.dob
                                                            ? `${Math.floor((Date.now() - new Date(student.dob).getTime()) / (365 * 24 * 60 * 60 * 1000))} años`
                                                            : 'Sin edad'}
                                                    </p>
                                                    {currentBook && (
                                                        <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full">
                                                            Libro {currentBook.bookTemplate.number}
                                                        </span>
                                                    )}
                                                </div>
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
        </>
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
        <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
            {/* Background decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bgGradient} dark:opacity-20 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500`}></div>

            <div className="relative">
                <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <div className="text-white">
                            {icon}
                        </div>
                    </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            </div>
        </div>
    )
}
