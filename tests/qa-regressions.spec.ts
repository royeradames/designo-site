import { expect, test, type Page } from "@playwright/test";

// Regression checks for the October 8 width-sweep findings. Each mirrors one sweep detector
// (overflow, overlap, tight-spacing, icon-label-split, small-text, meta-identity) closely enough
// to fail on the shipped layout and pass once it is fixed.

const routes = ["/", "/about", "/locations", "/contact", "/web-design", "/app-design", "/graphic-design"];
const widths = [320, 375, 560, 768, 1030, 1280, 1440, 1920];

/** Boxes that paint ink inside an element: text line boxes (clipped by overflow ancestors) and images or controls. */
async function inkOverlap(page: Page, first: string, second: string) {
  return page.evaluate(([a, b]) => {
    const ink = (root: Element) => {
      const boxes: DOMRect[] = [];
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.nodeValue?.trim()) continue;
        let clip = new DOMRect(-1e6, -1e6, 2e6, 2e6);
        for (let el = node.parentElement; el && el !== root.parentElement; el = el.parentElement) {
          const style = getComputedStyle(el);
          if (style.overflowX !== "visible" || style.overflowY !== "visible") {
            const r = el.getBoundingClientRect();
            const left = Math.max(clip.left, r.left);
            const top = Math.max(clip.top, r.top);
            clip = new DOMRect(left, top, Math.min(clip.right, r.right) - left, Math.min(clip.bottom, r.bottom) - top);
          }
        }
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const r of range.getClientRects()) {
          const left = Math.max(r.left, clip.left);
          const top = Math.max(r.top, clip.top);
          const width = Math.min(r.right, clip.right) - left;
          const height = Math.min(r.bottom, clip.bottom) - top;
          if (width > 0.5 && height > 0.5) boxes.push(new DOMRect(left, top, width, height));
        }
      }
      for (const control of root.querySelectorAll("img, svg, input, textarea, button, video")) {
        const r = control.getBoundingClientRect();
        if (r.width > 1 && r.height > 1 && getComputedStyle(control).visibility !== "hidden") boxes.push(r);
      }
      return boxes;
    };
    const left = ink(document.querySelector(a)!);
    const right = ink(document.querySelector(b)!);
    for (const x of left) for (const y of right) {
      const w = Math.min(x.right, y.right) - Math.max(x.left, y.left);
      const h = Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top);
      if (w > 2 && h > Math.max(4, 0.3 * Math.min(x.height, y.height))) return `${Math.round(w)}x${Math.round(h)}px at y=${Math.round(y.top)}`;
    }
    return null;
  }, [first, second]);
}

test.describe("width sweep regressions", () => {
  for (const path of routes) {
    test(`${path}: footer links stay in their boxes, main never overlaps the footer, and text is at least 16px`, async ({ page }) => {
      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        await page.waitForLoadState("networkidle");

        const spills = await page.evaluate(() => [...document.querySelectorAll(".socials li")].flatMap(item => {
          const box = item.getBoundingClientRect();
          const link = item.firstElementChild!.getBoundingClientRect();
          return link.left < box.left - 1 || link.right > box.right + 1 ? [item.textContent] : [];
        }));
        expect(spills, `social links spill out of their list items at ${width}px`).toEqual([]);

        expect(await inkOverlap(page, "main", "footer"), `main overlaps the footer at ${width}px`).toBeNull();

        const small = await page.evaluate(() => {
          const found: string[] = [];
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            const parent = node.parentElement!;
            if (!node.nodeValue?.trim() || parent.closest("script, style, noscript")) continue;
            const style = getComputedStyle(parent);
            if (style.display === "none" || style.visibility === "hidden" || !parent.getClientRects().length) continue;
            if (parseFloat(style.fontSize) < 16) found.push(`${style.fontSize} "${node.nodeValue.trim().slice(0, 30)}"`);
          }
          return found;
        });
        expect(small, `text under 16px at ${width}px`).toEqual([]);
      }
    });
  }

  test("page sections never paint into each other (decorations stay inside their panels)", async ({ page }) => {
    for (const width of [320, 768, 1030, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of routes) {
        await page.goto(path);
        const count = await page.locator(".sections > *").count();
        for (let i = 1; i < count; i++) {
          for (let j = i + 1; j <= count; j++) {
            const hit = await inkOverlap(page, `.sections > :nth-child(${i})`, `.sections > :nth-child(${j})`);
            expect(hit, `${path} sections ${i} and ${j} at ${width}px`).toBeNull();
          }
        }
      }
    }
  });

  test("category call-to-action labels keep their arrow on the same line at every width", async ({ page }) => {
    for (const width of [320, 340, 375, 560, 768, 1030, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ["/", "/web-design"]) {
        await page.goto(path);
        const split = await page.locator(".category-card__cta").evaluateAll(nodes => nodes.flatMap(node => {
          const style = getComputedStyle(node);
          const lineHeight = parseFloat(style.lineHeight);
          return node.getBoundingClientRect().height > 1.5 * lineHeight ? [node.textContent] : [];
        }));
        expect(split, `${path} at ${width}px`).toEqual([]);
      }
    }
  });

  test("empty-submit errors sit in the flow, clear of their fields, at every width", async ({ page }) => {
    for (const width of [320, 375, 480, 560, 768, 1030, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/contact");
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(page.locator(".field__error")).toHaveCount(3);
      const clashes = await page.locator(".field__error").evaluateAll(errors => errors.flatMap(error => {
        const control = error.parentElement!.querySelector("input, textarea")!.getBoundingClientRect();
        const box = error.getBoundingClientRect();
        const across = Math.min(control.right, box.right) - Math.max(control.left, box.left);
        if (across <= 4) return [];
        const gap = Math.max(box.top - control.bottom, control.top - box.bottom);
        return gap < 4 ? [`${error.id}: ${Math.round(gap)}px`] : [];
      }));
      expect(clashes, `at ${width}px`).toEqual([]);
    }
  });

  test("a long email error still fits beside or under its field", async ({ page }) => {
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/contact");
      await page.getByLabel("Email address", { exact: true }).fill("rose@example");
      await page.getByRole("button", { name: "Submit" }).click();
      const error = page.locator("#email-error");
      await expect(error).toHaveText("Please use a valid email address");
      const form = (await page.locator(".contact-form__fields").boundingBox())!;
      const box = (await error.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(form.x - 1);
      expect(box.x + box.width).toBeLessThanOrEqual(form.x + form.width + 1);
    }
  });
});

test.describe("site identity", () => {
  for (const path of routes) {
    test(`${path} declares og:site_name and WebSite JSON-LD with one site name`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Designo");
      const data = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.map(node => JSON.parse(node.textContent ?? "{}")));
      const site = data.find(entry => entry["@type"] === "WebSite");
      expect(site).toMatchObject({ "@context": "https://schema.org", name: "Designo", url: "https://designo-site.royeradames.com/" });
    });
  }
});
