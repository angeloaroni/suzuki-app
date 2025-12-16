import { PrismaClient } from '@prisma/client'
import { compare } from 'bcryptjs'

const prisma = new PrismaClient()

async function checkUser() {
    try {
        console.log('Buscando usuarios en la base de datos...\n')

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                password: true,
                createdAt: true
            }
        })

        if (users.length === 0) {
            console.log('❌ No hay usuarios en la base de datos')
            return
        }

        console.log(`✅ Se encontraron ${users.length} usuario(s):\n`)

        for (const user of users) {
            console.log(`Email: ${user.email}`)
            console.log(`Name: ${user.name}`)
            console.log(`ID: ${user.id}`)
            console.log(`Created: ${user.createdAt}`)
            console.log(`Password hash: ${user.password?.substring(0, 20)}...`)

            // Probar contraseñas comunes
            if (user.password) {
                const testPasswords = ['123456', 'password', 'test', 'test123']
                for (const pwd of testPasswords) {
                    const isValid = await compare(pwd, user.password)
                    if (isValid) {
                        console.log(`✅ Contraseña correcta: "${pwd}"`)
                    }
                }
            }
            console.log('---')
        }

    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

checkUser()
