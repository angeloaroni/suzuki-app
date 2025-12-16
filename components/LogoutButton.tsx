'use client'

import { logoutAction } from "@/app/actions/auth"

export default function LogoutButton() {
    async function handleLogout() {
        await logoutAction()
    }

    return (
        <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900 font-medium"
        >
            Salir
        </button>
    )
}
