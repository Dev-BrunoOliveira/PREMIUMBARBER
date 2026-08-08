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
  ArrowRight,
  Lock,
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

  const [allTimeSlots, setAllTimeSlots] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  // Formulário do Cliente
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const today = startOfDay(new Date());

  // 1. Carregar Serviços do Barbeiro
  useEffect(() => {
    fetch(`/api/services?barberId=${barberId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.services && data.services.length > 0) {
          setServices(data.services);
        } else {
          // Fallback dos 4 serviços padrão do sistema
          setServices([
            { id: "s1", name: "Corte", price: 45, duration: 30, description: "Corte completo com acabamento de precisão." },
            { id: "s2", name: "Corte + Barba", price: 75, duration: 50, description: "Combo especial com toalha quente e barba terapia." },
            { id: "s3", name: "Apenas Barba", price: 35, duration: 30, description: "Modelagem de barba com navalha e hidratação." },
            { id: "s4", name: "Limpar a Sobrancelha", price: 15, duration: 15, description: "Design e alinhamento masculino na navalha." },
          ]);
        }
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

  // 3. Buscar horários disponíveis e ocupados ao alterar a data
  useEffect(() => {
    if (!selectedDate) return;
    setLoadingTimes(true);
    setSelectedTime("");

    const dateStr = format(selectedDate, "yyyy-MM-dd");

    fetch(`/api/appointments/available?date=${dateStr}&barberId=${barberId}`)
      .then((res) => res.json())
      .then((data) => {
        const defaultList = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
        const configured = data.configuredTimes && data.configuredTimes.length > 0 ? data.configuredTimes : defaultList;
        const available = data.availableTimes || [];
        const booked = data.bookedTimes || [];

        setAllTimeSlots(configured);
        setAvailableTimes(available);
        setBookedTimes(booked);
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
          serviceId: selectedService.id.startsWith("s") ? null : selectedService.id,
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
              color: isSelected ? "#fff" : isPast || !isCurrentMonth ? "var(--text-muted)" : "var(--text-main)",
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
            flexWrap: "wrap",
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
                color: "#fff",
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
            <span>1. Selecionar Serviço</span>
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
                color: "#fff",
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
            <span>2. Escolher Horário</span>
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
                color: "#fff",
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
            <span>3. Seus Dados</span>
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
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
                    backgroundColor: isSelected ? "rgba(229, 9, 20, 0.15)" : "var(--background)",
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
                        color: "#fff",
                        borderRadius: "50%",
                        padding: "2px",
                      }}
                    >
                      <CheckCircle size={18} />
                    </span>
                  )}
                  <div>
                    <h4 style={{ fontSize: "1.2rem", marginBottom: "6px", color: isSelected ? "var(--primary)" : "var(--text-main)" }}>
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
                    <strong style={{ fontSize: "1.3rem", color: "var(--primary)" }}>
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
              Escolher Horário <ArrowRight size={18} />
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
            Escolha o Dia e o Horário Desejado
          </h3>

          {/* Legenda de Cores */}
          <div style={{ display: "flex", gap: "20px", marginBottom: "20px", fontSize: "0.85rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "14px", height: "14px", borderRadius: "4px", backgroundColor: "var(--primary)" }}></span>
              <span>🔴 <strong>Vermelho Vivo</strong>: Horário Livre</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "14px", height: "14px", borderRadius: "4px", backgroundColor: "#3a090b", border: "1px solid #661214" }}></span>
              <span>🔴 <strong>Vermelho Escuro</strong>: Horário Ocupado</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px" }}>
            {/* Calendário */}
            <div>
              <p className="label" style={{ marginBottom: "16px" }}>1. Selecione o dia no calendário:</p>
              <div className="custom-calendar" style={{ background: "rgba(0,0,0,0.3)", padding: "16px", borderRadius: "14px", border: "1px solid var(--border)" }}>
                {renderHeader()}
                {renderDays()}
                {renderCells()}
              </div>
            </div>

            {/* Grade de Horários com Vermelho Vivo e Vermelho Escuro */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <p className="label" style={{ marginBottom: "16px" }}>
                2. Horários do dia{" "}
                <strong style={{ color: "var(--text-main)" }}>
                  {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : ""}
                </strong>:
              </p>

              {loadingTimes ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <p className="label">Carregando horários...</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                  {allTimeSlots.map((time) => {
                    const isBooked = bookedTimes.includes(time);
                    const isAvailable = availableTimes.includes(time);
                    const isSelected = selectedTime === time;

                    if (isBooked || !isAvailable) {
                      // Vermelho Escuro (Indisponível / Ocupado)
                      return (
                        <button
                          key={time}
                          type="button"
                          disabled
                          style={{
                            padding: "12px 6px",
                            borderRadius: "10px",
                            border: "1px solid #661214",
                            backgroundColor: "#3a090b",
                            color: "#7f272a",
                            fontWeight: "600",
                            cursor: "not-allowed",
                            opacity: 0.8,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span style={{ fontSize: "0.95rem" }}>{time}</span>
                          <span style={{ fontSize: "0.68rem", textTransform: "uppercase" }}>Ocupado</span>
                        </button>
                      );
                    }

                    // Vermelho Vivo (Livre e Clicável)
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        style={{
                          padding: "12px 6px",
                          borderRadius: "10px",
                          border: `2px solid ${isSelected ? "#ffffff" : "var(--primary)"}`,
                          backgroundColor: isSelected ? "var(--primary)" : "rgba(229, 9, 20, 0.15)",
                          color: "#ffffff",
                          fontWeight: isSelected ? "bold" : "700",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          boxShadow: "none",
                        }}
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
                  Continuar <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PASSO 3: Formulário do Cliente (Nome, WhatsApp, E-mail e Senha se necessário) */}
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
            Confirme seus Dados para o Agendamento
          </h3>

          {/* Resumo do Agendamento */}
          <div
            style={{
              backgroundColor: "rgba(229, 9, 20, 0.1)",
              border: "1px solid var(--primary)",
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
              <span className="label" style={{ color: "var(--primary)" }}>Resumo do Agendamento:</span>
              <h4 style={{ fontSize: "1.15rem", marginTop: "4px" }}>{selectedService?.name}</h4>
              <p className="label" style={{ textTransform: "none", color: "var(--text-main)", marginTop: "2px" }}>
                {selectedDate && format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })} às <strong>{selectedTime}</strong>
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className="label">Valor:</span>
              <p style={{ fontSize: "1.4rem", fontWeight: "bold", color: "var(--primary)" }}>
                R$ {selectedService?.price.toFixed(2).replace(".", ",")}
              </p>
            </div>
          </div>

          <form onSubmit={handleSchedule} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label className="label">Seu Nome Completo *</label>
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
              <label className="label">Seu Celular / WhatsApp (com DDD) *</label>
              <input
                type="tel"
                className="input-field"
                placeholder="(11) 99999-9999"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                required
              />
              <span className="label" style={{ fontSize: "0.78rem", marginTop: "4px", textTransform: "none" }}>
                Você receberá a notificação de confirmação no seu WhatsApp!
              </span>
            </div>

            <div>
              <label className="label">Seu E-mail *</label>
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
              <div style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid var(--error)", color: "var(--error)", padding: "12px 16px", borderRadius: "10px", fontSize: "0.9rem" }}>
                {errorMessage}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
              <button type="button" className="btn-secondary" onClick={() => setStep(2)} style={{ flex: 1 }}>
                Voltar
              </button>
              <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2 }}>
                {loading ? "Confirmando..." : "Confirmar e Enviar para o WhatsApp"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PASSO 4: Sucesso e Confirmação via WhatsApp */}
      {step === 4 && (
        <div className="card animate-fade-in" style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{ width: "75px", height: "75px", borderRadius: "50%", backgroundColor: "rgba(229, 9, 20, 0.15)", color: "var(--primary)", border: "2px solid var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <CheckCircle size={44} />
          </div>

          <h2 style={{ fontSize: "1.9rem", color: "var(--primary)", marginBottom: "8px", fontWeight: "800" }}>
            Agendamento Confirmado com Sucesso!
          </h2>
          <p className="label" style={{ textTransform: "none", fontSize: "1.05rem", maxWidth: "550px", margin: "0 auto 32px" }}>
            Parabéns, <strong>{clientName}</strong>! Seu horário para o serviço <strong>{selectedService?.name}</strong> foi reservado para <strong>{selectedDate && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} às {selectedTime}</strong>.
          </p>

          <div style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", padding: "20px", borderRadius: "14px", maxWidth: "450px", margin: "0 auto 32px", textAlign: "left" }}>
            <span className="label" style={{ color: "var(--primary)" }}>📲 Notificação de WhatsApp Enviada:</span>
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.95rem" }}>
              <div>
                <span>Profissional:</span> <strong>{barberName}</strong>
              </div>
              <div>
                <span>Celular Cadastrado:</span> <strong>{clientPhone}</strong>
              </div>
              <div>
                <span>Serviço:</span> <strong>{selectedService?.name}</strong> (R$ {selectedService?.price.toFixed(2).replace(".", ",")})
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
            Fazer Novo Agendamento
          </button>
        </div>
      )}
    </div>
  );
}
