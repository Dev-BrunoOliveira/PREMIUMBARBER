const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { format, addDays } = require('date-fns');

async function main() {
    console.log('Iniciando injeção de horários no banco...');
    let barber = await prisma.user.findFirst({ where: { role: 'BARBER' } });
    
    if (!barber) {
        barber = await prisma.user.create({
            data: {
                name: 'Barbeiro Premium (Mock)',
                email: 'barber@premium.com',
                role: 'BARBER'
            }
        });
        console.log('✅ Barbeiro criado com sucesso!');
    } else {
        console.log('✅ Barbeiro já existe no sistema.');
    }

    const defaultTimes = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
    const today = new Date();

    for (let i = 0; i < 15; i++) {
        const dateStr = format(addDays(today, i), 'yyyy-MM-dd');
        for (const time of defaultTimes) {
            const existing = await prisma.availableTime.findFirst({
                where: { date: dateStr, time: time, barberId: barber.id }
            });
            if (!existing) {
                await prisma.availableTime.create({
                    data: {
                        date: dateStr,
                        time: time,
                        barberId: barber.id
                    }
                });
            }
        }
    }
    
    console.log('✅ Horários para os próximos 15 dias foram injetados perfeitamente!');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
