"use client";

import React, { useState } from "react";
import { Users, Calendar, Scissors, Clock, Settings, Award } from "lucide-react";
import BioLinkBanner from "./barber/BioLinkBanner";
import BarberMetrics from "./barber/BarberMetrics";
import ClientControlTab from "./barber/ClientControlTab";
import ClientDirectoryTab from "./barber/ClientDirectoryTab";
import ServicesManagerTab from "./barber/ServicesManagerTab";
import ScheduleManagerTab from "./barber/ScheduleManagerTab";
import ProfileSettingsTab from "./barber/ProfileSettingsTab";

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
  const [activeTab, setActiveTab] = useState<
    "client-control" | "client-directory" | "services" | "hours" | "profile"
  >("client-control");

  const slug = barber.slug || barber.id;

  // Handler: Atualizar Status de Agendamento
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
        alert("Erro ao atualizar o status do agendamento.");
      }
    } catch (err) {
      alert("Falha na requisição. Verifique sua conexão.");
    }
  };

  // Handler: Criar Serviço
  const handleCreateService = async (serviceData: any) => {
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceData),
      });

      const data = await res.json();
      if (res.ok) {
        setServices((prev) => [...prev, data.service]);
      } else {
        alert(data.error || "Erro ao criar serviço.");
      }
    } catch (err) {
      alert("Erro na conexão ao cadastrar serviço.");
    }
  };

  // Handler: Deletar Serviço
  const handleDeleteService = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este serviço do seu catálogo?")) return;

    try {
      const res = await fetch(`/api/services?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setServices((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert("Erro ao excluir serviço.");
      }
    } catch (err) {
      alert("Erro na requisição ao excluir serviço.");
    }
  };

  // Handler: Salvar Perfil
  const handleSaveProfile = async (profileData: { name: string; phone: string; slug: string }) => {
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Perfil atualizado com sucesso!");
      } else {
        alert(data.error || "Erro ao atualizar perfil.");
      }
    } catch (err) {
      alert("Erro de conexão ao salvar perfil.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Widget do Link da Bio (Instagram) */}
      <BioLinkBanner slug={slug} />

      {/* Cards de KPIs e Métricas do Barbeiro */}
      <BarberMetrics appointments={appointments} />

      {/* Navegação Principal do Painel */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--border)", paddingBottom: "12px", flexWrap: "wrap" }}>
        <button
          className={activeTab === "client-control" ? "btn-primary" : "btn-secondary"}
          onClick={() => setActiveTab("client-control")}
          style={{ padding: "10px 18px", fontSize: "0.9rem" }}
        >
          <Calendar size={16} /> Controle de Agendamentos ({appointments.length})
        </button>

        <button
          className={activeTab === "client-directory" ? "btn-primary" : "btn-secondary"}
          onClick={() => setActiveTab("client-directory")}
          style={{ padding: "10px 18px", fontSize: "0.9rem" }}
        >
          <Award size={16} /> Carteira de Clientes (CRM)
        </button>

        <button
          className={activeTab === "services" ? "btn-primary" : "btn-secondary"}
          onClick={() => setActiveTab("services")}
          style={{ padding: "10px 18px", fontSize: "0.9rem" }}
        >
          <Scissors size={16} /> Serviços & Preços ({services.length})
        </button>

        <button
          className={activeTab === "hours" ? "btn-primary" : "btn-secondary"}
          onClick={() => setActiveTab("hours")}
          style={{ padding: "10px 18px", fontSize: "0.9rem" }}
        >
          <Clock size={16} /> Horários Operacionais
        </button>

        <button
          className={activeTab === "profile" ? "btn-primary" : "btn-secondary"}
          onClick={() => setActiveTab("profile")}
          style={{ padding: "10px 18px", fontSize: "0.9rem" }}
        >
          <Settings size={16} /> Perfil & Bio
        </button>
      </div>

      {/* Conteúdo da Aba Ativa */}
      {activeTab === "client-control" && (
        <ClientControlTab
          barberName={barber.name || "Barbeiro"}
          appointments={appointments}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {activeTab === "client-directory" && (
        <ClientDirectoryTab
          barberName={barber.name || "Barbeiro"}
          appointments={appointments}
        />
      )}

      {activeTab === "services" && (
        <ServicesManagerTab
          services={services}
          onAddService={handleCreateService}
          onDeleteService={handleDeleteService}
        />
      )}

      {activeTab === "hours" && <ScheduleManagerTab barberId={barber.id} />}

      {activeTab === "profile" && (
        <ProfileSettingsTab barber={barber} onSaveProfile={handleSaveProfile} />
      )}
    </div>
  );
}
