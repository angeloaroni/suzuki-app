import LoginForm from "@/components/LoginForm"

export const metadata = {
    title: 'Iniciar Sesión - Musivo',
    description: 'Accede a tu cuenta de Musivo',
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const resolvedParams = await searchParams
    return <LoginForm error={resolvedParams?.error as string | undefined} />
}
