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
    if (!linkId) { setError("Link invalido"); setLoading(false); return; }
    api(`/flow/${linkId}/complete`, { method: "POST" })
      .then((data) => { setResult(data); sessionStorage.clear(); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg3)", fontFamily: "var(--mono)", fontSize: 11 }}>Finalizando...</div>;

  return (
    <div className="sgl-auth-wrap">
      <div className="sgl-auth-card sgl-fade-in" style={{ textAlign: "center" }}>
        {error ? (
          <>
            <h1 className="sgl-page-title" style={{ fontSize: "1.3rem", marginBottom: 12 }}>Erro</h1>
            <p style={{ color: "var(--fg2)", fontSize: 13, marginBottom: 20 }}>{error}</p>
            <button className="sgl-btn" onClick={() => router.push("/")}
              style={{ width: "100%", justifyContent: "center" }}>Voltar</button>
          </>
        ) : (
          <>
            <div style={{ width: 56, height: 56, border: "1px solid var(--g20)", background: "var(--g12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 24, color: "var(--g)" }}>✓</div>
            <h1 className="sgl-page-title" style={{ fontSize: "1.4rem", marginBottom: 8 }}>Concluido!</h1>
            <p style={{ color: "var(--fg2)", fontSize: 12, marginBottom: 20 }}>
              Seu procedimento foi registrado com sucesso.
            </p>

            <div className="sgl-hash-box" style={{ textAlign: "left", marginBottom: 8 }}>
              <div className="sgl-hash-label">Numero de Protocolo</div>
              <div className="sgl-hash-val">{result?.protocol_number}</div>
            </div>
            <div className="sgl-hash-box" style={{ textAlign: "left", marginBottom: 8 }}>
              <div className="sgl-hash-label">Hash da Evidencia</div>
              <div className="sgl-hash-val">{result?.evidence_hash}</div>
            </div>
            {result?.web3_tx_hash && (
              <div className="sgl-hash-box" style={{ textAlign: "left" }}>
                <div className="sgl-hash-label">TX Hash (Sepolia)</div>
                <div className="sgl-hash-val">{result.web3_tx_hash}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
