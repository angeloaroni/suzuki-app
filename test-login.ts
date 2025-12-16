import { PrismaClient } from '@prisma/client'
import { compare } from 'bcryptjs'

const prisma = new PrismaClient()

async function testLogin(email: string, password: string) {
    console.log(`\n=== Testing login for: ${email} ===\n`)

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        console.log('❌ User not found')
        return
    }

    console.log('✅ User found in database')
    console.log(`   Name: ${user.name}`)
    console.log(`   Email: ${user.email}`)

    const isValid = await compare(password, user.password)

    if (isValid) {
        console.log('✅ Password is CORRECT')
    } else {
        console.log('❌ Password is INCORRECT')
    }

    await prisma.$disconnect()
}

// Test with the test user
testLogin('test-1763570843111@example.com', 'password123')
