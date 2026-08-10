"use client";

import React, { useState } from "react";
import { Settings, Save } from "lucide-react";

interface ProfileSettingsTabProps {
  barber: any;
  onSaveProfile: (profileData: { name: string; phone: string; slug: string }) => Promise<void>;
}

export default function ProfileSettingsTab({ barber, onSaveProfile }: ProfileSettingsTabProps) {
  const [barberName, setBarberName] = useState(barber.name || "");
  const [barberPhone, setBarberPhone] = useState(barber.phone || "");
  const [barberSlug, setBarberSlug] = useState(barber.slug || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSaveProfile({
        name: barberName,
        phone: barberPhone,
        slug: barberSlug,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card animate-fade-in">
      <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", fontSize: "1.2rem", fontWeight: "800" }}>
        <Settings color="var(--primary)" size={20} /> Configurações do Perfil e Barbearia
      </h3>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "500px" }}>
        <div>
          <label className="label">Nome Profissional / Nome da Barbearia *</label>
          <input
            type="text"
            className="input-field"
            value={barberName}
            onChange={(e) => setBarberName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">WhatsApp para Receber Notificações de Agendamento *</label>
          <input
            type="tel"
            className="input-field"
            placeholder="(11) 99999-9999"
            value={barberPhone}
            onChange={(e) => setBarberPhone(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Link Personalizado (Slug da Bio do Instagram)</label>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "700" }}>/agenda/</span>
            <input
              type="text"
              className="input-field"
              placeholder="barbeiro-estilo"
              value={barberSlug}
              onChange={(e) => setBarberSlug(e.target.value)}
              style={{ marginTop: 0 }}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "12px" }}>
          <Save size={18} /> {loading ? "Salvando Alterações..." : "Salvar Configurações do Perfil"}
        </button>
      </form>
    </div>
  );
}
