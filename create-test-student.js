const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestStudent() {
    const teacher = await prisma.user.findUnique({
        where: { email: 'profesor@test.com' }
    })

    if (!teacher) {
        console.error('❌ Teacher not found')
        return
    }

    const student = await prisma.student.create({
        data: {
            name: 'María García',
            dob: new Date('2010-05-15'),
            notes: 'Estudiante dedicada con buen oído musical',
            teacherId: teacher.id
        }
    })

    console.log('✅ Estudiante de prueba creado:')
    console.log('   Nombre:', student.name)
    console.log('   ID:', student.id)
}

createTestStudent()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
