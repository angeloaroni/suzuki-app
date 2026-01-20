import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            password: true,
            createdAt: true
        }
    })

    console.log('Total users:', users.length)
    console.log('\nUsers in database:')
    users.forEach(user => {
        console.log(`\nEmail: ${user.email}`)
        console.log(`Name: ${user.name}`)
        console.log(`Password hash: ${user.password.substring(0, 20)}...`)
        console.log(`Created: ${user.createdAt}`)
    })

    await prisma.$disconnect()
}

main()
