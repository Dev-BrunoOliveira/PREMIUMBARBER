"use client";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/login' })}
      style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "8px", 
        background: "rgba(255, 59, 48, 0.1)", 
        border: "1px solid rgba(255, 59, 48, 0.3)", 
        color: "#ff3b30", 
        padding: "8px 16px", 
        borderRadius: "8px", 
        cursor: "pointer", 
        fontWeight: "600", 
        transition: "all 0.2s" 
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = "rgba(255, 59, 48, 0.2)";
        e.currentTarget.style.borderColor = "#ff3b30";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = "rgba(255, 59, 48, 0.1)";
        e.currentTarget.style.borderColor = "rgba(255, 59, 48, 0.3)";
      }}
    >
      <LogOut size={16} /> Sair
    </button>
  );
}
