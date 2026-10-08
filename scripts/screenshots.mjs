// Usage: node scripts/screenshots.mjs <baseURL> <outDir> [widths]
// Full-page captures of every route for design comparison and PR previews.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const [base = "http://127.0.0.1:4412", out = "screenshots", widthList = "400,768,1440"] = process.argv.slice(2);
const routes = { home: "/", about: "/about", locations: "/locations", contact: "/contact", "web-design": "/web-design", "app-design": "/app-design", "graphic-design": "/graphic-design" };
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
for (const width of widthList.split(",").map(Number)) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const [name, path] of Object.entries(routes)) {
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      for (const img of document.images) { img.loading = "eager"; }
      await Promise.all([...document.images].map(img => img.complete ? null : new Promise(r => { img.onload = img.onerror = r; })));
      await document.fonts.ready;
    });
    await page.screenshot({ path: `${out}/${name}-${width}.png`, fullPage: true });
  }
  await page.close();
}
// State variants: contact errors and success, and the open mobile menu.
const desk = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await desk.goto(base + "/contact", { waitUntil: "networkidle" });
await desk.getByRole("button", { name: "Submit" }).click();
await desk.getByLabel("Email address", { exact: true }).fill("rose@example");
await desk.getByRole("button", { name: "Submit" }).click();
await desk.screenshot({ path: `${out}/contact-errors-1440.png`, clip: { x: 0, y: 0, width: 1440, height: 700 } });
await desk.getByLabel("Name", { exact: true }).fill("Rose Caldwell");
await desk.getByLabel("Email address", { exact: true }).fill("rose@example.com");
await desk.getByLabel("Your message", { exact: true }).fill("We need a new brand.");
await desk.getByRole("button", { name: "Submit" }).click();
await desk.getByRole("status").filter({ hasText: "demo" }).waitFor();
await desk.screenshot({ path: `${out}/contact-success-1440.png`, clip: { x: 0, y: 0, width: 1440, height: 700 } });
const phone = await browser.newPage({ viewport: { width: 400, height: 700 } });
await phone.goto(base + "/", { waitUntil: "networkidle" });
await phone.getByRole("button", { name: "Menu" }).click();
await phone.screenshot({ path: `${out}/menu-open-400.png` });
await phone.goto(base + "/contact", { waitUntil: "networkidle" });
await phone.getByRole("button", { name: "Submit" }).click();
await phone.screenshot({ path: `${out}/contact-errors-400.png`, fullPage: true, clip: { x: 0, y: 0, width: 400, height: 900 } });
await browser.close();
