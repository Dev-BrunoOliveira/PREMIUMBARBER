import { Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import PublicScheduler from "@/app/agenda/[slug]/PublicScheduler";

export default async function ClientDashboard({ user }: { user: any }) {
  const appointments = await prisma.appointment.findMany({
    where: { clientId: user.id },
    include: { barber: true, service: true },
    orderBy: { date: "desc" },
  });

  const barber = await prisma.user.findFirst({
    where: { role: "BARBER" },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", maxWidth: "850px", margin: "0 auto" }}>
      {/* Seção de Novo Agendamento */}
      {barber ? (
        <div className="animate-fade-in">
          <PublicScheduler barberId={barber.id} barberName={barber.name || "Profissional"} />
        </div>
      ) : (
        <div className="card">
          <p className="label">Nenhum profissional disponível no momento.</p>
        </div>
      )}

      {/* Histórico de Agendamentos */}
      <div className="card animate-fade-in">
        <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Calendar color="var(--primary)" size={20} />
          Seus Agendamentos
        </h3>

        {appointments.length === 0 ? (
          <div
            style={{
              padding: "36px 20px",
              textAlign: "center",
              backgroundColor: "var(--background)",
              borderRadius: "12px",
              border: "1px dashed var(--border)",
            }}
          >
            <p className="label" style={{ marginBottom: "8px", textTransform: "none" }}>
              Você ainda não tem nenhum agendamento registrado.
            </p>
            <p style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>
              Escolha seu serviço no formulário acima para marcar seu primeiro horário!
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {appointments.map((app) => {
              const dateStr = new Date(app.date).toLocaleDateString("pt-BR", { timeZone: "UTC" });
              const timeStr = app.time || (new Date(app.date).getUTCHours().toString().padStart(2, "0") + ":00");

              return (
                <div
                  key={app.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 20px",
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <strong style={{ display: "block", fontSize: "1.1rem", marginBottom: "4px" }}>
                      {app.service?.name || "Atendimento"} com {app.barber?.name || "Barbeiro"}
                    </strong>
                    <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ color: "var(--primary)", fontWeight: "600", fontSize: "0.9rem" }}>
                        📅 {dateStr} às {timeStr}
                      </span>
                      {app.service && (
                        <span style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                          R$ {app.service.price.toFixed(2).replace(".", ",")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span
                      className={
                        app.status === "CONFIRMED"
                          ? "badge badge-confirmed"
                          : app.status === "COMPLETED"
                          ? "badge badge-completed"
                          : app.status === "CANCELED"
                          ? "badge badge-canceled"
                          : "badge badge-pending"
                      }
                    >
                      {app.status === "CONFIRMED"
                        ? "Confirmado"
                        : app.status === "COMPLETED"
                        ? "Concluído"
                        : app.status === "CANCELED"
                        ? "Cancelado"
                        : "Aguardando Confirmação"}
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
