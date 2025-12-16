'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"
import { login } from "@/lib/session"

export async function loginAction(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        console.error("Login failed: Missing credentials")
        throw new Error("Faltan credenciales")
    }

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user || !user.password) {
        console.error("Login failed: Invalid credentials for", email)
        throw new Error("Credenciales inválidas")
    }

    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) {
        console.error("Login failed: Wrong password for", email)
        throw new Error("Credenciales inválidas")
    }

    // Login exitoso
    console.log("Login successful for:", email)

    const userData = {
        id: user.id,
        email: user.email,
        name: user.name
    }

    const { session, expires } = await login(userData)

    // Establecer cookie
    cookies().set({
        name: 'session',
        value: session,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: expires
    })

    console.log("Session cookie set, redirecting to dashboard...")

    // Redirigir al dashboard
    redirect('/dashboard')
}
