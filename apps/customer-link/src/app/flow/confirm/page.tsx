"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";

export default function ConfirmPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", document_masked: "" });
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const linkId = sessionStorage.getItem("linkId");
      await api(`/flow/${linkId}/confirm`, {
        method: "POST",
        body: JSON.stringify({ ...form, confirmed: true }),
      });
      router.push("/flow/sign");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold text-flow-700">Confirme seus Dados</h1>
        {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome Completo *</label>
            <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-flow-500 focus:ring-flow-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Documento (mascarado)</label>
            <input value={form.document_masked} onChange={(e) => setForm({...form, document_masked: e.target.value})}
              placeholder="ex: ***123456**" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-flow-500 focus:ring-flow-500" />
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" required checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)}
              className="rounded border-gray-300" />
            <span className="text-sm text-gray-700">Confirmo que os dados estao corretos *</span>
          </label>

          <button type="submit" disabled={loading || !confirmed}
            className="w-full rounded-md bg-flow-600 px-4 py-2 text-white hover:bg-flow-700 disabled:opacity-50">
            {loading ? "Enviando..." : "Continuar"}
          </button>
        </form>
      </div>
    </div>
  );
}
