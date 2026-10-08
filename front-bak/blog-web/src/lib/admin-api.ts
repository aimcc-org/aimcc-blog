const baseUrl =
  import.meta.env.PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "/api";
const TOKEN_KEY = "aimcc.admin.token";

export class AdminApiError extends Error {
  constructor(
    message: string,
    public code: number,
  ) {
    super(message);
  }
}

export const adminToken = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: (token: string) => sessionStorage.setItem(TOKEN_KEY, token),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
};

export async function adminRequest<T>(
  path: string,
  body?: unknown,
): Promise<T> {
  const token = adminToken.get();
  const response = await fetch(`${baseUrl}/admin${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { satoken: token } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(15000),
  });
  const result = await response.json();
  if (!response.ok || result.code !== 200) {
    const code = result.code ?? response.status;
    if (code === 401) adminToken.clear();
    throw new AdminApiError(result.message || "请求失败，请稍后重试", code);
  }
  return result.data as T;
}
