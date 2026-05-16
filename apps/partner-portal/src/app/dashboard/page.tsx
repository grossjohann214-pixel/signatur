"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft: { label: "Rascunho", cls: "sgl-badge-muted" },
  pending_review: { label: "Em Revisao", cls: "sgl-badge-y" },
  contract_accepted: { label: "Contrato Aceito", cls: "sgl-badge-c" },
  approved: { label: "Aprovado", cls: "sgl-badge-g" },
  rejected: { label: "Rejeitado", cls: "sgl-badge-r" },
  changes_requested: { label: "Ajustes Solicitados", cls: "sgl-badge-y" },
};

export default function DashboardPage() {
  const router = useRouter();
  const [partner, setPartner] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    Promise.all([api("/partners/me"), api("/partners/me/status")])
      .then(([p, s]) => { setPartner(p); setStatus(s); })
      .catch(() => { localStorage.removeItem("token"); router.push("/login"); });
  }, [router]);

  if (!partner || !status) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg3)", fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" }}>Carregando...</div>;
  }

  const st = STATUS_MAP[status.status] || { label: status.status, cls: "sgl-badge-muted" };

  function logout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <div style={{ position: "relative", zIndex: 1, padding: 32, maxWidth: 980, margin: "0 auto" }} className="sgl-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <div className="sgl-page-label">// Visao Geral</div>
          <h1 className="sgl-page-title">Dashboard do Parceiro</h1>
          <p className="sgl-page-sub">Acompanhe o status do seu onboarding.</p>
        </div>
        <button className="sgl-btn-o" onClick={logout}>Sair</button>
      </div>

      <div className="sgl-card" style={{ marginBottom: 24 }}>
        <div className="sgl-section-label" style={{ marginBottom: 16 }}>Dados da Empresa</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div className="sgl-hash-label">Razao Social</div>
            <div style={{ fontSize: 14, color: "var(--fg)", marginTop: 2 }}>{partner.company_name}</div>
          </div>
          <div>
            <div className="sgl-hash-label">CNPJ</div>
            <div style={{ fontSize: 14, color: "var(--fg)", marginTop: 2 }}>{partner.cnpj || "N/A"}</div>
          </div>
          <div>
            <div className="sgl-hash-label">Nome Fantasia</div>
            <div style={{ fontSize: 14, color: "var(--fg)", marginTop: 2 }}>{partner.trading_name || "N/A"}</div>
          </div>
          <div>
            <div className="sgl-hash-label">Status</div>
            <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
              <span className={`sgl-badge ${st.cls}`}>{st.label}</span>
              {status.production_released && (
                <span className="sgl-badge sgl-badge-g">Producao Liberada</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        {(status.status === "draft" || status.status === "changes_requested") && (
          <a href="/dashboard/scope" className="sgl-card" style={{ textDecoration: "none" }}>
            <div className="sgl-card-title" style={{ color: "var(--c)" }}>Solicitar Escopo</div>
            <p style={{ fontSize: 12, color: "var(--fg2)", marginTop: 4 }}>Defina os tipos de procedimento</p>
          </a>
        )}
        {status.status === "pending_review" && (
          <a href="/dashboard/contract" className="sgl-card" style={{ textDecoration: "none" }}>
            <div className="sgl-card-title" style={{ color: "var(--c)" }}>Ver Contrato</div>
            <p style={{ fontSize: 12, color: "var(--fg2)", marginTop: 4 }}>Visualize e aceite o contrato</p>
          </a>
        )}
        {status.production_released && (
          <>
            <div className="sgl-card">
              <div className="sgl-card-title" style={{ color: "var(--g)" }}>Procedimentos</div>
              <p style={{ fontSize: 12, color: "var(--fg2)", marginTop: 4 }}>Criar e gerenciar procedimentos</p>
            </div>
            <div className="sgl-card">
              <div className="sgl-card-title" style={{ color: "var(--g)" }}>Clientes</div>
              <p style={{ fontSize: 12, color: "var(--fg2)", marginTop: 4 }}>Cadastrar e gerenciar clientes</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
