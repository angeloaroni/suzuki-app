import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import EditStudentForm from "@/components/EditStudentForm"

export default async function EditStudentPage({ params }: { params: { id: string } }) {
    const session = await getSession()
    if (!session) redirect("/login")

    const student = await prisma.student.findUnique({
        where: { id: params.id }
    })

    if (!student || student.teacherId !== session.user.id) {
        redirect("/dashboard")
    }

    return <EditStudentForm student={student} />
}
