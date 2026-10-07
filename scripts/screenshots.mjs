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
await browser.close();
