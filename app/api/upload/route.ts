import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData()
        const file: File | null = data.get('file') as unknown as File

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            )
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Create unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
        const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`

        // Ensure uploads directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads')
        try {
            await mkdir(uploadDir, { recursive: true })
        } catch (e) {
            // Ignore if already exists
        }

        // Save file
        const path = join(uploadDir, filename)
        await writeFile(path, buffer)

        // Return public URL
        const url = `/uploads/${filename}`

        return NextResponse.json({ success: true, url })

    } catch (error: any) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: "Error uploading file: " + error.message },
            { status: 500 }
        )
    }
}
