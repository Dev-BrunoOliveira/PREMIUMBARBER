"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Phone,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
  Scissors,
  Plus,
  Trash2,
  Calendar,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import CopyLinkButton from "./CopyLinkButton";

interface BarberDashboardProps {
  barber: any;
  initialAppointments: any[];
  initialServices: any[];
}

export default function BarberDashboardView({
  barber,
  initialAppointments,
  initialServices,
}: BarberDashboardProps) {
  const [appointments, setAppointments] = useState<any[]>(initialAppointments);
  const [services, setServices] = useState<any[]>(initialServices);
  const [activeTab, setActiveTab] = useState<"appointments" | "services">("appointments");

  // Formulário de Novo Serviço
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState("30");
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [loadingService, setLoadingService] = useState(false);

  const slug = barber.slug || barber.id;
  const uniqueLink = `http://localhost:3000/agenda/${slug}`;
  const publicBookingLink = `http://localhost:3000/agendar`;

  // Atualizar Status do Agendamento
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        setAppointments((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
        );
      } else {
        alert("Erro ao atualizar status.");
      }
    } catch (err) {
      alert("Falha na requisição.");
    }
  };

  // Cadastrar Novo Serviço
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice) return;

    setLoadingService(true);
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newServiceName,
          price: newServicePrice,
          duration: newServiceDuration,
          description: newServiceDesc,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setServices((prev) => [...prev, data.service]);
        setNewServiceName("");
        setNewServicePrice("");
        setNewServiceDesc("");
      } else {
        alert(data.error || "Erro ao criar serviço");
      }
    } catch (err) {
      alert("Erro na conexão");
    } finally {
      setLoadingService(false);
    }
  };

  // Deletar Serviço
  const handleDeleteService = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;

    try {
      const res = await fetch(`/api/services?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setServices((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert("Erro ao excluir serviço.");
      }
    } catch (err) {
      alert("Erro na requisição.");
    }
  };

  const pendingCount = appointments.filter((a) => a.status === "PENDING").length;
  const confirmedCount = appointments.filter((a) => a.status === "CONFIRMED").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Cards de Métricas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <div className="card" style={{ padding: "20px" }}>
          <span className="label">Total de Agendamentos</span>
          <h2 style={{ fontSize: "2rem", color: "var(--primary)", marginTop: "4px" }}>
            {appointments.length}
          </h2>
        </div>
        <div className="card" style={{ padding: "20px" }}>
          <span className="label">Aguardando Confirmação</span>
          <h2 style={{ fontSize: "2rem", color: "var(--warning)", marginTop: "4px" }}>
            {pendingCount}
          </h2>
        </div>
        <div className="card" style={{ padding: "20px" }}>
          <span className="label">Confirmados</span>
          <h2 style={{ fontSize: "2rem", color: "var(--success)", marginTop: "4px" }}>
            {confirmedCount}
          </h2>
        </div>
      </div>

      {/* Link de Agendamento do Barbeiro */}
      <div
        className="card animate-fade-in"
        style={{
          background: "linear-gradient(135deg, var(--surface) 0%, rgba(212, 175, 55, 0.08) 100%)",
          border: "1px solid rgba(212, 175, 55, 0.4)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--primary)", marginBottom: "6px" }}>
              <LinkIcon size={20} /> Seu Link de Agendamento Direto
            </h3>
            <p className="label" style={{ textTransform: "none" }}>
              Envie aos seus clientes pelo WhatsApp ou adicione na Bio do seu Instagram!
            </p>
            <code
              style={{
                display: "inline-block",
                marginTop: "12px",
                padding: "10px 16px",
                background: "rgba(0,0,0,0.5)",
                borderRadius: "8px",
                color: "var(--primary)",
                fontSize: "1rem",
                border: "1px solid var(--border)",
              }}
            >
              {uniqueLink}
            </code>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <CopyLinkButton link={uniqueLink} />
            <a
              href={uniqueLink}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              style={{ padding: "10px 16px" }}
            >
              Testar Rota <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
        <button
          className={activeTab === "appointments" ? "btn-primary" : "btn-secondary"}
          onClick={() => setActiveTab("appointments")}
          style={{ padding: "10px 20px" }}
        >
          <Calendar size={18} /> Agendamentos ({appointments.length})
        </button>
        <button
          className={activeTab === "services" ? "btn-primary" : "btn-secondary"}
          onClick={() => setActiveTab("services")}
          style={{ padding: "10px 20px" }}
        >
          <Scissors size={18} /> Gerenciar Serviços & Preços ({services.length})
        </button>
      </div>

      {/* ABA 1: AGENDAMENTOS */}
      {activeTab === "appointments" && (
        <div className="card animate-fade-in">
          <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Users color="var(--primary)" size={22} />
            Lista de Agendamentos Recebidos
          </h3>

          {appointments.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              <p>Nenhum agendamento registrado até o momento.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {appointments.map((app) => {
                const dateStr = new Date(app.date).toLocaleDateString("pt-BR", { timeZone: "UTC" });
                const timeStr = app.time || (new Date(app.date).getUTCHours().toString().padStart(2, "0") + ":00");
                const clientDisplayName = app.clientName || app.client?.name || app.clientEmail || "Cliente";
                const clientPhoneNum = app.clientPhone || app.client?.phone;
                const cleanPhone = clientPhoneNum ? clientPhoneNum.replace(/\D/g, "") : "";

                return (
                  <div
                    key={app.id}
                    style={{
                      padding: "20px",
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <strong style={{ fontSize: "1.2rem", color: "var(--text-main)" }}>
                            {clientDisplayName}
                          </strong>
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
                              : "Pendente"}
                          </span>
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "8px", fontSize: "0.9rem" }}>
                          <span style={{ color: "var(--primary)", fontWeight: "600" }}>
                            📅 {dateStr} às {timeStr}
                          </span>

                          {app.service && (
                            <span style={{ color: "var(--text-muted)", fontWeight: "500" }}>
                              ✂️ {app.service.name} (R$ {app.service.price.toFixed(2).replace(".", ",")})
                            </span>
                          )}

                          {clientPhoneNum && (
                            <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)" }}>
                              <Phone size={14} /> {clientPhoneNum}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Botão de WhatsApp Rápido */}
                      {cleanPhone && (
                        <a
                          href={`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
                            `Olá ${clientDisplayName}, sou o barbeiro ${barber.name} referente ao seu agendamento.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-secondary"
                          style={{ padding: "8px 14px", fontSize: "0.85rem", color: "#25D366", borderColor: "#25D366" }}
                        >
                          <MessageCircle size={16} /> WhatsApp
                        </a>
                      )}
                    </div>

                    {/* Botões de Ação do Barbeiro */}
                    <div style={{ display: "flex", gap: "10px", marginTop: "8px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      {app.status !== "CONFIRMED" && app.status !== "COMPLETED" && (
                        <button
                          className="btn-primary"
                          onClick={() => handleUpdateStatus(app.id, "CONFIRMED")}
                          style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                        >
                          <CheckCircle size={16} /> Confirmar Horário
                        </button>
                      )}

                      {app.status === "CONFIRMED" && (
                        <button
                          className="btn-secondary"
                          onClick={() => handleUpdateStatus(app.id, "COMPLETED")}
                          style={{ padding: "8px 16px", fontSize: "0.85rem", color: "var(--success)" }}
                        >
                          <CheckCircle size={16} /> Marcar como Atendido
                        </button>
                      )}

                      {app.status !== "CANCELED" && (
                        <button
                          className="btn-secondary"
                          onClick={() => handleUpdateStatus(app.id, "CANCELED")}
                          style={{ padding: "8px 16px", fontSize: "0.85rem", color: "var(--error)" }}
                        >
                          <XCircle size={16} /> Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: GERENCIAR SERVIÇOS & PREÇOS */}
      {activeTab === "services" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-fade-in">
          {/* Formulário de Adicionar Serviço */}
          <div className="card">
            <h3 style={{ marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Plus color="var(--primary)" size={20} /> Cadastrar Novo Serviço
            </h3>
            <form onSubmit={handleCreateService} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              <div>
                <label className="label">Nome do Serviço *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ex: Barba Terapia"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">Preço (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  placeholder="35.00"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">Duração (Minutos)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="30"
                  value={newServiceDuration}
                  onChange={(e) => setNewServiceDuration(e.target.value)}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label className="label">Descrição (Opcional)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ex: Inclui toalha quente e balm hidratante"
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                />
              </div>

              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" className="btn-primary" disabled={loadingService}>
                  <Plus size={18} /> {loadingService ? "Salvando..." : "Salvar Serviço"}
                </button>
              </div>
            </form>
          </div>

          {/* Lista de Serviços Cadastrados */}
          <div className="card">
            <h3 style={{ marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Scissors color="var(--primary)" size={20} /> Serviços Oferecidos
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              {services.map((s) => (
                <div
                  key={s.id}
                  style={{
                    padding: "18px",
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <strong style={{ fontSize: "1.1rem" }}>{s.name}</strong>
                      <button
                        onClick={() => handleDeleteService(s.id)}
                        className="icon-btn"
                        style={{ color: "var(--error)" }}
                        title="Deletar serviço"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    {s.description && (
                      <p className="label" style={{ marginTop: "6px", textTransform: "none", fontSize: "0.85rem" }}>
                        {s.description}
                      </p>
                    )}
                  </div>

                  <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px" }}>
                    <span className="label">{s.duration} min</span>
                    <strong style={{ fontSize: "1.2rem", color: "var(--primary)" }}>
                      R$ {s.price.toFixed(2).replace(".", ",")}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
