'use client'

import { loginAction } from "@/app/actions/auth"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginForm({ error }: { error?: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState(error)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setErrorMessage(undefined)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const result = await loginAction({ email, password })

        if (result.error) {
            setErrorMessage(result.error)
            setIsLoading(false)
        } else if (result.success) {
            // Redirigir al dashboard
            router.push('/dashboard')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Suzuki Tracker
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Inicia Sesión
                    </p>
                </div>

                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {errorMessage === 'credentials' && 'Por favor ingresa email y contraseña'}
                        {errorMessage === 'invalid' && 'Email o contraseña incorrectos'}
                        {errorMessage === 'server' && 'Error del servidor'}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="rounded-md shadow-sm space-y-2">
                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                disabled={isLoading}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50"
                                placeholder="Email"
                                defaultValue="profesor@test.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Contraseña</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                disabled={isLoading}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50"
                                placeholder="Contraseña"
                                defaultValue="test123"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Iniciando sesión...' : 'Entrar'}
                        </button>
                    </div>

                    <div className="text-center text-xs text-gray-500">
                        <p>Credenciales: profesor@test.com / test123</p>
                    </div>
                </form>
            </div>
        </div>
    )
}
