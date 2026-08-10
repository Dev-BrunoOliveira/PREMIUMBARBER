"use client";

import React, { useState, useEffect } from "react";
import { Clock, Lock, Unlock, Plus } from "lucide-react";
import { format } from "date-fns";

interface ScheduleManagerTabProps {
  barberId: string;
}

const defaultTimeList = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

export default function ScheduleManagerTab({ barberId }: ScheduleManagerTabProps) {
  const [selectedDateStr, setSelectedDateStr] = useState(format(new Date(), "yyyy-MM-dd"));
  const [configuredTimes, setConfiguredTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [newTimeInput, setNewTimeInput] = useState("");

  // Buscar Horários configurados para a data selecionada
  useEffect(() => {
    setLoadingTimes(true);
    fetch(`/api/appointments/available?date=${selectedDateStr}&barberId=${barberId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.configuredTimes) setConfiguredTimes(data.configuredTimes);
      })
      .catch(() => {})
      .finally(() => setLoadingTimes(false));
  }, [selectedDateStr, barberId]);

  // Alternar Horário (Bloquear / Desbloquear)
  const handleToggleTime = async (time: string, isConfigured: boolean) => {
    const action = isConfigured ? "REMOVE" : "ADD";
    try {
      const res = await fetch("/api/appointments/available/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDateStr, time, action }),
      });

      if (res.ok) {
        if (isConfigured) {
          setConfiguredTimes((prev) => prev.filter((t) => t !== time));
        } else {
          setConfiguredTimes((prev) => [...prev, time].sort());
        }
      }
    } catch (err) {
      alert("Erro ao alterar disponibilidade do horário.");
    }
  };

  // Adicionar novo horário personalizado
  const handleAddCustomTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTimeInput.trim()) return;

    await handleToggleTime(newTimeInput.trim(), false);
    setNewTimeInput("");
  };

  return (
    <div className="card animate-fade-in">
      <h3 style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "1.2rem", fontWeight: "800" }}>
        <Clock color="var(--primary)" size={20} /> Gerenciador de Horários Operacionais
      </h3>
      <p style={{ textTransform: "none", fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "24px" }}>
        Selecione uma data para abrir ou bloquear horários de atendimento aos clientes.
      </p>

      {/* Seleção de Data */}
      <div style={{ marginBottom: "24px", maxWidth: "320px" }}>
        <label className="label">Data de Atendimento:</label>
        <input
          type="date"
          className="input-field"
          value={selectedDateStr}
          onChange={(e) => setSelectedDateStr(e.target.value)}
        />
      </div>

      {/* Grade de Horários */}
      <div style={{ marginBottom: "28px" }}>
        <p style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase" }}>
          Horários disponíveis para {selectedDateStr}:
        </p>

        {loadingTimes ? (
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Carregando grade de horários...</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "10px" }}>
            {defaultTimeList.map((time) => {
              const isConfigured = configuredTimes.includes(time);
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleToggleTime(time, isConfigured)}
                  style={{
                    padding: "12px 8px",
                    borderRadius: "10px",
                    border: `1.5px solid ${isConfigured ? "var(--primary)" : "var(--border)"}`,
                    backgroundColor: isConfigured ? "rgba(157, 78, 223, 0.15)" : "var(--background)",
                    color: isConfigured ? "var(--primary)" : "var(--text-muted)",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                  }}
                >
                  {isConfigured ? <Unlock size={14} /> : <Lock size={14} />}
                  {time}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Form de Horário Customizado */}
      <form onSubmit={handleAddCustomTime} style={{ display: "flex", gap: "12px", alignItems: "flex-end", maxWidth: "420px" }}>
        <div style={{ flex: 1 }}>
          <label className="label">Adicionar Horário Específico (ex: 20:30)</label>
          <input
            type="text"
            className="input-field"
            placeholder="20:30"
            value={newTimeInput}
            onChange={(e) => setNewTimeInput(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-secondary" style={{ padding: "14px 20px" }}>
          <Plus size={18} /> Adicionar
        </button>
      </form>
    </div>
  );
}
