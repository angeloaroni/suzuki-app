'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { practiceSessionSchema } from "@/lib/validations"

/**
 * Log a practice session (called from parent portal, no teacher auth required)
 */
export async function logPracticeSession(data: {
    accessCode: string
    date: string // ISO date string YYYY-MM-DD
    duration: number // minutes
    notes?: string
}) {
    try {
        const parsed = practiceSessionSchema.safeParse(data)
        if (!parsed.success) {
            return { success: false, error: parsed.error.errors[0].message }
        }
        const validatedData = parsed.data

        const student = await prisma.student.findUnique({
            where: { accessCode: validatedData.accessCode }
        })

        if (!student) {
            return { success: false, error: "Código de acceso no válido" }
        }

        const dateObj = new Date(validatedData.date + 'T00:00:00.000Z')

        const session = await prisma.practiceSession.upsert({
            where: {
                studentId_date: {
                    studentId: student.id,
                    date: dateObj
                }
            },
            update: {
                duration: { increment: validatedData.duration },
                notes: validatedData.notes || null
            },
            create: {
                studentId: student.id,
                date: dateObj,
                duration: validatedData.duration,
                notes: validatedData.notes || null
            }
        })

        return { success: true, data: session }
    } catch (error) {
        return { success: false, error: "Error al registrar la sesión de práctica" }
    }
}

/**
 * Get practice sessions for a student (last 30 days)
 */
export async function getPracticeSessions(accessCode: string) {
    try {
        const student = await prisma.student.findUnique({
            where: { accessCode },
            include: {
                practiceSessions: {
                    orderBy: { date: 'desc' },
                    take: 60
                }
            }
        })

        if (!student) {
            return { success: false, error: "Código de acceso no válido", data: [] }
        }

        return { success: true, data: student.practiceSessions }
    } catch (error) {
        return { success: false, error: "Error al obtener sesiones", data: [] }
    }
}

/**
 * Get practice sessions for a student by ID (teacher auth required)
 */
export async function getPracticeSessionsByStudentId(studentId: string) {
    try {
        const { getSession } = await import("@/lib/session")
        const session = await getSession()
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado", data: [] }
        }

        const student = await prisma.student.findUnique({
            where: { id: studentId }
        })

        if (!student || student.teacherId !== session.user.id) {
            return { success: false, error: "Estudiante no encontrado", data: [] }
        }

        const practiceSessions = await prisma.practiceSession.findMany({
            where: { studentId },
            orderBy: { date: 'desc' },
            take: 60
        })

        return { success: true, data: practiceSessions }
    } catch (error) {
        return { success: false, error: "Error al obtener sesiones", data: [] }
    }
}

