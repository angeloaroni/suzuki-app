import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'teacher@example.com'
    const password = 'password'
    const hashedPassword = await hash(password, 10)

    await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
    })

    console.log(`Password for ${email} updated to hashed '${password}'`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
