import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    const { searchParams } = new URL(req.url);
    const filterDate = searchParams.get("date"); // YYYY-MM-DD

    let whereClause: any = {};

    if (userRole === "BARBER") {
      whereClause.barberId = userId;
    } else {
      whereClause.clientId = userId;
    }

    if (filterDate) {
      const startOfDay = new Date(`${filterDate}T00:00:00.000Z`);
      const endOfDay = new Date(`${filterDate}T23:59:59.999Z`);
      whereClause.date = { gte: startOfDay, lte: endOfDay };
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        client: true,
        barber: true,
        service: true,
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar agendamentos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { date, time, barberId, serviceId, clientName, clientPhone, clientEmail } = await req.json();

    if (!date || !time || !barberId) {
      return NextResponse.json({ error: "Data, horário e barbeiro são obrigatórios." }, { status: 400 });
    }

    if (!clientName || !clientPhone || !clientEmail) {
      return NextResponse.json({ error: "Nome, WhatsApp e E-mail são obrigatórios para realizar o agendamento." }, { status: 400 });
    }

    const appointmentDate = new Date(`${date}T${time}:00.000Z`);

    // Verificar se o horário já está reservado
    const existing = await prisma.appointment.findFirst({
      where: {
        barberId,
        date: appointmentDate,
        status: { in: ["CONFIRMED", "PENDING"] },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Infelizmente este horário acabou de ser reservado por outro cliente." }, { status: 400 });
    }

    const loggedUserId = session?.user ? (session.user as any).id : null;

    // Buscar informações do Serviço e do Barbeiro
    const service = serviceId ? await prisma.service.findUnique({ where: { id: serviceId } }) : null;
    const barber = await prisma.user.findUnique({ where: { id: barberId } });

    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        time,
        barberId,
        serviceId: serviceId || null,
        clientId: loggedUserId,
        clientName,
        clientPhone,
        clientEmail,
        status: "PENDING", // Inicia como PENDENTE aguardando confirmação do barbeiro
      },
      include: {
        service: true,
        barber: true,
      },
    });

    // 1. Criar Notificação para o Cliente
    if (clientPhone) {
      await prisma.notification.create({
        data: {
          phone: clientPhone,
          message: `Olá *${clientName}*! Seu agendamento na barbearia de *${barber?.name || 'nosso profissional'}* para *${service?.name || 'Atendimento'}* no dia *${date} às ${time}* foi RECEBIDO com sucesso! Status: Aguardando confirmação.`,
        },
      });
    }

    // 2. Criar Notificação para o Barbeiro
    if (barber?.phone) {
      await prisma.notification.create({
        data: {
          phone: barber.phone,
          message: `🚨 *NOVO AGENDAMENTO PENDENTE!*\n👤 *Cliente:* ${clientName}\n📱 *Zap:* ${clientPhone}\n✂️ *Serviço:* ${service?.name || 'Atendimento'} (R$ ${service?.price || '0'})\n📅 *Data:* ${date} às ${time}\n\nAcesse seu painel para confirmar!`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Agendamento realizado com sucesso! Aguarde a confirmação do barbeiro.",
      appointment,
    });
  } catch (error) {
    console.error("Erro no POST de agendamento:", error);
    return NextResponse.json({ error: "Erro interno ao processar o agendamento." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "BARBER") {
      return NextResponse.json({ error: "Apenas barbeiros podem alterar o status de agendamentos" }, { status: 403 });
    }

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "ID e status são obrigatórios" }, { status: 400 });
    }

    const validStatuses = ["CONFIRMED", "COMPLETED", "CANCELED", "PENDING"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: { barber: true, service: true },
    });

    // Notificar cliente sobre atualização de status
    const targetPhone = updated.clientPhone;
    if (targetPhone) {
      let statusMsg = "";
      if (status === "CONFIRMED") {
        statusMsg = `✅ *AGENDAMENTO CONFIRMADO!* Seu horário com ${updated.barber.name} para o dia ${updated.date.toISOString().split("T")[0]} foi CONFIRMADO pelo barbeiro!`;
      } else if (status === "CANCELED") {
        statusMsg = `❌ *AGENDAMENTO CANCELADO.* Seu agendamento para o dia ${updated.date.toISOString().split("T")[0]} foi cancelado.`;
      } else if (status === "COMPLETED") {
        statusMsg = `⭐ *ATENDIMENTO CONCLUÍDO!* Obrigado pela preferência! Nos vemos na próxima.`;
      }

      if (statusMsg) {
        await prisma.notification.create({
          data: {
            phone: targetPhone,
            message: statusMsg,
          },
        });
      }
    }

    return NextResponse.json({ success: true, appointment: updated });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar agendamento" }, { status: 500 });
  }
}
