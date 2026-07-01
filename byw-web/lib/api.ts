const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

let currentAccessToken: string | null = null;

export function setCurrentAccessToken(token: string | null): void {
  currentAccessToken = token;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export type ApiRequestOptions = Omit<RequestInit, 'headers'> & {
  token?: string;
  headers?: HeadersInit;
};

export function getApiUrl(): string {
  return API_URL;
}

export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { token, headers, ...rest } = options;
  const authToken = token ?? currentAccessToken ?? undefined;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    let message = response.statusText;

    try {
      const body: unknown = await response.json();
      if (
        body &&
        typeof body === 'object' &&
        'message' in body &&
        body.message
      ) {
        message = Array.isArray(body.message)
          ? body.message.join(', ')
          : String(body.message);
      }
    } catch {
      // respuesta no JSON
    }

    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
