'use server'

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function getAvailableBooksForStudent(studentId: string) {
    try {
        const session = await getSession()
        if (!session?.user?.id) {
            return { error: "No autorizado" }
        }

        // Get all book templates (shared library)
        const allBooks = await prisma.bookTemplate.findMany({
            // where: { teacherId: session.user.id }, // Allow seeing all books
            orderBy: { number: 'asc' },
            include: {
                assignments: {
                    where: { studentId: studentId }
                },
                songs: {
                    orderBy: { order: 'asc' }
                }
            }
        })

        // Filter out books already assigned to the student
        const availableBooks = allBooks.filter(book => book.assignments.length === 0)

        return { success: true, data: availableBooks }
    } catch (error) {
        console.error("Error fetching available books:", error)
        return { error: "Error al obtener libros disponibles" }
    }
}

export async function assignBookToStudent(studentId: string, bookTemplateId: string) {
    console.log("📚 Assigning book:", { studentId, bookTemplateId })
    try {
        const session = await getSession()
        if (!session?.user?.id) {
            console.log("❌ No session")
            return { error: "No autorizado" }
        }

        // Verify ownership
        const student = await prisma.student.findUnique({
            where: { id: studentId }
        })
        const bookTemplate = await prisma.bookTemplate.findUnique({
            where: { id: bookTemplateId },
            include: { songs: true }
        })

        if (!student || !bookTemplate) {
            console.log("❌ Student or Book not found")
            return { error: "Estudiante o libro no encontrado" }
        }

        if (student.teacherId !== session.user.id) {
            console.log("❌ Auth mismatch", {
                studentTeacher: student.teacherId,
                user: session.user.id
            })
            return { error: "No autorizado" }
        }

        // Check if already assigned
        const existingAssignment = await prisma.bookAssignment.findUnique({
            where: {
                studentId_bookTemplateId: {
                    studentId,
                    bookTemplateId
                }
            }
        })

        if (existingAssignment) {
            console.log("⚠️ Already assigned")
            return { error: "El libro ya está asignado a este estudiante" }
        }

        // Create assignment
        console.log("📝 Creating assignment record...")
        await prisma.bookAssignment.create({
            data: {
                studentId,
                bookTemplateId
            }
        })

        // Create student songs for all songs in the template
        if (bookTemplate.songs.length > 0) {
            console.log(`🎵 Creating ${bookTemplate.songs.length} student songs...`)

            // Clean up any potential orphaned songs for this book to avoid unique constraint errors
            const songIds = bookTemplate.songs.map(s => s.id)
            await prisma.studentSong.deleteMany({
                where: {
                    studentId,
                    songTemplateId: { in: songIds }
                }
            })

            await prisma.studentSong.createMany({
                data: bookTemplate.songs.map(song => ({
                    studentId,
                    songTemplateId: song.id
                }))
            })
        }

        revalidatePath(`/students/${studentId}`)
        return { success: true }
    } catch (error: any) {
        console.error("❌ Error assigning book:", error)
        return { error: "Error al asignar el libro: " + error.message }
    }
}

export async function removeBookFromStudent(assignmentId: string) {
    try {
        const session = await getSession()
        if (!session?.user?.id) {
            return { error: "No autorizado" }
        }

        const assignment = await prisma.bookAssignment.findUnique({
            where: { id: assignmentId },
            include: { student: true }
        })

        if (!assignment) {
            return { error: "Asignación no encontrada" }
        }

        if (assignment.student.teacherId !== session.user.id) {
            return { error: "No autorizado" }
        }

        // Delete assignment (cascade should handle related data if configured, but let's be safe)
        // Note: StudentSongs are related to Student and SongTemplate, not directly to BookAssignment in schema
        // But we might want to keep them or delete them. 
        // If we delete assignment, we probably want to delete progress for that book.
        // However, StudentSongs are linked to SongTemplates which are linked to BookTemplate.
        // So we can find them.

        // For now, just deleting the assignment record. 
        // Ideally we should also clean up StudentSongs for this book if we want a "clean slate".
        // Let's find the book template and its songs
        const bookTemplate = await prisma.bookTemplate.findUnique({
            where: { id: assignment.bookTemplateId },
            include: { songs: true }
        })

        if (bookTemplate) {
            const songTemplateIds = bookTemplate.songs.map(s => s.id)
            await prisma.studentSong.deleteMany({
                where: {
                    studentId: assignment.studentId,
                    songTemplateId: { in: songTemplateIds }
                }
            })
        }

        await prisma.bookAssignment.delete({
            where: { id: assignmentId }
        })

        revalidatePath(`/students/${assignment.studentId}`)
        return { success: true }
    } catch (error: any) {
        console.error("Error removing book:", error)
        return { error: "Error al eliminar el libro" }
    }
}

export async function toggleBookGraduation(assignmentId: string) {
    console.log("🎓 Toggling graduation for:", assignmentId)
    try {
        const session = await getSession()
        console.log("👤 Session user:", session?.user?.id)

        if (!session?.user?.id) {
            console.log("❌ No session")
            return { error: "No autorizado" }
        }

        const assignment = await prisma.bookAssignment.findUnique({
            where: { id: assignmentId },
            include: { student: true }
        })
        console.log("📚 Assignment found:", assignment ? "yes" : "no")

        if (!assignment) return { error: "Asignación no encontrada" }

        console.log("👨‍🏫 Assignment teacherId:", assignment.student.teacherId)

        if (assignment.student.teacherId !== session.user.id) {
            console.log("❌ Auth mismatch")
            return { error: "No autorizado" }
        }

        const newStatus = !assignment.isGraduated
        const graduationDate = newStatus ? new Date() : null

        await prisma.bookAssignment.update({
            where: { id: assignmentId },
            data: {
                isGraduated: newStatus,
                graduationDate: graduationDate
            }
        })

        revalidatePath(`/students/${assignment.studentId}`)
        return { success: true, isGraduated: newStatus, graduationDate }
    } catch (error: any) {
        console.error("❌ Error toggling graduation:", error)
        return { error: "Error al actualizar estado de graduación: " + error.message }
    }
}
