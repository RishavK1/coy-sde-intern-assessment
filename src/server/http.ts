import { DomainError } from "./store";
export function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
export function failure(error: unknown) {
  if (error instanceof DomainError)
    return json({ error: error.message }, error.status);
  console.error(
    "Discover request failed",
    error instanceof Error ? error.name : "UnknownError",
  );
  return json({ error: "Something went wrong. Please try again." }, 500);
}
