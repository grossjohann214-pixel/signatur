"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ company_name: "", cnpj: "", trading_name: "", owner_email: "", owner_password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/partners/register", { method: "POST", body: JSON.stringify(form) });
      const login = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: form.owner_email, password: form.owner_password }),
      });
      localStorage.setItem("token", login.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Falha no cadastro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sgl-auth-wrap">
      <div className="sgl-auth-card sgl-fade-in" style={{ maxWidth: 520 }}>
        <div className="sgl-brand">
          <div className="sgl-brand-logo">SV</div>
          <div className="sgl-brand-name">Singul<span>AI</span> Validate</div>
        </div>
        <div className="sgl-page-label" style={{ justifyContent: "center" }}>
          // Cadastro de Parceiro
        </div>

        {error && <div className="sgl-alert sgl-alert-r" style={{ marginTop: 16 }}>
          <span style={{ color: "var(--r)", fontSize: 12 }}>{error}</span>
        </div>}

        <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label className="sgl-label">Razao Social *</label>
            <input className="sgl-input" required
              value={form.company_name} onChange={(e) => set("company_name", e.target.value)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label className="sgl-label">CNPJ</label>
              <input className="sgl-input"
                value={form.cnpj} onChange={(e) => set("cnpj", e.target.value)} />
            </div>
            <div>
              <label className="sgl-label">Nome Fantasia</label>
              <input className="sgl-input"
                value={form.trading_name} onChange={(e) => set("trading_name", e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="sgl-label">Email do Responsavel *</label>
            <input className="sgl-input" type="email" required
              value={form.owner_email} onChange={(e) => set("owner_email", e.target.value)} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="sgl-label">Senha * (min. 8 caracteres)</label>
            <input className="sgl-input" type="password" required minLength={8}
              value={form.owner_password} onChange={(e) => set("owner_password", e.target.value)} />
          </div>
          <button type="submit" className="sgl-btn" disabled={loading}
            style={{ width: "100%", justifyContent: "center" }}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: "center", fontSize: 12, color: "var(--fg2)" }}>
          Ja tem conta? <a href="/login" style={{ color: "var(--c)" }}>Entrar</a>
        </p>
      </div>
    </div>
  );
}
