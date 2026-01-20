async function testPrisma() {
    console.log("Testing Prisma API (Native Response)...")
    try {
        const res = await fetch('http://localhost:3000/api/test-prisma', { method: 'POST' })
        console.log("Prisma API Status:", res.status)
        console.log("Prisma API Body:", await res.text())
    } catch (e) {
        console.error("Prisma API Failed:", e)
    }
}

testPrisma()
