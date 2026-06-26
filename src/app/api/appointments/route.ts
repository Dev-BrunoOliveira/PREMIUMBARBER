import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { date, time, barberId } = await req.json(); 

    if (!date || !time || !barberId) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const appointmentDate = new Date(`${date}T${time}:00.000Z`);
    const clientId = (session.user as any).id;

    const existing = await prisma.appointment.findFirst({
      where: { barberId, date: appointmentDate, status: "CONFIRMED" }
    });

    if (existing) {
      return NextResponse.json({ error: "Este horário não está mais disponível" }, { status: 400 });
    }

    await prisma.appointment.create({
      data: {
        date: appointmentDate,
        clientId,
        barberId,
        status: "CONFIRMED"
      }
    });
    
    const dbClient = await prisma.user.findUnique({ where: { id: clientId } });
    const barber = await prisma.user.findUnique({ where: { id: barberId } });
    
    if (dbClient?.phone) {
      await prisma.notification.create({
        data: {
          phone: dbClient.phone,
          message: `Olá ${dbClient.name || ''}, seu agendamento com o profissional ${barber?.name || ''} para o dia ${date} às ${time} foi CONFIRMADO com sucesso! Obrigado pela preferência.`
        }
      });
    }

    if (barber?.phone) {
      await prisma.notification.create({
        data: {
          phone: barber.phone,
          message: `🚨 *NOVO AGENDAMENTO!*\nO cliente ${dbClient?.name || 'Um cliente'} marcou um horário para o dia ${date} às ${time}.`
        }
      });
    }

    return NextResponse.json({ success: true, message: "Agendamento confirmado!" });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno ao processar agendamento" }, { status: 500 });
  }
}
