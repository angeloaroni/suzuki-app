import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// This route is designed to be called by a cron job (e.g., GitHub Actions, Vercel Cron, or a simple pinger)
// to ensure the Supabase database stays active by performing a simple query.
export async function GET() {
    try {
        // Simple query to wake up/keep alive the DB
        const userCount = await prisma.user.count()
        
        return NextResponse.json({ 
            success: true, 
            status: "Database is active",
            timestamp: new Date().toISOString(),
            count: userCount
        })
    } catch (error: any) {
        console.error("Keep-alive error:", error)
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 })
    }
}
