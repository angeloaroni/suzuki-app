const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

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

    console.log('✅ Usuario creado/actualizado:')
    console.log('   Email:', user.email)
    console.log('   Contraseña: test123')
    console.log('')
    console.log('Usa estas credenciales para login')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
