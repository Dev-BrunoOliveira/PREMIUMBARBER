const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { format, addDays } = require('date-fns');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando injeção de dados no SQLite local (dev.db)...');

    const hashedPassword = await bcrypt.hash('123456', 10);

    // 1. Criar ou atualizar Barbeiro Demo
    let barber = await prisma.user.findFirst({ where: { role: 'BARBER' } });
    
    if (!barber) {
        barber = await prisma.user.create({
            data: {
                name: 'Barbeiro Premium',
                email: 'barber@premium.com',
                password: hashedPassword,
                phone: '(11) 99999-8888',
                role: 'BARBER',
                slug: 'barbeiro-premium'
            }
        });
        console.log('✅ Barbeiro demo criado: barber@premium.com / 123456');
    } else {
        await prisma.user.update({
            where: { id: barber.id },
            data: { password: hashedPassword, slug: 'barbeiro-premium' }
        });
        console.log('✅ Barbeiro existente atualizado.');
    }

    // 2. Criar ou atualizar Cliente Demo
    let client = await prisma.user.findUnique({ where: { email: 'cliente@teste.com' } });
    if (!client) {
        client = await prisma.user.create({
            data: {
                name: 'Cliente Teste',
                email: 'cliente@teste.com',
                password: hashedPassword,
                phone: '(11) 97777-6666',
                role: 'CLIENT'
            }
        });
        console.log('✅ Cliente demo criado: cliente@teste.com / 123456');
    }

    // 3. Injetar Serviços da Barbearia
    const defaultServices = [
        {
            name: 'Corte Masculino',
            price: 45.00,
            duration: 30,
            description: 'Corte moderno ou clássico com acabamento perfeito na tesoura ou máquina.'
        },
        {
            name: 'Barba Completa com Toalha Quente',
            price: 35.00,
            duration: 30,
            description: 'Modelagem, alinhamento com navalha, toalha quente e hidratação com óleo/balm.'
        },
        {
            name: 'Combo Especial (Corte + Barba)',
            price: 70.00,
            duration: 50,
            description: 'O pacote completo para dar aquele tapa no visual com desconto especial.'
        },
        {
            name: 'Pezinho & Acabamento',
            price: 20.00,
            duration: 15,
            description: 'Alinhamento rápido do contorno do cabelo e barba.'
        },
        {
            name: 'Design de Sobrancelha',
            price: 15.00,
            duration: 15,
            description: 'Limpeza e alinhamento masculino na navalha.'
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
    console.log('✅ Serviços da barbearia criados.');

    // 4. Injetar Horários dos próximos 15 dias
    const defaultTimes = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
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
    console.log('✅ Horários para os próximos 15 dias injetados.');
    console.log('🎉 Seeding concluído com sucesso!');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
