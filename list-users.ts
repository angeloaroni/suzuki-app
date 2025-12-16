import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany()

    console.log('=== USUARIOS EN LA BASE DE DATOS ===\n')

    for (const user of users) {
        console.log(`Email: ${user.email}`)
        console.log(`Nombre: ${user.name}`)
        console.log('---')
    }

    console.log(`\nTotal: ${users.length} usuarios`)

    await prisma.$disconnect()
}

main().catch(console.error)
