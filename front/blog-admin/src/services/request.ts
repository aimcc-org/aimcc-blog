import { adminToken } from "../utils/session-token.ts";
const baseUrl =
  import.meta.env?.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "/api";
export class AdminApiError extends Error {
  readonly code: number;
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

export async function adminRequest<T>(
  path: string,
  body?: unknown,
): Promise<T> {
  const token = adminToken.get();
  const { response, result } = await requestEnvelope(
    `${baseUrl}/admin${path}`,
    {
      method: body === undefined ? "GET" : "POST",
      headers: {
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(token ? { satoken: token } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(15000),
    },
  );
  if (!response.ok || result.code !== 200) {
    const code = result.code ?? response.status;
    if (code === 401) adminToken.clear();
    throw new AdminApiError(result.message || "请求失败，请稍后重试", code);
  }
  return result.data as T;
}

export async function requestEnvelope(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  const result = await response.json();
  return { response, result };
}
