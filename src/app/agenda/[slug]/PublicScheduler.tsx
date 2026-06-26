"use client";
import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, CheckCircle } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";

export default function PublicScheduler({ barberId, barberName }: { barberId: string, barberName: string }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const today = startOfDay(new Date());

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingTimes(true);
    setSelectedTime("");
    setSuccess(false);
    
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    
    fetch(`/api/appointments/available?date=${dateStr}&barberId=${barberId}`)
      .then(res => res.json())
      .then(data => {
        if (data.availableTimes) setAvailableTimes(data.availableTimes);
      })
      .finally(() => setLoadingTimes(false));
  }, [selectedDate, barberId]);

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime) return;
    setLoading(true);
    
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateStr, time: selectedTime, barberId })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
        setAvailableTimes(prev => prev.filter(t => t !== selectedTime));
        setSelectedTime("");
        setTimeout(() => {
          setSuccess(false);
          router.push("/dashboard"); // Redirects client to their dashboard to see the appointment
        }, 3000);
      } else {
        alert(data.error || "Erro ao agendar.");
      }
    } catch (e) {
      alert("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

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
        <h4 style={{ textTransform: "capitalize", fontSize: "1.1rem" }}>
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </h4>
        <button onClick={nextMonth} className="icon-btn"><ChevronRight /></button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentMonth, { weekStartsOn: 0 });

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} style={{ textAlign: "center", fontWeight: "bold", color: "var(--text-muted)", fontSize: "0.85rem", padding: "8px 0" }}>
          {format(addDays(startDate, i), "EE", { locale: ptBR }).substring(0, 3)}
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
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        
        const isPast = isBefore(day, today);
        const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <div 
            key={day.toString()} 
            onClick={() => !isPast && isCurrentMonth && setSelectedDate(cloneDay)}
            style={{
              padding: "12px",
              textAlign: "center",
              cursor: isPast || !isCurrentMonth ? "default" : "pointer",
              backgroundColor: isSelected ? "var(--primary)" : "transparent",
              color: isSelected ? "#000" : (isPast || !isCurrentMonth ? "var(--border)" : "var(--text-main)"),
              borderRadius: "8px",
              fontWeight: isSelected ? "bold" : "normal",
              transition: "all 0.2s",
              opacity: isPast ? 0.3 : 1
            }}
            className={(!isPast && isCurrentMonth && !isSelected) ? "calendar-day-hover" : ""}
          >
            <span style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              width: "30px", 
              height: "30px",
              margin: "0 auto",
              borderRadius: "50%",
              backgroundColor: isSameDay(day, new Date()) && !isSelected ? "rgba(255,255,255,0.05)" : "transparent"
            }}>
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
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        
        <div className="card animate-fade-in" style={{ padding: "24px" }}>
          <h3 style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
            <CalendarIcon color="var(--primary)" size={20} /> Escolha uma Data
          </h3>
          <div className="custom-calendar">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
          </div>
        </div>

        <div className="card animate-fade-in" style={{ padding: "24px", display: "flex", flexDirection: "column" }}>
          <h3 style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
            <Clock color="var(--primary)" size={20} /> Horários
          </h3>

          {!selectedDate ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", textAlign: "center" }}>
              <p>Selecione uma data no calendário ao lado para ver os horários disponíveis.</p>
            </div>
          ) : (
            <div className="animate-fade-in" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <p className="label" style={{ marginBottom: "20px" }}>
                Disponibilidade para <strong style={{color: "var(--text-main)"}}>{format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</strong>
              </p>

              {loadingTimes ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <p className="label">Buscando horários...</p>
                </div>
              ) : availableTimes.length === 0 ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--error)", textAlign: "center" }}>
                  <p>Infelizmente, não há horários livres para este dia.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
                  {availableTimes.map(time => (
                    <button 
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      style={{
                        padding: "12px 8px",
                        borderRadius: "12px",
                        border: `1px solid ${selectedTime === time ? "var(--primary)" : "var(--border)"}`,
                        backgroundColor: selectedTime === time ? "var(--primary)" : "var(--background)",
                        color: selectedTime === time ? "#000" : "var(--text-main)",
                        cursor: "pointer",
                        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                        fontWeight: "600",
                        transform: selectedTime === time ? "scale(1.05)" : "scale(1)"
                      }}
                      className="time-slot-hover"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}

              {success && (
                <div className="animate-fade-in" style={{ backgroundColor: "rgba(212, 175, 55, 0.1)", padding: "16px", borderRadius: "12px", border: "1px solid var(--primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <CheckCircle color="var(--primary)" />
                  <div>
                    <strong style={{ display: "block", color: "var(--primary)" }}>Sucesso!</strong>
                    <span style={{ fontSize: "0.85rem" }}>Seu agendamento foi confirmado.</span>
                  </div>
                </div>
              )}

              <div style={{ marginTop: "auto" }}>
                <button 
                  className="btn-primary" 
                  style={{ width: "100%", opacity: (!selectedTime || loading) ? 0.5 : 1, padding: "16px", fontSize: "1rem" }}
                  onClick={handleSchedule}
                  disabled={!selectedTime || loading}
                >
                  {loading ? "Confirmando..." : (selectedTime ? `Confirmar às ${selectedTime}` : "Selecione um horário")}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
