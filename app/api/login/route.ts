import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"
import { NextResponse } from "next/server"
import { login } from "@/lib/session"
import { cookies } from "next/headers"

export async function POST(request: Request) {
    try {
        // Intentar leer JSON o FormData
        let email, password;
        const contentType = request.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            const body = await request.json();
            email = body.email;
            password = body.password;
        } else {
            const formData = await request.formData()
            email = formData.get('email') as string
            password = formData.get('password') as string
        }

        console.log("Login attempt for:", email)

        if (!email || !password) {
            return NextResponse.json({ error: "Faltan credenciales" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user || !user.password) {
            console.log("User not found")
            return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
        }

        const isPasswordValid = await compare(password, user.password)

        if (!isPasswordValid) {
            console.log("Invalid password")
            return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
        }

        // Login exitoso
        console.log("✅ Login successful for:", email)

        const userData = {
            id: user.id,
            email: user.email,
            name: user.name
        }

        const { session, expires } = await login(userData)

        // Establecer cookie usando next/headers
        cookies().set({
            name: 'session',
            value: session,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            expires: expires
        })

        console.log("✅ Session cookie set via cookies().set()")

        // Redirigir al dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))

    } catch (error: any) {
        console.error("Login error:", error)
        return new Response(JSON.stringify({ error: "Error del servidor" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
