import { afterEach, describe, expect, it } from "vitest";
import { createStore } from "../src/server/store";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const stores: ReturnType<typeof createStore>[] = [];
const open = (path = ":memory:") => {
  const s = createStore(path);
  stores.push(s);
  return s;
};
afterEach(() => {
  for (const s of stores.splice(0)) s.close();
});
describe("Discover privacy and persistence", () => {
  it("seeds complete profiles without exposing incoming likes", () => {
    const s = open();
    expect(s.feed().length).toBeGreaterThanOrEqual(30);
    for (const p of s.feed()) {
      expect(Object.keys(p).sort()).toEqual([
        "age",
        "bio",
        "id",
        "interests",
        "location",
        "name",
        "photo",
      ]);
      expect(p.age).toBeGreaterThanOrEqual(18);
    }
    expect(s.matches()).toEqual([]);
  });
  it("matches only reciprocal likes and removes every decision from feed", () => {
    const s = open();
    expect(s.swipe("profile-01", "like").createdMatch).toBe(false);
    expect(s.swipe("profile-02", "like").createdMatch).toBe(true);
    expect(s.swipe("profile-05", "pass").createdMatch).toBe(false);
    expect(s.matches()).toHaveLength(1);
    expect(s.feed().map((p) => p.id)).not.toContain("profile-05");
  });
  it("makes retries safe and decisions final", () => {
    const s = open();
    s.swipe("profile-02", "like");
    expect(s.swipe("profile-02", "like").createdMatch).toBe(false);
    expect(s.matches()).toHaveLength(1);
    expect(() => s.swipe("profile-02", "pass")).toThrow("already");
    expect(() => s.swipe("missing", "like")).toThrow("not found");
  });
  it("persists decisions across database connections", () => {
    const dir = mkdtempSync(join(tmpdir(), "coy-"));
    const path = join(dir, "test.sqlite");
    const first = createStore(path);
    first.swipe("profile-02", "like");
    first.close();
    const second = createStore(path);
    expect(second.matches()).toHaveLength(1);
    expect(second.feed().map((p) => p.id)).not.toContain("profile-02");
    second.close();
    rmSync(dir, { recursive: true });
  });
  it("has an empty feed after all profiles are swiped", () => {
    const s = open();
    for (const p of s.feed()) s.swipe(p.id, "pass");
    expect(s.feed()).toEqual([]);
    expect(s.matches()).toEqual([]);
  });
});
