'use server'

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

/**
 * Generate or get the access code for a student's parent portal
 */
export async function generateAccessCode(studentId: string) {
    try {
        const session = await getSession()
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado" }
        }

        const student = await prisma.student.findUnique({
            where: { id: studentId }
        })

        if (!student || student.teacherId !== session.user.id) {
            return { success: false, error: "Estudiante no encontrado" }
        }

        // If already has a code, return it
        if (student.accessCode) {
            return { success: true, code: student.accessCode }
        }

        // Generate a unique 8-char alphanumeric code
        const code = crypto.randomBytes(4).toString('hex').toUpperCase()

        await prisma.student.update({
            where: { id: studentId },
            data: { accessCode: code }
        })

        revalidatePath(`/students/${studentId}`)
        return { success: true, code }
    } catch (error: any) {
        console.error("Error generating access code:", error)
        return { success: false, error: "Error al generar el código" }
    }
}

/**
 * Regenerate access code (invalidates old one)
 */
export async function regenerateAccessCode(studentId: string) {
    try {
        const session = await getSession()
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado" }
        }

        const student = await prisma.student.findUnique({
            where: { id: studentId }
        })

        if (!student || student.teacherId !== session.user.id) {
            return { success: false, error: "Estudiante no encontrado" }
        }

        const code = crypto.randomBytes(4).toString('hex').toUpperCase()

        await prisma.student.update({
            where: { id: studentId },
            data: { accessCode: code }
        })

        revalidatePath(`/students/${studentId}`)
        return { success: true, code }
    } catch (error: any) {
        console.error("Error regenerating access code:", error)
        return { success: false, error: "Error al regenerar el código" }
    }
}

/**
 * Get student data for the parent portal (public, no auth required)
 */
export async function getStudentByAccessCode(code: string) {
    try {
        const student = await prisma.student.findUnique({
            where: { accessCode: code },
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
                            orderBy: { date: 'desc' },
                            take: 1
                        }
                    }
                },
                practiceSessions: {
                    orderBy: { date: 'desc' },
                    take: 30
                }
            }
        })

        if (!student) {
            return { success: false, error: "Código de acceso no válido" }
        }

        return { success: true, data: student }
    } catch (error: any) {
        console.error("Error fetching student by access code:", error)
        return { success: false, error: "Error al obtener los datos" }
    }
}
