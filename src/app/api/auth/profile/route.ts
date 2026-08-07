import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { name, phone, slug } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "O nome é obrigatório." }, { status: 400 });
    }

    // Se o slug foi alterado, verificar disponibilidade
    if (slug) {
      const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-");
      const existing = await prisma.user.findFirst({
        where: { slug: cleanSlug, NOT: { id: userId } },
      });

      if (existing) {
        return NextResponse.json({ error: "Este link personalizado já está em uso por outro profissional." }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        slug: slug ? slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-") : undefined,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar perfil." }, { status: 500 });
  }
}
