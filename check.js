const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const users = await prisma.user.findMany();
    console.log("Users:", users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, slug: u.slug })));

    const services = await prisma.service.findMany();
    console.log("Services:", services.map(s => ({ id: s.id, name: s.name, price: s.price })));
}

check().catch(console.error).finally(() => prisma.$disconnect());
