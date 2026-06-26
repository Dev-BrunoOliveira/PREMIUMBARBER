import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ClientDashboard from "./ClientDashboard";
import BarberDashboard from "./BarberDashboard";
import LogoutButton from "./LogoutButton";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const role = (session.user as any).role || "CLIENT";

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
        <h2>Olá, <span style={{ color: "var(--primary)" }}>{session.user.name || session.user.email?.split("@")[0]}</span></h2>
        
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span className="label" style={{ backgroundColor: "var(--surface)", padding: "6px 16px", borderRadius: "16px", border: "1px solid var(--border)" }}>
            {role === "BARBER" ? "Painel do Barbeiro" : "Painel do Cliente"}
          </span>
          <LogoutButton />
        </div>
      </header>

      {role === "BARBER" ? <BarberDashboard /> : <ClientDashboard />}
    </div>
  );
}
