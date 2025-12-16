/**
 * Backup Script: Export existing books and songs data
 * 
 * This script exports all books and songs to a JSON file using raw SQL
 * Run with: npx tsx scripts/backup-books.ts
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
    console.log('📦 Starting backup of books and songs...\n')

    try {
        // Use raw SQL to query old schema
        const books: any[] = await prisma.$queryRaw`
      SELECT * FROM Book
    `

        console.log(`📚 Found ${books.length} books`)

        const songs: any[] = await prisma.$queryRaw`
      SELECT * FROM Song
    `

        console.log(`🎵 Found ${songs.length} songs`)

        // Get students to map teacherIds
        const students: any[] = await prisma.$queryRaw`
      SELECT id, name, teacherId FROM Student
    `

        // Group books by teacher and book number to create templates
        const booksByTeacher = new Map<string, Map<number, any>>()

        for (const book of books) {
            const student = students.find(s => s.id === book.studentId)
            if (!student) continue

            const teacherId = student.teacherId

            if (!booksByTeacher.has(teacherId)) {
                booksByTeacher.set(teacherId, new Map())
            }

            const teacherBooks = booksByTeacher.get(teacherId)!

            if (!teacherBooks.has(book.number)) {
                // Get songs for this book
                const bookSongs = songs
                    .filter(s => s.bookId === book.id)
                    .sort((a, b) => a.order - b.order)
                    .map(s => ({
                        title: s.title,
                        order: s.order
                    }))

                teacherBooks.set(book.number, {
                    title: book.title,
                    number: book.number,
                    coverImage: book.coverImage,
                    songs: bookSongs,
                    assignments: []
                })
            }

            // Add this student assignment
            teacherBooks.get(book.number)!.assignments.push({
                studentId: student.id,
                studentName: student.name,
                notes: null
            })
        }

        // Convert to array format
        const backup = {
            exportDate: new Date().toISOString(),
            totalBooks: books.length,
            teachers: Array.from(booksByTeacher.entries()).map(([teacherId, books]) => ({
                teacherId,
                bookTemplates: Array.from(books.values())
            }))
        }

        // Save to file
        const backupDir = path.join(process.cwd(), 'backups')
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true })
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const backupFile = path.join(backupDir, `books-backup-${timestamp}.json`)

        fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2))

        console.log(`\n✅ Backup completed successfully!`)
        console.log(`📁 Backup saved to: ${backupFile}`)
        console.log(`\n📊 Summary:`)
        console.log(`  - Teachers: ${backup.teachers.length}`)
        console.log(`  - Unique book templates: ${backup.teachers.reduce((sum, t) => sum + t.bookTemplates.length, 0)}`)
        console.log(`  - Total assignments: ${books.length}`)
        console.log(`  - Total songs: ${songs.length}`)

    } catch (error) {
        console.error('❌ Backup failed:', error)
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
