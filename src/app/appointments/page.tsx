"use client";
import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, CheckCircle, LogOut } from "lucide-react";
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isBefore, startOfDay 
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AppointmentsPage() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [success, setSuccess] = useState(false);

  const today = startOfDay(new Date());

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingTimes(true);
    setSelectedTime("");
    setSuccess(false);
    
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    
    fetch(`/api/appointments/available?date=${dateStr}`)
      .then(res => res.json())
      .then(data => {
        if (data.availableTimes) setAvailableTimes(data.availableTimes);
      })
      .finally(() => setLoadingTimes(false));
  }, [selectedDate]);

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime) return;
    setLoading(true);
    
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateStr, time: selectedTime })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
        setAvailableTimes(prev => prev.filter(t => t !== selectedTime));
        setSelectedTime("");
        setTimeout(() => setSuccess(false), 5000);
      } else {
        alert(data.error || "Erro ao agendar.");
      }
    } catch (e) {
      alert("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  // Funções do Calendário
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => {
    const prev = subMonths(currentMonth, 1);
    if (!isBefore(endOfMonth(prev), today)) {
      setCurrentMonth(prev);
    }
  };

  const renderHeader = () => {
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <button onClick={prevMonth} className="icon-btn"><ChevronLeft /></button>
        <h3 style={{ margin: 0 }}>{format(currentMonth, "MMMM yyyy", { locale: ptBR })}</h3>
        <button onClick={nextMonth} className="icon-btn"><ChevronRight /></button>
      </div>
    );
  };

  const renderDays = () => {
    const dateFormat = "EEEEE";
    const days = [];
    const startDate = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} style={{ textAlign: "center", fontWeight: "600", color: "var(--text-muted)", padding: "8px 0", fontSize: "0.85rem" }}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }
    return days;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days: JSX.Element[] = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isDisabled = isBefore(cloneDay, today);
        const isSelected = selectedDate && isSameDay(cloneDay, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <button
            key={day.toString()}
            onClick={() => !isDisabled && setSelectedDate(cloneDay)}
            disabled={isDisabled}
            style={{
              padding: "12px",
              margin: "2px",
              borderRadius: "8px",
              border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border)",
              backgroundColor: isSelected ? "rgba(212, 175, 55, 0.1)" : isCurrentMonth ? "var(--surface)" : "transparent",
              color: isCurrentMonth ? "var(--text)" : "var(--text-muted)",
              cursor: isDisabled ? "not-allowed" : "pointer",
              fontWeight: isSelected ? "700" : "400",
              opacity: isDisabled ? 0.5 : 1,
              transition: "all 0.2s"
            }}
          >
            {format(cloneDay, "d")}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
          {days}
        </div>
      );
      days = [];
    }
    return rows;
  };

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
        <h2>Agendar Atendimento</h2>
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            backgroundColor: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            cursor: "pointer",
            color: "var(--text-muted)",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--surface)";
            e.currentTarget.style.color = "var(--text)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
        {/* Calendário */}
        <div className="card animate-fade-in">
          <h3 style={{ marginBottom: "16px" }}>Selecione uma data</h3>
          {renderHeader()}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "16px" }}>
            {renderDays()}
          </div>
          {renderCells()}
          {selectedDate && (
            <p style={{ marginTop: "16px", fontSize: "0.9rem", color: "var(--primary)", textAlign: "center" }}>
              📅 {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          )}
        </div>

        {/* Horários e Confirmação */}
        <div className="card animate-fade-in">
          <h3 style={{ marginBottom: "16px" }}>Horários disponíveis</h3>
          
          {!selectedDate ? (
            <p className="label" style={{ textAlign: "center", color: "var(--text-muted)" }}>
              Selecione uma data para ver os horários disponíveis
            </p>
          ) : loadingTimes ? (
            <p className="label" style={{ textAlign: "center", color: "var(--text-muted)" }}>
              Carregando horários...
            </p>
          ) : availableTimes.length === 0 ? (
            <p className="label" style={{ textAlign: "center", color: "var(--text-muted)" }}>
              Nenhum horário disponível para esta data
            </p>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", marginBottom: "16px" }}>
                {availableTimes.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: selectedTime === time ? "2px solid var(--primary)" : "1px solid var(--border)",
                      backgroundColor: selectedTime === time ? "rgba(212, 175, 55, 0.1)" : "var(--surface)",
                      color: selectedTime === time ? "var(--primary)" : "var(--text)",
                      cursor: "pointer",
                      fontWeight: selectedTime === time ? "600" : "400",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    <Clock size={16} />
                    {time}
                  </button>
                ))}
              </div>

              {success && (
                <div style={{
                  padding: "12px",
                  backgroundColor: "rgba(34, 197, 94, 0.1)",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  borderRadius: "8px",
                  color: "#22c55e",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.9rem"
                }}>
                  <CheckCircle size={18} />
                  Agendamento realizado com sucesso!
                </div>
              )}

              <button 
                onClick={handleSchedule}
                disabled={!selectedTime || loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: selectedTime && !loading ? "var(--primary)" : "var(--surface)",
                  color: selectedTime && !loading ? "#000" : "var(--text-muted)",
                  border: "none",
                  borderRadius: "8px",
                  cursor: selectedTime && !loading ? "pointer" : "not-allowed",
                  fontWeight: "600",
                  transition: "all 0.2s",
                  opacity: selectedTime && !loading ? 1 : 0.5
                }}
              >
                {loading ? "Agendando..." : "Confirmar Agendamento"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
