export const runtime = 'edge';

export async function GET(request: Request) {
    return new Response(JSON.stringify({ status: 'ok', runtime: 'edge' }), {
        status: 200,
        headers: {
            'content-type': 'application/json',
        },
    });
}
