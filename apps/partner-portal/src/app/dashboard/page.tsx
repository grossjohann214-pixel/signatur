"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: "Rascunho", color: "bg-gray-100 text-gray-800" },
  pending_review: { label: "Em Revisao", color: "bg-yellow-100 text-yellow-800" },
  contract_accepted: { label: "Contrato Aceito", color: "bg-blue-100 text-blue-800" },
  approved: { label: "Aprovado", color: "bg-green-100 text-green-800" },
  rejected: { label: "Rejeitado", color: "bg-red-100 text-red-800" },
  changes_requested: { label: "Ajustes Solicitados", color: "bg-orange-100 text-orange-800" },
};

export default function DashboardPage() {
  const router = useRouter();
  const [partner, setPartner] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    Promise.all([api("/partners/me"), api("/partners/me/status")])
      .then(([p, s]) => { setPartner(p); setStatus(s); })
      .catch(() => { localStorage.removeItem("token"); router.push("/login"); });
  }, [router]);

  if (!partner || !status) return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;

  const st = STATUS_MAP[status.status] || { label: status.status, color: "bg-gray-100" };

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-700">Dashboard do Parceiro</h1>
        <button onClick={() => { localStorage.removeItem("token"); router.push("/login"); }}
          className="text-sm text-gray-500 hover:text-gray-700">Sair</button>
      </div>

      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold">Dados da Empresa</h2>
        <p><strong>Razao Social:</strong> {partner.company_name}</p>
        <p><strong>CNPJ:</strong> {partner.cnpj || "N/A"}</p>
        <p><strong>Nome Fantasia:</strong> {partner.trading_name || "N/A"}</p>
        <div className="mt-4">
          <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${st.color}`}>{st.label}</span>
          {status.production_released && (
            <span className="ml-2 inline-block rounded-full bg-green-500 px-3 py-1 text-sm font-medium text-white">Producao Liberada</span>
          )}
        </div>
      </div>

      {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 md:grid-cols-3">
        {status.status === "draft" || status.status === "changes_requested" ? (
          <a href="/dashboard/scope" className="rounded-lg bg-white p-6 shadow hover:shadow-md transition">
            <h3 className="font-semibold text-brand-600">Solicitar Escopo</h3>
            <p className="mt-2 text-sm text-gray-500">Defina os tipos de procedimento</p>
          </a>
        ) : null}

        {status.status === "pending_review" ? (
          <a href="/dashboard/contract" className="rounded-lg bg-white p-6 shadow hover:shadow-md transition">
            <h3 className="font-semibold text-brand-600">Ver Contrato</h3>
            <p className="mt-2 text-sm text-gray-500">Visualize e aceite o contrato</p>
          </a>
        ) : null}

        {status.production_released ? (
          <>
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="font-semibold text-green-600">Procedimentos</h3>
              <p className="mt-2 text-sm text-gray-500">Criar e gerenciar procedimentos</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="font-semibold text-green-600">Clientes</h3>
              <p className="mt-2 text-sm text-gray-500">Cadastrar e gerenciar clientes</p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
