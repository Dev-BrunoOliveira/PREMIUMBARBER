"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, LayoutDashboard, User, LogIn, Calendar } from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && session?.user;
  const isBarber = (session?.user as any)?.role === "BARBER";

  return (
    <nav
      style={{
        backgroundColor: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(24px) saturate(210%)",
        WebkitBackdropFilter: "blur(24px) saturate(210%)",
        boxShadow: "none",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "14px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {/* Logo / Brand */}
        <Link
          href="/"
          style={{
            fontSize: "1.4rem",
            fontWeight: "800",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            letterSpacing: "-0.02em",
          }}
        >
          Barber<span style={{ color: "var(--primary)" }}>App</span>
        </Link>

        {/* Menu de Ações */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {isAuthenticated ? (
            <>
              {/* Info do Usuário */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  border: "1px solid var(--border)",
                  fontSize: "0.88rem",
                  color: "var(--text-main)",
                }}
              >
                <User size={14} color="var(--primary)" />
                <span style={{ fontWeight: "600" }}>
                  {session.user?.name || session.user?.email?.split("@")[0]}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    padding: "2px 10px",
                    borderRadius: "12px",
                    backgroundColor: "var(--primary-glow)",
                    color: "var(--primary)",
                    border: "1px solid var(--primary)",
                    textTransform: "uppercase",
                  }}
                >
                  {isBarber ? "Barbeiro" : "Cliente"}
                </span>
              </div>

              {/* Botão para o Painel */}
              <Link
                href="/dashboard"
                className="btn-secondary"
                style={{
                  padding: "8px 14px",
                  fontSize: "0.88rem",
                  borderRadius: "10px",
                }}
              >
                <LayoutDashboard size={16} /> Meu Painel
              </Link>

              {/* Botão de Sair (Logout) */}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(255, 59, 48, 0.12)",
                  border: "1px solid rgba(255, 59, 48, 0.4)",
                  color: "#ff3b30",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(255, 59, 48, 0.25)";
                  e.currentTarget.style.borderColor = "#ff3b30";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "rgba(255, 59, 48, 0.12)";
                  e.currentTarget.style.borderColor = "rgba(255, 59, 48, 0.4)";
                }}
                title="Encerrar sessão"
              >
                <LogOut size={16} /> Sair
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="btn-secondary"
                style={{
                  padding: "8px 16px",
                  fontSize: "0.88rem",
                  borderRadius: "10px",
                }}
              >
                <LogIn size={16} /> Entrar
              </Link>
              <Link
                href="/login"
                className="btn-primary"
                style={{
                  padding: "8px 16px",
                  fontSize: "0.88rem",
                  borderRadius: "10px",
                }}
              >
                <Calendar size={16} /> Agendar Horário
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
