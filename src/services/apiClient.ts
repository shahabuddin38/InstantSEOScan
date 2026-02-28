type ApiResult<T = any> = {
  ok: boolean;
  status: number;
  data: T | null;
  error: string;
};

function normalizeErrorMessage(payload: any, fallback: string): string {
  if (!payload) return fallback;
  if (typeof payload === "string") return payload;
  if (typeof payload?.error === "string") return payload.error;
  if (typeof payload?.message === "string") return payload.message;
  return fallback;
}

export async function apiRequest<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(input, init);
    const contentType = res.headers.get("content-type") || "";

    let payload: any = null;
    if (contentType.includes("application/json")) {
      payload = await res.json();
    } else {
      const text = await res.text();
      payload = text;
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data: null,
        error: normalizeErrorMessage(payload, `Request failed with status ${res.status}`),
      };
    }

    if (!contentType.includes("application/json")) {
      return {
        ok: false,
        status: res.status,
        data: null,
        error: "API returned non-JSON response. Make sure backend server is running and /api is correctly proxied.",
      };
    }

    return {
      ok: true,
      status: res.status,
      data: payload as T,
      error: "",
    };
  } catch (error: any) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: error?.message || "Network error",
    };
  }
}
