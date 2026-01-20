/**
 * Migration Script: Convert old Book/Song structure to new BookTemplate/StudentSong structure
 * 
 * This script:
 * 1. Creates BookTemplates from unique books
 * 2. Creates SongTemplates for each book
 * 3. Creates BookAssignments for each student
 * 4. Creates StudentSongs for each student's songs
 * 5. Updates Progress records to point to StudentSongs
 * 
 * IMPORTANT: Run this ONCE after updating the schema
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrate() {
    console.log('🚀 Starting migration to global book management system...\n')

    try {
        // Step 1: Get all existing books and songs from the old structure
        console.log('📚 Step 1: Analyzing existing data...')

        const oldBooks = await prisma.$queryRaw<any[]>`
            SELECT DISTINCT title, number FROM Book ORDER BY number
        `

        console.log(`   Found ${oldBooks.length} unique books\n`)

        // Step 2: Create BookTemplates for each unique book
        console.log('📖 Step 2: Creating BookTemplates...')

        const bookTemplateMap = new Map<string, string>() // key: "title-number", value: bookTemplateId

        for (const oldBook of oldBooks) {
            // Get the first teacher who has this book
            const sampleBook = await prisma.$queryRaw<any[]>`
                SELECT b.*, s.teacherId 
                FROM Book b
                JOIN Student s ON b.studentId = s.id
                WHERE b.title = ${oldBook.title} AND b.number = ${oldBook.number}
                LIMIT 1
            `

            if (sampleBook.length === 0) continue

            const teacherId = sampleBook[0].teacherId

            // Create BookTemplate
            const bookTemplate = await prisma.bookTemplate.create({
                data: {
                    title: oldBook.title,
                    number: oldBook.number,
                    teacherId: teacherId,
                }
            })

            const key = `${oldBook.title}-${oldBook.number}`
            bookTemplateMap.set(key, bookTemplate.id)

            console.log(`   ✓ Created BookTemplate: ${oldBook.title}`)

            // Step 3: Create SongTemplates for this book
            const oldSongs = await prisma.$queryRaw<any[]>`
                SELECT DISTINCT s.title, s.\`order\`
                FROM Song s
                JOIN Book b ON s.bookId = b.id
                WHERE b.title = ${oldBook.title} AND b.number = ${oldBook.number}
                ORDER BY s.\`order\`
            `

            for (const oldSong of oldSongs) {
                await prisma.songTemplate.create({
                    data: {
                        title: oldSong.title,
                        order: oldSong.order,
                        bookTemplateId: bookTemplate.id
                    }
                })
            }

            console.log(`     ✓ Created ${oldSongs.length} SongTemplates\n`)
        }

        // Step 4: Create BookAssignments and StudentSongs
        console.log('👥 Step 3: Creating BookAssignments and StudentSongs...')

        const students = await prisma.student.findMany()

        for (const student of students) {
            const studentBooks = await prisma.$queryRaw<any[]>`
                SELECT * FROM Book WHERE studentId = ${student.id}
            `

            for (const studentBook of studentBooks) {
                const key = `${studentBook.title}-${studentBook.number}`
                const bookTemplateId = bookTemplateMap.get(key)

                if (!bookTemplateId) {
                    console.log(`   ⚠️  Warning: BookTemplate not found for ${key}`)
                    continue
                }

                // Create BookAssignment
                const assignment = await prisma.bookAssignment.create({
                    data: {
                        studentId: student.id,
                        bookTemplateId: bookTemplateId,
                        notes: null
                    }
                })

                // Get all songs for this book
                const studentSongs = await prisma.$queryRaw<any[]>`
                    SELECT * FROM Song WHERE bookId = ${studentBook.id}
                `

                // Get SongTemplates for this book
                const songTemplates = await prisma.songTemplate.findMany({
                    where: { bookTemplateId }
                })

                // Create StudentSong for each song
                for (const oldSong of studentSongs) {
                    // Find matching SongTemplate
                    const songTemplate = songTemplates.find(
                        st => st.title === oldSong.title && st.order === oldSong.order
                    )

                    if (!songTemplate) {
                        console.log(`   ⚠️  Warning: SongTemplate not found for "${oldSong.title}"`)
                        continue
                    }

                    // Create StudentSong
                    const studentSong = await prisma.studentSong.create({
                        data: {
                            studentId: student.id,
                            songTemplateId: songTemplate.id,
                            imageUrl: oldSong.imageUrl,
                            notes: oldSong.notes,
                            youtubeUrl: oldSong.youtubeUrl,
                            audioUrl: oldSong.audioUrl,
                            completed: oldSong.completed,
                            learnedLeft: oldSong.learnedLeft,
                            learnedRight: oldSong.learnedRight,
                            learnedBoth: oldSong.learnedBoth
                        }
                    })

                    // Step 5: Update Progress records
                    await prisma.$executeRaw`
                        UPDATE Progress 
                        SET studentSongId = ${studentSong.id}
                        WHERE songId = ${oldSong.id}
                    `
                }
            }

            console.log(`   ✓ Migrated student: ${student.name}`)
        }

        console.log('\n✅ Migration completed successfully!')
        console.log('\n⚠️  IMPORTANT: You can now safely delete the old Book, Song, and Media tables')
        console.log('   Run: npx prisma migrate dev --name remove_old_tables')

    } catch (error) {
        console.error('\n❌ Migration failed:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

// Run migration
migrate()
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
