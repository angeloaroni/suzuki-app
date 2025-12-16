"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { SUZUKI_BOOKS } from "@/lib/suzuki-data"
import { getSession } from "@/lib/session"

export async function addSuzukiBookToStudent(studentId: string, bookNumber: number) {
    const session = await getSession()
    if (!session?.user?.id) {
        return { success: false, error: "No autorizado" }
    }

    const bookTemplate = SUZUKI_BOOKS.find(b => b.number === bookNumber)

    if (!bookTemplate) {
        return { success: false, error: "Libro no encontrado" }
    }

    try {
        // Check if book already exists for this student
        const existingBook = await prisma.book.findFirst({
            where: {
                studentId,
                number: bookNumber
            }
        })

        if (existingBook) {
            return { success: false, error: "Este libro ya está asignado al estudiante" }
        }

        const book = await prisma.book.create({
            data: {
                title: bookTemplate.title,
                number: bookTemplate.number,
                studentId: studentId,
                songs: {
                    create: bookTemplate.songs.map(song => ({
                        title: song.title,
                        order: song.order
                    }))
                }
            }
        })

        revalidatePath(`/students/${studentId}`)
        return { success: true, book }
    } catch (error) {
        console.error("Error adding book:", error)
        return { success: false, error: "Error al agregar el libro" }
    }
}

export async function getStudentBooks(studentId: string) {
    try {
        const books = await prisma.book.findMany({
            where: { studentId },
            include: {
                songs: {
                    orderBy: { order: 'asc' },
                    include: {
                        progresses: {
                            orderBy: { date: 'desc' },
                            take: 1
                        }
                    }
                }
            },
            orderBy: { number: 'asc' }
        })
        return books
    } catch (error) {
        console.error("Error fetching books:", error)
        return []
    }
}

export async function updateBook(bookId: string, data: { title?: string; number?: number }) {
    try {
        const session = await getSession()
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado" }
        }

        const book = await prisma.book.update({
            where: { id: bookId },
            data: {
                title: data.title,
                number: data.number
            },
            include: {
                student: true
            }
        })

        revalidatePath(`/students/${book.studentId}`)
        return { success: true, book }
    } catch (error) {
        console.error("Error updating book:", error)
        return { success: false, error: "Error al actualizar el libro" }
    }
}

export async function deleteBook(bookId: string) {
    try {
        const session = await getSession()
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado" }
        }

        // Get book to find studentId for revalidation
        const book = await prisma.book.findUnique({
            where: { id: bookId },
            select: { studentId: true }
        })

        if (!book) {
            return { success: false, error: "Libro no encontrado" }
        }

        // Delete book (songs will be cascade deleted if configured in schema)
        await prisma.song.deleteMany({
            where: { bookId }
        })

        await prisma.book.delete({
            where: { id: bookId }
        })

        revalidatePath(`/students/${book.studentId}`)
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error("Error deleting book:", error)
        return { success: false, error: "Error al eliminar el libro" }
    }
}

export async function getAvailableBooks(studentId: string) {
    try {
        const assignedBooks = await prisma.book.findMany({
            where: { studentId },
            select: { number: true }
        })

        const assignedNumbers = assignedBooks.map(b => b.number)
        const availableBooks = SUZUKI_BOOKS.filter(b => !assignedNumbers.includes(b.number))

        return availableBooks
    } catch (error) {
        console.error("Error fetching available books:", error)
        return []
    }
}
