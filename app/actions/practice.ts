'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

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
        const student = await prisma.student.findUnique({
            where: { accessCode: data.accessCode }
        })

        if (!student) {
            return { success: false, error: "Código de acceso no válido" }
        }

        const dateObj = new Date(data.date + 'T00:00:00.000Z')

        const session = await prisma.practiceSession.upsert({
            where: {
                studentId_date: {
                    studentId: student.id,
                    date: dateObj
                }
            },
            update: {
                duration: data.duration,
                notes: data.notes || null
            },
            create: {
                studentId: student.id,
                date: dateObj,
                duration: data.duration,
                notes: data.notes || null
            }
        })

        return { success: true, data: session }
    } catch (error: any) {
        console.error("Error logging practice session:", error)
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
    } catch (error: any) {
        console.error("Error fetching practice sessions:", error)
        return { success: false, error: "Error al obtener sesiones", data: [] }
    }
}

