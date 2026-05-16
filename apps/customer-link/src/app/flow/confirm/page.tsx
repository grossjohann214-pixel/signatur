"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";

export default function ConfirmPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", document_masked: "" });
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const linkId = sessionStorage.getItem("linkId");
      await api(`/flow/${linkId}/confirm`, {
        method: "POST",
        body: JSON.stringify({ ...form, confirmed: true }),
      });
      router.push("/flow/sign");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sgl-auth-wrap">
      <div className="sgl-auth-card sgl-fade-in">
        <div className="sgl-page-label">// Etapa 1 de 4</div>
        <h1 className="sgl-page-title" style={{ fontSize: "1.3rem", marginBottom: 20 }}>Confirme seus Dados</h1>

        {error && <div className="sgl-alert sgl-alert-r">
          <span style={{ color: "var(--r)", fontSize: 12 }}>{error}</span>
        </div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label className="sgl-label">Nome Completo *</label>
            <input className="sgl-input" required
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="sgl-label">Documento (mascarado)</label>
            <input className="sgl-input" placeholder="ex: ***123456**"
              value={form.document_masked} onChange={(e) => setForm({ ...form, document_masked: e.target.value })} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 12, color: "var(--fg2)" }}>
            <input type="checkbox" required checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
            Confirmo que os dados estao corretos
          </label>
          <button type="submit" className="sgl-btn" disabled={loading || !confirmed}
            style={{ width: "100%", justifyContent: "center" }}>
            {loading ? "Enviando..." : "Continuar"}
          </button>
        </form>
      </div>
    </div>
  );
}
