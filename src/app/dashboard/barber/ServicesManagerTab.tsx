"use client";

import React, { useState } from "react";
import { Scissors, Plus, Trash2 } from "lucide-react";

interface ServicesManagerTabProps {
  services: any[];
  onAddService: (newServiceData: any) => Promise<void>;
  onDeleteService: (id: string) => Promise<void>;
}

export default function ServicesManagerTab({
  services,
  onAddService,
  onDeleteService,
}: ServicesManagerTabProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("30");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    setLoading(true);
    try {
      await onAddService({
        name,
        price: parseFloat(price),
        duration: parseInt(duration, 10) || 30,
        description,
      });

      setName("");
      setPrice("");
      setDuration("30");
      setDescription("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-fade-in">
      {/* Formulário de Novo Serviço */}
      <div className="card">
        <h3 style={{ marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px", fontSize: "1.2rem", fontWeight: "800" }}>
          <Plus color="var(--primary)" size={20} /> Cadastrar Novo Serviço
        </h3>
        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div>
            <label className="label">Nome do Serviço *</label>
            <input
              type="text"
              className="input-field"
              placeholder="Ex: Corte Degradê + Barba"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Preço (R$) *</label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              placeholder="45.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Duração (Minutos)</label>
            <input
              type="number"
              className="input-field"
              placeholder="30"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Descrição do Serviço (Opcional)</label>
            <input
              type="text"
              className="input-field"
              placeholder="Ex: Inclui lavagem especial, toalha quente e balm hidratante"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Plus size={18} /> {loading ? "Salvando..." : "Salvar Serviço no Catálogo"}
            </button>
          </div>
        </form>
      </div>

      {/* Catálogo de Serviços Existentes */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "1.2rem", fontWeight: "800" }}>
            <Scissors color="var(--primary)" size={20} /> Catálogo de Serviços & Tabela de Preços
          </h3>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Total: <strong>{services.length}</strong> serviços ativos
          </span>
        </div>

        {services.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Nenhum serviço cadastrado até o momento. Cadastre seu primeiro serviço acima.
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
            {services.map((s) => (
              <div
                key={s.id}
                style={{
                  padding: "18px",
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <strong style={{ fontSize: "1.1rem", color: "var(--text-main)" }}>{s.name}</strong>
                    <button
                      onClick={() => onDeleteService(s.id)}
                      className="icon-btn"
                      style={{ color: "var(--error)" }}
                      title="Excluir serviço"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  {s.description && (
                    <p style={{ marginTop: "6px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      {s.description}
                    </p>
                  )}
                </div>

                <div
                  style={{
                    marginTop: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                    paddingTop: "12px",
                  }}
                >
                  <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: "600" }}>
                    ⏱️ {s.duration} min
                  </span>
                  <strong style={{ fontSize: "1.2rem", color: "var(--primary)" }}>
                    R$ {Number(s.price).toFixed(2).replace(".", ",")}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
