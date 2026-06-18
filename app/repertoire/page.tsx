import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Music, ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import LogoutButton from "@/components/LogoutButton"
import { RepertoireClient } from "@/components/RepertoireClient"

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Repertorio - Musivo',
    description: 'Explora y gestiona el repertorio musical',
}

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

            <div className="max-w-7xl mx-auto px-6 py-8">
                <RepertoireClient bookGroups={Object.values(bookGroups)} />
            </div>
        </div>
    )
}
