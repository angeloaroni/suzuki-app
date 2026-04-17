'use client'

import { logoutAction } from "@/app/actions/auth"

export default function LogoutButton() {
    async function handleLogout() {
        await logoutAction()
    }

    return (
        <button
            onClick={handleLogout}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors font-medium text-sm"
        >
            Salir
        </button>
    )
}
