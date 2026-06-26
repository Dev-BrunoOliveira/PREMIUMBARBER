import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date"); // YYYY-MM-DD

  if (!dateStr) {
    return NextResponse.json({ error: "Data não fornecida" }, { status: 400 });
  }

  try {
    // Buscar horários disponíveis cadastrados pelo barbeiro
    const availableTimesFromDB = await prisma.availableTime.findMany({
      where: { date: dateStr },
      select: { time: true },
      orderBy: { time: "asc" },
    });

    const dbTimes = availableTimesFromDB.map((t) => t.time);

    // Buscar agendamentos confirmados para esta data
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: "CONFIRMED",
      },
    });

    const bookedTimes = appointments.map((app) => {
      const hours = app.date.getUTCHours().toString().padStart(2, "0");
      return `${hours}:00`;
    });

    // Horários disponíveis são aqueles cadastrados que não têm agendamentos
    const availableTimes = dbTimes.filter((t) => !bookedTimes.includes(t));

    return NextResponse.json({ availableTimes });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar horários" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
    });

    if (user?.role !== "BARBER") {
      return NextResponse.json(
        { error: "Apenas barbeiros podem adicionar horários" },
        { status: 403 },
      );
    }

    const { date, time } = await req.json();

    if (!date || !time) {
      return NextResponse.json(
        { error: "Data e hora são obrigatórios" },
        { status: 400 },
      );
    }

    const existing = await prisma.availableTime.findFirst({
      where: {
        date,
        time,
        barberId: user.id,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Este horário já foi adicionado" },
        { status: 400 },
      );
    }

    await prisma.availableTime.create({
      data: {
        date,
        time,
        barberId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Horário adicionado com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao adicionar horário:", error);
    return NextResponse.json(
      { error: "Erro interno ao adicionar horário" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
    });

    if (user?.role !== "BARBER") {
      return NextResponse.json(
        { error: "Apenas barbeiros podem remover horários" },
        { status: 403 },
      );
    }

    const { date, time } = await req.json();

    if (!date || !time) {
      return NextResponse.json(
        { error: "Data e hora são obrigatórios" },
        { status: 400 },
      );
    }

    await prisma.availableTime.deleteMany({
      where: {
        date,
        time,
        barberId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Horário removido com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao remover horário:", error);
    return NextResponse.json(
      { error: "Erro interno ao remover horário" },
      { status: 500 },
    );
  }
}
