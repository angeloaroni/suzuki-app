/**
 * Create a test user
 * Run with: npx tsx scripts/create-user-quick.ts
 */

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('👤 Creating test user...\n')

    const email = 'teacher@test.com'
    const password = 'password123'
    const name = 'Profesor de Prueba'

    try {
        // Check if user exists
        const existing = await prisma.user.findUnique({
            where: { email }
        })

        if (existing) {
            console.log(`✅ User already exists: ${email}`)
            console.log(`   ID: ${existing.id}`)
            console.log(`   Name: ${existing.name}`)
            return
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'teacher'
            }
        })

        console.log(`✅ User created successfully!`)
        console.log(`\n📧 Email: ${email}`)
        console.log(`🔑 Password: ${password}`)
        console.log(`👤 Name: ${name}`)
        console.log(`🆔 ID: ${user.id}`)
        console.log(`\n🎯 You can now login with these credentials`)

    } catch (error) {
        console.error('❌ Error creating user:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
