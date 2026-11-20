import { getStore } from "@/server/store";
import { json, failure } from "@/server/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET() {
  try {
    return json({ feed: getStore().feed() });
  } catch (error) {
    return failure(error);
  }
}
