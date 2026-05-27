import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  // The tab list only renders once structure data is processed through all producers
  await expect(page.getByRole("tablist")).toBeVisible();
});

test("application loads", async ({ page }) => {
  await expect(page).toHaveTitle("Engine Dashboard");
  await expect(page.locator("#app")).toBeAttached();
});

test("state tree is populated with the root node and its children", async ({
  page,
}) => {
  await expect(page.getByText("Root")).toBeVisible();
  // Top-level paths derived from observe/get/update operations across the codebase
  // Use exact to avoid matching the "Structure" tab button
  await expect(page.getByText("structure", { exact: true })).toBeVisible();
  await expect(page.getByText("activeTab", { exact: true })).toBeVisible();
});

test("Views tab lists views and clicking one opens the element description", async ({
  page,
}) => {
  await page.getByRole("tab", { name: /Views/ }).click();

  // View names should be visible in the list
  await expect(page.getByText("App", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("src/App.tsx").first()).toBeVisible();

  // Click to select a view — element description header should show operation paths
  await page.getByText("App", { exact: true }).first().click();
  await expect(page.getByText(".structure.data")).toBeVisible();
  await expect(page.getByText(".activeTab")).toBeVisible();
});

test("Producers tab lists producers and clicking one opens the element description", async ({
  page,
}) => {
  await page.getByRole("tab", { name: /Producers/ }).click();

  // ViewsTab and ProducersTab share the same sortedByStats — both panels stay in the
  // DOM when tabs switch, so scope to the Producers panel by its accessible name
  const producersPanel = page.getByRole("tabpanel", { name: /Producers/ });

  await expect(
    producersPanel.getByText("processEngineOutput", { exact: true })
  ).toBeVisible();
  await expect(
    producersPanel.getByText("src/producers/processEngineOutput.ts")
  ).toBeVisible();

  // Click to select a producer — element description header should show operation paths
  await producersPanel.getByText("processEngineOutput", { exact: true }).click();
  await expect(page.getByText(".structure.elements")).toBeVisible();
  await expect(page.getByText(".structure.projectRoot")).toBeVisible();
});
