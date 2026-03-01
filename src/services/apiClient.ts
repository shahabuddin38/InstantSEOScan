type ApiResult<T = any> = {
  ok: boolean;
  status: number;
  data: T | null;
  error: string;
};

export const NON_JSON_API_EVENT = "api:non-json-response";

function resolveApiInput(input: RequestInfo | URL): RequestInfo | URL {
  const baseUrl = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;

  if (!baseUrl || typeof input !== "string") {
    return input;
  }

  if (!input.startsWith("/api")) {
    return input;
  }

  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const inputPath = input.replace(/\/+$/, "");

  if (/\/api$/i.test(normalizedBase)) {
    const suffix = inputPath.replace(/^\/api/, "") || "";
    return `${normalizedBase}${suffix}`;
  }

  return `${normalizedBase}${inputPath}`;
}

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
  const resolvedInput = resolveApiInput(input);
  const requestInit: RequestInit = {
    ...init,
    credentials: init?.credentials || "include",
  };

  try {
    const res = await fetch(resolvedInput, requestInit);
    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const isNonJson = !isJson;

    let payload: any = null;
    if (isJson) {
      payload = await res.json();
    } else {
      const text = await res.text();
      payload = text;
    }

    if (isNonJson && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(NON_JSON_API_EVENT, {
          detail: {
            path: typeof input === "string" ? input : input.toString(),
            status: res.status,
            contentType,
          },
        })
      );
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data: null,
        error: isNonJson
          ? "Unexpected response from server. Please try again or contact support."
          : normalizeErrorMessage(payload, `Request failed with status ${res.status}`),
      };
    }

    if (isNonJson) {
      return {
        ok: false,
        status: res.status,
        data: null,
        error: "API returned an unexpected response format.",
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
