import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const barberId = searchParams.get("barberId");

    let whereClause = {};
    if (barberId) {
      whereClause = { barberId };
    }

    const services = await prisma.service.findMany({
      where: whereClause,
      orderBy: { price: "asc" },
    });

    return NextResponse.json({ services });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar serviços" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    if (userRole !== "BARBER") {
      return NextResponse.json({ error: "Apenas barbeiros podem cadastrar serviços" }, { status: 403 });
    }

    const { name, price, duration, description } = await req.json();

    if (!name || price === undefined || price === null) {
      return NextResponse.json({ error: "Nome e preço são obrigatórios" }, { status: 400 });
    }

    const newService = await prisma.service.create({
      data: {
        name,
        price: parseFloat(price),
        duration: duration ? parseInt(duration) : 30,
        description: description || null,
        barberId: userId,
      },
    });

    return NextResponse.json({ success: true, service: newService });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno ao cadastrar serviço" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID do serviço é obrigatório" }, { status: 400 });
    }

    await prisma.service.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar serviço" }, { status: 500 });
  }
}
