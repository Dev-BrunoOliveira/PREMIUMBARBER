import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClientDashboard from "./ClientDashboard";
import BarberDashboard from "./BarberDashboard";
import LogoutButton from "./LogoutButton";
import { prisma } from "@/lib/prisma";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (!user) redirect("/login");

  const role = user.role;
  const isBarber = role === "BARBER";

  return (
    <div
      data-role={isBarber ? "BARBER" : "CLIENT"}
      className={isBarber ? "barber-theme" : ""}
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--background)",
        color: "var(--text-main)",
        padding: "24px 16px",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
            borderBottom: "1px solid var(--border)",
            paddingBottom: "16px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "800" }}>
              Olá, <span style={{ color: "var(--primary)" }}>{user.name || user.email?.split("@")[0]}</span>
            </h2>
            <p className="label" style={{ textTransform: "none", marginTop: "2px" }}>
              {isBarber ? "⚡ Painel do Barbeiro" : "✂️ Área do Cliente"}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span
              style={{
                backgroundColor: "var(--primary-glow)",
                color: "var(--primary)",
                padding: "8px 18px",
                borderRadius: "20px",
                border: "1px solid var(--primary)",
                fontWeight: "700",
                fontSize: "0.85rem",
                textTransform: "uppercase",
                backdropFilter: "blur(8px)",
              }}
            >
              {isBarber ? "⚡ Painel do Barbeiro" : "✂️ Área do Cliente"}
            </span>
            <LogoutButton />
          </div>
        </header>

        {isBarber ? <BarberDashboard barber={user} /> : <ClientDashboard user={user} />}
      </div>
    </div>
  );
}
