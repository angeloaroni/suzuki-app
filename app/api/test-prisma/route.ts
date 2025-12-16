import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
    try {
        const count = await prisma.user.count()
        return new Response(JSON.stringify({ count }), { headers: { 'Content-Type': 'application/json' } })
    } catch (e: any) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
}
