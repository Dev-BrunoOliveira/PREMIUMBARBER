const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findMany().then(users => {
    console.log(users.map(u => ({name: u.name, role: u.role, slug: u.slug, id: u.id})));
}).finally(() => prisma.$disconnect());
