const DEFAULT_API_BASE_URL = "http://localhost:8000/api/v1";
const API_BASE_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL);

export type ApiErrorKind = "network" | "http" | "parse";

export class ApiError extends Error {
  status: number;
  kind: ApiErrorKind;

  constructor(status: number, message: string, kind: ApiErrorKind = "http") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.kind = kind;
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, "");
}

function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (API_BASE_URL.endsWith("/api/v1") && normalizedPath.startsWith("/api/v1/")) {
    return `${API_BASE_URL}${normalizedPath.slice("/api/v1".length)}`;
  }
  return `${API_BASE_URL}${normalizedPath}`;
}

function headersFrom(initHeaders: RequestInit["headers"], hasJsonBody: boolean): Record<string, string> {
  const headers: Record<string, string> = {};
  if (hasJsonBody) {
    headers["Content-Type"] = "application/json";
  }
  if (initHeaders instanceof Headers) {
    initHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  } else if (Array.isArray(initHeaders)) {
    for (const [key, value] of initHeaders) {
      headers[key] = value;
    }
  } else if (initHeaders) {
    Object.assign(headers, initHeaders as Record<string, string>);
  }
  return headers;
}

async function parseErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      const body = await response.json();
      return body.detail ?? body.error?.message ?? `Gradient AI API returned HTTP ${response.status}.`;
    }
    const text = await response.text();
    return text || response.statusText || `Gradient AI API returned HTTP ${response.status}.`;
  } catch {
    return response.statusText || `Gradient AI API returned HTTP ${response.status}.`;
  }
}

async function parseSuccessBody<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return undefined as T;
  }
  try {
    return (await response.json()) as T;
  } catch (error) {
    throw new ApiError(response.status, "Gradient AI returned an invalid JSON response.", "parse");
  }
}

export function getStoredToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("gradient_ai_token");
  }
  return null;
}

export function setStoredToken(token: string | null): void {
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("gradient_ai_token", token);
    } else {
      localStorage.removeItem("gradient_ai_token");
    }
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const hasJsonBody = typeof init.body === "string";
  const headers = headersFrom(init.headers, hasJsonBody);
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(buildApiUrl(path), {
      ...init,
      credentials: "include",
      headers,
    });
  } catch (error) {
    throw new ApiError(
      0,
      `Unable to connect to Gradient AI backend at ${API_BASE_URL}. Check that the FastAPI server is running and NEXT_PUBLIC_API_BASE_URL is correct.`,
      "network",
    );
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response), "http");
  }

  return parseSuccessBody<T>(response);
}

export async function downloadReportPdf(reportId: string, filename: string): Promise<void> {
  const token = getStoredToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(buildApiUrl(`/reports/${reportId}/download`), {
      credentials: "include",
      headers,
    });
  } catch {
    throw new ApiError(
      0,
      `Unable to connect to Gradient AI backend at ${API_BASE_URL}. Check that the FastAPI server is running before downloading reports.`,
      "network",
    );
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response));
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
