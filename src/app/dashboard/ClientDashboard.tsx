import { Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function ClientDashboard({ user }: { user: any }) {
  const appointments = await prisma.appointment.findMany({
    where: { clientId: user.id },
    include: { barber: true },
    orderBy: { date: 'desc' }
  });

  return (
    <div className="card animate-fade-in" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h3 style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
        <Calendar color="var(--primary)" /> Meus Agendamentos
      </h3>
      
      {appointments.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", backgroundColor: "var(--background)", borderRadius: "8px", border: "1px dashed var(--border)" }}>
          <p className="label" style={{ marginBottom: "16px" }}>Você ainda não tem nenhum agendamento.</p>
          <p style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>Peça o link personalizado para o seu barbeiro ou encontre a página de agendamento dele!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {appointments.map(app => {
            const dateStr = app.date.toLocaleDateString("pt-BR");
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
  );
}
