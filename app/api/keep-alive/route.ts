import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const userCount = await prisma.user.count()
        return NextResponse.json({
            success: true,
            status: "Database is active",
            timestamp: new Date().toISOString(),
            count: userCount
        })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: "Keep-alive failed"
        }, { status: 500 })
    }
}
