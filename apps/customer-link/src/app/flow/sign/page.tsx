"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { api } from "@/lib/api";

async function sha256Text(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function SignPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signed, setSigned] = useState(false);
  const [hasInk, setHasInk] = useState(false);

  function getPosition(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  function startDrawing(event: React.PointerEvent<HTMLCanvasElement>) {
    event.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { x, y } = getPosition(event);

    drawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0f172a";
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(event: React.PointerEvent<HTMLCanvasElement>) {
    event.preventDefault();

    if (!drawingRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { x, y } = getPosition(event);

    ctx.lineTo(x, y);
    ctx.stroke();

    setHasInk(true);
    setSigned(false);
  }

  function stopDrawing(event: React.PointerEvent<HTMLCanvasElement>) {
    event.preventDefault();

    drawingRef.current = false;

    const canvas = canvasRef.current;
    if (canvas?.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSigned(false);
    setHasInk(false);
    setError("");
  }

  async function handleSubmit() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!hasInk || !signed) {
      setError("Assine e confirme a assinatura antes de continuar.");
      return;
    }

    const linkId = sessionStorage.getItem("linkId");
    if (!linkId) {
      setError("Link inválido ou sessão expirada.");
      return;
    }

    const imageData = canvas.toDataURL("image/png");
    const signatureHash = await sha256Text(
      JSON.stringify({
        schema_version: "sgl.signature.v1",
        signature_data_url: imageData,
        signed_at: new Date().toISOString(),
      })
    );

    setLoading(true);
    setError("");

    try {
      await api(`/flow/${linkId}/sign`, {
        method: "POST",
        body: JSON.stringify({
          signature_hash: signatureHash,
          signed_at: new Date().toISOString(),
        }),
      });

      router.push("/flow/wallet");
    } catch (err: any) {
      setError(err.message || "Erro ao registrar assinatura.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-white p-8 text-slate-900 shadow-2xl">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Assine Digitalmente</h1>
        <p className="mb-6 text-sm text-slate-500">
          Use o dedo ou mouse para assinar no campo abaixo.
        </p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <canvas
          ref={canvasRef}
          width={600}
          height={260}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          className="mb-4 h-[180px] w-full cursor-crosshair rounded-xl border-2 border-slate-300 bg-white"
          style={{ touchAction: "none" }}
        />

        <div className="space-y-3">
          <button
            type="button"
            onClick={clearCanvas}
            className="w-full rounded-lg border-2 border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
          >
            Limpar Assinatura
          </button>

          <button
            type="button"
            onClick={() => {
              if (!hasInk) {
                setError("O campo de assinatura ainda está vazio.");
                return;
              }
              setSigned(true);
              setError("");
            }}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Confirmar Assinatura
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!signed || loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}
