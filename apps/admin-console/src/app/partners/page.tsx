"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending_review: { label: "Aguardando Revisao", cls: "sgl-badge-y" },
  contract_accepted: { label: "Contrato Aceito", cls: "sgl-badge-c" },
  approved: { label: "Aprovado", cls: "sgl-badge-g" },
  rejected: { label: "Rejeitado", cls: "sgl-badge-r" },
  changes_requested: { label: "Ajustes Solicitados", cls: "sgl-badge-y" },
};

export default function PartnersPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.push("/login"); return; }
    api("/admin/partners/pending")
      .then(setPartners)
      .catch((err) => {
        if (String(err.message).includes("401")) { localStorage.removeItem("admin_token"); router.push("/login"); }
        else setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [router]);

  function logout() {
    localStorage.removeItem("admin_token");
    router.push("/login");
  }

  if (loading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg3)", fontFamily: "var(--mono)", fontSize: 11 }}>Carregando...</div>;
  }

  return (
    <div style={{ position: "relative", zIndex: 1, padding: 32, maxWidth: 1080, margin: "0 auto" }} className="sgl-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <div className="sgl-page-label">// SingulAI Interno</div>
          <h1 className="sgl-page-title">Parceiros Pendentes</h1>
          <p className="sgl-page-sub">Revise e aprove o onboarding dos parceiros.</p>
        </div>
        <button className="sgl-btn-o" onClick={logout}>Sair</button>
      </div>

      {error && <div className="sgl-alert sgl-alert-r">
        <span style={{ color: "var(--r)", fontSize: 12 }}>{error}</span>
      </div>}

      {partners.length === 0 ? (
        <div className="sgl-card" style={{ textAlign: "center", color: "var(--fg3)" }}>
          Nenhum parceiro pendente
        </div>
      ) : (
        <table className="sgl-table">
          <thead>
            <tr>
              <th>Razao Social</th>
              <th>CNPJ</th>
              <th>Status</th>
              <th>Criado em</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => {
              const st = STATUS_MAP[p.status] || { label: p.status, cls: "sgl-badge-muted" };
              return (
                <tr key={p.id}>
                  <td style={{ color: "var(--fg)" }}>{p.company_name}</td>
                  <td style={{ fontFamily: "var(--mono)", fontSize: 11 }}>{p.cnpj || "N/A"}</td>
                  <td><span className={`sgl-badge ${st.cls}`}>{st.label}</span></td>
                  <td style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--fg3)" }}>
                    {new Date(p.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td>
                    <Link href={`/partners/${p.id}`} style={{ color: "var(--c)", fontSize: 12, fontWeight: 600 }}>
                      Revisar
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
