"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/session"

/**
 * Get all BookTemplates for the current teacher
 */
export async function getBookTemplates() {
    try {
        const session = await getSession()
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado", data: [] }
        }

        const templates = await prisma.bookTemplate.findMany({
            // where: { teacherId: session.user.id }, // Allow seeing all books
            include: {
                songs: {
                    orderBy: { order: 'asc' }
                },
                _count: {
                    select: { assignments: true }
                }
            },
            orderBy: { number: 'asc' }
        })

        return { success: true, data: templates }
    } catch (error) {
        console.error("Error fetching book templates:", error)
        return { success: false, error: "Error al obtener los libros", data: [] }
    }
}

/**
 * Get the next available book number
 */
export async function getNextBookNumber() {
    try {
        const session = await getSession()
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado", data: 1 }
        }

        const lastBook = await prisma.bookTemplate.findFirst({
            where: { teacherId: session.user.id },
            orderBy: { number: 'desc' }
        })

        return { success: true, data: (lastBook?.number || 0) + 1 }
    } catch (error) {
        console.error("Error fetching next book number:", error)
        return { success: false, error: "Error al obtener el número", data: 1 }
    }
}

/**
 * Check if a book number is available
 */
export async function checkBookNumberAvailability(number: number, excludeId?: string) {
    try {
        const session = await getSession()
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado" }
        }

        const where: any = {
            teacherId: session.user.id,
            number: number
        }

        if (excludeId) {
            where.id = { not: excludeId }
        }

        const existing = await prisma.bookTemplate.findFirst({
            where
        })

        return { success: true, available: !existing }
    } catch (error) {
        console.error("Error checking book number:", error)
        return { success: false, error: "Error al verificar número" }
    }
}

/**
 * Get a single BookTemplate by ID
 */
export async function getBookTemplate(id: string) {
    try {
        const session = await getSession()
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado", data: null }
        }

        const template = await prisma.bookTemplate.findFirst({
            where: {
                id,
                // teacherId: session.user.id // Allow viewing any book
            },
            include: {
                songs: {
                    orderBy: { order: 'asc' }
                },
                assignments: {
                    include: {
                        student: true
                    }
                }
            }
        })

        if (!template) {
            return { success: false, error: "Libro no encontrado", data: null }
        }

        return { success: true, data: template }
    } catch (error) {
        console.error("Error fetching book template:", error)
        return { success: false, error: "Error al obtener el libro", data: null }
    }
}

/**
 * Create a new BookTemplate
 */
export async function createBookTemplate(data: {
    title: string
    number: number
    coverImage?: string
    songs: Array<{ title: string; order: number }>
}) {
    try {
        const session = await getSession()
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado" }
        }

        // Check if book number already exists for this teacher
        const existing = await prisma.bookTemplate.findFirst({
            where: {
                teacherId: session.user.id,
                number: data.number
            }
        })

        if (existing) {
            return { success: false, error: "Ya existe un libro con este número" }
        }

        const template = await prisma.bookTemplate.create({
            data: {
                title: data.title,
                number: data.number,
                coverImage: data.coverImage,
                teacherId: session.user.id,
                songs: {
                    create: data.songs
                }
            },
            include: {
                songs: true
            }
        })

        revalidatePath('/books')
        return { success: true, data: template }
    } catch (error) {
        console.error("Error creating book template:", error)
        return { success: false, error: "Error al crear el libro" }
    }
}

/**
 * Update an existing BookTemplate
 */
export async function updateBookTemplate(
    id: string,
    data: {
        title?: string
        number?: number
        coverImage?: string
    }
) {
    try {
        const session = await getSession()
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado" }
        }

        // Verify ownership
        const existing = await prisma.bookTemplate.findFirst({
            where: {
                id,
                // teacherId: session.user.id // Allow editing any book
            }
        })

        if (!existing) {
            return { success: false, error: "Libro no encontrado" }
        }

        // If changing number, check it's not taken
        if (data.number && data.number !== existing.number) {
            const numberTaken = await prisma.bookTemplate.findFirst({
                where: {
                    // teacherId: session.user.id, // Check global uniqueness or just ignore?
                    // If we allow shared editing, we should probably check if number is taken by ANY book?
                    // But the constraint is [teacherId, number].
                    // If I edit a book from Teacher A, I shouldn't change its number to clash with another book of Teacher A.
                    // So we should check against the ORIGINAL owner's books.
                    // But we don't have the original owner here easily without fetching.
                    // The 'existing' variable has the book info.
                    teacherId: existing.teacherId,
                    number: data.number,
                    id: { not: id }
                }
            })

            if (numberTaken) {
                return { success: false, error: "Ya existe un libro con este número" }
            }
        }

        const template = await prisma.bookTemplate.update({
            where: { id },
            data: {
                title: data.title,
                number: data.number,
                coverImage: data.coverImage
            },
            include: {
                songs: true
            }
        })

        revalidatePath('/books')
        revalidatePath(`/books/${id}`)
        return { success: true, data: template }
    } catch (error) {
        console.error("Error updating book template:", error)
        return { success: false, error: "Error al actualizar el libro" }
    }
}

/**
 * Delete a BookTemplate
 */
export async function deleteBookTemplate(id: string) {
    try {
        const session = await getSession()
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado" }
        }

        // Verify ownership
        const existing = await prisma.bookTemplate.findFirst({
            where: {
                id,
                // teacherId: session.user.id // Allow deleting any book
            },
            include: {
                _count: {
                    select: { assignments: true }
                }
            }
        })

        if (!existing) {
            return { success: false, error: "Libro no encontrado" }
        }

        // Warn if there are assignments
        if (existing._count.assignments > 0) {
            return {
                success: false,
                error: `Este libro está asignado a ${existing._count.assignments} estudiante(s). Elimina las asignaciones primero.`
            }
        }

        await prisma.bookTemplate.delete({
            where: { id }
        })

        revalidatePath('/books')
        return { success: true }
    } catch (error) {
        console.error("Error deleting book template:", error)
        return { success: false, error: "Error al eliminar el libro" }
    }
}

/**
 * Add a song to a BookTemplate
 */
export async function addSongToTemplate(
    bookTemplateId: string,
    song: { title: string; order: number }
) {
    try {
        const session = await getSession()
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado" }
        }

        // Verify ownership
        const template = await prisma.bookTemplate.findFirst({
            where: {
                id: bookTemplateId,
                // teacherId: session.user.id // Allow adding songs to any book
            }
        })

        if (!template) {
            return { success: false, error: "Libro no encontrado" }
        }

        const songTemplate = await prisma.songTemplate.create({
            data: {
                title: song.title,
                order: song.order,
                bookTemplateId
            }
        })

        revalidatePath(`/books/${bookTemplateId}`)
        return { success: true, data: songTemplate }
    } catch (error) {
        console.error("Error adding song:", error)
        return { success: false, error: "Error al añadir la canción" }
    }
}

/**
 * Update a song in a BookTemplate
 */
export async function updateSongTemplate(
    songId: string,
    data: { title?: string; order?: number }
) {
    try {
        const session = await getSession()
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado" }
        }

        // Verify ownership through BookTemplate
        const song = await prisma.songTemplate.findUnique({
            where: { id: songId },
            include: {
                bookTemplate: true
            }
        })

        if (!song) { // || song.bookTemplate.teacherId !== session.user.id) {
            return { success: false, error: "Canción no encontrada" }
        }

        const updated = await prisma.songTemplate.update({
            where: { id: songId },
            data
        })

        revalidatePath(`/books/${song.bookTemplateId}`)
        return { success: true, data: updated }
    } catch (error) {
        console.error("Error updating song:", error)
        return { success: false, error: "Error al actualizar la canción" }
    }
}

/**
 * Delete a song from a BookTemplate
 */
export async function deleteSongTemplate(songId: string) {
    try {
        const session = await getSession()
        if (!session?.user?.id) {
            return { success: false, error: "No autorizado" }
        }

        // Verify ownership through BookTemplate
        const song = await prisma.songTemplate.findUnique({
            where: { id: songId },
            include: {
                bookTemplate: true,
                _count: {
                    select: { studentSongs: true }
                }
            }
        })

        if (!song || song.bookTemplate.teacherId !== session.user.id) {
            return { success: false, error: "Canción no encontrada" }
        }

        // Warn if there are student songs
        if (song._count.studentSongs > 0) {
            return {
                success: false,
                error: `Esta canción está siendo usada por ${song._count.studentSongs} estudiante(s).`
            }
        }

        await prisma.songTemplate.delete({
            where: { id: songId }
        })

        revalidatePath(`/books/${song.bookTemplateId}`)
        return { success: true }
    } catch (error) {
        console.error("Error deleting song:", error)
        return { success: false, error: "Error al eliminar la canción" }
    }
}
