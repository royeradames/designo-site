import { expect, test, type Page } from "@playwright/test";

const routes = ["/", "/about", "/locations", "/contact", "/web-design", "/app-design", "/graphic-design"];

async function readableText(page: Page) {
  const texts = await page.evaluate(() => {
    const found = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement;
      if (!parent || !node.textContent?.trim() || parent.closest("script,style,noscript,.sr-only")) continue;
      const style = getComputedStyle(parent);
      if (style.visibility !== "visible" || !parent.getClientRects().length) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      const rects = [...range.getClientRects()].filter(r => r.width && r.height).map(r => ({ x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height }));
      if (!rects.length) continue;
      let opacity = 1;
      for (let ancestor: Element | null = parent; ancestor; ancestor = ancestor.parentElement) opacity *= Number(getComputedStyle(ancestor).opacity);
      found.push({ text: node.textContent.trim().slice(0, 65), color: style.color, opacity, size: parseFloat(style.fontSize), weight: Number(style.fontWeight), rects });
    }
    for (const control of document.querySelectorAll("input,textarea")) {
      if (!(control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) || !control.getClientRects().length) continue;
      const style = getComputedStyle(control, control.value ? undefined : "::placeholder");
      const box = control.getBoundingClientRect();
      found.push({ text: control.value || control.placeholder, color: style.color, opacity: 1, size: parseFloat(style.fontSize), weight: Number(style.fontWeight), rects: [{ x: box.x + scrollX + 8, y: box.y + scrollY + 8, width: box.width - 16, height: box.height - 16 }] });
    }
    return found;
  });

  // Mask foreground ink without changing layout, then sample the genuine rendered
  // backgrounds. This includes the supplied translucent SVG patterns and photos.
  const mask = await page.addStyleTag({ content: "* { transition: none !important; color: transparent !important; caret-color: transparent !important; text-shadow: none !important; } *::placeholder { color: transparent !important; }" });
  let pixels;
  try {
    pixels = (await page.screenshot({ fullPage: true })).toString("base64");
  } finally {
    // Keep transitions disabled while restoring ink so the sampler cannot start
    // a transparent-to-ink animation that contaminates the next real state.
    await mask.evaluate(node => { node.textContent = "* { transition: none !important; }"; });
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    await mask.evaluate(node => { node.parentNode?.removeChild(node); });
  }
  return page.evaluate(async ({ texts, pixels }) => {
    const image = new Image();
    image.src = `data:image/png;base64,${pixels}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Rendered background sampler needs a canvas context");
    context.drawImage(image, 0, 0);
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const luminance = (rgb: number[]) => rgb.reduce((sum, channel, index) => {
      const value = channel / 255;
      return sum + (value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4) * ([.2126, .7152, .0722][index] ?? 0);
    }, 0);
    return texts.flatMap(text => {
      const channels = text.color.match(/[\d.]+/g)?.map(Number);
      if (!channels || channels.length < 3) throw new Error(`Unsupported rendered color ${text.color}`);
      const alpha = (channels[3] ?? 1) * text.opacity;
      const minimum = text.size >= 24 || (text.size >= 18.66 && text.weight >= 700) ? 3 : 4.5;
      let worst = Infinity;
      for (const rect of text.rects) {
        for (let y = Math.ceil(rect.y); y < rect.y + rect.height; y += 8) {
          for (let x = Math.ceil(rect.x); x < rect.x + rect.width; x += 8) {
            if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) continue;
            const offset = (y * canvas.width + x) * 4;
            const background = [data[offset] ?? 0, data[offset + 1] ?? 0, data[offset + 2] ?? 0];
            const foreground = background.map((channel, index) => (channels[index] ?? 0) * alpha + channel * (1 - alpha));
            const a = luminance(foreground), b = luminance(background);
            worst = Math.min(worst, (Math.max(a, b) + .05) / (Math.min(a, b) + .05));
          }
        }
      }
      return worst + .01 < minimum ? [{ text: text.text, ratio: +worst.toFixed(3), minimum, color: text.color }] : [];
    });
  }, { texts, pixels });
}

for (const width of [375, 768, 1440]) {
  test(`shared text stays readable on real backgrounds and hover states at ${width}px`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 900 });
    const failures = [];
    for (const route of routes) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      failures.push({ route, state: "default", failures: await readableText(page) });
      for (const selector of [".btn-light", ".location-link", ".category-card", ".project-card"]) {
        const target = page.locator(selector).first();
        if (!(await target.count())) continue;
        await target.hover();
        await page.waitForTimeout(250);
        failures.push({ route, state: selector, failures: await readableText(page) });
      }
      if (route === "/contact") {
        await page.getByRole("button", { name: "Submit", exact: true }).click();
        failures.push({ route, state: "empty validation", failures: await readableText(page) });
      }
    }
    expect(failures.filter(state => state.failures.length)).toEqual([]);
  });
}
