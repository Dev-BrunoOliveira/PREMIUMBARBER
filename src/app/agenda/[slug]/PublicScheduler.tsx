"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  Scissors,
  User,
  Phone,
  Mail,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isBefore,
  startOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSession } from "next-auth/react";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
}

export default function PublicScheduler({
  barberId,
  barberName,
}: {
  barberId: string;
  barberName: string;
}) {
  const { data: session } = useSession();

  // Passos: 1 = Servico, 2 = Data & Horario, 3 = Dados do Cliente, 4 = Sucesso
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Estados dos Dados Selecionados
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState("");

  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  // Formulário Obrigatorio do Cliente
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const today = startOfDay(new Date());

  // 1. Carregar Serviços
  useEffect(() => {
    fetch(`/api/services?barberId=${barberId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.services) setServices(data.services);
      })
      .catch((err) => console.error("Erro ao carregar serviços:", err));
  }, [barberId]);

  // 2. Preencher dados caso cliente esteja logado
  useEffect(() => {
    if (session?.user) {
      if (session.user.name && !clientName) setClientName(session.user.name);
      if (session.user.email && !clientEmail) setClientEmail(session.user.email);
    }
  }, [session]);

  // 3. Buscar horários disponíveis ao alterar a data
  useEffect(() => {
    if (!selectedDate) return;
    setLoadingTimes(true);
    setSelectedTime("");

    const dateStr = format(selectedDate, "yyyy-MM-dd");

    fetch(`/api/appointments/available?date=${dateStr}&barberId=${barberId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.availableTimes) setAvailableTimes(data.availableTimes);
      })
      .finally(() => setLoadingTimes(false));
  }, [selectedDate, barberId]);

  // 4. Submeter Agendamento
  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedDate || !selectedTime || !selectedService) {
      setErrorMessage("Por favor, selecione o serviço, a data e o horário.");
      return;
    }

    if (!clientName.trim() || !clientPhone.trim() || !clientEmail.trim()) {
      setErrorMessage("É obrigatório preencher seu Nome, WhatsApp e E-mail.");
      return;
    }

    setLoading(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateStr,
          time: selectedTime,
          barberId,
          serviceId: selectedService.id,
          clientName,
          clientPhone,
          clientEmail,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep(4);
      } else {
        setErrorMessage(data.error || "Erro ao realizar o agendamento.");
      }
    } catch (err) {
      setErrorMessage("Falha na conexão com o servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Navegação do Calendário
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => {
    const prev = subMonths(currentMonth, 1);
    if (!isBefore(endOfMonth(prev), today)) {
      setCurrentMonth(prev);
    }
  };

  const renderHeader = () => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
      <button type="button" onClick={prevMonth} className="icon-btn">
        <ChevronLeft size={20} />
      </button>
      <h4 style={{ textTransform: "capitalize", fontSize: "1.1rem", fontWeight: "700" }}>
        {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
      </h4>
      <button type="button" onClick={nextMonth} className="icon-btn">
        <ChevronRight size={20} />
      </button>
    </div>
  );

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentMonth, { weekStartsOn: 0 });

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} style={{ textAlign: "center", fontWeight: "700", color: "var(--text-muted)", fontSize: "0.8rem", padding: "8px 0" }}>
          {format(addDays(startDate, i), "EE", { locale: ptBR }).substring(0, 3).toUpperCase()}
        </div>
      );
    }
    return <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const rows = [];
    let days: React.ReactNode[] = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "d");
        const cloneDay = day;

        const isPast = isBefore(day, today);
        const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <div
            key={day.toString()}
            onClick={() => !isPast && isCurrentMonth && setSelectedDate(cloneDay)}
            style={{
              padding: "8px 4px",
              textAlign: "center",
              cursor: isPast || !isCurrentMonth ? "default" : "pointer",
              backgroundColor: isSelected ? "var(--primary)" : "transparent",
              color: isSelected ? "#000" : isPast || !isCurrentMonth ? "var(--text-muted)" : "var(--text-main)",
              borderRadius: "10px",
              fontWeight: isSelected ? "bold" : "normal",
              transition: "all 0.2s",
              opacity: isPast ? 0.3 : isCurrentMonth ? 1 : 0.2,
            }}
            className={!isPast && isCurrentMonth && !isSelected ? "calendar-day-hover" : ""}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                margin: "0 auto",
                borderRadius: "50%",
              }}
            >
              {formattedDate}
            </span>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }} key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div style={{ maxWidth: "850px", margin: "0 auto" }}>
      {/* Indicador de Passos */}
      {step !== 4 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          <div
            onClick={() => setStep(1)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              color: step >= 1 ? "var(--primary)" : "var(--text-muted)",
              fontWeight: step === 1 ? "bold" : "normal",
            }}
          >
            <span
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: step === 1 ? "var(--primary)" : "var(--surface)",
                color: step === 1 ? "#000" : "var(--text-main)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.85rem",
                fontWeight: "bold",
                border: "1px solid var(--border)",
              }}
            >
              1
            </span>
            <span>Serviço</span>
          </div>

          <span style={{ color: "var(--border)" }}>—</span>

          <div
            onClick={() => selectedService && setStep(2)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: selectedService ? "pointer" : "not-allowed",
              color: step >= 2 ? "var(--primary)" : "var(--text-muted)",
              fontWeight: step === 2 ? "bold" : "normal",
            }}
          >
            <span
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: step === 2 ? "var(--primary)" : "var(--surface)",
                color: step === 2 ? "#000" : "var(--text-main)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.85rem",
                fontWeight: "bold",
                border: "1px solid var(--border)",
              }}
            >
              2
            </span>
            <span>Data & Horário</span>
          </div>

          <span style={{ color: "var(--border)" }}>—</span>

          <div
            onClick={() => selectedService && selectedDate && selectedTime && setStep(3)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: selectedService && selectedTime ? "pointer" : "not-allowed",
              color: step >= 3 ? "var(--primary)" : "var(--text-muted)",
              fontWeight: step === 3 ? "bold" : "normal",
            }}
          >
            <span
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: step === 3 ? "var(--primary)" : "var(--surface)",
                color: step === 3 ? "#000" : "var(--text-main)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.85rem",
                fontWeight: "bold",
                border: "1px solid var(--border)",
              }}
            >
              3
            </span>
            <span>Seus Dados</span>
          </div>
        </div>
      )}

      {/* PASSO 1: Escolha de Serviço */}
      {step === 1 && (
        <div className="card animate-fade-in">
          <h3
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "24px",
              paddingBottom: "16px",
              borderBottom: "1px solid var(--border)",
              fontSize: "1.3rem",
            }}
          >
            <Scissors color="var(--primary)" size={24} />
            Selecione o Serviço Desejado
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {services.map((s) => {
              const isSelected = selectedService?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedService(s)}
                  className="hover-card"
                  style={{
                    padding: "20px",
                    borderRadius: "14px",
                    backgroundColor: isSelected ? "rgba(212, 175, 55, 0.08)" : "var(--background)",
                    border: `2px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                  }}
                >
                  {isSelected && (
                    <span
                      style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        backgroundColor: "var(--primary)",
                        color: "#000",
                        borderRadius: "50%",
                        padding: "2px",
                      }}
                    >
                      <CheckCircle size={18} />
                    </span>
                  )}
                  <div>
                    <h4 style={{ fontSize: "1.15rem", marginBottom: "6px", color: isSelected ? "var(--primary)" : "var(--text-main)" }}>
                      {s.name}
                    </h4>
                    {s.description && (
                      <p className="label" style={{ fontSize: "0.85rem", marginBottom: "16px", textTransform: "none" }}>
                        {s.description}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={14} /> {s.duration} min
                    </span>
                    <strong style={{ fontSize: "1.25rem", color: "var(--primary)" }}>
                      R$ {s.price.toFixed(2).replace(".", ",")}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end" }}>
            <button
              className="btn-primary"
              disabled={!selectedService}
              onClick={() => setStep(2)}
              style={{ width: "100%", maxWidth: "250px" }}
            >
              Avançar para Data <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* PASSO 2: Escolha de Data & Horário */}
      {step === 2 && (
        <div className="card animate-fade-in">
          <h3
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "24px",
              paddingBottom: "16px",
              borderBottom: "1px solid var(--border)",
              fontSize: "1.3rem",
            }}
          >
            <CalendarIcon color="var(--primary)" size={24} />
            Escolha o Dia e o Horário
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px" }}>
            {/* Calendário */}
            <div>
              <p className="label" style={{ marginBottom: "16px" }}>1. Selecione o dia</p>
              <div className="custom-calendar" style={{ background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: "14px", border: "1px solid var(--border)" }}>
                {renderHeader()}
                {renderDays()}
                {renderCells()}
              </div>
            </div>

            {/* Horários */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <p className="label" style={{ marginBottom: "16px" }}>
                2. Horários disponíveis para{" "}
                <strong style={{ color: "var(--text-main)" }}>
                  {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : ""}
                </strong>
              </p>

              {loadingTimes ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <p className="label">Buscando horários disponíveis...</p>
                </div>
              ) : availableTimes.length === 0 ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--error)", textAlign: "center", padding: "20px" }}>
                  <p>Nenhum horário livre disponível para este dia. Por favor selecione outra data.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                  {availableTimes.map((time) => {
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        style={{
                          padding: "12px 6px",
                          borderRadius: "10px",
                          border: `1.5px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
                          backgroundColor: isSelected ? "var(--primary)" : "var(--background)",
                          color: isSelected ? "#000" : "var(--text-main)",
                          fontWeight: isSelected ? "bold" : "600",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        className="time-slot-hover"
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              )}

              <div style={{ marginTop: "auto", paddingTop: "24px", display: "flex", gap: "12px" }}>
                <button className="btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>
                  Voltar
                </button>
                <button
                  className="btn-primary"
                  disabled={!selectedTime}
                  onClick={() => setStep(3)}
                  style={{ flex: 2 }}
                >
                  Informar Dados <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PASSO 3: Formulário do Cliente (Nome, WhatsApp e Email) */}
      {step === 3 && (
        <div className="card animate-fade-in">
          <h3
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "24px",
              paddingBottom: "16px",
              borderBottom: "1px solid var(--border)",
              fontSize: "1.3rem",
            }}
          >
            <User color="var(--primary)" size={24} />
            Seus Dados para Contato e Confirmação
          </h3>

          {/* Resumo do Agendamento */}
          <div
            style={{
              backgroundColor: "rgba(212, 175, 55, 0.08)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
              padding: "18px",
              borderRadius: "14px",
              marginBottom: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <span className="label" style={{ color: "var(--primary)" }}>Resumo da Reserva:</span>
              <h4 style={{ fontSize: "1.1rem", marginTop: "4px" }}>{selectedService?.name}</h4>
              <p className="label" style={{ textTransform: "none", color: "var(--text-main)" }}>
                {selectedDate && format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })} às <strong>{selectedTime}</strong>
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className="label">Valor Total:</span>
              <p style={{ fontSize: "1.3rem", fontWeight: "bold", color: "var(--primary)" }}>
                R$ {selectedService?.price.toFixed(2).replace(".", ",")}
              </p>
            </div>
          </div>

          <form onSubmit={handleSchedule} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label className="label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={16} /> Seu Nome Completo *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Ex: João da Silva"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Phone size={16} /> Número do WhatsApp (com DDD) *
              </label>
              <input
                type="tel"
                className="input-field"
                placeholder="(11) 99999-9999"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                required
              />
              <span className="label" style={{ fontSize: "0.78rem", marginTop: "4px", textTransform: "none" }}>
                Enviaremos a confirmação e o lembrete direto no seu WhatsApp!
              </span>
            </div>

            <div>
              <label className="label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Mail size={16} /> Seu E-mail *
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="seu@email.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                required
              />
            </div>

            {errorMessage && (
              <div style={{ backgroundColor: "rgba(239, 83, 80, 0.15)", border: "1px solid var(--error)", color: "var(--error)", padding: "12px 16px", borderRadius: "10px", fontSize: "0.9rem" }}>
                {errorMessage}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
              <button type="button" className="btn-secondary" onClick={() => setStep(2)} style={{ flex: 1 }}>
                Voltar
              </button>
              <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2 }}>
                {loading ? "Confirmando..." : "Finalizar Agendamento"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PASSO 4: Sucesso e Confirmação */}
      {step === 4 && (
        <div className="card animate-fade-in" style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{ width: "70px", height: "70px", borderRadius: "50%", backgroundColor: "rgba(212, 175, 55, 0.15)", color: "var(--primary)", border: "2px solid var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <CheckCircle size={40} />
          </div>

          <h2 style={{ fontSize: "1.8rem", color: "var(--primary)", marginBottom: "8px" }}>Agendamento Solicitar com Sucesso!</h2>
          <p className="label" style={{ textTransform: "none", fontSize: "1rem", maxWidth: "500px", margin: "0 auto 32px" }}>
            Obrigado, <strong>{clientName}</strong>! Seu agendamento para <strong>{selectedService?.name}</strong> no dia <strong>{selectedDate && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} às {selectedTime}</strong> foi enviado ao barbeiro <strong>{barberName}</strong>.
          </p>

          <div style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", padding: "20px", borderRadius: "14px", maxWidth: "450px", margin: "0 auto 32px", textAlign: "left" }}>
            <span className="label">Resumo do Pedido:</span>
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Profissional:</span>
                <strong>{barberName}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>WhatsApp Cadastrado:</span>
                <strong>{clientPhone}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Valor a pagar no local:</span>
                <strong style={{ color: "var(--primary)" }}>R$ {selectedService?.price.toFixed(2).replace(".", ",")}</strong>
              </div>
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={() => {
              setStep(1);
              setSelectedService(null);
              setSelectedTime("");
            }}
          >
            Realizar Outro Agendamento
          </button>
        </div>
      )}
    </div>
  );
}
