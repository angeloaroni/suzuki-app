async function testHealth() {
    console.log("Testing Health API (Edge)...")
    try {
        const res = await fetch('http://localhost:3000/api/health')
        console.log("Health API Status:", res.status)
        console.log("Health API Body:", await res.text())
    } catch (e) {
        console.error("Health API Failed:", e)
    }
}

testHealth()
