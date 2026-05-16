"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { api } from "@/lib/api";

export default function WalletPage() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const w = ethers.Wallet.createRandom();
    setAddress(w.address);
  }, []);

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const linkId = sessionStorage.getItem("linkId");
      await api(`/flow/${linkId}/wallet`, {
        method: "POST",
        body: JSON.stringify({ wallet_address: address, network: "sepolia" }),
      });
      setSubmitted(true);
      setTimeout(() => router.push("/flow/complete"), 1200);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!address) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg3)", fontFamily: "var(--mono)", fontSize: 11 }}>Gerando carteira...</div>;

  return (
    <div className="sgl-auth-wrap">
      <div className="sgl-auth-card sgl-fade-in">
        <div className="sgl-page-label">// Etapa 3 de 4</div>
        <h1 className="sgl-page-title" style={{ fontSize: "1.3rem", marginBottom: 16 }}>Carteira SGL</h1>

        {error && <div className="sgl-alert sgl-alert-r">
          <span style={{ color: "var(--r)", fontSize: 12 }}>{error}</span>
        </div>}
        {submitted && <div className="sgl-alert sgl-alert-g">
          <span style={{ color: "var(--g)", fontSize: 12 }}>Carteira registrada!</span>
        </div>}

        <div className="sgl-hash-box" style={{ marginBottom: 16 }}>
          <div className="sgl-hash-label">Seu Endereco SGL (Sepolia)</div>
          <div className="sgl-hash-val">{address}</div>
        </div>

        <div className="sgl-alert sgl-alert-y" style={{ marginBottom: 16 }}>
          <span style={{ color: "var(--y)", fontSize: 11 }}>
            A chave privada foi gerada apenas neste navegador e nunca e enviada ao servidor.
          </span>
        </div>

        <button className="sgl-btn" disabled={loading || submitted} onClick={handleSubmit}
          style={{ width: "100%", justifyContent: "center" }}>
          {loading ? "Registrando..." : submitted ? "Concluindo..." : "Continuar"}
        </button>
      </div>
    </div>
  );
}
