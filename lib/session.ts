import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export interface SessionUser {
    id: string
    email: string
    name?: string | null
}

export interface SessionPayload {
    user: SessionUser
    expires: Date
    iat?: number
    exp?: number
    [key: string]: unknown
}

const secretKey = process.env.NEXTAUTH_SECRET
if (!secretKey) {
    throw new Error('NEXTAUTH_SECRET environment variable is required')
}
const key = new TextEncoder().encode(secretKey)

export async function encrypt(payload: Record<string, unknown>) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30d')
        .sign(key)
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ['HS256'],
        })
        return payload as unknown as SessionPayload
    } catch {
        return null
    }
}

export async function login(userData: SessionUser) {
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    const session = await encrypt({ user: userData, expires })
    return { session, expires }
}

export async function logout() {
    // Destroy the session
    cookies().set('session', '', { expires: new Date(0) })
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('session')

    if (!sessionCookie) {
        return null
    }

    try {
        return await decrypt(sessionCookie.value)
    } catch {
        return null
    }
}

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get('session')?.value
    if (!session) return

    // Refresh the session so it doesn't expire
    const parsed = await decrypt(session)
    if (!parsed) return

    parsed.expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const res = NextResponse.next()
    res.cookies.set({
        name: 'session',
        value: await encrypt(parsed),
        httpOnly: true,
        expires: parsed.expires,
    })
    return res
}
