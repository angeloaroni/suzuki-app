import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        const assignment = await prisma.bookAssignment.findFirst()
        if (assignment) {
            console.log('Assignment keys:', Object.keys(assignment))
            console.log('isGraduated:', (assignment as any).isGraduated)
            console.log('graduationDate:', (assignment as any).graduationDate)
        } else {
            console.log('No assignments found')
        }
    } catch (error) {
        console.error('Error checking schema:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
