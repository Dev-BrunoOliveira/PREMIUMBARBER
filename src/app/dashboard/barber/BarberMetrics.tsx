"use client";

import React from "react";
import { Calendar, Clock, CheckCircle, DollarSign, AlertCircle } from "lucide-react";

interface BarberMetricsProps {
  appointments: any[];
}

export default function BarberMetrics({ appointments }: BarberMetricsProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  const todayAppointments = appointments.filter((a) => {
    const appDate = new Date(a.date).toISOString().split("T")[0];
    return appDate === todayStr && a.status !== "CANCELED";
  });

  const pendingCount = appointments.filter((a) => a.status === "PENDING").length;
  const confirmedCount = appointments.filter((a) => a.status === "CONFIRMED").length;
  const completedCount = appointments.filter((a) => a.status === "COMPLETED").length;

  const validRevenueAppointments = appointments.filter(
    (a) => a.status === "COMPLETED" || a.status === "CONFIRMED"
  );
  const totalRevenue = validRevenueAppointments.reduce(
    (acc, a) => acc + (a.service?.price || 0),
    0
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "14px" }}>
      {/* Hoje */}
      <div
        className="card hover-card"
        style={{
          padding: "18px 20px",
          background: "var(--surface)",
          borderLeft: "4px solid var(--primary)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="label" style={{ fontSize: "0.78rem" }}>Agendamentos Hoje</span>
          <Calendar size={18} color="var(--primary)" />
        </div>
        <h2 style={{ fontSize: "1.9rem", fontWeight: "800", color: "var(--text-main)", marginTop: "6px" }}>
          {todayAppointments.length}
        </h2>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          {todayAppointments.filter(a => a.status === "CONFIRMED").length} confirmados para hoje
        </span>
      </div>

      {/* Pendentes */}
      <div
        className="card hover-card"
        style={{
          padding: "18px 20px",
          background: "var(--surface)",
          borderLeft: "4px solid var(--warning)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="label" style={{ fontSize: "0.78rem" }}>Aguardando Aprovação</span>
          <AlertCircle size={18} color="var(--warning)" />
        </div>
        <h2 style={{ fontSize: "1.9rem", fontWeight: "800", color: "var(--warning)", marginTop: "6px" }}>
          {pendingCount}
        </h2>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          {pendingCount > 0 ? "Requer sua confirmação" : "Nenhum pendente"}
        </span>
      </div>

      {/* Confirmados & Concluídos */}
      <div
        className="card hover-card"
        style={{
          padding: "18px 20px",
          background: "var(--surface)",
          borderLeft: "4px solid var(--success)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="label" style={{ fontSize: "0.78rem" }}>Confirmados / Concluídos</span>
          <CheckCircle size={18} color="var(--success)" />
        </div>
        <h2 style={{ fontSize: "1.9rem", fontWeight: "800", color: "var(--success)", marginTop: "6px" }}>
          {confirmedCount + completedCount}
        </h2>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          {completedCount} finalizados
        </span>
      </div>

      {/* Faturamento Estimado */}
      <div
        className="card hover-card"
        style={{
          padding: "18px 20px",
          background: "var(--surface)",
          borderLeft: "4px solid var(--primary)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="label" style={{ fontSize: "0.78rem" }}>Faturamento Estimado</span>
          <DollarSign size={18} color="var(--primary)" />
        </div>
        <h2 style={{ fontSize: "1.7rem", fontWeight: "800", color: "var(--primary)", marginTop: "6px" }}>
          R$ {totalRevenue.toFixed(2).replace(".", ",")}
        </h2>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
          Baseado em horários ativos
        </span>
      </div>
    </div>
  );
}
