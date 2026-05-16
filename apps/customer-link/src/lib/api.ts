const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:4000";

type ApiOptions = RequestInit & {
  token?: string | null;
};

export async function api(path: string, options: ApiOptions = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data?.message
        ? Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message
        : typeof data === "string" && data.length > 0
          ? data
          : `HTTP ${response.status}`;

    throw new Error(message);
  }

  return data;
}
