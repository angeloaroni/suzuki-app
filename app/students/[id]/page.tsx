import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import StudentDetailClient from "@/components/StudentDetailClient"

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
    const session = await getSession()

    if (!session) {
        redirect("/login")
    }

    const studentData = await prisma.student.findUnique({
        where: { id: params.id },
        include: {
            bookAssignments: {
                include: {
                    bookTemplate: {
                        include: {
                            songs: {
                                orderBy: { order: 'asc' }
                            }
                        }
                    }
                },
                orderBy: {
                    bookTemplate: {
                        number: 'asc'
                    }
                }
            },
            studentSongs: {
                include: {
                    songTemplate: true,
                    progresses: {
                        select: { id: true }
                    }
                }
            }
        }
    })

    if (!studentData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Estudiante no encontrado</h1>
                    <Link href="/dashboard" className="text-indigo-600 hover:underline">
                        Volver al Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    // Transform data to match StudentDetailClient interface
    const student = {
        ...studentData,
        books: studentData.bookAssignments.map(assignment => {
            const template = assignment.bookTemplate

            // Map songs from template, merging with student progress
            const songs = template.songs.map(songTemplate => {
                const studentSong = studentData.studentSongs.find(
                    s => s.songTemplateId === songTemplate.id
                )

                return {
                    id: studentSong?.id || songTemplate.id, // Use studentSong id if exists, else template id (though it should exist)
                    templateId: songTemplate.id,
                    title: songTemplate.title,
                    order: songTemplate.order,
                    imageUrl: studentSong?.imageUrl || null,
                    completed: studentSong?.completed || false,
                    learnedLeft: studentSong?.learnedLeft || false,
                    learnedRight: studentSong?.learnedRight || false,
                    learnedBoth: studentSong?.learnedBoth || false,
                    notes: studentSong?.notes || null,
                    youtubeUrl: studentSong?.youtubeUrl || null,
                    audioUrl: studentSong?.audioUrl || null,
                    progresses: studentSong?.progresses || []
                }
            })

            return {
                id: assignment.id, // Use assignment ID as book ID for the view
                templateId: template.id,
                title: template.title,
                number: template.number,
                isGraduated: assignment.isGraduated,
                graduationDate: assignment.graduationDate,
                songs: songs
            }
        })
    }

    // Verify the student belongs to the current teacher
    if (student.teacherId !== session.user.id) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">No autorizado</h1>
                    <Link href="/dashboard" className="text-indigo-600 hover:underline">
                        Volver al Dashboard
                    </Link>
                </div>
            </div>
        )
    }

    return <StudentDetailClient student={student} />
}
