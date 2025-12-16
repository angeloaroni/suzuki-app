import { getSession } from "@/lib/session"
import { cookies } from "next/headers"

export default async function DebugSessionPage() {
    const session = await getSession()
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()

    return (
        <div className="p-8 font-mono text-sm">
            <h1 className="text-xl font-bold mb-4">Diagnóstico de Sesión</h1>

            <div className="mb-6 p-4 bg-gray-100 rounded">
                <h2 className="font-bold mb-2">Estado de Sesión (getSession)</h2>
                <pre>{JSON.stringify(session, null, 2)}</pre>
            </div>

            <div className="mb-6 p-4 bg-gray-100 rounded">
                <h2 className="font-bold mb-2">Cookies en el Servidor</h2>
                <ul>
                    {allCookies.map(c => (
                        <li key={c.name} className="mb-1">
                            <strong>{c.name}</strong>: {c.value.substring(0, 20)}...
                            (HttpOnly: {c.httpOnly ? 'Yes' : 'No'}, Secure: {c.secure ? 'Yes' : 'No'})
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
