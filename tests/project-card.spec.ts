import { expect, test } from "@playwright/test";

for (const width of [320, 430, 768, 1440]) {
  test(`project pictures leave their descriptions unobscured at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const overlaps: { route: string; title: string; imageBottom: number; copyTop: number }[] = [];
    for (const route of ["/web-design", "/app-design", "/graphic-design"]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      for (const card of await page.locator(".project-card").all()) {
        await card.scrollIntoViewIfNeeded();
        await card.locator("img").evaluate(image => {
          if (!(image instanceof HTMLImageElement)) throw new Error("Project picture is missing");
          return image.decode();
        });
        const overlap = await card.evaluate(node => {
          const image = node.querySelector("img");
          const copy = node.querySelector(".project-card__copy");
          if (!image || !copy) throw new Error("Project picture or description is missing");
          const picture = image.getBoundingClientRect();
          const description = copy.getBoundingClientRect();
          const intersects = picture.left < description.right - 1 && picture.right > description.left + 1
            && picture.top < description.bottom - 1 && picture.bottom > description.top + 1;
          return intersects ? { title: node.querySelector("h2")?.textContent ?? "", imageBottom: picture.bottom, copyTop: description.top } : null;
        });
        if (overlap) overlaps.push({ route, ...overlap });
      }
    }
    expect(overlaps, "Project artwork must stay out of the readable description area").toEqual([]);
  });
}
