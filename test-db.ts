
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Connecting to database...')
        const email = `test-${Date.now()}@example.com`
        const password = await hash('password123', 10)

        console.log(`Creating user with email: ${email}`)
        const user = await prisma.user.create({
            data: {
                email,
                name: 'Test User',
                password,
            },
        })
        console.log('User created successfully:', user)
    } catch (e) {
        console.error('Error creating user:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
