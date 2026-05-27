import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:8081",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "yarn start",
    // Wait for the /app-structure endpoint — it returns 200 only after webpack has
    // finished compiling and written .app-structure.json, so it gates both servers
    url: "http://localhost:3000/app-structure",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
