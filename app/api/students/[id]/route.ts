import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/session"

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Get session from request cookies
        const sessionCookie = request.cookies.get('session')

        if (!sessionCookie) {
            console.log("[API] No session cookie found")
            return new NextResponse(
                JSON.stringify({ error: "No autorizado" }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            )
        }

        const session = await decrypt(sessionCookie.value)

        if (!session?.user?.id) {
            console.log("[API] Invalid session")
            return new NextResponse(
                JSON.stringify({ error: "No autorizado" }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            )
        }

        console.log("[API] Fetching student:", params.id, "for teacher:", session.user.id)

        const student = await prisma.student.findUnique({
            where: { id: params.id },
            include: {
                books: {
                    include: {
                        songs: {
                            orderBy: { order: 'asc' }
                        }
                    },
                    orderBy: { number: 'asc' }
                }
            }
        })

        if (!student) {
            console.log("[API] Student not found:", params.id)
            return new NextResponse(
                JSON.stringify({ error: "Estudiante no encontrado" }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Verify the student belongs to the current teacher
        if (student.teacherId !== session.user.id) {
            console.log("[API] Student doesn't belong to teacher")
            return new NextResponse(
                JSON.stringify({ error: "No autorizado" }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            )
        }

        console.log("[API] Student found successfully:", student.name)
        return new NextResponse(
            JSON.stringify(student),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error("[API] Error fetching student:", error)
        return new NextResponse(
            JSON.stringify({ error: "Error interno del servidor" }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }
}
