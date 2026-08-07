import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PublicScheduler from "./PublicScheduler";

export default async function AgendaPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;

  const barber = await prisma.user.findFirst({
    where: {
      OR: [
        { slug: slug },
        { id: slug }
      ],
      role: "BARBER"
    }
  });

  if (!barber) {
    notFound();
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)", padding: "24px 16px" }}>
      <header style={{ maxWidth: "850px", margin: "0 auto 32px", textAlign: "center" }} className="animate-fade-in">
        <div style={{ display: "inline-block", backgroundColor: "rgba(229, 9, 20, 0.1)", border: "1px solid var(--primary)", padding: "6px 16px", borderRadius: "20px", marginBottom: "16px" }}>
          <span style={{ color: "var(--primary)", fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase" }}>
            Agendamento Online
          </span>
        </div>
        <h1 style={{ fontSize: "2.2rem", marginBottom: "8px", fontWeight: "800" }}>
          Barbearia <span style={{ color: "var(--primary)" }}>{barber.name}</span>
        </h1>
        <p className="label" style={{ textTransform: "none", fontSize: "1rem" }}>
          Escolha seu serviço, data e horário em poucos segundos.
        </p>
      </header>

      <PublicScheduler barberId={barber.id} barberName={barber.name || "Barbeiro"} />
    </div>
  );
}
