import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
    const filePath = path.join(process.cwd(), 'full-data-export.json')

    if (!fs.existsSync(filePath)) {
        console.error(`❌ No se encontró el archivo de exportación: ${filePath}`)
        process.exit(1)
    }

    console.log('🚀 Iniciando importación a Supabase...')
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    try {
        // 1. Usuarios
        console.log('👥 Importando usuarios...')
        for (const user of data.users) {
            await prisma.user.upsert({
                where: { id: user.id },
                update: {},
                create: user
            })
        }

        // 2. Estudiantes
        console.log('👨‍🎓 Importando estudiantes...')
        for (const student of data.students) {
            await prisma.student.upsert({
                where: { id: student.id },
                update: {},
                create: {
                    ...student,
                    dob: student.dob ? new Date(student.dob) : null
                }
            })
        }

        // 3. Plantillas de Libros
        console.log('📚 Importando plantillas de libros...')
        for (const template of data.bookTemplates) {
            await prisma.bookTemplate.upsert({
                where: { id: template.id },
                update: {},
                create: template
            })
        }

        // 4. Plantillas de Canciones
        console.log('🎵 Importando plantillas de canciones...')
        for (const song of data.songTemplates) {
            await prisma.songTemplate.upsert({
                where: { id: song.id },
                update: {},
                create: song
            })
        }

        // 5. Asignaciones de Libros
        console.log('📝 Importando asignaciones...')
        for (const assignment of data.bookAssignments) {
            await prisma.bookAssignment.upsert({
                where: { id: assignment.id },
                update: {},
                create: {
                    ...assignment,
                    graduationDate: assignment.graduationDate ? new Date(assignment.graduationDate) : null
                }
            })
        }

        // 6. Canciones de Estudiantes
        console.log('🎸 Importando canciones de estudiantes...')
        for (const studentSong of data.studentSongs) {
            await prisma.studentSong.upsert({
                where: { id: studentSong.id },
                update: {},
                create: studentSong
            })
        }

        // 7. Progreso
        console.log('📈 Importando notas de progreso...')
        for (const p of data.progress) {
            await prisma.progress.upsert({
                where: { id: p.id },
                update: {},
                create: {
                    ...p,
                    date: new Date(p.date)
                }
            })
        }

        console.log('\n✅ ¡Importación completada con éxito!')

    } catch (error) {
        console.error('❌ Error durante la importación:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
