"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const me = await api("/auth/me", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      if (me.role !== "admin") throw new Error("Acesso negado: requer role admin");
      localStorage.setItem("admin_token", data.access_token);
      router.push("/partners");
    } catch (err: any) {
      setError(err.message || "Falha no login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sgl-auth-wrap">
      <div className="sgl-auth-card sgl-fade-in">
        <div className="sgl-brand">
          <div className="sgl-brand-logo">SV</div>
          <div className="sgl-brand-name">Singul<span>AI</span> Validate</div>
        </div>
        <div className="sgl-page-label" style={{ justifyContent: "center" }}>
          // Admin Console
        </div>

        {error && <div className="sgl-alert sgl-alert-r" style={{ marginTop: 16 }}>
          <span style={{ color: "var(--r)", fontSize: 12 }}>{error}</span>
        </div>}

        <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 18 }}>
            <label className="sgl-label">Email</label>
            <input className="sgl-input" type="email" required
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="sgl-label">Senha</label>
            <input className="sgl-input" type="password" required
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="sgl-btn" disabled={loading}
            style={{ width: "100%", justifyContent: "center" }}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
