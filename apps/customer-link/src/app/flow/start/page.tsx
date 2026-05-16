"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

function StartContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [context, setContext] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { setError("Token nao fornecido"); setLoading(false); return; }
    api("/flow/open", { method: "POST", body: JSON.stringify({ token }) })
      .then((data) => {
        setContext(data);
        sessionStorage.setItem("linkId", data.link_id);
        sessionStorage.setItem("procedureId", data.procedure_id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg3)", fontFamily: "var(--mono)", fontSize: 11 }}>Abrindo link...</div>;
  if (error) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--r)", fontSize: 13 }}>{error}</div>;
  if (!context) return null;

  return (
    <div className="sgl-auth-wrap">
      <div className="sgl-auth-card sgl-fade-in">
        <div className="sgl-brand">
          <div className="sgl-brand-logo">SV</div>
          <div className="sgl-brand-name">Singul<span>AI</span> Validate</div>
        </div>
        <div className="sgl-page-label" style={{ justifyContent: "center" }}>// Confirmacao e Assinatura</div>

        <div className="sgl-hash-box" style={{ marginTop: 24, marginBottom: 24 }}>
          <div className="sgl-hash-label">Tipo</div>
          <div style={{ fontSize: 13, color: "var(--fg)", marginBottom: 12 }}>{context.procedure_type}</div>
          <div className="sgl-hash-label">Seu Papel</div>
          <div style={{ fontSize: 13, color: "var(--fg)" }}>{context.participant_role}</div>
        </div>

        <button className="sgl-btn" onClick={() => router.push("/flow/confirm")}
          style={{ width: "100%", justifyContent: "center" }}>
          Proxima Etapa
        </button>
      </div>
    </div>
  );
}

export default function StartPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <StartContent />
    </Suspense>
  );
}
