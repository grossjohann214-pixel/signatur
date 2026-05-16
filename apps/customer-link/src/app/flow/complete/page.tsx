"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function CompletePage() {
  const router = useRouter();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const linkId = sessionStorage.getItem("linkId");
    if (!linkId) {
      setError("Link invalido");
      setLoading(false);
      return;
    }
    api(`/flow/${linkId}/complete`, { method: "POST" })
      .then((data) => {
        setResult(data);
        sessionStorage.clear();
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex min-h-screen items-center justify-center">Finalizando...</div>;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg text-center">
        {error ? (
          <>
            <h1 className="mb-4 text-2xl font-bold text-red-600">Erro</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={() => router.push("/")}
              className="w-full rounded-md bg-flow-600 px-4 py-2 text-white hover:bg-flow-700">
              Voltar
            </button>
          </>
        ) : (
          <>
            <h1 className="mb-2 text-3xl font-bold text-green-600">✓ Concluido!</h1>
            <p className="mb-6 text-gray-600">Seu procedimento foi registrado com sucesso.</p>

            <div className="mb-6 space-y-3 rounded-lg bg-green-50 p-4 text-left text-sm">
              <p><strong>Protocolo:</strong> {result?.protocol_number}</p>
              {result?.web3_tx_hash && <p><strong>Tx Hash:</strong> {result.web3_tx_hash.slice(0, 20)}...</p>}
              {result?.audit_id && <p><strong>Auditoria:</strong> {result.audit_id}</p>}
            </div>

            <p className="text-xs text-gray-500">Guarde seu protocolo para referencia futura.</p>
          </>
        )}
      </div>
    </div>
  );
}
