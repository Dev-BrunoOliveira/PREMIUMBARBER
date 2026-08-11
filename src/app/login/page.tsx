"use client";

import { useState, Suspense } from "react";
import { signIn, useSession, signOut } from "next-auth/react";
import { LogIn, UserPlus, LogOut, LayoutDashboard } from "lucide-react";
import styles from "./login.module.css";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const { data: session } = useSession();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const initialRole = searchParams.get("role") === "CLIENT" ? "CLIENT" : "BARBER";
  const [role, setRole] = useState<"CLIENT" | "BARBER">(initialRole);

  const isBarber = role === "BARBER";

  const targetRedirect = isBarber
    ? "/dashboard"
    : searchParams.get("callbackUrl") || "/agenda/barbeiro-premium";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;

    if (isLogin) {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        alert("E-mail ou senha incorretos.");
      } else {
        router.push("/dashboard");
      }
    } else {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, role }),
      });
      const data = await res.json();

      if (res.ok) {
        await signIn("credentials", { email, password, callbackUrl: "/dashboard" });
      } else {
        alert(data.error || "Erro ao criar conta.");
      }
    }
    setLoading(false);
  };

  return (
    <div
      className={styles.container}
      data-role={isBarber ? "BARBER" : "CLIENT"}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        backgroundColor: "var(--background)",
        color: "var(--text-main)",
        transition: "all 0.3s ease",
      }}
    >
      <div
        className="card animate-fade-in"
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "32px 24px",
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        {session?.user && (
          <div
            style={{
              marginBottom: "20px",
              padding: "14px 16px",
              backgroundColor: "var(--primary-glow)",
              border: "1px solid var(--primary)",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "0.9rem", color: "var(--text-main)", marginBottom: "10px" }}>
              Você está conectado como <strong>{session.user.name || session.user.email}</strong>
            </p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn-primary"
                style={{ padding: "8px 14px", fontSize: "0.85rem", borderRadius: "8px" }}
                onClick={() => router.push("/dashboard")}
              >
                <LayoutDashboard size={16} /> Meu Painel
              </button>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(244, 63, 94, 0.15)",
                  border: "1px solid rgba(244, 63, 94, 0.4)",
                  color: "#f43f5e",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "0.85rem",
                }}
              >
                <LogOut size={16} /> Sair
              </button>
            </div>
          </div>
        )}

        {/* Seleção de Perfil */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            marginBottom: "24px",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            padding: "4px",
            borderRadius: "10px",
            border: "1px solid var(--border)",
          }}
        >
          <button
            type="button"
            onClick={() => setRole("BARBER")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "0.88rem",
              backgroundColor: role === "BARBER" ? "var(--primary)" : "transparent",
              color: role === "BARBER" ? "#ffffff" : "var(--text-muted)",
              transition: "all 0.2s ease",
            }}
          >
            Sou Barbeiro
          </button>
          <button
            type="button"
            onClick={() => setRole("CLIENT")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "0.88rem",
              backgroundColor: role === "CLIENT" ? "var(--primary)" : "transparent",
              color: role === "CLIENT" ? "#ffffff" : "var(--text-muted)",
              transition: "all 0.2s ease",
            }}
          >
            Sou Cliente
          </button>
        </div>

        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800" }}>
            Barber<span style={{ color: "var(--primary)" }}>App</span>
          </h1>
          <p className="label" style={{ textTransform: "none", marginTop: "4px" }}>
            {isBarber
              ? "Painel do Barbeiro - Gerencie agendamentos e carteira de clientes"
              : isLogin
              ? "Área do Cliente - Faça login para agendar e gerenciar horários"
              : "Crie sua conta de cliente (Nome, WhatsApp, E-mail e Senha)"}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {!isLogin && (
            <>
              <div>
                <label className="label">Nome Completo *</label>
                <input
                  name="name"
                  type="text"
                  className="input-field"
                  placeholder={isBarber ? "Nome do Barbeiro" : "Seu nome completo"}
                  required={!isLogin}
                />
              </div>
              <div>
                <label className="label">Celular / WhatsApp (com DDD) *</label>
                <input
                  name="phone"
                  type="tel"
                  className="input-field"
                  placeholder="(11) 99999-9999"
                  required={!isLogin}
                />
              </div>
            </>
          )}
          <div>
            <label className="label">E-mail *</label>
            <input
              name="email"
              type="email"
              className="input-field"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div>
            <label className="label">Senha *</label>
            <input
              name="password"
              type="password"
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: "100%",
              marginTop: "12px",
            }}
            disabled={loading}
          >
            {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
            {loading ? "Aguarde..." : isLogin ? (isBarber ? "Entrar no Painel do Barbeiro" : "Entrar como Cliente") : "Criar Conta"}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{ color: "var(--text-muted)", fontSize: "0.88rem", textDecoration: "underline" }}
          >
            {isLogin ? "Ainda não tem conta? Criar Conta" : "Já tem conta? Fazer Login"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary)",
          }}
        >
          Carregando...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
