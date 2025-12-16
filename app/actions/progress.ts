'use server'

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"

/**
 * Create a new progress note for a song
 */
export async function createProgressNote(data: {
    studentSongId: string
    leftHand: number
    rightHand: number
    bothHands: number
    note?: string
}) {
    try {
        const session = await getSession()

        if (!session?.user?.id) {
            return { success: false, error: "No autorizado" }
        }

        // Verify the song belongs to a student of this teacher
        const studentSong = await prisma.studentSong.findUnique({
            where: { id: data.studentSongId },
            include: {
                student: true
            }
        })

        if (!studentSong || studentSong.student.teacherId !== session.user.id) {
            return { success: false, error: "Canción no encontrada o no autorizada" }
        }

        // Validate progress values (0-100)
        if (
            data.leftHand < 0 || data.leftHand > 100 ||
            data.rightHand < 0 || data.rightHand > 100 ||
            data.bothHands < 0 || data.bothHands > 100
        ) {
            return { success: false, error: "Los valores de progreso deben estar entre 0 y 100" }
        }

        // Create progress note
        const progress = await prisma.progress.create({
            data: {
                studentSongId: data.studentSongId,
                leftHand: data.leftHand,
                rightHand: data.rightHand,
                bothHands: data.bothHands,
                note: data.note || null,
                date: new Date()
            }
        })

        // Revalidate the student page
        revalidatePath(`/students/${studentSong.studentId}`)

        return { success: true, progress }

    } catch (error: any) {
        console.error("Error creating progress note:", error)
        return { success: false, error: "Error al crear la nota de progreso: " + error.message }
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

    } catch (error: any) {
        console.error("Error fetching progress history:", error)
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

    } catch (error: any) {
        console.error("Error deleting progress note:", error)
        return { success: false, error: "Error al eliminar la nota de progreso: " + error.message }
    }
}
