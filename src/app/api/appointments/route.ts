import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");

    if (!dateStr) {
      return NextResponse.json(
        { error: "Data não fornecida" },
        { status: 400 },
      );
    }

    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        client: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar agendamentos" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { date, time } = await req.json();

    const appointmentDate = new Date(`${date}T${time}:00.000Z`);

    let barber = await prisma.user.findFirst({ where: { role: "BARBER" } });

    if (!barber) {
      barber = await prisma.user.create({
        data: {
          name: "Barbeiro Premium",
          email: "barber@premium.com",
          role: "BARBER",
        },
      });
    }

    const clientId = (session.user as any).id;

    // Verificar se o horário está disponível (cadastrado pelo barbeiro)
    const isAvailable = await prisma.availableTime.findFirst({
      where: {
        barberId: barber.id,
        date: date,
        time: time,
      },
    });

    if (!isAvailable) {
      return NextResponse.json(
        { error: "Este horário não está disponível" },
        { status: 400 },
      );
    }

    const existing = await prisma.appointment.findFirst({
      where: {
        barberId: barber.id,
        date: appointmentDate,
        status: "CONFIRMED",
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Este horário não está mais disponível" },
        { status: 400 },
      );
    }

    // Criação do agendamento
    await prisma.appointment.create({
      data: {
        date: appointmentDate,
        clientId,
        barberId: barber.id,
        status: "CONFIRMED",
      },
    });

    // Salvar Intenção de Notificação para o Bot Processar
    const dbClient = await prisma.user.findUnique({ where: { id: clientId } });

    if (dbClient?.phone) {
      await prisma.notification.create({
        data: {
          phone: dbClient.phone,
          message: `Olá ${dbClient.name || ""}, seu agendamento na *Premium Barber* para o dia ${date} às ${time} foi CONFIRMADO com sucesso! Obrigado pela preferência.`,
        },
      });
    }

    if (barber.phone) {
      await prisma.notification.create({
        data: {
          phone: barber.phone,
          message: `🚨 *NOVO AGENDAMENTO!*\nO cliente ${dbClient?.name || "Um cliente"} acabou de marcar um horário para o dia ${date} às ${time}.`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Agendamento confirmado!",
    });
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar agendamento" },
      { status: 500 },
    );
  }
}
