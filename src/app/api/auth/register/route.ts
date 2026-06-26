import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, phone, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Este email já está cadastrado" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const finalRole = role === "BARBER" ? "BARBER" : "CLIENT";
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: passwordHash,
        role: finalRole,
      }
    });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno ao criar conta" }, { status: 500 });
  }
}
