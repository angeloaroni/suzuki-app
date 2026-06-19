'use server'

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { progressSchema } from "@/lib/validations"

/**
 * Create a new progress note for a song
 */
export async function createProgressNote(data: {
    studentSongId: string
    metric1: number
    metric2: number
    metric3: number
    note?: string
}) {
    try {
        const parsed = progressSchema.safeParse(data)
        if (!parsed.success) {
            return { success: false, error: parsed.error.errors[0].message }
        }
        const validatedData = parsed.data

        const session = await getSession()

        if (!session?.user?.id) {
            return { success: false, error: "No autorizado" }
        }

        // Verify the song belongs to a student of this teacher
        const studentSong = await prisma.studentSong.findUnique({
            where: { id: validatedData.studentSongId },
            include: {
                student: true
            }
        })

        if (!studentSong || studentSong.student.teacherId !== session.user.id) {
            return { success: false, error: "Canción no encontrada o no autorizada" }
        }

        // Create progress note
        const progress = await prisma.progress.create({
            data: {
                studentSongId: validatedData.studentSongId,
                metric1: validatedData.metric1,
                metric2: validatedData.metric2,
                metric3: validatedData.metric3,
                note: validatedData.note || null,
                date: new Date()
            }
        })

        // Revalidate the student page
        revalidatePath(`/students/${studentSong.studentId}`)

        return { success: true, progress }

    } catch (error) {
        return { success: false, error: "Error al crear la nota de progreso: " + (error instanceof Error ? error.message : "Error desconocido") }
    }
}

/**
 * Get all progress notes for a song, ordered by date (newest first)
 */
export async function getSongProgressHistory(studentSongId: string) {
    try {
        const session = await getSession()

        if (!session?.user?.id) {
            return { success: false, error: "No autorizado", data: [] }
        }

        // Verify the song belongs to a student of this teacher
        const studentSong = await prisma.studentSong.findUnique({
            where: { id: studentSongId },
            include: {
                student: true
            }
        })

        if (!studentSong || studentSong.student.teacherId !== session.user.id) {
            return { success: false, error: "Canción no encontrada o no autorizada", data: [] }
        }

        // Get all progress notes for this song
        const progressHistory = await prisma.progress.findMany({
            where: { studentSongId },
            orderBy: { date: 'desc' }
        })

        return { success: true, data: progressHistory }

    } catch (error) {
        return { success: false, error: "Error al obtener el historial de progreso", data: [] }
    }
}

/**
 * Delete a progress note
 */
export async function deleteProgressNote(progressId: string) {
    try {
        const session = await getSession()

        if (!session?.user?.id) {
            return { success: false, error: "No autorizado" }
        }

        // Get the progress note with song and student info
        const progress = await prisma.progress.findUnique({
            where: { id: progressId },
            include: {
                studentSong: {
                    include: {
                        student: true
                    }
                }
            }
        })

        if (!progress || progress.studentSong.student.teacherId !== session.user.id) {
            return { success: false, error: "Nota de progreso no encontrada o no autorizada" }
        }

        // Delete the progress note
        await prisma.progress.delete({
            where: { id: progressId }
        })

        // Revalidate the student page
        revalidatePath(`/students/${progress.studentSong.studentId}`)

        return { success: true }

    } catch (error) {
        return { success: false, error: "Error al eliminar la nota de progreso: " + (error instanceof Error ? error.message : "Error desconocido") }
    }
}

/**
 * Update an existing progress note
 */
export async function updateProgressNote(progressId: string, data: {
    metric1: number
    metric2: number
    metric3: number
    note?: string
}) {
    try {
        const session = await getSession()

        if (!session?.user?.id) {
            return { success: false, error: "No autorizado" }
        }

        // Verify the note belongs to this teacher
        const progress = await prisma.progress.findUnique({
            where: { id: progressId },
            include: {
                studentSong: {
                    include: {
                        student: true
                    }
                }
            }
        })

        if (!progress || progress.studentSong.student.teacherId !== session.user.id) {
            return { success: false, error: "Nota no encontrada o no autorizada" }
        }

        // Validate values
        if (
            data.metric1 < 0 || data.metric1 > 100 ||
            data.metric2 < 0 || data.metric2 > 100 ||
            data.metric3 < 0 || data.metric3 > 100
        ) {
            return { success: false, error: "Valores inválidos" }
        }

        // Update
        const updated = await prisma.progress.update({
            where: { id: progressId },
            data: {
                metric1: data.metric1,
                metric2: data.metric2,
                metric3: data.metric3,
                note: data.note || null
            }
        })

        revalidatePath(`/students/${progress.studentSong.studentId}`)
        return { success: true, progress: updated }

    } catch (error) {
        return { success: false, error: "Error al actualizar la nota" }
    }
}
