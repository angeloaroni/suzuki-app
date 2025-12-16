import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const secretKey = process.env.NEXTAUTH_SECRET || 'suzuki-tracker-secret-key-change-me-in-production'
const key = new TextEncoder().encode(secretKey)

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30d')
        .sign(key)
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ['HS256'],
        })
        return payload
    } catch (error) {
        return null
    }
}

export async function login(userData: any) {
    console.log("Iniciando login en lib/session")
    // Create the session
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    console.log("Expiración calculada:", expires)

    try {
        const session = await encrypt({ user: userData, expires })
        console.log("JWT firmado correctamente")
        return { session, expires }
    } catch (err) {
        console.error("Error en lib/session login:", err)
        throw err
    }
}

export async function logout() {
    // Destroy the session
    cookies().set('session', '', { expires: new Date(0) })
}

export async function getSession() {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('session')

    console.log("[getSession] Buscando cookie 'session'...")

    if (!sessionCookie) {
        console.log("[getSession] Cookie 'session' NO encontrada. Cookies disponibles:", cookieStore.getAll().map(c => c.name).join(', '))
        return null
    }

    console.log("[getSession] Cookie encontrada. Valor (truncado):", sessionCookie.value.substring(0, 10) + "...")

    try {
        const payload = await decrypt(sessionCookie.value)
        if (payload) {
            console.log("[getSession] Sesión desencriptada correctamente. User ID:", payload.user?.id)
            return payload
        } else {
            console.log("[getSession] Falló la desencriptación (payload null)")
            return null
        }
    } catch (e) {
        console.error("[getSession] Error al desencriptar:", e)
        return null
    }
}

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get('session')?.value
    if (!session) return

    // Refresh the session so it doesn't expire
    const parsed = await decrypt(session)
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
