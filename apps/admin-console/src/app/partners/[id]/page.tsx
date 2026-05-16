"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";

export default function PartnerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const partnerId = params.id as string;
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api(`/admin/partners/${partnerId}`)
      .then(setDetail)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [partnerId]);

  async function handleAction(action: string, label: string) {
    if (action === "release-production" && !confirm("Liberar producao para este parceiro?")) return;
    setActionLoading(true);
    setError("");
    setSuccess("");
    try {
      await api(`/admin/partners/${partnerId}/${action}`, { method: "POST" });
      setSuccess(`${label} com sucesso!`);
      setTimeout(() => router.push("/partners"), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg3)", fontFamily: "var(--mono)", fontSize: 11 }}>Carregando...</div>;
  }
  if (!detail) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg3)" }}>Nao encontrado</div>;
  }

  const { partner, scopes, contract } = detail;

  return (
    <div style={{ position: "relative", zIndex: 1, padding: 32, maxWidth: 820, margin: "0 auto" }} className="sgl-fade-in">
      <a href="/partners" style={{ color: "var(--c)", fontSize: 12 }}>&larr; Voltar</a>
      <h1 className="sgl-page-title" style={{ marginTop: 12, marginBottom: 24 }}>{partner.company_name}</h1>

      {error && <div className="sgl-alert sgl-alert-r">
        <span style={{ color: "var(--r)", fontSize: 12 }}>{error}</span>
      </div>}
      {success && <div className="sgl-alert sgl-alert-g">
        <span style={{ color: "var(--g)", fontSize: 12 }}>{success}</span>
      </div>}

      <div className="sgl-card" style={{ marginBottom: 16 }}>
        <div className="sgl-section-label" style={{ marginBottom: 16 }}>Dados da Empresa</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div><div className="sgl-hash-label">CNPJ</div><div style={{ fontSize: 14, color: "var(--fg)" }}>{partner.cnpj || "N/A"}</div></div>
          <div><div className="sgl-hash-label">Nome Fantasia</div><div style={{ fontSize: 14, color: "var(--fg)" }}>{partner.trading_name || "N/A"}</div></div>
          <div><div className="sgl-hash-label">Status</div><div style={{ fontSize: 14, color: "var(--fg)" }}>{partner.status}</div></div>
          <div><div className="sgl-hash-label">Criado em</div><div style={{ fontSize: 14, color: "var(--fg)" }}>{new Date(partner.created_at).toLocaleDateString("pt-BR")}</div></div>
        </div>
      </div>

      {scopes && scopes.length > 0 && (
        <div className="sgl-card" style={{ marginBottom: 16 }}>
          <div className="sgl-section-label" style={{ marginBottom: 12 }}>Escopos Solicitados</div>
          {scopes.map((s: any) => (
            <div key={s.id} style={{ fontSize: 13, color: "var(--fg2)", padding: "6px 0", borderBottom: "1px solid var(--bd)" }}>
              <strong style={{ color: "var(--fg)" }}>{s.request_type}</strong> — {s.status}
            </div>
          ))}
        </div>
      )}

      {contract && (
        <div className="sgl-card" style={{ marginBottom: 16 }}>
          <div className="sgl-section-label" style={{ marginBottom: 12 }}>Contrato</div>
          <p style={{ fontSize: 13, color: "var(--fg2)", marginBottom: 8 }}>Status: <strong style={{ color: "var(--fg)" }}>{contract.status}</strong></p>
          <div className="sgl-hash-box">
            <div className="sgl-hash-label">Contract Hash</div>
            <div className="sgl-hash-val">{contract.contract_hash}</div>
          </div>
        </div>
      )}

      <div className="sgl-card">
        <div className="sgl-section-label" style={{ marginBottom: 16 }}>Acoes de Aprovacao</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {partner.status === "pending_review" && (
            <>
              <button className="sgl-btn-o" disabled={actionLoading}
                onClick={() => handleAction("request-changes", "Ajustes solicitados")}
                style={{ width: "100%", justifyContent: "center" }}>
                Solicitar Ajustes
              </button>
              <button className="sgl-btn" disabled={actionLoading}
                onClick={() => handleAction("approve", "Parceiro aprovado")}
                style={{ width: "100%", justifyContent: "center" }}>
                Aprovar
              </button>
              <button className="sgl-btn sgl-btn-danger" disabled={actionLoading}
                onClick={() => handleAction("reject", "Parceiro rejeitado")}
                style={{ width: "100%", justifyContent: "center" }}>
                Rejeitar
              </button>
            </>
          )}
          {partner.status === "contract_accepted" && (
            <button className="sgl-btn" disabled={actionLoading}
              onClick={() => handleAction("approve", "Parceiro aprovado")}
              style={{ width: "100%", justifyContent: "center" }}>
              Aprovar
            </button>
          )}
          {partner.status === "approved" && !partner.production_released && (
            <button className="sgl-btn" disabled={actionLoading}
              onClick={() => handleAction("release-production", "Producao liberada")}
              style={{ width: "100%", justifyContent: "center" }}>
              Liberar Producao
            </button>
          )}
          {partner.production_released && (
            <div className="sgl-alert sgl-alert-g">
              <span style={{ color: "var(--g)", fontSize: 12 }}>Producao ja liberada</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
