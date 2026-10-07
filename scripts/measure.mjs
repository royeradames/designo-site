// Usage: node scripts/measure.mjs <baseURL> [widths]
// Prints page-relative boxes of the main layout blocks for checking against the Figma frames.
import { chromium } from "@playwright/test";

const [base = "http://127.0.0.1:4412", widthList = "375,768,1440"] = process.argv.slice(2);
const routes = ["/", "/about", "/locations", "/contact", "/web-design", "/graphic-design"];
const selectors = [".logo", ".site-nav li:first-child a", ".home-hero", ".page-hero", ".category-hero", ".category-card", ".value", ".story", ".location-link", ".office__map", ".office__card", ".project-card", ".contact-form .field", ".contact-form .btn", ".cta", ".cta .btn", ".site-footer", ".site-footer__rule", ".site-footer address", ".socials", "h1"];
const browser = await chromium.launch({ channel: "chrome" });
for (const width of widthList.split(",").map(Number)) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const route of routes) {
    await page.goto(base + route);
    const rows = await page.evaluate(list => list.flatMap(selector => [...document.querySelectorAll(selector)].slice(0, 3).filter(node => node.getClientRects().length).map(node => {
      const box = node.getBoundingClientRect();
      return `${selector} x${Math.round(box.x)} y${Math.round(box.y + scrollY)} ${Math.round(box.width)}×${Math.round(box.height)}`;
    })), selectors);
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    console.log(`\n## ${route} @${width} (page height ${height})\n${rows.join("\n")}`);
  }
  await page.close();
}
await browser.close();
