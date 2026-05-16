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
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api(`/admin/partners/${partnerId}`)
      .then(setDetail)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [partnerId]);

  async function handleAction(action: "approve" | "reject" | "request-changes") {
    setActionLoading(true);
    setActionError("");
    setSuccess("");
    try {
      await api(`/admin/partners/${partnerId}/${action}`, { method: "POST" });
      setSuccess(`Parceiro ${action === "approve" ? "aprovado" : action === "reject" ? "rejeitado" : "solicitados ajustes"}!`);
      setTimeout(() => router.push("/partners"), 1500);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRelease() {
    if (!confirm("Liberar producao para este parceiro?")) return;
    setActionLoading(true);
    setActionError("");
    try {
      await api(`/admin/partners/${partnerId}/release-production`, { method: "POST" });
      setSuccess("Producao liberada!");
      setTimeout(() => router.push("/partners"), 1500);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
  if (!detail) return <div className="flex min-h-screen items-center justify-center">Nao encontrado</div>;

  const { partner, scopes, contract } = detail;

  return (
    <div className="mx-auto max-w-4xl p-8">
      <a href="/partners" className="mb-4 text-admin-600 hover:underline">← Voltar</a>

      <h1 className="mb-6 text-2xl font-bold text-admin-700">{partner.company_name}</h1>

      {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {actionError && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{actionError}</p>}
      {success && <p className="mb-4 rounded bg-green-50 p-3 text-sm text-green-600">{success}</p>}

      <div className="mb-6 space-y-4 rounded-lg bg-white p-6 shadow">
        <h2 className="font-semibold">Dados da Empresa</h2>
        <p><strong>CNPJ:</strong> {partner.cnpj || "N/A"}</p>
        <p><strong>Nome Fantasia:</strong> {partner.trading_name || "N/A"}</p>
        <p><strong>Status:</strong> {partner.status}</p>
        <p><strong>Criado em:</strong> {new Date(partner.created_at).toLocaleDateString("pt-BR")}</p>
      </div>

      {scopes && scopes.length > 0 && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 font-semibold">Escopos Solicitados</h2>
          <ul className="space-y-2">
            {scopes.map((s: any) => (
              <li key={s.id} className="text-sm">
                <strong>{s.request_type}</strong> — {s.status} ({new Date(s.created_at).toLocaleDateString("pt-BR")})
              </li>
            ))}
          </ul>
        </div>
      )}

      {contract && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 font-semibold">Contrato</h2>
          <p className="mb-2 text-sm"><strong>Status:</strong> {contract.status}</p>
          <p className="mb-2 text-xs text-gray-400"><strong>Hash:</strong> {contract.contract_hash}</p>
          {contract.accepted_at && (
            <p className="text-sm text-green-600"><strong>Aceito em:</strong> {new Date(contract.accepted_at).toLocaleDateString("pt-BR")}</p>
          )}
        </div>
      )}

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 font-semibold">Acoes de Aprovacao</h2>
        <div className="space-y-3">
          {partner.status === "pending_review" && (
            <>
              <button onClick={() => handleAction("request-changes")} disabled={actionLoading}
                className="w-full rounded-md bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 disabled:opacity-50">
                {actionLoading ? "Processando..." : "Solicitar Ajustes"}
              </button>
              <button onClick={() => handleAction("approve")} disabled={actionLoading}
                className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50">
                {actionLoading ? "Processando..." : "Aprovar"}
              </button>
              <button onClick={() => handleAction("reject")} disabled={actionLoading}
                className="w-full rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50">
                {actionLoading ? "Processando..." : "Rejeitar"}
              </button>
            </>
          )}

          {partner.status === "contract_accepted" && (
            <button onClick={() => handleAction("approve")} disabled={actionLoading}
              className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50">
              {actionLoading ? "Processando..." : "Aprovar"}
            </button>
          )}

          {partner.status === "approved" && !partner.production_released && (
            <button onClick={handleRelease} disabled={actionLoading}
              className="w-full rounded-md bg-admin-600 px-4 py-2 text-white hover:bg-admin-700 disabled:opacity-50">
              {actionLoading ? "Processando..." : "Liberar Producao"}
            </button>
          )}

          {partner.production_released && (
            <p className="rounded-md bg-green-50 p-3 text-center text-sm font-medium text-green-700">Producao ja liberada</p>
          )}
        </div>
      </div>
    </div>
  );
}
