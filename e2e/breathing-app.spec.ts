import { test, expect } from "@playwright/test";

test.describe("Breathing Shapes App", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the app title", async ({ page }) => {
    await expect(page.locator(".logo")).toHaveText("Breathing Shapes");
  });

  test("should have three tabs", async ({ page }) => {
    const tabs = page.locator(".tab-btn");
    await expect(tabs).toHaveCount(3);
    await expect(tabs.nth(0)).toHaveText("Breathe");
    await expect(tabs.nth(1)).toHaveText("Patterns");
    await expect(tabs.nth(2)).toHaveText("Settings");
  });

  test("should start on the Breathe tab", async ({ page }) => {
    await expect(page.locator(".tab-btn.active")).toHaveText("Breathe");
    await expect(page.locator(".breathe-container")).toBeVisible();
  });

  test("should show start button when not running", async ({ page }) => {
    await expect(page.locator(".start-btn")).toHaveText("Start");
  });

  test("should start breathing session when Start is clicked", async ({ page }) => {
    await page.click(".start-btn");

    // Should show pause and stop buttons
    await expect(page.locator(".pause-btn")).toBeVisible();
    await expect(page.locator(".stop-btn")).toBeVisible();

    // Should show cycle count in header
    await expect(page.getByText(/Cycle 1/)).toBeVisible();
  });

  test("should pause and resume session", async ({ page }) => {
    await page.click(".start-btn");

    // Pause
    await page.click(".pause-btn");
    await expect(page.locator(".pause-btn")).toContainText("▶");

    // Resume
    await page.click(".pause-btn");
    await expect(page.locator(".pause-btn")).toContainText("❚❚");
  });

  test("should stop session when Stop is clicked", async ({ page }) => {
    await page.click(".start-btn");
    await page.click(".stop-btn");

    // Should show start button again
    await expect(page.locator(".start-btn")).toBeVisible();
  });

  test("should navigate to Patterns tab", async ({ page }) => {
    await page.click('button:has-text("Patterns")');

    await expect(page.locator(".tab-btn.active")).toHaveText("Patterns");
    await expect(page.locator(".section-title")).toHaveText("Breathing Patterns");
  });

  test("should show default patterns", async ({ page }) => {
    await page.click('button:has-text("Patterns")');

    const patternCards = page.locator(".pattern-card");
    await expect(patternCards).toHaveCount(4);

    // Check for default pattern names
    await expect(page.getByText("Box 4s")).toBeVisible();
    await expect(page.getByText("Box 8s")).toBeVisible();
    await expect(page.getByText("4-7-8 Relaxing")).toBeVisible();
    await expect(page.getByText("Calm Wave")).toBeVisible();
  });

  test("should open pattern editor for new box pattern", async ({ page }) => {
    await page.click('button:has-text("Patterns")');
    await page.click('button:has-text("New Box")');

    await expect(page.locator(".modal")).toBeVisible();
    await expect(page.locator(".modal-title")).toContainText("Box Pattern");
  });

  test("should open pattern editor for new trapezoid pattern", async ({ page }) => {
    await page.click('button:has-text("Patterns")');
    await page.click('button:has-text("New Trapezoid")');

    await expect(page.locator(".modal")).toBeVisible();
    await expect(page.locator(".modal-title")).toContainText("Trapezoid Pattern");
  });

  test("should create a new box pattern", async ({ page }) => {
    await page.click('button:has-text("Patterns")');
    await page.click('button:has-text("New Box")');

    // Fill in pattern name
    await page.fill('input[placeholder*="pattern"]', "My Test Pattern");

    // Save
    await page.click(".save-btn");

    // Should see the new pattern in the list
    await expect(page.getByText("My Test Pattern")).toBeVisible();
  });

  test("should navigate to Settings tab", async ({ page }) => {
    await page.click('button:has-text("Settings")');

    await expect(page.locator(".tab-btn.active")).toHaveText("Settings");
    await expect(page.locator(".section-title")).toHaveText("Settings");
  });

  test("should show haptics and voice toggles in settings", async ({ page }) => {
    await page.click('button:has-text("Settings")');

    await expect(page.getByText("Haptic Feedback")).toBeVisible();
    await expect(page.getByText("Voice Prompts")).toBeVisible();
  });

  test("should show About section in settings", async ({ page }) => {
    await page.click('button:has-text("Settings")');

    await expect(page.locator(".about-section")).toBeVisible();
    await expect(page.getByText("GitHub")).toBeVisible();
    await expect(page.getByText("Report Bug")).toBeVisible();
  });

  test("should open visualization picker", async ({ page }) => {
    await page.click(".viz-picker-btn");

    await expect(page.locator(".modal")).toBeVisible();
    await expect(page.locator(".modal-title")).toHaveText("Choose Visualization");
  });

  test("should list all 10 visualizations", async ({ page }) => {
    await page.click(".viz-picker-btn");

    const vizOptions = page.locator(".viz-option");
    await expect(vizOptions).toHaveCount(10);
  });

  test("should change visualization", async ({ page }) => {
    await page.click(".viz-picker-btn");

    // Click on Orbiting Dot
    await page.click('button:has-text("Orbiting Dot")');

    // Modal should close and button should show new visualization
    await expect(page.locator(".modal")).not.toBeVisible();
    await expect(page.locator(".viz-picker-btn")).toContainText("Orbiting Dot");
  });

  test("should toggle haptics", async ({ page }) => {
    // Check initial state (on by default)
    const hapticToggle = page.locator(".toggle-row").filter({ hasText: "Haptics" }).locator(".toggle-switch");
    await expect(hapticToggle).toHaveClass(/on/);

    // Toggle off
    await hapticToggle.click();
    await expect(hapticToggle).not.toHaveClass(/on/);

    // Toggle on
    await hapticToggle.click();
    await expect(hapticToggle).toHaveClass(/on/);
  });

  test("should select pattern from list", async ({ page }) => {
    await page.click('button:has-text("Patterns")');

    // Click on Box 8s pattern
    await page.click('.pattern-card:has-text("Box 8s")');

    // Should navigate to Breathe tab with new pattern
    await expect(page.locator(".tab-btn.active")).toHaveText("Breathe");
    await expect(page.locator(".pattern-badge")).toContainText("Box 8s");
  });
});

test.describe("Pattern Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.click('button:has-text("Patterns")');
  });

  test("should show delete confirmation when deleting a pattern", async ({ page }) => {
    // Delete first pattern
    await page.locator(".delete-btn").first().click();

    // Should show confirmation modal
    await expect(page.locator(".modal")).toBeVisible();
    await expect(page.getByText("Delete Pattern?")).toBeVisible();
  });

  test("should cancel deletion", async ({ page }) => {
    const patternCount = await page.locator(".pattern-card").count();

    await page.locator(".delete-btn").first().click();
    await page.click('button:has-text("Cancel")');

    // Pattern count should be unchanged
    await expect(page.locator(".pattern-card")).toHaveCount(patternCount);
  });

  test("should delete a pattern", async ({ page }) => {
    const initialCount = await page.locator(".pattern-card").count();

    await page.locator(".delete-btn").first().click();
    await page.click('button:has-text("Delete")');

    // Pattern count should decrease
    await expect(page.locator(".pattern-card")).toHaveCount(initialCount - 1);
  });

  test("should not allow deleting the last pattern", async ({ page }) => {
    // Delete patterns until one remains
    while (await page.locator(".pattern-card").count() > 1) {
      await page.locator(".delete-btn").first().click();
      await page.click('button:has-text("Delete")');
      await page.waitForTimeout(100);
    }

    // Try to delete the last one
    await page.locator(".delete-btn").first().click();

    // Should show "Cannot Delete" message
    await expect(page.getByText("Cannot Delete")).toBeVisible();
    await expect(page.getByText("Got It")).toBeVisible();
  });
});
