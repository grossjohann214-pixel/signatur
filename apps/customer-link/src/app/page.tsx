"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  useEffect(() => {
    if (token) {
      router.push(`/flow/start?token=${token}`);
    } else {
      router.push("/flow/start");
    }
  }, [token, router]);

  return <div className="flex min-h-screen items-center justify-center">Carregando...</div>;
}
