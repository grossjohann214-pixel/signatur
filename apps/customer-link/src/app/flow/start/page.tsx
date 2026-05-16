"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function StartPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [context, setContext] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Token nao fornecido");
      setLoading(false);
      return;
    }
    api("/flow/open", { method: "POST", body: JSON.stringify({ token }) })
      .then((data) => {
        setContext(data);
        sessionStorage.setItem("linkId", data.link_id);
        sessionStorage.setItem("procedureId", data.procedure_id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex min-h-screen items-center justify-center">Abrindo link...</div>;
  if (error) return <div className="flex min-h-screen items-center justify-center text-red-600">{error}</div>;
  if (!context) return null;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-2xl font-bold text-flow-700">Confirmacao e Assinatura</h1>
        <p className="mb-6 text-gray-500">Procedimento: {context.procedure_type}</p>

        <div className="mb-6 space-y-2 rounded-lg bg-flow-50 p-4">
          <p className="text-sm"><strong>Tipo:</strong> {context.procedure_type}</p>
          <p className="text-sm"><strong>Seu Papel:</strong> {context.participant_role}</p>
          <p className="text-sm text-gray-500">{context.participant_email}</p>
        </div>

        <button onClick={() => router.push("/flow/confirm")}
          className="w-full rounded-md bg-flow-600 px-4 py-2 text-white hover:bg-flow-700">
          Proxima Etapa
        </button>
      </div>
    </div>
  );
}
