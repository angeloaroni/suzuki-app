import { NextResponse } from "next/server"

export async function GET() {
    return new Response(JSON.stringify({ status: "ok", message: "Server is running" }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    })
}
