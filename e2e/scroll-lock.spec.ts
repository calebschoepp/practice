import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/#/");
  await page.evaluate(async () => {
    if ("indexedDB" in window) {
      await new Promise<void>((resolve) => {
        const request = indexedDB.deleteDatabase("practice-tracker-db");
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
        request.onblocked = () => resolve();
      });
    }
  });
  await page.goto("/#/");
});

test("screen is locked from page scrolling outside settings/stats", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 420 });

  const homeScroll = await page.evaluate(() => {
    window.scrollTo(0, 400);
    return window.scrollY;
  });
  expect(homeScroll).toBe(0);

  await page.getByLabel("Settings").click();

  const settingsScroll = await page.evaluate(() => {
    const before = window.scrollY;
    window.scrollTo(0, before + 240);
    return {
      before,
      after: window.scrollY,
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: window.innerHeight,
    };
  });

  expect(settingsScroll.scrollHeight).toBeGreaterThan(settingsScroll.clientHeight);
  expect(settingsScroll.after).toBeGreaterThan(settingsScroll.before);

  await page.keyboard.press("Escape");
  await page.getByLabel("Stats").click();

  const statsScroll = await page.evaluate(() => {
    const before = window.scrollY;
    window.scrollTo(0, before + 240);
    return {
      before,
      after: window.scrollY,
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: window.innerHeight,
    };
  });

  expect(statsScroll.scrollHeight).toBeGreaterThan(statsScroll.clientHeight);
  expect(statsScroll.after).toBeGreaterThan(statsScroll.before);
});
