import { Users, Phone, Link as LinkIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import CopyLinkButton from "./CopyLinkButton";
import PublicScheduler from "@/app/agenda/[slug]/PublicScheduler";

export default async function BarberDashboard({ barber }: { barber: any }) {
  const todayStart = new Date();
  todayStart.setUTCHours(0,0,0,0);
  const todayEnd = new Date();
  todayEnd.setUTCHours(23,59,59,999);

  const appointments = await prisma.appointment.findMany({
    where: {
      date: { gte: todayStart, lte: todayEnd },
      barberId: barber.id
    },
    include: { client: true },
    orderBy: { date: 'asc' }
  });

  // Mostra o link se o barbeiro tiver slug, senao usa ID
  const slug = barber.slug || barber.id;
  // TODO: Use a ENV var for the domain in production
  const uniqueLink = `http://localhost:3000/agenda/${slug}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Box do Link Personalizado */}
      <div className="card animate-fade-in" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px", background: "linear-gradient(45deg, var(--surface) 0%, rgba(212, 175, 55, 0.08) 100%)", border: "1px solid rgba(212, 175, 55, 0.4)" }}>
        <div>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <LinkIcon color="var(--primary)" size={20} /> Seu Link de Agendamento
          </h3>
          <p className="label">Coloque este link na bio do seu Instagram ou mande no WhatsApp!</p>
          <code style={{ display: "block", marginTop: "12px", padding: "12px", background: "#000", borderRadius: "8px", color: "var(--primary)", fontSize: "1.05rem" }}>
            {uniqueLink}
          </code>
        </div>
        <CopyLinkButton link={uniqueLink} />
      </div>

      {/* Calendário do Barbeiro (Para bloqueio de horários ou visualização) */}
      <div className="card animate-fade-in" style={{ padding: "0", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", backgroundColor: "rgba(0,0,0,0.2)" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.2rem" }}>
            <span style={{ color: "var(--text-main)" }}>Sua</span> <span style={{ color: "var(--primary)" }}>Agenda</span>
          </h3>
          <p className="label" style={{ marginTop: "4px", fontSize: "0.9rem" }}>Selecione um horário para bloqueá-lo (agendar para si mesmo) ou visualize os dias.</p>
        </div>
        <div style={{ padding: "24px" }}>
          <PublicScheduler barberId={barber.id} barberName={barber.name || 'Profissional'} />
        </div>
      </div>

      <div className="card animate-fade-in">
        <h3 style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Users color="var(--primary)" /> Agendamentos de Hoje
        </h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {appointments.length === 0 ? (
            <p className="label">Nenhum agendamento para hoje até o momento.</p>
          ) : (
            appointments.map(app => {
              const timeStr = app.date.getUTCHours().toString().padStart(2, '0') + ':00';
              
              return (
                <div key={app.id} style={{
                  display: "flex", 
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px",
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  transition: "transform 0.2s"
                }}>
                  <div>
                    <strong style={{ display: "block", fontSize: "1.1rem", marginBottom: "4px" }}>
                      {app.client.name || app.client.email}
                    </strong>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                      <span className="label" style={{ color: "var(--primary)" }}>Hoje, {timeStr}</span>
                      {app.client.phone && (
                        <span className="label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Phone size={14} /> {app.client.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span style={{
                      padding: "6px 12px",
                      borderRadius: "16px",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      backgroundColor: app.status === "CONFIRMED" ? "rgba(212, 175, 55, 0.15)" : "rgba(255, 255, 255, 0.05)",
                      color: app.status === "CONFIRMED" ? "var(--primary)" : "var(--text-muted)",
                      border: `1px solid ${app.status === "CONFIRMED" ? "rgba(212, 175, 55, 0.3)" : "rgba(255, 255, 255, 0.1)"}`
                    }}>
                      {app.status === "CONFIRMED" ? "Confirmado" : "Pendente"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
