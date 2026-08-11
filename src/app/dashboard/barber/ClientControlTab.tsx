"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Calendar,
  Filter,
  CheckCircle,
  XCircle,
  MessageCircle,
  Phone,
  Clock,
  Scissors,
  ChevronDown,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { format, isSameDay, addDays, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClientControlTabProps {
  barberName: string;
  appointments: any[];
  onUpdateStatus: (id: string, newStatus: string) => Promise<void>;
}

type DateFilterType = "TODAY" | "TOMORROW" | "WEEK" | "ALL" | "CUSTOM";
type StatusFilterType = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED";

export default function ClientControlTab({
  barberName,
  appointments,
  onUpdateStatus,
}: ClientControlTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilterType>("TODAY");
  const [customDate, setCustomDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [openMsgMenuId, setOpenMsgMenuId] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => addDays(today, 1), [today]);

  // Filtragem Otimizada em Memória
  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      const appDate = new Date(app.date);

      // 1. Filtro por Data
      if (dateFilter === "TODAY") {
        if (!isSameDay(appDate, today)) return false;
      } else if (dateFilter === "TOMORROW") {
        if (!isSameDay(appDate, tomorrow)) return false;
      } else if (dateFilter === "WEEK") {
        const weekEnd = addDays(startOfDay(today), 7);
        if (!isWithinInterval(appDate, { start: startOfDay(today), end: endOfDay(weekEnd) })) {
          return false;
        }
      } else if (dateFilter === "CUSTOM") {
        const customDateObj = new Date(`${customDate}T00:00:00`);
        if (!isSameDay(appDate, customDateObj)) return false;
      }

      // 2. Filtro por Status
      if (statusFilter !== "ALL" && app.status !== statusFilter) {
        return false;
      }

      // 3. Filtro por Busca (Nome do Cliente, Telefone ou Serviço)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const clientName = (app.clientName || app.client?.name || "").toLowerCase();
        const clientPhone = (app.clientPhone || app.client?.phone || "").toLowerCase();
        const serviceName = (app.service?.name || "").toLowerCase();

        return clientName.includes(term) || clientPhone.includes(term) || serviceName.includes(term);
      }

      return true;
    });
  }, [appointments, dateFilter, customDate, statusFilter, searchTerm, today, tomorrow]);

  const handleStatusClick = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await onUpdateStatus(id, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  // Gerador de links para Mensagens Rápidas via WhatsApp
  const getWhatsAppMessageUrl = (app: any, type: "REMINDER" | "CONFIRMATION" | "THANKS" | "DIRECT") => {
    const clientDisplayName = app.clientName || app.client?.name || "Cliente";
    const rawPhone = app.clientPhone || app.client?.phone || "";
    const cleanPhone = rawPhone.replace(/\D/g, "");

    if (!cleanPhone) return "#";

    const dateStr = format(new Date(app.date), "dd/MM/yyyy");
    const timeStr = app.time || format(new Date(app.date), "HH:mm");
    const serviceName = app.service?.name || "Atendimento";

    let messageText = "";

    switch (type) {
      case "REMINDER":
        messageText = `Olá *${clientDisplayName}*! Passando pra lembrar do seu horário de *${serviceName}* comigo (*${barberName}*) marcado para *hoje às ${timeStr}*. Nos vemos em breve! ✂️`;
        break;
      case "CONFIRMATION":
        messageText = `Olá *${clientDisplayName}*! Seu agendamento para *${serviceName}* no dia *${dateStr} às ${timeStr}* foi *CONFIRMADO* com sucesso! Até lá! 👍✂️`;
        break;
      case "THANKS":
        messageText = `Fala *${clientDisplayName}*! Obrigado pela preferência hoje! Foi um prazer te atender. Qualquer coisa estou à disposição! ✂️⚡`;
        break;
      case "DIRECT":
      default:
        messageText = `Olá *${clientDisplayName}*, sou o barbeiro *${barberName}* referente ao seu agendamento no dia *${dateStr} às ${timeStr}*.`;
        break;
    }

    return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(messageText)}`;
  };

  return (
    <div className="card animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Cabeçalho da Central de Controle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.3rem", fontWeight: "800" }}>
            <Users color="var(--primary)" size={22} /> Central de Controle de Clientes
          </h3>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Gerencie os agendamentos, confirme presenças e entre em contato rápido via WhatsApp.
          </p>
        </div>

        <span
          style={{
            fontSize: "0.85rem",
            color: "var(--text-muted)",
            backgroundColor: "rgba(0,0,0,0.3)",
            padding: "6px 14px",
            borderRadius: "20px",
            border: "1px solid var(--border)",
          }}
        >
          Exibindo <strong>{filteredAppointments.length}</strong> de {appointments.length} agendamentos
        </span>
      </div>

      {/* BARRA DE FILTROS E BUSCA */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          background: "var(--background)",
          padding: "16px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Input de Busca */}
        <div style={{ position: "relative" }}>
          <Search
            size={18}
            color="var(--text-muted)"
            style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            className="input-field"
            placeholder="Buscar por nome do cliente, WhatsApp ou serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: "42px", marginTop: 0 }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
                fontSize: "0.85rem",
              }}
            >
              Limpar
            </button>
          )}
        </div>

        {/* Filtros por Data */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", marginRight: "4px" }}>
            DATA:
          </span>

          <button
            onClick={() => setDateFilter("TODAY")}
            style={{
              padding: "6px 14px",
              borderRadius: "16px",
              fontSize: "0.82rem",
              fontWeight: "700",
              border: `1px solid ${dateFilter === "TODAY" ? "var(--primary)" : "var(--border)"}`,
              backgroundColor: dateFilter === "TODAY" ? "rgba(157, 78, 223, 0.2)" : "transparent",
              color: dateFilter === "TODAY" ? "var(--primary)" : "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            Hoje
          </button>

          <button
            onClick={() => setDateFilter("TOMORROW")}
            style={{
              padding: "6px 14px",
              borderRadius: "16px",
              fontSize: "0.82rem",
              fontWeight: "700",
              border: `1px solid ${dateFilter === "TOMORROW" ? "var(--primary)" : "var(--border)"}`,
              backgroundColor: dateFilter === "TOMORROW" ? "rgba(157, 78, 223, 0.2)" : "transparent",
              color: dateFilter === "TOMORROW" ? "var(--primary)" : "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            Amanhã
          </button>

          <button
            onClick={() => setDateFilter("WEEK")}
            style={{
              padding: "6px 14px",
              borderRadius: "16px",
              fontSize: "0.82rem",
              fontWeight: "700",
              border: `1px solid ${dateFilter === "WEEK" ? "var(--primary)" : "var(--border)"}`,
              backgroundColor: dateFilter === "WEEK" ? "rgba(157, 78, 223, 0.2)" : "transparent",
              color: dateFilter === "WEEK" ? "var(--primary)" : "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            Próximos 7 Dias
          </button>

          <button
            onClick={() => setDateFilter("ALL")}
            style={{
              padding: "6px 14px",
              borderRadius: "16px",
              fontSize: "0.82rem",
              fontWeight: "700",
              border: `1px solid ${dateFilter === "ALL" ? "var(--primary)" : "var(--border)"}`,
              backgroundColor: dateFilter === "ALL" ? "rgba(157, 78, 223, 0.2)" : "transparent",
              color: dateFilter === "ALL" ? "var(--primary)" : "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            Todas as Datas
          </button>

          {/* Date Picker Customizado */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginLeft: "auto" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Outra data:</span>
            <input
              type="date"
              className="input-field"
              value={customDate}
              onChange={(e) => {
                setCustomDate(e.target.value);
                setDateFilter("CUSTOM");
              }}
              style={{ padding: "4px 8px", fontSize: "0.82rem", width: "auto", marginTop: 0 }}
            />
          </div>
        </div>

        {/* Filtros por Status */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", marginRight: "4px" }}>
            STATUS:
          </span>

          {(["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELED"] as StatusFilterType[]).map((st) => {
            const labels: Record<StatusFilterType, string> = {
              ALL: "Todos",
              PENDING: "Pendentes",
              CONFIRMED: "Confirmados",
              COMPLETED: "Concluídos",
              CANCELED: "Cancelados",
            };

            const isSelected = statusFilter === st;

            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "14px",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  border: `1px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
                  backgroundColor: isSelected ? "var(--surface-hover)" : "transparent",
                  color: isSelected ? "var(--text-main)" : "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                {labels[st]}
              </button>
            );
          })}
        </div>
      </div>

      {/* LISTA DE CARDS DE CLIENTES / AGENDAMENTOS */}
      {filteredAppointments.length === 0 ? (
        <div
          style={{
            padding: "48px 20px",
            textAlign: "center",
            background: "var(--background)",
            borderRadius: "var(--radius-md)",
            border: "1px dashed var(--border)",
          }}
        >
          <Calendar size={40} color="var(--text-muted)" style={{ opacity: 0.5, marginBottom: "12px" }} />
          <h4 style={{ fontSize: "1.1rem", color: "var(--text-main)", marginBottom: "6px" }}>
            Nenhum agendamento encontrado
          </h4>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", maxWidth: "400px", margin: "0 auto" }}>
            Não há registros para os filtros selecionados. Tente alterar a data ou limpar os termos de busca.
          </p>
          {(searchTerm || dateFilter !== "TODAY" || statusFilter !== "ALL") && (
            <button
              className="btn-secondary"
              onClick={() => {
                setSearchTerm("");
                setDateFilter("TODAY");
                setStatusFilter("ALL");
              }}
              style={{ marginTop: "16px", padding: "8px 16px", fontSize: "0.85rem" }}
            >
              Resetar Filtros
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filteredAppointments.map((app) => {
            const appDateObj = new Date(app.date);
            const dateStr = format(appDateObj, "dd/MM/yyyy (''EEEE'')", { locale: ptBR });
            const timeStr = app.time || format(appDateObj, "HH:mm");
            const clientDisplayName = app.clientName || app.client?.name || app.clientEmail || "Cliente Sem Nome";
            const clientPhoneNum = app.clientPhone || app.client?.phone;
            const cleanPhone = clientPhoneNum ? clientPhoneNum.replace(/\D/g, "") : "";
            const isUpdating = updatingId === app.id;
            const isToday = isSameDay(appDateObj, today);

            return (
              <div
                key={app.id}
                style={{
                  padding: "18px 20px",
                  backgroundColor: "var(--background)",
                  border: `1.5px solid ${
                    isToday ? "rgba(157, 78, 223, 0.4)" : "var(--border)"
                  }`,
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  transition: "all 0.2s ease",
                  boxShadow: isToday ? "0 4px 16px rgba(157, 78, 223, 0.08)" : "none",
                }}
              >
                {/* Linha Superior: Nome do Cliente + Status */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <strong style={{ fontSize: "1.15rem", color: "var(--text-main)" }}>
                        {clientDisplayName}
                      </strong>

                      {isToday && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            backgroundColor: "var(--primary)",
                            color: "#fff",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            fontWeight: "800",
                          }}
                        >
                          HOJE
                        </span>
                      )}

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

                    {/* Detalhes do Horário e Serviço */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "16px",
                        marginTop: "8px",
                        fontSize: "0.88rem",
                      }}
                    >
                      <span style={{ color: "var(--primary)", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={14} /> {timeStr} hs ({dateStr})
                      </span>

                      {app.service && (
                        <span style={{ color: "var(--text-muted)", fontWeight: "500", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Scissors size={14} /> {app.service.name} —{" "}
                          <strong style={{ color: "var(--text-main)" }}>
                            R$ {app.service.price.toFixed(2).replace(".", ",")}
                          </strong>
                        </span>
                      )}

                      {clientPhoneNum && (
                        <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)" }}>
                          <Phone size={14} /> {clientPhoneNum}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Menu Rápido de Mensagens no WhatsApp */}
                  {cleanPhone && (
                    <div style={{ position: "relative" }}>
                      <button
                        onClick={() => setOpenMsgMenuId(openMsgMenuId === app.id ? null : app.id)}
                        className="btn-secondary"
                        style={{
                          padding: "8px 14px",
                          fontSize: "0.82rem",
                          color: "#25D366",
                          borderColor: "rgba(37, 211, 102, 0.4)",
                          backgroundColor: "rgba(37, 211, 102, 0.08)",
                        }}
                      >
                        <MessageCircle size={15} /> WhatsApp <ChevronDown size={14} />
                      </button>

                      {/* Dropdown de Templates do Zap */}
                      {openMsgMenuId === app.id && (
                        <div
                          style={{
                            position: "absolute",
                            right: 0,
                            top: "110%",
                            zIndex: 20,
                            width: "240px",
                            backgroundColor: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-md)",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                            padding: "8px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                          }}
                        >
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", padding: "4px 8px", fontWeight: "700" }}>
                            ENVIAR MENSAGEM RÁPIDA:
                          </span>

                          <a
                            href={getWhatsAppMessageUrl(app, "CONFIRMATION")}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => setOpenMsgMenuId(null)}
                            style={{
                              padding: "8px",
                              fontSize: "0.82rem",
                              borderRadius: "6px",
                              color: "var(--text-main)",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                            className="btn-secondary"
                          >
                            <CheckCircle size={14} color="var(--primary)" /> Confirmar Horário
                          </a>

                          <a
                            href={getWhatsAppMessageUrl(app, "REMINDER")}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => setOpenMsgMenuId(null)}
                            style={{
                              padding: "8px",
                              fontSize: "0.82rem",
                              borderRadius: "6px",
                              color: "var(--text-main)",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                            className="btn-secondary"
                          >
                            <Clock size={14} color="var(--warning)" /> Enviar Lembrete
                          </a>

                          <a
                            href={getWhatsAppMessageUrl(app, "THANKS")}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => setOpenMsgMenuId(null)}
                            style={{
                              padding: "8px",
                              fontSize: "0.82rem",
                              borderRadius: "6px",
                              color: "var(--text-main)",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                            className="btn-secondary"
                          >
                            <Sparkles size={14} color="var(--success)" /> Agradecer Atendimento
                          </a>

                          <a
                            href={getWhatsAppMessageUrl(app, "DIRECT")}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => setOpenMsgMenuId(null)}
                            style={{
                              padding: "8px",
                              fontSize: "0.82rem",
                              borderRadius: "6px",
                              color: "var(--text-muted)",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                            className="btn-secondary"
                          >
                            <MessageCircle size={14} /> Abrir Conversa Livre
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Barra Inferior de Ações Operacionais */}
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    paddingTop: "12px",
                    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  {app.status !== "CONFIRMED" && app.status !== "COMPLETED" && (
                    <button
                      className="btn-primary"
                      disabled={isUpdating}
                      onClick={() => handleStatusClick(app.id, "CONFIRMED")}
                      style={{ padding: "7px 16px", fontSize: "0.82rem" }}
                    >
                      {isUpdating ? <RefreshCw size={14} className="spin" /> : <CheckCircle size={15} />}
                      Confirmar Horário
                    </button>
                  )}

                  {app.status === "CONFIRMED" && (
                    <button
                      className="btn-secondary"
                      disabled={isUpdating}
                      onClick={() => handleStatusClick(app.id, "COMPLETED")}
                      style={{ padding: "7px 16px", fontSize: "0.82rem", color: "var(--success)", borderColor: "rgba(16, 185, 129, 0.4)" }}
                    >
                      {isUpdating ? <RefreshCw size={14} className="spin" /> : <CheckCircle size={15} />}
                      Finalizar Atendimento
                    </button>
                  )}

                  {app.status !== "CANCELED" && app.status !== "COMPLETED" && (
                    <button
                      className="btn-secondary"
                      disabled={isUpdating}
                      onClick={() => handleStatusClick(app.id, "CANCELED")}
                      style={{ padding: "7px 14px", fontSize: "0.82rem", color: "var(--error)" }}
                    >
                      <XCircle size={15} /> Cancelar Horário
                    </button>
                  )}

                  {app.status === "CANCELED" && (
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                      Agendamento cancelado.
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
