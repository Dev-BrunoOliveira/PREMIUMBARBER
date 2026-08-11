"use client";

import React from "react";
import { Link as LinkIcon, ExternalLink } from "lucide-react";
import CopyLinkButton from "../CopyLinkButton";

interface BioLinkBannerProps {
  slug: string;
}

export default function BioLinkBanner({ slug }: BioLinkBannerProps) {
  const uniqueLink = typeof window !== "undefined"
    ? `${window.location.origin}/agenda/${slug}`
    : `http://localhost:3000/agenda/${slug}`;

  return (
    <div
      className="card animate-fade-in"
      style={{
        background: "linear-gradient(135deg, var(--primary-glow) 0%, var(--surface) 100%)",
        border: "1.5px solid var(--border-active)",
        padding: "20px 24px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ flex: "1 1 300px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span
              style={{
                backgroundColor: "var(--primary)",
                color: "#fff",
                padding: "3px 10px",
                borderRadius: "12px",
                fontSize: "0.75rem",
                fontWeight: "800",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              📲 Link Exclusivo da Bio
            </span>
          </div>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-main)", fontSize: "1.2rem", fontWeight: "700" }}>
            <LinkIcon size={20} color="var(--primary)" /> Divulgue no Instagram / WhatsApp
          </h3>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Seus clientes clicam no link e vão direto para agendar com você em poucos passos.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <code
            style={{
              padding: "10px 14px",
              background: "rgba(0, 0, 0, 0.5)",
              borderRadius: "8px",
              color: "var(--primary)",
              fontSize: "0.95rem",
              fontWeight: "700",
              border: "1px solid var(--border)",
            }}
          >
            /agenda/{slug}
          </code>
          <CopyLinkButton link={uniqueLink} />
          <a
            href={uniqueLink}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
            style={{ padding: "10px 14px", fontSize: "0.85rem" }}
          >
            Testar Rota <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
