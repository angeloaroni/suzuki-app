import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Calendar, ArrowLeft, Users } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import LogoutButton from "@/components/LogoutButton"
import { AttendanceCalendar } from "@/components/AttendanceCalendar"

export const dynamic = 'force-dynamic'

export default async function AttendancePage() {
    const session = await getSession()

    if (!session) {
        redirect("/login")
    }

    // Get current month
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()

    // Fetch students
    const students = await prisma.student.findMany({
        where: {
            teacherId: session.user.id
        },
        orderBy: {
            name: 'asc'
        },
        select: {
            id: true,
            name: true
        }
    })

    // Fetch attendances for current month
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)

    const attendances = await prisma.attendance.findMany({
        where: {
            student: {
                teacherId: session.user.id
            },
            date: {
                gte: startDate,
                lte: endDate
            }
        }
    })

    // Serialize for client
    const serializedAttendances = attendances.map(a => ({
        id: a.id,
        studentId: a.studentId,
        date: a.date.toISOString(),
        present: a.present
    }))

    // Calculate stats
    const totalClasses = attendances.length
    const presentCount = attendances.filter(a => a.present).length
    const absentCount = attendances.filter(a => !a.present).length

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-950 dark:via-gray-900 dark:to-orange-950 transition-colors duration-300">
            {/* Header */}
            <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg">
                                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-600 truncate">
                                    Control de Asistencia
                                </h1>
                                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">Registro de clases</p>
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
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Estudiantes</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{students.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Asistencias este mes</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{presentCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Faltas este mes</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{absentCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calendar */}
                {students.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="w-10 h-10 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            No hay estudiantes
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Añade estudiantes para empezar a controlar la asistencia
                        </p>
                        <Link
                            href="/students/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl hover:from-orange-700 hover:to-amber-700 transition-all shadow-lg font-medium"
                        >
                            Añadir Estudiante
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <AttendanceCalendar
                            students={students}
                            initialAttendances={serializedAttendances}
                            initialYear={year}
                            initialMonth={month}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
