import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

// Helper para respuestas JSON usando Response nativo (ya que NextResponse falla)
function jsonResponse(data: any, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
    })
}

export async function POST(request: Request) {
    try {
        console.log("API /api/students: Iniciando creación de estudiante")

        // Debug sesión
        const session = await getSession()
        console.log("API Session:", session ? "Encontrada" : "No encontrada")

        if (!session?.user?.id) {
            const cookieHeader = request.headers.get('cookie') || 'No cookies'
            console.log("API: No autorizado. Cookies recibidas:", cookieHeader)
            return jsonResponse({
                error: "No autorizado",
                debug: {
                    cookiesReceived: cookieHeader,
                    sessionFound: !!session,
                    sessionUser: session?.user
                }
            }, 401)
        }

        const body = await request.json()
        const { name, dob, notes } = body

        if (!name) {
            return jsonResponse({ error: "El nombre es obligatorio" }, 400)
        }

        const student = await prisma.student.create({
            data: {
                name,
                dob: dob ? new Date(dob) : null,
                notes,
                teacherId: session.user.id
            }
        })

        console.log("API: Estudiante creado:", student.id)
        return jsonResponse(student)

    } catch (error: any) {
        console.error("API Error:", error)
        return jsonResponse({ error: "Error interno del servidor: " + error.message }, 500)
    }
}
