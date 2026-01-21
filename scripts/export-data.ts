import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Iniciando exportación de datos locales...')

    try {
        const data = {
            users: await prisma.user.findMany(),
            students: await prisma.student.findMany(),
            bookTemplates: await prisma.bookTemplate.findMany(),
            songTemplates: await prisma.songTemplate.findMany(),
            bookAssignments: await prisma.bookAssignment.findMany(),
            studentSongs: await prisma.studentSong.findMany(),
            progress: await prisma.progress.findMany(),
            exportDate: new Date().toISOString()
        }

        const filePath = path.join(process.cwd(), 'full-data-export.json')
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

        console.log(`\n✅ Exportación completada con éxito!`)
        console.log(`📂 Archivo creado: ${filePath}`)
        console.log(`📊 Resumen:`)
        console.log(`  - Usuarios: ${data.users.length}`)
        console.log(`  - Estudiantes: ${data.students.length}`)
        console.log(`  - Libros: ${data.bookTemplates.length}`)
        console.log(`  - Canciones: ${data.songTemplates.length}`)
        console.log(`  - Asignaciones: ${data.bookAssignments.length}`)
        console.log(`  - Notas de progreso: ${data.progress.length}`)

    } catch (error) {
        console.error('❌ Error durante la exportación:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
