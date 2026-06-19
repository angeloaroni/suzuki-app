'use server'

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function toggleSongProgress(
    id: string,
    field: 'metric1' | 'metric2' | 'metric3' | 'completed',
    context?: { studentId: string, templateId: string }
) {
    try {
        const session = await getSession()
        if (!session?.user?.id) {
            return { error: "No autorizado" }
        }

        let studentSong = await prisma.studentSong.findUnique({
            where: { id },
            include: {
                student: true
            }
        })

        // If not found and context provided, try to find or create
        if (!studentSong && context) {
            // Verify student belongs to teacher
            const student = await prisma.student.findUnique({
                where: { id: context.studentId }
            })

            if (!student || student.teacherId !== session.user.id) {
                return { error: "No autorizado" }
            }

            // Find or create
            studentSong = await prisma.studentSong.upsert({
                where: {
                    studentId_songTemplateId: {
                        studentId: context.studentId,
                        songTemplateId: context.templateId
                    }
                },
                create: {
                    studentId: context.studentId,
                    songTemplateId: context.templateId
                },
                update: {},
                include: { student: true }
            })
        }

        if (!studentSong) return { error: "Canción no encontrada" }

        if (studentSong.student.teacherId !== session.user.id) {
            return { error: "No autorizado" }
        }

        let updateData: any = {}
        let newValue: boolean

        switch (field) {
            case 'metric1':
                newValue = !studentSong.learned1
                updateData = { learned1: newValue }
                break
            case 'metric2':
                newValue = !studentSong.learned2
                updateData = { learned2: newValue }
                break
            case 'metric3':
                newValue = !studentSong.learned3
                updateData = { learned3: newValue }
                // If metric3 is learned, also mark metric1 and metric2 as learned
                if (newValue) {
                    updateData.learned1 = true
                    updateData.learned2 = true
                }
                break
            case 'completed':
                newValue = !studentSong.completed
                updateData = { completed: newValue }
                break
        }

        await prisma.studentSong.update({
            where: { id: studentSong.id }, // Use the found/created ID
            data: updateData
        })

        revalidatePath(`/students/${studentSong.studentId}`)
        return { success: true, newValue, updatedFields: updateData }

    } catch (error) {
        return { error: "Error al actualizar el progreso" }
    }
}

export async function uploadSongImage(studentSongId: string, base64Data: string, filename: string) {
    try {
        const session = await getSession()
        if (!session?.user?.id) {
            return { error: "No autorizado" }
        }

        const studentSong = await prisma.studentSong.findUnique({
            where: { id: studentSongId },
            include: { student: true }
        })

        if (!studentSong) return { error: "Canción no encontrada" }
        if (studentSong.student.teacherId !== session.user.id) return { error: "No autorizado" }

        if (!base64Data || !filename) {
            return { error: "No se ha subido ningún archivo" }
        }

        // Convert base64 to buffer
        const base64WithoutPrefix = base64Data.replace(/^data:image\/\w+;base64,/, '')
        const buffer = Buffer.from(base64WithoutPrefix, 'base64')

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = filename.split('.').pop()
        const newFilename = `song-${studentSongId}-${uniqueSuffix}.${ext}`

        const uploadDir = join(process.cwd(), 'public', 'uploads')
        await mkdir(uploadDir, { recursive: true })

        const filepath = join(uploadDir, newFilename)
        await writeFile(filepath, buffer)

        const imageUrl = `/uploads/${newFilename}`

        await prisma.studentSong.update({
            where: { id: studentSongId },
            data: { imageUrl }
        })

        revalidatePath(`/students/${studentSong.studentId}`)
        return { success: true, imageUrl }
    } catch (error) {
        return { error: "Error al subir la imagen: " + (error instanceof Error ? error.message : "Error desconocido") }
    }
}

export async function updateSongDetails(studentSongId: string, data: { notes?: string; youtubeUrl?: string }) {
    try {
        const session = await getSession()
        if (!session?.user?.id) {
            return { error: "No autorizado" }
        }

        const studentSong = await prisma.studentSong.findUnique({
            where: { id: studentSongId },
            include: { student: true }
        })

        if (!studentSong) return { error: "Canción no encontrada" }
        if (studentSong.student.teacherId !== session.user.id) return { error: "No autorizado" }

        await prisma.studentSong.update({
            where: { id: studentSongId },
            data: {
                notes: data.notes,
                youtubeUrl: data.youtubeUrl
            }
        })

        revalidatePath(`/students/${studentSong.studentId}`)
        return { success: true }
    } catch (error) {
        return { error: "Error al actualizar los detalles" }
    }
}

export async function uploadSongAudio(studentSongId: string, base64Data: string, filename: string) {
    try {
        const session = await getSession()
        if (!session?.user?.id) {
            return { error: "No autorizado" }
        }

        const studentSong = await prisma.studentSong.findUnique({
            where: { id: studentSongId },
            include: { student: true }
        })

        if (!studentSong) return { error: "Canción no encontrada" }
        if (studentSong.student.teacherId !== session.user.id) return { error: "No autorizado" }

        if (!base64Data || !filename) {
            return { error: "No se ha subido ningún archivo" }
        }

        // Convert base64 to buffer
        const base64WithoutPrefix = base64Data.replace(/^data:audio\/\w+;base64,/, '')
        const buffer = Buffer.from(base64WithoutPrefix, 'base64')

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = filename.split('.').pop()
        const newFilename = `audio-${studentSongId}-${uniqueSuffix}.${ext}`

        const uploadDir = join(process.cwd(), 'public', 'uploads')
        await mkdir(uploadDir, { recursive: true })

        const filepath = join(uploadDir, newFilename)
        await writeFile(filepath, buffer)

        const audioUrl = `/uploads/${newFilename}`

        await prisma.studentSong.update({
            where: { id: studentSongId },
            data: { audioUrl }
        })

        revalidatePath(`/students/${studentSong.studentId}`)
        return { success: true, audioUrl }

    } catch (error) {
        return { error: "Error al subir el audio" }
    }
}

export async function createCustomSong(bookId: string, data: { title: string, order: number, notes?: string, youtubeUrl?: string }) {
    try {
        const session = await getSession()
        if (!session?.user?.id) {
            return { error: "No autorizado" }
        }

        const book = await prisma.bookTemplate.findUnique({
            where: { id: bookId }
        })

        if (!book || book.teacherId !== session.user.id) {
            return { error: "No autorizado" }
        }

        const song = await prisma.songTemplate.create({
            data: {
                title: data.title,
                order: data.order,
                bookTemplateId: bookId,
            }
        })

        revalidatePath(`/books/${bookId}`)
        return { success: true, song }
    } catch (error) {
        return { error: "Error al crear la canción" }
    }
}

export async function updateStudentSongOrders(studentId: string, updates: { templateId: string, order: number }[]) {
    try {
        const session = await getSession()
        if (!session?.user?.id) {
            return { error: "No autorizado" }
        }

        const student = await prisma.student.findUnique({
            where: { id: studentId }
        })

        if (!student || student.teacherId !== session.user.id) {
            return { error: "No autorizado" }
        }

        for (const update of updates) {
            await prisma.studentSong.upsert({
                where: {
                    studentId_songTemplateId: {
                        studentId,
                        songTemplateId: update.templateId
                    }
                },
                create: {
                    studentId,
                    songTemplateId: update.templateId,
                    order: update.order
                },
                update: {
                    order: update.order
                }
            })
        }

        revalidatePath(`/students/${studentId}`)
        return { success: true }
    } catch (error) {
        return { error: "Error al actualizar el orden de las canciones" }
    }
}
