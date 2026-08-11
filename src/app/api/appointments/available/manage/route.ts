import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "BARBER") {
      return NextResponse.json({ error: "Apenas barbeiros podem gerenciar horários operacionais" }, { status: 403 });
    }

    const barberId = (session.user as any).id;
    const { date, time, action } = await req.json();

    if (!date || !time) {
      return NextResponse.json({ error: "Data e horário são obrigatórios" }, { status: 400 });
    }

    if (action === "REMOVE") {
      await prisma.availableTime.deleteMany({
        where: { barberId, date, time }
      });
      return NextResponse.json({ success: true, message: "Horário removido" });
    } else {
      const existing = await prisma.availableTime.findFirst({
        where: { barberId, date, time }
      });

      if (!existing) {
        await prisma.availableTime.create({
          data: { barberId, date, time }
        });
      }
      return NextResponse.json({ success: true, message: "Horário adicionado" });
    }
  } catch (error) {
    return NextResponse.json({ error: "Erro ao gerenciar horário" }, { status: 500 });
  }
}
