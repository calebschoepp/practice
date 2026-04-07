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

test("short session completes and returns home", async ({ page }) => {
  await page.getByTestId("start-session").click();
  await expect(page.getByTestId("session-progress")).toContainText("1/3");

  for (let i = 0; i < 3; i++) {
    await page.getByTestId("done-button").click();
    await page.getByTestId("difficulty-3").click();
  }

  await expect(page.getByText("Choose your session")).toBeVisible();
});

test("early close ends current session", async ({ page }) => {
  await page.getByTestId("start-session").click();
  await page.getByTestId("close-session").click();
  await expect(page.getByText("Choose your session")).toBeVisible();
});

test("stats update after a completion", async ({ page }) => {
  await page.getByTestId("start-session").click();
  await page.getByTestId("done-button").click();
  await page.getByTestId("difficulty-4").click();
  await page.getByTestId("close-session").click();

  await page.getByLabel("Stats").click();
  await expect(page.getByTestId("stats-summary-card")).toContainText("1");
  await expect(page.getByTestId("exercise-chart-card")).toBeVisible();
});

test("enter marks current exercise done with default okay selection", async ({ page }) => {
  await page.getByTestId("start-session").click();

  await page.keyboard.press("Enter");
  await expect(page.getByText("How did that go?")).toBeVisible();
  await expect(page.getByTestId("difficulty-2")).toHaveClass(/bg-primary\/10/);

  await page.keyboard.press("Enter");
  await expect(page.getByTestId("session-progress")).toContainText("2/3");
});

test("up and down arrows adjust rating selection", async ({ page }) => {
  await page.getByTestId("start-session").click();

  await page.keyboard.press("Enter");
  await expect(page.getByTestId("difficulty-2")).toHaveClass(/bg-primary\/10/);

  await page.keyboard.press("ArrowDown");
  await expect(page.getByTestId("difficulty-3")).toHaveClass(/bg-primary\/10/);

  await page.keyboard.press("ArrowUp");
  await expect(page.getByTestId("difficulty-2")).toHaveClass(/bg-primary\/10/);

  await page.keyboard.press("Enter");
  await expect(page.getByTestId("session-progress")).toContainText("2/3");
});

test("escape exits session and leaves settings/stats pages", async ({ page }) => {
  await page.getByTestId("start-session").click();
  await page.keyboard.press("Escape");
  await expect(page.getByText("Choose your session")).toBeVisible();

  await page.getByLabel("Settings").click();
  await page.keyboard.press("Escape");
  await expect(page.getByText("Choose your session")).toBeVisible();

  await page.getByLabel("Stats").click();
  await page.keyboard.press("Escape");
  await expect(page.getByText("Choose your session")).toBeVisible();
});

test("escape closes session from rating overlay", async ({ page }) => {
  await page.getByTestId("start-session").click();
  await page.keyboard.press("Enter");
  await expect(page.getByText("How did that go?")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByText("Choose your session")).toBeVisible();
});

test("metronome pauses while rating overlay is open", async ({ page }) => {
  await page.addInitScript(() => {
    let tickCount = 0;
    const win = window as unknown as Window & {
      __metronomeTickCount: number;
      AudioContext: unknown;
      webkitAudioContext?: unknown;
    };

    class FakeAudioContext {
      currentTime = 0;
      destination = {};

      resume() {
        return Promise.resolve();
      }

      close() {
        return Promise.resolve();
      }

      createOscillator() {
        return {
          type: "square",
          frequency: { value: 0 },
          connect() {
            return undefined;
          },
          start() {
            tickCount += 1;
            win.__metronomeTickCount = tickCount;
          },
          stop() {
            return undefined;
          },
        };
      }

      createGain() {
        return {
          gain: {
            setValueAtTime() {
              return undefined;
            },
            exponentialRampToValueAtTime() {
              return undefined;
            },
          },
          connect() {
            return undefined;
          },
        };
      }
    }

    win.__metronomeTickCount = tickCount;
    win.AudioContext = FakeAudioContext;
    win.webkitAudioContext = FakeAudioContext;
  });

  await page.goto("/#/");
  await page.getByTestId("start-session").click();

  await page.waitForTimeout(900);
  const ticksBeforeOverlay = await page.evaluate(
    () => (window as unknown as { __metronomeTickCount: number }).__metronomeTickCount
  );
  expect(ticksBeforeOverlay).toBeGreaterThan(1);

  await page.getByTestId("done-button").click();

  await page.waitForTimeout(900);
  const ticksDuringOverlay = await page.evaluate(
    () => (window as unknown as { __metronomeTickCount: number }).__metronomeTickCount
  );
  expect(ticksDuringOverlay - ticksBeforeOverlay).toBeLessThanOrEqual(1);

  await page.getByTestId("difficulty-3").click();

  await page.waitForTimeout(900);
  const ticksAfterOverlay = await page.evaluate(
    () => (window as unknown as { __metronomeTickCount: number }).__metronomeTickCount
  );
  expect(ticksAfterOverlay).toBeGreaterThan(ticksDuringOverlay);
});
