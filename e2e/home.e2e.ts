// End to end-test med Playwright. Kjør med:
//   npm run test:e2e
//
// Playwright starter dev-serveren selv, åpner en ekte nettleser og klikker som
// en bruker. Det er tregere enn Vitest, så bruk det på de viktige flytene, ikke
// på alt.
//
// Første gang må nettleseren lastes ned:
//   npx playwright install chromium
import { test, expect } from "@playwright/test";

test("forsiden viser overskriften", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Fiksa" })
  ).toBeVisible();
});

test("api-ruta svarer JSON", async ({ request }) => {
  const response = await request.get("/api/status");

  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({ status: "ok" });
});
