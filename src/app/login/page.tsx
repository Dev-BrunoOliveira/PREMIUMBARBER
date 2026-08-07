"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { LogIn, UserPlus, Calendar, ShieldCheck } from "lucide-react";
import styles from "./login.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const initialRole = searchParams.get("role") === "BARBER" ? "BARBER" : "CLIENT";
  const [role, setRole] = useState<"CLIENT" | "BARBER">(initialRole);

  const isBarber = role === "BARBER";

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
        alert("E-mail ou senha incorretos");
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
        alert(data.error || "Erro ao criar conta");
      }
    }
    setLoading(false);
  };

  const handleDemoBarber = async () => {
    setLoading(true);
    const res = await signIn("credentials", {
      email: "barber@premium.com",
      password: "123456",
      redirect: false,
    });
    if (!res?.error) {
      router.push("/dashboard");
    } else {
      alert("Erro ao logar como barbeiro demo");
    }
    setLoading(false);
  };

  return (
    <div className={styles.container} style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div
        className={`card animate-fade-in ${styles.loginCard}`}
        style={{ width: "100%", maxWidth: "460px", padding: "32px 24px" }}
      >
        {/* Banner de Rota do Cliente */}
        <div style={{ backgroundColor: "rgba(212, 175, 55, 0.08)", border: "1px solid var(--primary)", borderRadius: "12px", padding: "12px", marginBottom: "24px", textAlign: "center" }}>
          <p className="label" style={{ color: "var(--primary)", marginBottom: "8px" }}>É um Cliente querendo agendar?</p>
          <Link href="/agendar" className="btn-primary" style={{ width: "100%", padding: "10px 16px", fontSize: "0.9rem" }}>
            <Calendar size={18} /> Ir para Agendamento Direto
          </Link>
        </div>

        {/* Seleção de Perfil */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            marginBottom: "24px",
            backgroundColor: "var(--background)",
            padding: "4px",
            borderRadius: "10px",
            border: "1px solid var(--border)",
          }}
        >
          <button
            type="button"
            onClick={() => setRole("CLIENT")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "0.9rem",
              backgroundColor: role === "CLIENT" ? "var(--primary)" : "transparent",
              color: role === "CLIENT" ? "#000" : "var(--text-muted)",
              transition: "all 0.2s",
            }}
          >
            Cliente
          </button>
          <button
            type="button"
            onClick={() => setRole("BARBER")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "0.9rem",
              backgroundColor: role === "BARBER" ? "var(--primary)" : "transparent",
              color: role === "BARBER" ? "#000" : "var(--text-muted)",
              transition: "all 0.2s",
            }}
          >
            Barbeiro / Admin
          </button>
        </div>

        <div className={styles.header} style={{ marginBottom: "20px", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800" }}>
            Premium<span style={{ color: "var(--primary)" }}>Barber</span>
          </h1>
          <p className="label" style={{ textTransform: "none", marginTop: "4px" }}>
            {isLogin ? "Acesse seu painel com e-mail e senha" : "Crie sua conta profissional"}
          </p>
        </div>

        {/* Botão de Atalho Barbeiro Demo */}
        {role === "BARBER" && isLogin && (
          <div style={{ marginBottom: "20px" }}>
            <button
              type="button"
              onClick={handleDemoBarber}
              className="btn-secondary"
              style={{ width: "100%", borderColor: "var(--primary)", color: "var(--primary)" }}
            >
              <ShieldCheck size={18} /> Entrar como Barbeiro Demo
            </button>
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {!isLogin && (
            <>
              <div>
                <label className="label">Nome Completo</label>
                <input
                  name="name"
                  type="text"
                  className="input-field"
                  placeholder={isBarber ? "Nome do Barbeiro" : "Seu nome"}
                  required={!isLogin}
                />
              </div>
              <div>
                <label className="label">WhatsApp</label>
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
            <label className="label">E-mail</label>
            <input
              name="email"
              type="email"
              className="input-field"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div>
            <label className="label">Senha</label>
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
            style={{ width: "100%", marginTop: "12px" }}
            disabled={loading}
          >
            {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
            {loading ? "Aguarde..." : isLogin ? "Entrar no Painel" : "Criar Conta"}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setIsLogin(!isLogin)}
            style={{ color: "var(--text-muted)", fontSize: "0.9rem", textDecoration: "underline" }}
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
