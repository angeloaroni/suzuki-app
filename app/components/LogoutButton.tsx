'use client'

import { useRouter } from "next/navigation"

export default function LogoutButton() {
    const router = useRouter()

    const handleLogout = async () => {
        await fetch('/api/logout', { method: 'POST' })
        // Forzar recarga para limpiar estado
        window.location.href = "/login"
    }

    return (
        <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-800 font-medium"
        >
            Cerrar sesión
        </button>
    )
}
