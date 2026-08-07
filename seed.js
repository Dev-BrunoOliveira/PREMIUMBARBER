const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { format, addDays } = require('date-fns');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Atualizando seed com serviços e horários operacionais...');

    const hashedPassword = await bcrypt.hash('123456', 10);

    // 1. Criar ou atualizar Barbeiro Demo (Profissional)
    let barber = await prisma.user.findFirst({ where: { role: 'BARBER' } });
    
    if (!barber) {
        barber = await prisma.user.create({
            data: {
                name: 'Barbeiro Profissional',
                email: 'barbeiro@exemplo.com',
                password: hashedPassword,
                phone: '(11) 99999-8888',
                role: 'BARBER',
                slug: 'barbeiro-premium'
            }
        });
        console.log('✅ Barbeiro criado: barbeiro@exemplo.com / 123456');
    } else {
        await prisma.user.update({
            where: { id: barber.id },
            data: { password: hashedPassword, slug: 'barbeiro-premium' }
        });
    }

    // 2. Criar Cliente Demo
    let client = await prisma.user.findUnique({ where: { email: 'cliente@exemplo.com' } });
    if (!client) {
        client = await prisma.user.create({
            data: {
                name: 'Cliente Exemplo',
                email: 'cliente@exemplo.com',
                password: hashedPassword,
                phone: '(11) 97777-6666',
                role: 'CLIENT'
            }
        });
        console.log('✅ Cliente criado: cliente@exemplo.com / 123456');
    }

    // 3. Cadastrar os 4 Serviços exatos pedidos pelo usuário
    const defaultServices = [
        {
            name: 'Corte',
            price: 45.00,
            duration: 30,
            description: 'Corte completo com tesoura ou máquina e acabamento.'
        },
        {
            name: 'Corte + Barba',
            price: 75.00,
            duration: 50,
            description: 'Combo completo de cabelo e barba com toalha quente.'
        },
        {
            name: 'Apenas Barba',
            price: 35.00,
            duration: 30,
            description: 'Modelagem e alinhamento de barba com navalha e hidratação.'
        },
        {
            name: 'Limpar a Sobrancelha',
            price: 15.00,
            duration: 15,
            description: 'Design e alinhamento de sobrancelhas masculinas.'
        }
    ];

    for (const s of defaultServices) {
        const existingService = await prisma.service.findFirst({
            where: { barberId: barber.id, name: s.name }
        });

        if (!existingService) {
            await prisma.service.create({
                data: {
                    name: s.name,
                    price: s.price,
                    duration: s.duration,
                    description: s.description,
                    barberId: barber.id
                }
            });
        }
    }
    console.log('✅ 4 Serviços essenciais cadastrados com sucesso.');

    // 4. Horários operacionais padrão: 9h, 10h, 11h, (Almoço 12h), 13h, 14h, 15h, 16h, 17h
    const defaultTimes = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
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
    console.log('✅ Horários operacionais (9h-11h / 13h-17h) injetados.');
    console.log('🎉 Seeding concluído!');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
