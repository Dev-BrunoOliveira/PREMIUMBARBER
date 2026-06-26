"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className="btn-primary" 
      style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px" }}
    >
      {copied ? <Check size={20} /> : <Copy size={20} />}
      {copied ? "Copiado!" : "Copiar Link"}
    </button>
  );
}
