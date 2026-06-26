import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import PublicScheduler from "./PublicScheduler";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AgendaPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect(`/login?callbackUrl=/agenda/${params.slug}`);
  }

  const barber = await prisma.user.findFirst({
    where: { 
      OR: [
        { slug: params.slug },
        { id: params.slug }
      ],
      role: "BARBER"
    }
  });

  if (!barber) {
    notFound();
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)", padding: "24px" }}>
      <header style={{ maxWidth: "900px", margin: "0 auto 32px", textAlign: "center" }} className="animate-fade-in">
        <h1 style={{ fontSize: "2rem", marginBottom: "8px", fontWeight: "800" }}>Agenda de <span style={{color: "var(--primary)"}}>{barber.name}</span></h1>
        <p className="label">Selecione o melhor horário para o seu atendimento.</p>
      </header>
      
      <PublicScheduler barberId={barber.id} barberName={barber.name || ''} />
    </div>
  );
}
