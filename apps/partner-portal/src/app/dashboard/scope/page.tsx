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
    <div className="mx-auto max-w-lg p-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-700">Solicitar Escopo</h1>
      {success && <p className="mb-4 rounded bg-green-50 p-3 text-sm text-green-600">Escopo solicitado com sucesso!</p>}
      {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo de Procedimento</label>
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500">
            {TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Descricao (opcional)</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 disabled:opacity-50">
          {loading ? "Enviando..." : "Solicitar"}
        </button>
      </form>
      <a href="/dashboard" className="mt-4 block text-center text-sm text-brand-600 hover:underline">Voltar</a>
    </div>
  );
}
