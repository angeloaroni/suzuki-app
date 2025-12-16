'use server'

import { prisma } from "@/lib/prisma"
import { hash, compare } from "bcryptjs"
import { redirect } from "next/navigation"
import { logout, login } from "@/lib/session"
import { cookies } from "next/headers"

export async function logoutAction() {
    await logout()
    redirect('/login')
}

export async function loginAction(data: { email: string; password: string }) {
    const { email, password } = data

    if (!email || !password) {
        return { error: 'credentials' }
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user || !user.password) {
            return { error: 'invalid' }
        }

        const isPasswordValid = await compare(password, user.password)

        if (!isPasswordValid) {
            return { error: 'invalid' }
        }

        // Login exitoso
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

        return { success: true }
    } catch (error) {
        console.error("Login error:", error)
        return { error: 'server' }
    }
}


export async function registerUser(data: { name: string, email: string, password: string }) {
    const { name, email, password } = data

    if (!email || !password || !name) {
        return { error: "Faltan campos obligatorios" }
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return { error: "El usuario ya existe" }
        }

        const hashedPassword = await hash(password, 10)

        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            }
        })

        return { success: true }
    } catch (error) {
        console.error("Registration error details:", error)
        if (error instanceof Error) {
            console.error("Error message:", error.message)
            console.error("Error stack:", error.stack)
        }
        return { error: "Error al crear el usuario. Revisa la consola del servidor." }
    }
}
