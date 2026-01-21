'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function toggleAttendance(studentId: string, date: string, present: boolean) {
    const session = await getSession()
    if (!session) {
        return { error: 'No autorizado' }
    }

    try {
        // Verify student belongs to teacher
        const student = await prisma.student.findFirst({
            where: {
                id: studentId,
                teacherId: session.user.id
            }
        })

        if (!student) {
            return { error: 'Estudiante no encontrado' }
        }

        const dateObj = new Date(date)
        dateObj.setHours(0, 0, 0, 0)

        // Upsert attendance record
        const attendance = await prisma.attendance.upsert({
            where: {
                studentId_date: {
                    studentId,
                    date: dateObj
                }
            },
            update: {
                present
            },
            create: {
                studentId,
                date: dateObj,
                present
            }
        })

        revalidatePath('/attendance')
        return { success: true, attendance }
    } catch (error) {
        console.error('Error toggling attendance:', error)
        return { error: 'Error al actualizar asistencia' }
    }
}

export async function getAttendanceByMonth(year: number, month: number) {
    const session = await getSession()
    if (!session) {
        return { error: 'No autorizado', data: [] }
    }

    try {
        const startDate = new Date(year, month, 1)
        const endDate = new Date(year, month + 1, 0)

        const attendances = await prisma.attendance.findMany({
            where: {
                student: {
                    teacherId: session.user.id
                },
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                date: 'asc'
            }
        })

        return {
            data: attendances.map(a => ({
                ...a,
                date: a.date.toISOString(),
                createdAt: a.createdAt.toISOString(),
                updatedAt: a.updatedAt.toISOString()
            }))
        }
    } catch (error) {
        console.error('Error fetching attendance:', error)
        return { error: 'Error al obtener asistencia', data: [] }
    }
}

export async function deleteAttendance(studentId: string, date: string) {
    const session = await getSession()
    if (!session) {
        return { error: 'No autorizado' }
    }

    try {
        const dateObj = new Date(date)
        dateObj.setHours(0, 0, 0, 0)

        await prisma.attendance.delete({
            where: {
                studentId_date: {
                    studentId,
                    date: dateObj
                }
            }
        })

        revalidatePath('/attendance')
        return { success: true }
    } catch (error) {
        console.error('Error deleting attendance:', error)
        return { error: 'Error al eliminar asistencia' }
    }
}
