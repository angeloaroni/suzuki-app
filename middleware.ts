import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Public paths that don't require authentication
    const isPublicPath = path === '/login' || path === '/register' || path === '/' || path === '/forgot-password' || path === '/reset-password'

    const session = request.cookies.get('session')?.value

    // Verify session
    const validSession = session ? await decrypt(session) : null

    // Redirect to login if trying to access protected route without session
    if (!isPublicPath && !validSession) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Redirect to dashboard if trying to access login/register while logged in
    if (isPublicPath && validSession && path !== '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
