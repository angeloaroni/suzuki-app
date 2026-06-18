'use server'

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { createStudentSchema, updateStudentSchema } from "@/lib/validations"

export async function createStudent(data: { name: string; dob?: string; notes?: string }) {
    try {
        const session = await getSession()

        if (!session?.user?.id) {
            return { error: "No autorizado (Sesión no encontrada en Server Action)" }
        }

        const parsed = createStudentSchema.safeParse(data)
        if (!parsed.success) {
            return { error: parsed.error.errors[0].message }
        }
        const validatedData = parsed.data

        const student = await prisma.student.create({
            data: {
                name: validatedData.name,
                dob: validatedData.dob ? new Date(validatedData.dob) : null,
                notes: validatedData.notes,
                teacherId: session.user.id
            }
        })

        // Auto-assign Book 1 if it exists
        const book1 = await prisma.bookTemplate.findFirst({
            where: {
                teacherId: session.user.id,
                number: 1
            },
            include: { songs: true }
        })

        if (book1) {
            await prisma.bookAssignment.create({
                data: {
                    studentId: student.id,
                    bookTemplateId: book1.id
                }
            })

            if (book1.songs.length > 0) {
                await prisma.studentSong.createMany({
                    data: book1.songs.map(song => ({
                        studentId: student.id,
                        songTemplateId: song.id
                    }))
                })
            }
        }

        revalidatePath('/dashboard')
        return { success: true, student }

    } catch (error) {
        return { error: "Error interno del servidor: " + (error instanceof Error ? error.message : "Error desconocido") }
    }
}

export async function updateStudent(studentId: string, data: { name: string; dob?: string; notes?: string }) {
    try {
        const session = await getSession()

        if (!session?.user?.id) {
            return { error: "No autorizado" }
        }

        // Verify the student belongs to the current teacher
        const student = await prisma.student.findUnique({
            where: { id: studentId }
        })

        if (!student || student.teacherId !== session.user.id) {
            return { error: "Estudiante no encontrado o no autorizado" }
        }

        const parsed = updateStudentSchema.safeParse(data)
        if (!parsed.success) {
            return { error: parsed.error.errors[0].message }
        }
        const validatedData = parsed.data

        const updatedStudent = await prisma.student.update({
            where: { id: studentId },
            data: {
                name: validatedData.name,
                dob: validatedData.dob ? new Date(validatedData.dob) : null,
                notes: validatedData.notes
            }
        })

        revalidatePath('/dashboard')
        revalidatePath(`/students/${studentId}`)
        return { success: true, student: updatedStudent }

    } catch (error) {
        return { error: "Error al actualizar el estudiante: " + (error instanceof Error ? error.message : "Error desconocido") }
    }
}

export async function deleteStudent(studentId: string) {
    try {
        const session = await getSession()

        if (!session?.user?.id) {
            return { error: "No autorizado" }
        }

        // Verify the student belongs to the current teacher
        const student = await prisma.student.findUnique({
            where: { id: studentId }
        })

        if (!student || student.teacherId !== session.user.id) {
            return { error: "Estudiante no encontrado o no autorizado" }
        }

        // Delete the student (cascade will delete related books and songs)
        await prisma.student.delete({
            where: { id: studentId }
        })

        revalidatePath('/dashboard')
        return { success: true }

    } catch (error) {
        return { error: "Error al eliminar el estudiante: " + (error instanceof Error ? error.message : "Error desconocido") }
    }
}

