import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import LogoutButton from "@/components/LogoutButton"
import { Music, BookOpen } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { DashboardClient } from "@/components/DashboardClient"

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
            studentSongs: true
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

    // Serialize dates for client component
    const serializedStudents = students.map(student => ({
        ...student,
        dob: student.dob ? student.dob.toISOString() : null,
        createdAt: student.createdAt.toISOString(),
        updatedAt: student.updatedAt.toISOString(),
        bookAssignments: student.bookAssignments.map(ba => ({
            ...ba,
            createdAt: ba.createdAt.toISOString(),
            updatedAt: ba.updatedAt.toISOString(),
            graduationDate: ba.graduationDate ? ba.graduationDate.toISOString() : null,
            bookTemplate: {
                ...ba.bookTemplate,
                createdAt: ba.bookTemplate.createdAt.toISOString(),
                updatedAt: ba.bookTemplate.updatedAt.toISOString()
            }
        })),
        studentSongs: student.studentSongs.map(ss => ({
            ...ss,
            createdAt: ss.createdAt.toISOString(),
            updatedAt: ss.updatedAt.toISOString()
        }))
    }))

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 transition-colors duration-300">
            {/* Header */}
            <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
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
                                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">Panel de Control</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <Link
                                href="/books"
                                className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg hover:from-indigo-200 hover:to-purple-200 dark:hover:from-indigo-800/40 dark:hover:to-purple-800/40 transition-all font-medium text-sm"
                            >
                                <BookOpen className="w-4 h-4" />
                                <span className="hidden sm:inline">Libros</span>
                            </Link>
                            <Link
                                href="/repertoire"
                                className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 text-emerald-700 dark:text-emerald-300 rounded-lg hover:from-emerald-200 hover:to-teal-200 dark:hover:from-emerald-800/40 dark:hover:to-teal-800/40 transition-all font-medium text-sm"
                            >
                                <Music className="w-4 h-4" />
                                <span className="hidden sm:inline">Repertorio</span>
                            </Link>
                            <Link
                                href="/attendance"
                                className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 text-orange-700 dark:text-orange-300 rounded-lg hover:from-orange-200 hover:to-amber-200 dark:hover:from-orange-800/40 dark:hover:to-amber-800/40 transition-all font-medium text-sm"
                            >
                                <BookOpen className="w-4 h-4" />
                                <span className="hidden sm:inline">Asistencia</span>
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
                <DashboardClient
                    students={serializedStudents as any}
                    books={books}
                />
            </div>
        </div>
    )
}
