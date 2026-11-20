import { z } from "zod";
import { getStore } from "@/server/store";
import { json, failure } from "@/server/http";
export const runtime = "nodejs";
const schema = z
  .object({
    profileId: z.string().min(1).max(80),
    decision: z.enum(["like", "pass"]),
  })
  .strict();
export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json"))
    return json({ error: "Expected application/json." }, 415);
  const body = await request.text();
  if (body.length > 1024) return json({ error: "Request is too large." }, 413);
  let raw: unknown;
  try {
    raw = JSON.parse(body);
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }
  const result = schema.safeParse(raw);
  if (!result.success)
    return json(
      { error: "Provide a profileId and a like or pass decision." },
      400,
    );
  try {
    return json(getStore().swipe(result.data.profileId, result.data.decision));
  } catch (error) {
    return failure(error);
  }
}
