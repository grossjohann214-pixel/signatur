"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ company_name: "", cnpj: "", trading_name: "", owner_email: "", owner_password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/partners/register", { method: "POST", body: JSON.stringify(form) });
      // Auto-login
      const login = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: form.owner_email, password: form.owner_password }),
      });
      localStorage.setItem("token", login.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-brand-700">Cadastro de Parceiro</h1>
        {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Razao Social *</label>
            <input required value={form.company_name} onChange={(e) => set("company_name", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">CNPJ</label>
            <input value={form.cnpj} onChange={(e) => set("cnpj", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome Fantasia</label>
            <input value={form.trading_name} onChange={(e) => set("trading_name", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email do Responsavel *</label>
            <input type="email" required value={form.owner_email} onChange={(e) => set("owner_email", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Senha *</label>
            <input type="password" required minLength={8} value={form.owner_password} onChange={(e) => set("owner_password", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 disabled:opacity-50">
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          Ja tem conta? <a href="/login" className="text-brand-600 hover:underline">Entrar</a>
        </p>
      </div>
    </div>
  );
}
