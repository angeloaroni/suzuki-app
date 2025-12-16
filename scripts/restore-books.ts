/**
 * Restore Script: Import books from backup and create BookTemplates
 * 
 * This script reads the backup file and creates BookTemplates with assignments
 * Run with: npx tsx scripts/restore-books.ts [backup-file]
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
    console.log('🔄 Starting restore from backup...\n')

    try {
        // Find the most recent backup file
        const backupDir = path.join(process.cwd(), 'backups')
        const backupFiles = fs.readdirSync(backupDir)
            .filter(f => f.startsWith('books-backup-') && f.endsWith('.json'))
            .sort()
            .reverse()

        if (backupFiles.length === 0) {
            console.error('❌ No backup files found in backups directory')
            process.exit(1)
        }

        const backupFile = path.join(backupDir, backupFiles[0])
        console.log(`📁 Using backup file: ${backupFile}\n`)

        const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf-8'))

        console.log(`📊 Backup info:`)
        console.log(`  - Export date: ${backupData.exportDate}`)
        console.log(`  - Teachers: ${backupData.teachers.length}`)
        console.log(`  - Total books: ${backupData.totalBooks}\n`)

        // Get the current teacher (should be the only one)
        const currentTeacher = await prisma.user.findFirst({
            where: { role: 'teacher' }
        })

        if (!currentTeacher) {
            console.error('❌ No teacher found in database')
            // Try to create a default teacher if none exists
            console.log('⚠️  Creating default teacher...')
            const newTeacher = await prisma.user.create({
                data: {
                    email: 'teacher@example.com',
                    name: 'Default Teacher',
                    password: 'password', // In a real app this should be hashed
                    role: 'teacher'
                }
            })
            console.log(`✅ Created teacher: ${newTeacher.email}`)
            // Restart main with new teacher
            return main()
        }

        console.log(`👨‍🏫 Using current teacher: ${currentTeacher.name || currentTeacher.email}`)
        console.log(`   ID: ${currentTeacher.id}\n`)

        // 1. Restore Students first
        console.log('👥 Restoring students...')
        const studentNameMap = new Map<string, string>() // Original ID -> New/Current ID

        // Collect unique students from backup
        const studentsInBackup = new Map<string, string>() // Name -> Original ID

        for (const teacher of backupData.teachers) {
            for (const template of teacher.bookTemplates) {
                for (const assignment of template.assignments) {
                    if (assignment.studentName) {
                        studentsInBackup.set(assignment.studentName, assignment.studentId)
                    }
                }
            }
        }

        for (const [name, originalId] of studentsInBackup) {
            // Check if student exists by name for this teacher
            let student = await prisma.student.findFirst({
                where: {
                    name: name,
                    teacherId: currentTeacher.id
                }
            })

            if (!student) {
                console.log(`  ➕ Creating student: ${name}`)
                student = await prisma.student.create({
                    data: {
                        name: name,
                        teacherId: currentTeacher.id,
                    }
                })
            } else {
                console.log(`  ✓ Student exists: ${name}`)
            }

            studentNameMap.set(originalId, student.id)
        }
        console.log(`✅ Processed ${studentsInBackup.size} students\n`)

        let createdTemplates = 0
        let createdAssignments = 0
        let createdSongs = 0
        let skippedAssignments = 0

        // Process the first teacher's data from backup
        const teacherData = backupData.teachers[0]

        console.log(`📚 Processing ${teacherData.bookTemplates.length} book templates...\n`)

        for (const bookTemplate of teacherData.bookTemplates) {
            console.log(`  📖 Creating template: ${bookTemplate.title}`)

            // Check if template already exists
            let template = await prisma.bookTemplate.findFirst({
                where: {
                    teacherId: currentTeacher.id,
                    number: bookTemplate.number
                },
                include: { songs: true }
            })

            if (template) {
                console.log(`    ⚠️  Template already exists, using existing...`)
            } else {
                // Create BookTemplate
                template = await prisma.bookTemplate.create({
                    data: {
                        title: bookTemplate.title,
                        number: bookTemplate.number,
                        coverImage: bookTemplate.coverImage,
                        teacherId: currentTeacher.id,
                        songs: {
                            create: bookTemplate.songs.map((song: any) => ({
                                title: song.title,
                                order: song.order
                            }))
                        }
                    },
                    include: {
                        songs: true
                    }
                })
                createdTemplates++
                createdSongs += template.songs.length
                console.log(`    ✓ Created with ${template.songs.length} songs`)
            }

            // Create assignments for each student
            for (const assignment of bookTemplate.assignments) {
                const newStudentId = studentNameMap.get(assignment.studentId)

                if (!newStudentId) {
                    console.log(`    ⚠️  Could not map student ID for ${assignment.studentName}, skipping`)
                    skippedAssignments++
                    continue
                }

                // Check if assignment already exists
                const existingAssignment = await prisma.bookAssignment.findUnique({
                    where: {
                        studentId_bookTemplateId: {
                            studentId: newStudentId,
                            bookTemplateId: template.id
                        }
                    }
                })

                if (existingAssignment) {
                    console.log(`    ⚠️  Assignment for ${assignment.studentName} already exists, skipping`)
                    continue
                }

                try {
                    await prisma.bookAssignment.create({
                        data: {
                            studentId: newStudentId,
                            bookTemplateId: template.id,
                            notes: assignment.notes
                        }
                    })

                    // Create StudentSong entries for each song
                    await prisma.studentSong.createMany({
                        data: template.songs.map(song => ({
                            studentId: newStudentId,
                            songTemplateId: song.id
                        })),
                        skipDuplicates: true
                    })

                    createdAssignments++
                    console.log(`    ✓ Assigned to: ${assignment.studentName}`)
                } catch (error) {
                    console.log(`    ⚠️  Could not assign to ${assignment.studentName}:`, error)
                    skippedAssignments++
                }
            }
        }

        console.log(`\n✅ Restore completed!`)
        console.log(`\n📊 Summary:`)
        console.log(`  - BookTemplates created: ${createdTemplates}`)
        console.log(`  - SongTemplates created: ${createdSongs}`)
        console.log(`  - Assignments created: ${createdAssignments}`)
        if (skippedAssignments > 0) {
            console.log(`  - Assignments skipped: ${skippedAssignments} (students not found)`)
            console.log(`\n💡 Tip: Create students first, then run this script again to assign books`)
        }

    } catch (error) {
        console.error('❌ Restore failed:', error)
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
