async function testApis() {
    console.log("Testing Simple API...")
    try {
        const res1 = await fetch('http://localhost:3000/api/test-simple', { method: 'POST' })
        console.log("Simple API Status:", res1.status)
        console.log("Simple API Body:", await res1.text())
    } catch (e) {
        console.error("Simple API Failed:", e)
    }

    console.log("\nTesting DB API...")
    try {
        const res2 = await fetch('http://localhost:3000/api/test-db', { method: 'POST' })
        console.log("DB API Status:", res2.status)
        console.log("DB API Body:", await res2.text())
    } catch (e) {
        console.error("DB API Failed:", e)
    }
}

testApis()
