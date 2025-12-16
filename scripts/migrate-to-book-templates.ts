/**
 * Migration Script: Convert existing data to BookTemplate system
 * 
 * This script ensures that:
 * 1. BookTemplates exist for all Suzuki books
 * 2. Existing student data is preserved
 * 
 * Run with: npx tsx scripts/migrate-to-book-templates.ts
 */

import { PrismaClient } from '@prisma/client'
import { SUZUKI_BOOKS } from '../lib/suzuki-data'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Starting migration to BookTemplate system...\n')

    try {
        // Get all teachers
        const teachers = await prisma.user.findMany({
            where: { role: 'teacher' }
        })

        if (teachers.length === 0) {
            console.log('⚠️  No teachers found. Creating templates will require a teacher account.')
            return
        }

        console.log(`📚 Found ${teachers.length} teacher(s)\n`)

        // For each teacher, ensure they have BookTemplates for all Suzuki books
        for (const teacher of teachers) {
            console.log(`\n👨‍🏫 Processing teacher: ${teacher.name || teacher.email}`)

            for (const suzukiBook of SUZUKI_BOOKS) {
                // Check if BookTemplate already exists
                const existingTemplate = await prisma.bookTemplate.findFirst({
                    where: {
                        teacherId: teacher.id,
                        number: suzukiBook.number
                    }
                })

                if (existingTemplate) {
                    console.log(`  ✓ BookTemplate ${suzukiBook.number} already exists`)
                    continue
                }

                // Create BookTemplate with SongTemplates
                console.log(`  📖 Creating BookTemplate: ${suzukiBook.title}`)
                const bookTemplate = await prisma.bookTemplate.create({
                    data: {
                        title: suzukiBook.title,
                        number: suzukiBook.number,
                        teacherId: teacher.id,
                        songs: {
                            create: suzukiBook.songs.map(song => ({
                                title: song.title,
                                order: song.order
                            }))
                        }
                    },
                    include: {
                        songs: true
                    }
                })

                console.log(`  ✓ Created BookTemplate with ${bookTemplate.songs.length} songs`)
            }
        }

        console.log('\n✅ Migration completed successfully!')
        console.log('\n📊 Summary:')

        const templateCount = await prisma.bookTemplate.count()
        const songTemplateCount = await prisma.songTemplate.count()
        const assignmentCount = await prisma.bookAssignment.count()

        console.log(`  - BookTemplates: ${templateCount}`)
        console.log(`  - SongTemplates: ${songTemplateCount}`)
        console.log(`  - BookAssignments: ${assignmentCount}`)

    } catch (error) {
        console.error('❌ Migration failed:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

main()
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
