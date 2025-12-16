/**
 * Check database status
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Checking database status...\n')

    try {
        // Check users
        const users = await prisma.user.findMany()
        console.log(`👥 Users: ${users.length}`)
        users.forEach(u => console.log(`  - ${u.email} (${u.id})`))

        // Check students
        const students = await prisma.student.findMany()
        console.log(`\n🎓 Students: ${students.length}`)
        students.forEach(s => console.log(`  - ${s.name} (teacherId: ${s.teacherId})`))

        // Check book templates
        const templates = await prisma.bookTemplate.findMany()
        console.log(`\n📚 BookTemplates: ${templates.length}`)
        templates.forEach(t => console.log(`  - ${t.title} (teacherId: ${t.teacherId})`))

        // Check assignments
        const assignments = await prisma.bookAssignment.findMany()
        console.log(`\n📋 BookAssignments: ${assignments.length}`)

        // Check student songs
        const studentSongs = await prisma.studentSong.findMany()
        console.log(`\n🎵 StudentSongs: ${studentSongs.length}`)

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
