import { test } from "@playwright/test";

// iPhone 12 Pro viewport: 390x844
const VISUALIZATIONS = [
  "Box Perimeter",
  "Orbiting Dot",
  "Breathing Blob",
  "Progress Bar",
  "Breath Ladder",
  "Hill / Ramp",
  "Four Petals",
  "Minimal Word",
  "Timeline Ring",
  "Breath Path",
];

test.use({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});

test.describe("Screenshot Visualizations", () => {
  test("capture all visualizations while breathing", async ({ page }) => {
    test.setTimeout(120000); // 2 minutes for all screenshots
    await page.goto("/");

    // Wait for app to load
    await page.waitForSelector(".logo");

    for (const vizName of VISUALIZATIONS) {
      // Open visualization picker
      await page.click(".viz-picker-btn");
      await page.waitForSelector(".modal");

      // Select visualization - click on the viz-option button containing the name
      await page.locator(`.viz-option:has-text("${vizName}")`).click();
      await page.waitForTimeout(300);

      // Start breathing session
      await page.click(".start-btn");
      await page.waitForTimeout(2000); // Let it run for 2 seconds

      // Take screenshot
      const safeName = vizName.toLowerCase().replace(/[^a-z0-9]/g, "-");
      await page.screenshot({
        path: `screenshots/mobile-${safeName}.png`,
        fullPage: false
      });

      // Stop session
      await page.click(".stop-btn");
      await page.waitForTimeout(300);
    }
  });
});
