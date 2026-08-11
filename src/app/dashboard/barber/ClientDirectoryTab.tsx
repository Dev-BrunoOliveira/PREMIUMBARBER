"use client";

import React, { useState, useMemo } from "react";
import { Users, Search, Phone, Mail, Calendar, MessageCircle, DollarSign, Award, Scissors } from "lucide-react";
import { format } from "date-fns";

interface ClientDirectoryTabProps {
  barberName: string;
  appointments: any[];
}

interface ConsolidatedClient {
  key: string;
  name: string;
  phone: string;
  email: string;
  totalVisits: number;
  completedVisits: number;
  totalSpent: number;
  lastVisit: Date;
  servicesCount: Record<string, number>;
}

export default function ClientDirectoryTab({ barberName, appointments }: ClientDirectoryTabProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Consolidação dos Clientes Únicos
  const clientsList = useMemo(() => {
    const map = new Map<string, ConsolidatedClient>();

    appointments.forEach((app) => {
      const name = app.clientName || app.client?.name || app.clientEmail || "Cliente";
      const phone = app.clientPhone || app.client?.phone || "";
      const email = app.clientEmail || app.client?.email || "";

      // Chave única do cliente baseada em Telefone ou E-mail ou Nome
      const key = phone.replace(/\D/g, "") || email.toLowerCase() || name.toLowerCase();
      if (!key) return;

      const appDate = new Date(app.date);
      const isCompletedOrConfirmed = app.status === "COMPLETED" || app.status === "CONFIRMED";
      const price = isCompletedOrConfirmed ? app.service?.price || 0 : 0;
      const serviceName = app.service?.name || "Serviço Geral";

      if (!map.has(key)) {
        map.set(key, {
          key,
          name,
          phone,
          email,
          totalVisits: 1,
          completedVisits: isCompletedOrConfirmed ? 1 : 0,
          totalSpent: price,
          lastVisit: appDate,
          servicesCount: serviceName ? { [serviceName]: 1 } : {},
        });
      } else {
        const existing = map.get(key)!;
        existing.totalVisits += 1;
        if (isCompletedOrConfirmed) existing.completedVisits += 1;
        existing.totalSpent += price;
        if (appDate > existing.lastVisit) {
          existing.lastVisit = appDate;
        }

        if (serviceName) {
          existing.servicesCount[serviceName] = (existing.servicesCount[serviceName] || 0) + 1;
        }
      }
    });

    // Converter para array e ordenar por data da última visita
    return Array.from(map.values()).sort((a, b) => b.lastVisit.getTime() - a.lastVisit.getTime());
  }, [appointments]);

  // Filtrar lista de clientes pela busca
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clientsList;
    const term = searchTerm.toLowerCase();
    return clientsList.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term)
    );
  }, [clientsList, searchTerm]);

  // Gerar mensagem de retorno do cliente para WhatsApp
  const getReturnMessageUrl = (client: ConsolidatedClient) => {
    const cleanPhone = client.phone.replace(/\D/g, "");
    if (!cleanPhone) return "#";

    const lastDateStr = format(client.lastVisit, "dd/MM/yyyy");
    const msg = `Fala *${client.name}*! Tudo certo? Sou o barbeiro *${barberName}*. Vi aqui que sua última visita foi no dia *${lastDateStr}*. Que tal garantir o seu próximo corte para manter o estilo em dia? ✂️`;

    return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="card animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Cabeçalho */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.3rem", fontWeight: "800" }}>
            <Award color="var(--primary)" size={22} /> Carteira de Clientes (CRM)
          </h3>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Histórico consolidado dos seus clientes, frequência de cortes e faturamento gerado.
          </p>
        </div>

        <span
          style={{
            fontSize: "0.85rem",
            color: "var(--primary)",
            backgroundColor: "rgba(157, 78, 223, 0.15)",
            padding: "6px 14px",
            borderRadius: "20px",
            border: "1px solid var(--primary)",
            fontWeight: "700",
          }}
        >
          {clientsList.length} Clientes Únicos Cadastrados
        </span>
      </div>

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
          placeholder="Buscar cliente por nome ou WhatsApp..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: "42px", marginTop: 0 }}
        />
      </div>

      {/* Grid de Clientes */}
      {filteredClients.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          <Users size={36} style={{ opacity: 0.5, marginBottom: "8px" }} />
          <p>Nenhum cliente encontrado na sua carteira.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "16px" }}>
          {filteredClients.map((client) => {
            const cleanPhone = client.phone.replace(/\D/g, "");
            const isFrequent = client.completedVisits >= 3;
            const mostPopularService = Object.entries(client.servicesCount).sort((a, b) => b[1] - a[1])[0]?.[0];

            return (
              <div
                key={client.key}
                style={{
                  padding: "18px",
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "14px",
                }}
              >
                <div>
                  {/* Nome e Badge de Fidelidade */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                    <div>
                      <strong style={{ fontSize: "1.1rem", color: "var(--text-main)" }}>
                        {client.name}
                      </strong>
                      {client.phone && (
                        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                          <Phone size={13} /> {client.phone}
                        </p>
                      )}
                    </div>

                    {isFrequent ? (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          backgroundColor: "rgba(16, 185, 129, 0.15)",
                          color: "var(--success)",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                          padding: "3px 8px",
                          borderRadius: "12px",
                          fontWeight: "800",
                        }}
                      >
                        ⭐ VIP / Frequente
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          backgroundColor: "rgba(157, 78, 223, 0.15)",
                          color: "var(--primary)",
                          border: "1px solid var(--primary)",
                          padding: "3px 8px",
                          borderRadius: "12px",
                          fontWeight: "700",
                        }}
                      >
                        Cliente
                      </span>
                    )}
                  </div>

                  {/* Resumo de Métricas do Cliente */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                      marginTop: "14px",
                      background: "var(--surface)",
                      padding: "10px 12px",
                      borderRadius: "8px",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Visitas</span>
                      <p style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--text-main)" }}>
                        {client.completedVisits} cortes
                      </p>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Investido</span>
                      <p style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--primary)" }}>
                        R$ {client.totalSpent.toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  </div>

                  {/* Última Visita e Serviço Favorito */}
                  <div style={{ marginTop: "10px", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "3px" }}>
                    <span>
                      📅 Última visita: <strong>{format(client.lastVisit, "dd/MM/yyyy")}</strong>
                    </span>
                    {mostPopularService && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Scissors size={12} color="var(--primary)" /> Serviço habitual: <strong>{mostPopularService}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Botão de Retorno de Cliente no WhatsApp */}
                {cleanPhone && (
                  <a
                    href={getReturnMessageUrl(client)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    style={{
                      padding: "8px 12px",
                      fontSize: "0.82rem",
                      color: "#25D366",
                      borderColor: "rgba(37, 211, 102, 0.4)",
                      textAlign: "center",
                      width: "100%",
                      justifyContent: "center",
                    }}
                  >
                    <MessageCircle size={15} /> Chamar para Novo Agendamento
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
