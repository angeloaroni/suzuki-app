'use server'

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function createStudent(data: { name: string; dob?: string; notes?: string }) {
    try {
        console.log("Server Action: createStudent called")
        const session = await getSession()
        console.log("Server Action Session:", session ? "Found" : "Not Found")

        if (!session?.user?.id) {
            return { error: "No autorizado (Sesión no encontrada en Server Action)" }
        }

        if (!data.name) {
            return { error: "El nombre es obligatorio" }
        }

        const student = await prisma.student.create({
            data: {
                name: data.name,
                dob: data.dob ? new Date(data.dob) : null,
                notes: data.notes,
                teacherId: session.user.id
            }
        })

        console.log("Server Action: Student created", student.id)
        revalidatePath('/dashboard')
        return { success: true, student }

    } catch (error: any) {
        console.error("Server Action Error:", error)
        return { error: "Error interno del servidor: " + error.message }
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

        if (!data.name) {
            return { error: "El nombre es obligatorio" }
        }

        const updatedStudent = await prisma.student.update({
            where: { id: studentId },
            data: {
                name: data.name,
                dob: data.dob ? new Date(data.dob) : null,
                notes: data.notes
            }
        })

        revalidatePath('/dashboard')
        revalidatePath(`/students/${studentId}`)
        return { success: true, student: updatedStudent }

    } catch (error: any) {
        console.error("Update Student Error:", error)
        return { error: "Error al actualizar el estudiante: " + error.message }
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

    } catch (error: any) {
        console.error("Delete Student Error:", error)
        return { error: "Error al eliminar el estudiante: " + error.message }
    }
}

