import LoginForm from "@/components/LoginForm"

export default function LoginPage({
    searchParams,
}: {
    searchParams: { error?: string }
}) {
    return <LoginForm error={searchParams?.error} />
}
