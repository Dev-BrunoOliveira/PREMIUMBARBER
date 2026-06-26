"use client";
import { useState, useEffect } from "react";
import { Users, Phone, Plus, X, Calendar, Clock } from "lucide-react";
import { format, addDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Appointment {
  id: string;
  client: {
    name: string;
    email: string;
    phone?: string;
  };
  date: string;
  status: string;
}

export default function BarberDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [newTime, setNewTime] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [activeTab, setActiveTab] = useState<"appointments" | "available">(
    "appointments",
  );

  useEffect(() => {
    fetchAppointments();
    fetchAvailableTimes();
  }, []);

  const fetchAppointments = async () => {
    try {
      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setUTCHours(23, 59, 59, 999);

      const res = await fetch(
        `/api/appointments?date=${format(new Date(), "yyyy-MM-dd")}`,
      );
      const data = await res.json();
      if (data.appointments) {
        setAppointments(data.appointments);
      }
    } catch (e) {
      console.error("Erro ao buscar agendamentos");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTimes = async () => {
    try {
      const res = await fetch(
        `/api/appointments/available?date=${selectedDate}`,
      );
      const data = await res.json();
      if (data.availableTimes) {
        setAvailableTimes(data.availableTimes);
      }
    } catch (e) {
      console.error("Erro ao buscar horários");
    }
  };

  const handleAddTime = async () => {
    if (!newTime) return;

    try {
      const res = await fetch("/api/appointments/available", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          time: newTime,
        }),
      });

      if (res.ok) {
        setAvailableTimes([...availableTimes, newTime].sort());
        setNewTime("");
        alert("Horário adicionado com sucesso!");
      } else {
        alert("Erro ao adicionar horário");
      }
    } catch (e) {
      alert("Erro de conexão");
    }
  };

  const handleRemoveTime = async (time: string) => {
    try {
      const res = await fetch("/api/appointments/available", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          time: time,
        }),
      });

      if (res.ok) {
        setAvailableTimes(availableTimes.filter((t) => t !== time));
        alert("Horário removido com sucesso!");
      } else {
        alert("Erro ao remover horário");
      }
    } catch (e) {
      alert("Erro de conexão");
    }
  };

  const allHours = Array.from(
    { length: 12 },
    (_, i) => `${String(i + 8).padStart(2, "0")}:00`,
  );

  return (
    <div>
      {/* Abas */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "16px",
        }}
      >
        <button
          onClick={() => setActiveTab("appointments")}
          style={{
            padding: "8px 16px",
            backgroundColor:
              activeTab === "appointments" ? "var(--primary)" : "transparent",
            color: activeTab === "appointments" ? "#000" : "var(--text-muted)",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            transition: "all 0.2s",
          }}
        >
          <Users size={18} style={{ marginRight: "8px", display: "inline" }} />
          Agendamentos de Hoje
        </button>
        <button
          onClick={() => {
            setActiveTab("available");
            fetchAvailableTimes();
          }}
          style={{
            padding: "8px 16px",
            backgroundColor:
              activeTab === "available" ? "var(--primary)" : "transparent",
            color: activeTab === "available" ? "#000" : "var(--text-muted)",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            transition: "all 0.2s",
          }}
        >
          <Calendar
            size={18}
            style={{ marginRight: "8px", display: "inline" }}
          />
          Gerenciar Horários
        </button>
      </div>

      {/* Agendamentos de Hoje */}
      {activeTab === "appointments" && (
        <div className="card animate-fade-in">
          <h3 style={{ marginBottom: "24px" }}>Agendamentos de Hoje</h3>

          {loading ? (
            <p className="label">Carregando...</p>
          ) : appointments.length === 0 ? (
            <p className="label">Nenhum agendamento para hoje até o momento.</p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {appointments.map((app) => {
                const date = new Date(app.date);
                const timeStr =
                  date.getHours().toString().padStart(2, "0") + ":00";

                return (
                  <div
                    key={app.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px",
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      transition: "transform 0.2s",
                    }}
                  >
                    <div>
                      <strong
                        style={{
                          display: "block",
                          fontSize: "1.1rem",
                          marginBottom: "4px",
                        }}
                      >
                        {app.client.name || app.client.email}
                      </strong>
                      <div
                        style={{
                          display: "flex",
                          gap: "16px",
                          alignItems: "center",
                        }}
                      >
                        <span
                          className="label"
                          style={{ color: "var(--primary)" }}
                        >
                          Hoje, {timeStr}
                        </span>
                        {app.client.phone && (
                          <span
                            className="label"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Phone size={14} /> {app.client.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span
                        style={{
                          padding: "6px 12px",
                          borderRadius: "16px",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          backgroundColor:
                            app.status === "CONFIRMED"
                              ? "rgba(212, 175, 55, 0.15)"
                              : "rgba(255, 255, 255, 0.05)",
                          color:
                            app.status === "CONFIRMED"
                              ? "var(--primary)"
                              : "var(--text-muted)",
                          border:
                            app.status === "CONFIRMED"
                              ? "1px solid rgba(212, 175, 55, 0.3)"
                              : "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        {app.status === "CONFIRMED" ? "Confirmado" : "Pendente"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Gerenciar Horários */}
      {activeTab === "available" && (
        <div className="card animate-fade-in">
          <h3 style={{ marginBottom: "24px" }}>
            Gerenciar Horários Disponíveis
          </h3>

          {/* Seletor de Data */}
          <div style={{ marginBottom: "24px" }}>
            <label
              className="label"
              style={{ display: "block", marginBottom: "8px" }}
            >
              Selecione a data
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setTimeout(() => fetchAvailableTimes(), 100);
              }}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--surface)",
                color: "var(--text)",
                fontSize: "1rem",
              }}
            />
          </div>

          {/* Adicionar Horário */}
          <div
            style={{
              marginBottom: "24px",
              paddingBottom: "24px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <label
              className="label"
              style={{ display: "block", marginBottom: "8px" }}
            >
              Adicionar novo horário
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <select
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--surface)",
                  color: "var(--text)",
                  fontSize: "1rem",
                }}
              >
                <option value="">Selecione um horário</option>
                {allHours.map((hour) => (
                  <option
                    key={hour}
                    value={hour}
                    disabled={availableTimes.includes(hour)}
                  >
                    {hour}{" "}
                    {availableTimes.includes(hour) ? "(já adicionado)" : ""}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddTime}
                disabled={!newTime}
                style={{
                  padding: "10px 16px",
                  backgroundColor: newTime
                    ? "var(--primary)"
                    : "var(--surface)",
                  color: newTime ? "#000" : "var(--text-muted)",
                  border: "none",
                  borderRadius: "8px",
                  cursor: newTime ? "pointer" : "not-allowed",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                }}
              >
                <Plus size={18} />
                Adicionar
              </button>
            </div>
          </div>

          {/* Horários Disponíveis */}
          <div>
            <label
              className="label"
              style={{ display: "block", marginBottom: "12px" }}
            >
              Horários para{" "}
              {format(new Date(selectedDate), "d 'de' MMMM", { locale: ptBR })}
            </label>
            {availableTimes.length === 0 ? (
              <p
                className="label"
                style={{ textAlign: "center", color: "var(--text-muted)" }}
              >
                Nenhum horário disponível para esta data
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                  gap: "8px",
                }}
              >
                {availableTimes.map((time) => (
                  <div
                    key={time}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 12px",
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Clock size={14} color="var(--primary)" />
                      {time}
                    </span>
                    <button
                      onClick={() => handleRemoveTime(time)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-muted)",
                        padding: "4px",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--primary)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--text-muted)";
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
