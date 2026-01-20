import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await hash('test123', 10)

    const user = await prisma.user.upsert({
        where: { email: 'profesor@test.com' },
        update: {
            password: hashedPassword,
            name: 'Profesor Test'
        },
        create: {
            email: 'profesor@test.com',
            password: hashedPassword,
            name: 'Profesor Test',
            role: 'teacher'
        }
    })

    console.log('Usuario creado/actualizado:', user)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
