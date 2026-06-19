import { getStudentByAccessCode } from "@/app/actions/portal"
import { redirect } from "next/navigation"
import ParentPortalClient from "@/components/ParentPortalClient"

export const dynamic = 'force-dynamic'

export default async function ParentPortalPage({ params }: { params: { code: string } }) {
    const result = await getStudentByAccessCode(params.code)

    if (!result.success || !result.data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🔒</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Código no válido
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        El código de acceso que has introducido no es válido o ha sido cambiado.
                        Contacta con el profesor para obtener un enlace actualizado.
                    </p>
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium"
                    >
                        Ir al inicio
                    </a>
                </div>
            </div>
        )
    }

    const student = result.data

    // Transform data for client component
    const transformedData = {
        name: student.name,
        accessCode: student.accessCode!,
        books: student.bookAssignments.map(assignment => {
            const template = assignment.bookTemplate
            const songs = template.songs.map(songTemplate => {
                const studentSong = student.studentSongs.find(
                    s => s.songTemplateId === songTemplate.id
                )
                return {
                    id: studentSong?.id || songTemplate.id,
                    title: songTemplate.title,
                    order: studentSong?.order ?? songTemplate.order,
                    completed: studentSong?.completed || false,
                    learned1: studentSong?.learned1 || false,
                    learned2: studentSong?.learned2 || false,
                    learned3: studentSong?.learned3 || false,
                    notes: studentSong?.notes || null,
                    lastProgress: studentSong?.progresses?.[0] ? {
                        metric1: studentSong.progresses[0].metric1,
                        metric2: studentSong.progresses[0].metric2,
                        metric3: studentSong.progresses[0].metric3,
                        note: studentSong.progresses[0].note,
                        date: studentSong.progresses[0].date.toISOString()
                    } : null
                }
            }).sort((a, b) => a.order - b.order)

            return {
                title: template.title,
                number: template.number,
                isGraduated: assignment.isGraduated,
                songs
            }
        }),
        practiceSessions: student.practiceSessions.map(s => ({
            id: s.id,
            date: s.date.toISOString(),
            duration: s.duration,
            notes: s.notes
        })),
        attendances: student.attendances?.map(a => ({
            id: a.id,
            date: a.date.toISOString(),
            present: a.present
        })) || []
    }

    return <ParentPortalClient data={transformedData} />
}
