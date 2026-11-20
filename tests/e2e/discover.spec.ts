import { test, expect } from "@playwright/test";
test("API validation, privacy, final decisions, and persistent UI flow", async ({
  page,
  request,
}, testInfo) => {
  const feed = await request.get("/feed");
  expect(feed.status()).toBe(200);
  const { feed: profiles } = await feed.json();
  for (const p of profiles)
    expect(Object.keys(p).sort()).toEqual([
      "age",
      "bio",
      "id",
      "interests",
      "location",
      "name",
      "photo",
    ]);
  expect(
    (
      await request.post("/swipe", {
        data: { profileId: "missing", decision: "like" },
      })
    ).status(),
  ).toBe(404);
  expect(
    (
      await request.post("/swipe", {
        data: { profileId: "profile-01", decision: "invalid" },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/swipe", {
        data: "{",
        headers: { "Content-Type": "application/json" },
      })
    ).status(),
  ).toBe(400);
  await page.goto("/");
  await expect(page.getByRole("main")).toBeEmpty();
  await page.getByRole("link", { name: "Discover", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Discover." })).toBeVisible();
  const first = testInfo.project.name === "mobile" ? "Aanya" : "Meera";
  await expect(
    page.getByRole("heading", { name: new RegExp(first) }),
  ).toBeVisible();
  await page.getByRole("button", { name: `Pass on ${first}` }).click();
  const next = testInfo.project.name === "mobile" ? "Kabir" : "Arjun";
  await expect(
    page.getByRole("heading", { name: new RegExp(next) }),
  ).toBeVisible();
  if (testInfo.project.name === "desktop") {
    const card = page.locator(".profile-card");
    await expect(card).toHaveCSS("opacity", "1");
    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + 180);
    await page.mouse.down();
    await page.mouse.move(box.x + 20, box.y + 180, { steps: 12 });
    await page.mouse.up();
    await expect(page.getByRole("heading", { name: /Riya/ })).toBeVisible();
  }
  const liked = testInfo.project.name === "mobile" ? "Kabir" : "Riya";
  await page.getByRole("button", { name: `Like ${liked}` }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "It’s a match!" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("button", { name: `Like ${liked}` })).toHaveCount(
    0,
  );
  await page.getByRole("link", { name: "Matches", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: new RegExp(liked) }),
  ).toBeVisible();
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-matches.png`,
    fullPage: true,
  });
  await page.goto("/discover");
  await expect(page.locator(".profile-card")).toBeVisible();
  await expect(page.locator(".profile-card")).toHaveCSS("opacity", "1");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-discover.png`,
    fullPage: true,
  });
  if (testInfo.project.name === "desktop") {
    await page.setViewportSize({ width: 320, height: 700 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const name = (await (await request.get("/feed")).json()).feed[0].name;
    await page.route("**/swipe", (route) => route.abort());
    await page.getByRole("button", { name: `Like ${name}` }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: `Like ${name}` }),
    ).toBeEnabled();
    await page.unroute("**/swipe");
    const remaining = (await (await request.get("/feed")).json()).feed;
    for (const profile of remaining)
      await request.post("/swipe", {
        data: { profileId: profile.id, decision: "pass" },
      });
    await page.reload();
    await expect(
      page.getByRole("heading", {
        name: "A little pause. More possibilities later.",
      }),
    ).toBeVisible();
  }
});
