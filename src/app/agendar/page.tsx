import { prisma } from "@/lib/prisma";
import PublicScheduler from "@/app/agenda/[slug]/PublicScheduler";
import { notFound } from "next/navigation";

export default async function AgendarPage() {
  // Busca o barbeiro principal (ou o primeiro barbeiro cadastrado)
  const barber = await prisma.user.findFirst({
    where: { role: "BARBER" },
    orderBy: { name: "asc" }
  });

  if (!barber) {
    notFound();
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)", padding: "32px 16px" }}>
      <header style={{ maxWidth: "850px", margin: "0 auto 32px", textAlign: "center" }} className="animate-fade-in">
        <div style={{ display: "inline-block", backgroundColor: "rgba(212, 175, 55, 0.1)", border: "1px solid var(--primary)", padding: "6px 16px", borderRadius: "20px", marginBottom: "16px" }}>
          <span style={{ color: "var(--primary)", fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase" }}>
            Agendamento Rápido
          </span>
        </div>
        <h1 style={{ fontSize: "2.4rem", marginBottom: "8px", fontWeight: "800" }}>
          Premium<span style={{ color: "var(--primary)" }}>Barber</span>
        </h1>
        <p className="label" style={{ textTransform: "none", fontSize: "1rem" }}>
          Selecione seu serviço, data e horário com o profissional <strong>{barber.name}</strong>.
        </p>
      </header>

      <PublicScheduler barberId={barber.id} barberName={barber.name || "Profissional"} />
    </div>
  );
}
