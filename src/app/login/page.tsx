"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { LogIn, UserPlus } from "lucide-react";
import styles from "./login.module.css";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const initialRole =
    searchParams.get("role") === "BARBER" ? "BARBER" : "CLIENT";
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
        const redirectUrl = role === "BARBER" ? "/dashboard" : "/appointments";
        router.push(redirectUrl);
      }
    } else {
      // Criar Conta passando o Role correto
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, role }),
      });
      const data = await res.json();

      if (res.ok) {
        const redirectUrl = role === "BARBER" ? "/dashboard" : "/appointments";
        await signIn("credentials", { email, password, redirect: false });
        router.push(redirectUrl);
      } else {
        alert(data.error || "Erro ao criar conta");
      }
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div
        className={`card animate-fade-in ${styles.loginCard}`}
        style={{ paddingTop: "32px" }}
      >
        {/* BOTOES DE SELECAO DE PERFIL */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "32px",
            backgroundColor: "var(--background)",
            padding: "6px",
            borderRadius: "12px",
            border: "1px solid var(--border)",
          }}
        >
          <button
            type="button"
            onClick={() => setRole("CLIENT")}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "8px",
              fontWeight: "700",
              transition: "all 0.2s",
              backgroundColor:
                role === "CLIENT" ? "var(--primary)" : "transparent",
              color: role === "CLIENT" ? "#000" : "var(--text-muted)",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Sou Cliente
          </button>
          <button
            type="button"
            onClick={() => setRole("BARBER")}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "8px",
              fontWeight: "700",
              transition: "all 0.2s",
              backgroundColor:
                role === "BARBER" ? "var(--primary)" : "transparent",
              color: role === "BARBER" ? "#000" : "var(--text-muted)",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Sou Profissional
          </button>
        </div>

        <div className={styles.header} style={{ marginBottom: "24px" }}>
          <div className={styles.logo}>
            <h1>
              Premium<span>Barber</span>
            </h1>
          </div>
          <p className="label">
            {isLogin
              ? "Faça login para continuar"
              : "Crie sua conta para começar"}
          </p>
        </div>

        <div className={styles.actions}>
          <button
            className="btn-secondary"
            style={{ width: "100%" }}
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            type="button"
          >
            {isLogin ? "Entrar com Google" : "Criar conta com Google"}
          </button>

          <div className={styles.divider}>
            <span>ou com E-mail</span>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="animate-fade-in">
                  <label className="label">Nome Completo</label>
                  <input
                    name="name"
                    type="text"
                    className="input-field"
                    placeholder={
                      isBarber ? "Nome do Profissional" : "Seu nome completo"
                    }
                    required={!isLogin}
                  />
                </div>
                <div className="animate-fade-in">
                  <label className="label">Número do WhatsApp</label>
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
              style={{
                width: "100%",
                marginTop: "16px",
                backgroundColor:
                  isBarber && !isLogin ? "#fff" : "var(--primary)",
              }}
              disabled={loading}
            >
              {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
              {loading ? "Aguarde..." : isLogin ? "Fazer Login" : "Criar Conta"}
            </button>
          </form>

          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Ainda não tem conta? Criar Conta"
                : "Já tem conta? Fazer Login"}
            </button>
          </div>
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
