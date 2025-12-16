import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        console.log("Login request en RUTA NUEVA (Compatibilidad):", body.email)

        if (body.email === "test@test.test") {
            // Usamos new NextResponse en lugar de NextResponse.json para máxima compatibilidad
            const response = new NextResponse(JSON.stringify({
                success: true,
                user: { name: "Test User", email: "test@test.test" }
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            })

            response.cookies.set({
                name: 'session',
                value: 'test-token-123',
                httpOnly: true,
                path: '/',
                maxAge: 60 * 60 * 24
            })

            return response
        }

        return new NextResponse(JSON.stringify({ error: "Usuario no encontrado" }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (e: any) {
        return new NextResponse(JSON.stringify({ error: "Error interno: " + e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
