export function getWebUrl(): string {
  return process.env.WEB_URL ?? 'http://localhost:3001';
}

export function getApiUrl(): string {
  return process.env.API_URL ?? 'http://127.0.0.1:3000';
}
