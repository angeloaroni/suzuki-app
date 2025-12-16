export async function POST(request: Request) {
    return new Response(JSON.stringify({ message: "Native Response working" }), {
        headers: { 'content-type': 'application/json' }
    })
}
