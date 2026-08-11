import Link from "next/link";
import { Scissors, Calendar, Clock, ShieldCheck, ArrowRight, MessageCircle, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const services = await prisma.service.findMany({
    take: 4,
    orderBy: { price: "asc" },
  });

  const barber = await prisma.user.findFirst({
    where: { role: "BARBER" },
  });

  const bookingHref = barber?.slug ? `/agenda/${barber.slug}` : "/agenda/barbeiro-premium";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)", color: "var(--text-main)" }}>
      {/* Hero Section */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "40px auto 60px",
          padding: "0 16px",
          textAlign: "center",
        }}
        className="animate-fade-in"
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "rgba(229, 9, 20, 0.1)",
            border: "1px solid var(--primary)",
            padding: "8px 18px",
            borderRadius: "20px",
            marginBottom: "24px",
          }}
        >
          <Sparkles size={16} color="var(--primary)" />
          <span style={{ color: "var(--primary)", fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase" }}>
            Agendamento do Cliente & Sem Fila
          </span>
        </div>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: "900",
            lineHeight: "1.15",
            marginBottom: "20px",
            letterSpacing: "-0.02em",
          }}
        >
          Fique Sempre <br />
          <span style={{ color: "var(--primary)" }}>Elegante</span>
        </h1>

        <p
          className="label"
          style={{
            textTransform: "none",
            fontSize: "1.15rem",
            maxWidth: "600px",
            margin: "0 auto 36px",
            lineHeight: "1.6",
          }}
        >
          Escolha seu serviço, selecione a melhor data e receba a confirmação instantânea no seu WhatsApp em menos de 1 minuto.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
          <Link href={bookingHref} className="btn-primary" style={{ padding: "16px 36px", fontSize: "1.1rem" }}>
            <Calendar size={20} /> Agendar na Barberia do Jé
          </Link>
          <Link href="/login?role=BARBER" className="btn-secondary" style={{ padding: "16px 28px", fontSize: "1.1rem" }}>
            🟣 Painel do Barbeiro
          </Link>
        </div>
      </section>

      {/* Destaques de Serviços */}
      <section style={{ maxWidth: "1100px", margin: "0 auto 80px", padding: "0 16px" }}>
        <h2 style={{ fontSize: "1.8rem", textAlign: "center", marginBottom: "32px", fontWeight: "800" }}>
          Serviços Mais <span style={{ color: "var(--primary)" }}>Procurados</span>
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
          {services.map((s) => (
            <div
              key={s.id}
              className="card hover-card"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "24px",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <Scissors color="var(--primary)" size={24} />
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={14} /> {s.duration} min
                  </span>
                </div>
                <h3 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>{s.name}</h3>
                {s.description && (
                  <p className="label" style={{ textTransform: "none", fontSize: "0.88rem", marginBottom: "16px" }}>
                    {s.description}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "16px" }}>
                <strong style={{ fontSize: "1.3rem", color: "var(--primary)" }}>
                  R$ {s.price.toFixed(2).replace(".", ",")}
                </strong>
                <Link href={bookingHref} style={{ color: "var(--primary)", fontWeight: "700", fontSize: "0.9rem" }}>
                  Agendar →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Diferenciais */}
      <section style={{ backgroundColor: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "60px 16px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ width: "50px", height: "50px", borderRadius: "12px", backgroundColor: "rgba(229, 9, 20, 0.15)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Calendar size={26} />
            </div>
            <div>
              <h4 style={{ fontSize: "1.1rem", marginBottom: "6px" }}>Agendamento 24/7</h4>
              <p className="label" style={{ textTransform: "none" }}>Marque seu horário em qualquer dia ou hora do dia sem precisar ligar.</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ width: "50px", height: "50px", borderRadius: "12px", backgroundColor: "rgba(229, 9, 20, 0.15)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <MessageCircle size={26} />
            </div>
            <div>
              <h4 style={{ fontSize: "1.1rem", marginBottom: "6px" }}>Notificação via WhatsApp</h4>
              <p className="label" style={{ textTransform: "none" }}>Receba o comprovante e lembrete direto no seu WhatsApp.</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ width: "50px", height: "50px", borderRadius: "12px", backgroundColor: "rgba(229, 9, 20, 0.15)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ShieldCheck size={26} />
            </div>
            <div>
              <h4 style={{ fontSize: "1.1rem", marginBottom: "6px" }}>Sem Fila de Espera</h4>
              <p className="label" style={{ textTransform: "none" }}>Chegue no horário marcado e seja atendido imediatamente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
        <p>© 2026 PremiumBarber. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

function Sparkles({ size, color }: { size: number; color: string }) {
  return <Star size={size} color={color} fill={color} />;
}
