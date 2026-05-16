"use client";
import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function Redirector() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  useEffect(() => {
    router.push(token ? `/flow/start?token=${token}` : "/flow/start");
  }, [token, router]);
  return null;
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <Redirector />
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg3)", fontFamily: "var(--mono)", fontSize: 11 }}>
        Carregando...
      </div>
    </Suspense>
  );
}
