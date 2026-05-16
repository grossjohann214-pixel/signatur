"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function ContractPage() {
  const router = useRouter();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    api("/partners/me/generated-contract")
      .then(setContract)
      .catch((err) => setError(err.message));
  }, []);

  async function handleAccept() {
    setLoading(true);
    setError("");
    try {
      await api("/partners/me/accept-contract", { method: "POST" });
      setAccepted(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!contract && !error) return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-700">Contrato de Parceria</h1>
      {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {accepted && <p className="mb-4 rounded bg-green-50 p-3 text-sm text-green-600">Contrato aceito! Aguarde aprovacao.</p>}
      {contract && (
        <>
          <div className="mb-4 rounded-lg bg-white p-6 shadow" dangerouslySetInnerHTML={{ __html: contract.generated_html }} />
          <p className="mb-4 text-xs text-gray-400">Hash: {contract.contract_hash}</p>
          {contract.status === "generated" && !accepted && (
            <button onClick={handleAccept} disabled={loading}
              className="w-full rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 disabled:opacity-50">
              {loading ? "Aceitando..." : "Aceitar Contrato"}
            </button>
          )}
          {contract.status === "accepted" && <p className="text-center text-green-600 font-medium">Contrato ja aceito</p>}
        </>
      )}
      <a href="/dashboard" className="mt-4 block text-center text-sm text-brand-600 hover:underline">Voltar</a>
    </div>
  );
}
