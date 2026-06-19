import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import LogoutButton from "@/components/LogoutButton"
import { Music, BookOpen, CalendarCheck } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { DashboardClient } from "@/components/DashboardClient"

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Dashboard - Musivo',
    description: 'Resumen de tus estudiantes y progreso musical',
}

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
        select: {
            id: true,
            name: true,
            dob: true,
            bookAssignments: {
                select: {
                    id: true,
                    isGraduated: true,
                    bookTemplate: {
                        select: {
                            id: true,
                            title: true,
                            number: true,
                        }
                    }
                }
            },
            studentSongs: {
                select: {
                    id: true,
                    completed: true,
                    learned1: true,
                    learned2: true,
                    learned3: true,
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    // Fetch all book templates for the filter dropdown
    const books = await prisma.bookTemplate.findMany({
        where: {
            teacherId: session.user.id
        },
        orderBy: {
            number: 'asc'
        },
        select: {
            id: true,
            title: true,
            number: true
        }
    })

    // Fetch today's attendance
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayAttendance = await prisma.attendance.findMany({
        where: {
            student: { teacherId: session.user.id },
            date: today
        },
        select: { studentId: true, present: true }
    })

    // Build attendance map: studentId -> present boolean
    const todayAttendanceMap: Record<string, boolean> = {}
    todayAttendance.forEach(a => { todayAttendanceMap[a.studentId] = a.present })

    // Serialize dates for client component
    const serializedStudents = students.map(student => ({
        ...student,
        dob: student.dob ? student.dob.toISOString() : null,
        bookAssignments: student.bookAssignments.map(ba => ({
            ...ba,
        })),
        studentSongs: student.studentSongs.map(ss => ({ ...ss }))
    }))

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 transition-colors duration-300">
            {/* Header */}
            <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex justify-between items-center gap-4">
                        <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg">
                                <Music className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <h1 className="text-[11px] sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 truncate uppercase tracking-tighter sm:tracking-normal sm:normal-case leading-none">
                                Musivo
                            </h1>
                        </Link>
                        <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto no-scrollbar py-1">
                            <Link
                                href="/books"
                                className="flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all font-medium text-sm flex-shrink-0"
                                title="Libros"
                            >
                                <BookOpen className="w-4 h-4" />
                                <span className="hidden lg:inline">Libros</span>
                            </Link>
                            <Link
                                href="/repertoire"
                                className="flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all font-medium text-sm flex-shrink-0"
                                title="Repertorio"
                            >
                                <Music className="w-4 h-4" />
                                <span className="hidden lg:inline">Repertorio</span>
                            </Link>
                            <Link
                                href="/attendance"
                                className="flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all font-medium text-sm flex-shrink-0"
                                title="Asistencia"
                            >
                                <CalendarCheck className="w-4 h-4" />
                                <span className="hidden lg:inline">Asistencia</span>
                            </Link>
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" title={session.user.name || session.user.email}>
                                {(session.user.name || session.user.email || 'U')[0].toUpperCase()}
                            </div>
                            <ThemeToggle />
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <DashboardClient
                    students={serializedStudents}
                    books={books}
                    teacherName={session.user.name || session.user.email || 'Profesor'}
                    todayAttendanceMap={todayAttendanceMap}
                />
            </div>
        </div>
    )
}
