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

  if (!contract && !error) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg3)", fontFamily: "var(--mono)", fontSize: 11 }}>Carregando...</div>;
  }

  return (
    <div style={{ position: "relative", zIndex: 1, padding: 32, maxWidth: 720, margin: "0 auto" }} className="sgl-fade-in">
      <div className="sgl-page-label">// Onboarding</div>
      <h1 className="sgl-page-title" style={{ marginBottom: 24 }}>Contrato de Parceria</h1>

      {error && <div className="sgl-alert sgl-alert-r">
        <span style={{ color: "var(--r)", fontSize: 12 }}>{error}</span>
      </div>}
      {accepted && <div className="sgl-alert sgl-alert-g">
        <span style={{ color: "var(--g)", fontSize: 12 }}>Contrato aceito! Aguarde aprovacao.</span>
      </div>}

      {contract && (
        <>
          <div className="sgl-card" style={{ marginBottom: 12 }}>
            <div dangerouslySetInnerHTML={{ __html: contract.generated_html }} />
          </div>
          <div className="sgl-hash-box" style={{ marginBottom: 16 }}>
            <div className="sgl-hash-label">Contract Hash (SHA-256)</div>
            <div className="sgl-hash-val">{contract.contract_hash}</div>
          </div>
          {contract.status === "generated" && !accepted && (
            <button className="sgl-btn" disabled={loading} onClick={handleAccept}
              style={{ width: "100%", justifyContent: "center" }}>
              {loading ? "Aceitando..." : "Aceitar Contrato"}
            </button>
          )}
          {contract.status === "accepted" && (
            <div className="sgl-alert sgl-alert-g">
              <span style={{ color: "var(--g)", fontSize: 12 }}>Contrato ja aceito</span>
            </div>
          )}
        </>
      )}

      <p style={{ marginTop: 16, textAlign: "center", fontSize: 12 }}>
        <a href="/dashboard" style={{ color: "var(--c)" }}>Voltar ao Dashboard</a>
      </p>
    </div>
  );
}
