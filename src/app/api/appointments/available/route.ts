import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date"); 
  const barberId = searchParams.get("barberId");

  if (!dateStr || !barberId) {
    return NextResponse.json({ error: "Faltam parâmetros" }, { status: 400 });
  }

  try {
    const availableTimesFromDB = await prisma.availableTime.findMany({
      where: { date: dateStr, barberId },
      select: { time: true },
      orderBy: { time: "asc" },
    });

    let dbTimes = availableTimesFromDB.map((t) => t.time);

    if (dbTimes.length === 0) {
      dbTimes = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
    }

    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    const appointments = await prisma.appointment.findMany({
      where: {
        barberId,
        date: { gte: startOfDay, lte: endOfDay },
        status: "CONFIRMED"
      }
    });

    const bookedTimes = appointments.map((app) => {
      const hours = app.date.getUTCHours().toString().padStart(2, "0");
      return `${hours}:00`;
    });

    const availableTimes = dbTimes.filter((t) => !bookedTimes.includes(t));

    return NextResponse.json({ availableTimes });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar horários" }, { status: 500 });
  }
}
