import { defineConfig } from "@playwright/test";

// Mac2 uses port 4412; the Mac1 build lane sets PORT to its own claimed port.
const port = process.env.PORT ?? "4412";

export default defineConfig({
  testDir: "./tests",
  workers: 1,
  reporter: "list",
  use: { baseURL: `http://127.0.0.1:${port}`, headless: true, channel: "chrome" },
  webServer: {
    command: `npm run start -- --hostname 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
  },
});
