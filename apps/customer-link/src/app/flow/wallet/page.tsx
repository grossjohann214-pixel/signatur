"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { api } from "@/lib/api";

type LocalWallet = {
  address: string;
  privateKey: string;
  mnemonicPhrase: string | null;
};

async function sha256Text(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

export default function WalletPage() {
  const router = useRouter();

  const [wallet, setWallet] = useState<LocalWallet | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const created = ethers.Wallet.createRandom();

    setWallet({
      address: created.address,
      privateKey: created.privateKey,
      mnemonicPhrase: created.mnemonic?.phrase || null,
    });

    setLoading(false);
  }, []);

  const recoveryFile = useMemo(() => {
    if (!wallet) return "";

    return [
      "SingulAI Validate — Chave de Recuperação Local",
      "",
      "IMPORTANTE:",
      "Este arquivo foi gerado somente no seu navegador.",
      "O SingulAI não armazena sua chave privada nem sua frase de recuperação.",
      "Guarde este arquivo em local seguro.",
      "",
      `Address: ${wallet.address}`,
      `Network: sepolia`,
      "",
      wallet.mnemonicPhrase ? `Mnemonic Phrase: ${wallet.mnemonicPhrase}` : "Mnemonic Phrase: N/A",
      `Private Key: ${wallet.privateKey}`,
      "",
      `Generated At: ${new Date().toISOString()}`,
    ].join("\n");
  }, [wallet]);

  function handleDownload() {
    if (!wallet) return;

    downloadTextFile(
      `singulai-wallet-${wallet.address.slice(0, 10)}.txt`,
      recoveryFile
    );

    setDownloaded(true);
  }

  async function handleSubmit() {
    if (!wallet) return;

    if (!downloaded || !confirmed) {
      setError("Baixe e confirme a guarda da chave antes de continuar.");
      return;
    }

    const linkId = sessionStorage.getItem("linkId");
    if (!linkId) {
      setError("Link inválido ou sessão expirada.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const keySavedConfirmationHash = await sha256Text(
        JSON.stringify({
          schema_version: "sgl.wallet.confirmation.v1",
          wallet_address: wallet.address,
          network: "sepolia",
          confirmed_at: new Date().toISOString(),
          statement:
            "User confirmed local backup of recovery key. SingulAI did not receive private key or mnemonic.",
        })
      );

      await api(`/flow/${linkId}/wallet`, {
        method: "POST",
        body: JSON.stringify({
          wallet_address: wallet.address,
          network: "sepolia",
          key_saved_confirmation_hash: keySavedConfirmationHash,
        }),
      });

      setSubmitted(true);

      setWallet((current) =>
        current
          ? {
              address: current.address,
              privateKey: "",
              mnemonicPhrase: null,
            }
          : null
      );

      setTimeout(() => router.push("/flow/complete"), 1200);
    } catch (err: any) {
      setError(err.message || "Erro ao registrar wallet.");
    } finally {
      setLoading(false);
    }
  }

  if (loading || !wallet) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        Gerando wallet...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-white p-8 text-slate-900 shadow-2xl">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Carteira SGL</h1>
        <p className="mb-6 text-sm text-slate-500">
          Esta wallet foi criada localmente no seu navegador.
        </p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {submitted && (
          <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600">
            Carteira registrada. Finalizando...
          </p>
        )}

        <div className="mb-5 rounded-xl bg-slate-50 p-4">
          <p className="mb-1 text-xs text-slate-500">Endereço público</p>
          <p className="break-all font-mono text-sm text-slate-900">
            {wallet.address}
          </p>
        </div>

        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Baixe e guarde sua chave de recuperação. Ela será exibida somente
          localmente. O backend receberá apenas o endereço público e a confirmação
          criptográfica de guarda.
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleDownload}
            disabled={submitted}
            className="w-full rounded-lg border-2 border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Baixar chave de recuperação
          </button>

          <label className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={confirmed}
              disabled={!downloaded || submitted}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-1"
            />
            <span>
              Confirmo que baixei e guardei minha chave de recuperação. Entendo
              que o SingulAI não armazena minha chave privada.
            </span>
          </label>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!downloaded || !confirmed || loading || submitted}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Registrando..." : submitted ? "Concluindo..." : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}
