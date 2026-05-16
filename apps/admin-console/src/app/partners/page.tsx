"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending_review: { label: "Aguardando Revisao", color: "bg-yellow-100 text-yellow-800" },
  contract_accepted: { label: "Contrato Aceito", color: "bg-blue-100 text-blue-800" },
  approved: { label: "Aprovado", color: "bg-green-100 text-green-800" },
  rejected: { label: "Rejeitado", color: "bg-red-100 text-red-800" },
  changes_requested: { label: "Ajustes Solicitados", color: "bg-orange-100 text-orange-800" },
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
        if (err.message.includes("401")) { localStorage.removeItem("admin_token"); router.push("/login"); }
        else setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;

  return (
    <div className="mx-auto max-w-6xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-admin-700">Parceiros Pendentes</h1>
        <button onClick={() => { localStorage.removeItem("admin_token"); router.push("/login"); }}
          className="text-sm text-gray-500 hover:text-gray-700">Sair</button>
      </div>

      {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {partners.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum parceiro pendente</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Razao Social</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">CNPJ</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Criado em</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {partners.map((p) => {
                const st = STATUS_MAP[p.status] || { label: p.status, color: "bg-gray-100" };
                return (
                  <tr key={p.id}>
                    <td className="px-6 py-4 text-sm">{p.company_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{p.cnpj || "N/A"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.created_at).toLocaleDateString("pt-BR")}</td>
                    <td className="px-6 py-4 text-center">
                      <Link href={`/partners/${p.id}`} className="text-admin-600 hover:underline text-sm font-medium">
                        Revisar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
