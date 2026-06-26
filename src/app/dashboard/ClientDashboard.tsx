import { Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import PublicScheduler from "@/app/agenda/[slug]/PublicScheduler";

export default async function ClientDashboard({ user }: { user: any }) {
  const appointments = await prisma.appointment.findMany({
    where: { clientId: user.id },
    include: { barber: true },
    orderBy: { date: 'desc' }
  });

  // Busca um barbeiro disponível para o cliente já agendar direto no painel
  const barber = await prisma.user.findFirst({
    where: { role: 'BARBER' }
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", maxWidth: "900px", margin: "0 auto" }}>
      
      {/* Seção de Agendamento */}
      {barber ? (
        <div className="animate-fade-in" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", backgroundColor: "rgba(0,0,0,0.2)" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.2rem" }}>
              <span style={{ color: "var(--text-main)" }}>Agendar com</span> <span style={{ color: "var(--primary)" }}>{barber.name}</span>
            </h3>
          </div>
          <div style={{ padding: "24px" }}>
            <PublicScheduler barberId={barber.id} barberName={barber.name || 'Profissional'} />
          </div>
        </div>
      ) : (
        <div className="card">
          <p className="label">Nenhum profissional disponível no momento.</p>
        </div>
      )}

      {/* Histórico de Agendamentos */}
      <div className="card animate-fade-in">
        <h3 style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Calendar color="var(--primary)" /> Meus Agendamentos Anteriores
        </h3>
        
        {appointments.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", backgroundColor: "var(--background)", borderRadius: "8px", border: "1px dashed var(--border)" }}>
            <p className="label" style={{ marginBottom: "16px" }}>Você ainda não tem nenhum agendamento.</p>
            <p style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>Utilize o calendário acima para marcar seu primeiro horário!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {appointments.map(app => {
              const dateStr = app.date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
              const timeStr = app.date.getUTCHours().toString().padStart(2, '0') + ':00';
              
              return (
                <div key={app.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", backgroundColor: "var(--background)", border: "1px solid var(--border)", borderRadius: "8px" }}>
                  <div>
                    <strong style={{ display: "block", fontSize: "1.1rem", marginBottom: "4px" }}>
                      Com {app.barber?.name || "Barbeiro"}
                    </strong>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <span className="label" style={{ color: "var(--primary)" }}>{dateStr} às {timeStr}</span>
                    </div>
                  </div>
                  <div>
                    <span style={{ padding: "6px 12px", borderRadius: "16px", fontSize: "0.85rem", fontWeight: "600", backgroundColor: "rgba(212, 175, 55, 0.15)", color: "var(--primary)", border: "1px solid rgba(212, 175, 55, 0.3)" }}>
                      {app.status === "CONFIRMED" ? "Confirmado" : "Pendente"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
    </div>
  );
}
