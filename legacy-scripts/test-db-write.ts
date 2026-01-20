import { prisma } from "./lib/prisma"

async function main() {
    try {
        console.log("Probando conexión a BD...")
        const userCount = await prisma.user.count()
        console.log("Usuarios en BD:", userCount)

        console.log("Intentando crear estudiante de prueba...")
        // Necesito un ID de profesor válido. Buscaré el primero.
        const teacher = await prisma.user.findFirst()
        if (!teacher) {
            console.error("No hay profesores para probar creación de estudiante")
            return
        }

        const student = await prisma.student.create({
            data: {
                name: "Test Student DB Script",
                dob: new Date(),
                notes: "Created via script",
                teacherId: teacher.id
            }
        })
        console.log("Estudiante creado exitosamente:", student.id)

        // Limpieza
        await prisma.student.delete({ where: { id: student.id } })
        console.log("Estudiante de prueba eliminado")

    } catch (e) {
        console.error("Error en prueba de BD:", e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
