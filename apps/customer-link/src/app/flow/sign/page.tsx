"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { api } from "@/lib/api";

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function SignPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasDrawn, setHasDrawn] = useState(false);
  const drawing = useRef(false);

  function pos(e: React.MouseEvent<HTMLCanvasElement>) {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.height / r.height) };
  }

  function start(e: React.MouseEvent<HTMLCanvasElement>) {
    drawing.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.strokeStyle = "#06B6D4";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }
  function move(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    setHasDrawn(true);
  }
  function end() { drawing.current = false; }

  function clear() {
    const c = canvasRef.current!;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    setHasDrawn(false);
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const imageData = canvasRef.current!.toDataURL();
      const hash = await sha256Hex(imageData);
      const linkId = sessionStorage.getItem("linkId");
      await api(`/flow/${linkId}/sign`, {
        method: "POST",
        body: JSON.stringify({ signature_hash: hash }),
      });
      router.push("/flow/wallet");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sgl-auth-wrap">
      <div className="sgl-auth-card sgl-fade-in">
        <div className="sgl-page-label">// Etapa 2 de 4</div>
        <h1 className="sgl-page-title" style={{ fontSize: "1.3rem", marginBottom: 16 }}>Assine Digitalmente</h1>

        {error && <div className="sgl-alert sgl-alert-r">
          <span style={{ color: "var(--r)", fontSize: 12 }}>{error}</span>
        </div>}

        <canvas ref={canvasRef} width={380} height={160}
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          style={{ width: "100%", height: 160, border: "1px solid var(--bdc)", background: "rgba(6,182,212,.03)", cursor: "crosshair", display: "block", marginBottom: 12 }} />

        <div style={{ display: "flex", gap: 8 }}>
          <button className="sgl-btn-o" onClick={clear}>Limpar</button>
          <button className="sgl-btn" disabled={!hasDrawn || loading} onClick={handleSubmit}
            style={{ marginLeft: "auto" }}>
            {loading ? "Enviando..." : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}
