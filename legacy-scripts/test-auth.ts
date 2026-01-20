
import { PrismaClient } from '@prisma/client'
import { compare } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'test-1763570843111@example.com'
    const password = 'password123'

    console.log(`Testing auth for: ${email}`)

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })

        console.log('User found:', user ? 'Yes' : 'No')

        if (!user) {
            console.log('User not found in DB')
            return
        }

        console.log('User password hash:', user.password)

        const isValid = await compare(password, user.password)
        console.log('Password valid:', isValid)

    } catch (e) {
        console.error('Error testing auth:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
