import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import seedProfiles from "./profiles.json";
import type {
  Decision,
  Match,
  Profile,
  SwipeResult,
} from "../features/discover/types";

const USER = "demo-user";
export class DomainError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function createStore(path: string) {
  if (path !== ":memory:")
    mkdirSync(dirname(resolve(path)), { recursive: true });
  const db = new Database(path);
  db.pragma("foreign_keys = ON");
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");
  db.exec(`CREATE TABLE IF NOT EXISTS profiles (id TEXT PRIMARY KEY, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS swipes (actor TEXT NOT NULL REFERENCES profiles(id), target TEXT NOT NULL REFERENCES profiles(id), decision TEXT NOT NULL CHECK(decision IN ('like','pass')), created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')), PRIMARY KEY(actor,target), CHECK(actor <> target));`);
  db.transaction(() => {
    const insert = db.prepare(
      "INSERT OR IGNORE INTO profiles(id,data) VALUES (?,?)",
    );
    insert.run(USER, JSON.stringify({ id: USER, name: "You" }));
    for (const profile of seedProfiles)
      insert.run(profile.id, JSON.stringify(profile));
    const like = db.prepare(
      "INSERT OR IGNORE INTO swipes(actor,target,decision) VALUES (?,?,'like')",
    );
    for (const id of [
      "profile-02",
      "profile-05",
      "profile-09",
      "profile-14",
      "profile-20",
      "profile-27",
    ])
      like.run(id, USER);
  })();
  const profile = (id: string): Profile | null => {
    const row = db.prepare("SELECT data FROM profiles WHERE id=?").get(id) as
      { data: string } | undefined;
    return row ? (JSON.parse(row.data) as Profile) : null;
  };
  const feed = (): Profile[] =>
    (
      db
        .prepare(
          "SELECT data FROM profiles p WHERE id <> ? AND NOT EXISTS (SELECT 1 FROM swipes s WHERE s.actor=? AND s.target=p.id) ORDER BY id",
        )
        .all(USER, USER) as { data: string }[]
    ).map((r) => JSON.parse(r.data) as Profile);
  const matches = (): Match[] =>
    (
      db
        .prepare(
          `SELECT p.data, a.created_at FROM swipes a JOIN swipes b ON b.actor=a.target AND b.target=a.actor JOIN profiles p ON p.id=a.target WHERE a.actor=? AND a.decision='like' AND b.decision='like' ORDER BY a.created_at DESC, p.id`,
        )
        .all(USER) as { data: string; created_at: string }[]
    ).map((r) => ({
      profile: JSON.parse(r.data) as Profile,
      matchedAt: r.created_at,
    }));
  const swipe = db.transaction(
    (id: string, decision: Decision): SwipeResult => {
      if (id === USER || !profile(id))
        throw new DomainError(404, "Profile not found.");
      const existing = db
        .prepare("SELECT decision FROM swipes WHERE actor=? AND target=?")
        .get(USER, id) as { decision: Decision } | undefined;
      if (existing) {
        if (existing.decision !== decision)
          throw new DomainError(
            409,
            "This profile has already been swiped on.",
          );
        return {
          createdMatch: false,
          match: matches().find((m) => m.profile.id === id) ?? null,
        };
      }
      db.prepare(
        "INSERT INTO swipes(actor,target,decision) VALUES (?,?,?)",
      ).run(USER, id, decision);
      const match =
        decision === "like"
          ? (matches().find((m) => m.profile.id === id) ?? null)
          : null;
      return { createdMatch: match !== null, match };
    },
  );
  return { feed, matches, swipe, close: () => db.close() };
}
let store: ReturnType<typeof createStore> | undefined;
export function getStore() {
  return (store ??= createStore(
    process.env.COY_DATABASE_PATH ?? "./data/coy.sqlite",
  ));
}
