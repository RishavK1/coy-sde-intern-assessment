export async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const body = await response.json();
  if (!response.ok)
    throw new Error(body.error ?? "Unable to connect. Please try again.");
  return body as T;
}
