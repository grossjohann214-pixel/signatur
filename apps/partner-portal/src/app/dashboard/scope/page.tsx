"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const TYPES = [
  "confirmacao_cadastral", "assinatura_de_termo", "autorizacao_de_servico",
  "liberacao_de_execucao", "ressarcimento", "quitacao", "declaracao_de_ciencia",
  "validacao_de_beneficiario", "contrato_com_testemunhas", "prestacao_de_servico",
  "termo_juridico", "termo_contabil", "outro_procedimento",
];

export default function ScopePage() {
  const router = useRouter();
  const [type, setType] = useState(TYPES[0]);
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api("/partners/me/scope-request", {
        method: "POST",
        body: JSON.stringify({ request_type: type, description: desc }),
      });
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "relative", zIndex: 1, padding: 32, maxWidth: 560, margin: "0 auto" }} className="sgl-fade-in">
      <div className="sgl-page-label">// Onboarding</div>
      <h1 className="sgl-page-title" style={{ marginBottom: 24 }}>Solicitar Escopo</h1>

      {success && <div className="sgl-alert sgl-alert-g">
        <span style={{ color: "var(--g)", fontSize: 12 }}>Escopo solicitado com sucesso!</span>
      </div>}
      {error && <div className="sgl-alert sgl-alert-r">
        <span style={{ color: "var(--r)", fontSize: 12 }}>{error}</span>
      </div>}

      <div className="sgl-card">
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label className="sgl-label">Tipo de Procedimento</label>
            <select className="sgl-select" value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="sgl-label">Descricao (opcional)</label>
            <textarea className="sgl-textarea" value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <button type="submit" className="sgl-btn" disabled={loading}
            style={{ width: "100%", justifyContent: "center" }}>
            {loading ? "Enviando..." : "Solicitar"}
          </button>
        </form>
      </div>

      <p style={{ marginTop: 16, textAlign: "center", fontSize: 12 }}>
        <a href="/dashboard" style={{ color: "var(--c)" }}>Voltar ao Dashboard</a>
      </p>
    </div>
  );
}
