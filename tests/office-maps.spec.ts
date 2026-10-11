import { expect, test, type Page } from "@playwright/test";

// A 1×1 transparent PNG, so the opt-in test never reaches OpenStreetMap.
const tile = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");

const offices = [
  { slug: "canada", country: "Canada", lat: 43.6435, lng: -79.5772 },
  { slug: "australia", country: "Australia", lat: -31.7327, lng: 152.6968 },
  { slug: "united-kingdom", country: "United Kingdom", lat: 51.7371, lng: -3.8668 },
] as const;

/** Records every request that leaves the local server, and answers tile requests locally. */
async function watchRequests(page: Page) {
  const localHost = `127.0.0.1:${process.env.PORT ?? "4412"}`;
  const external: string[] = [];
  const problems: string[] = [];
  page.on("pageerror", error => problems.push(`pageerror: ${error.message}`));
  page.on("console", message => { if (message.type() === "error") problems.push(`console: ${message.text()}`); });
  page.on("request", request => {
    const url = new URL(request.url());
    if (![localHost, ""].includes(url.host) && url.protocol !== "data:") external.push(request.url());
  });
  await page.route("https://tile.openstreetmap.org/**", route => route.fulfill({ contentType: "image/png", body: tile }));
  return { external, problems };
}

for (const width of [320, 375, 768, 1024, 1440]) {
  test.describe(`office maps at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test("stay static images with an OpenStreetMap link until a visitor opts in", async ({ page }) => {
      const { external, problems } = await watchRequests(page);
      await page.goto("/locations");
      for (const office of offices) {
        const article = page.locator(`#${office.slug}`);
        await expect(article.locator("img.office__map")).toBeVisible();
        const link = article.getByRole("link", { name: `${office.country} on OpenStreetMap`, exact: true });
        await expect(link).toHaveAttribute("href", `https://www.openstreetmap.org/?mlat=${office.lat}&mlon=${office.lng}#map=14/${office.lat}/${office.lng}`);
        const load = article.getByRole("button", { name: `Load interactive map of the ${office.country} office` });
        await expect(load).toBeVisible();
        await expect(load).toHaveAccessibleDescription("The interactive map sends your IP address to OpenStreetMap.");

        // The controls sit below the map, never over it, so the whole map stays in view.
        const map = await article.locator("img.office__map").boundingBox();
        const note = article.getByText("The interactive map sends your IP address to OpenStreetMap.");
        expect(map).not.toBeNull();
        for (const control of [load, link, note]) {
          const box = await control.boundingBox();
          expect(box).not.toBeNull();
          expect(box!.y, "control starts below the map").toBeGreaterThanOrEqual(map!.y + map!.height);
          expect(box!.x, "control starts inside the map column").toBeGreaterThanOrEqual(map!.x);
          expect(box!.x + box!.width, "control ends inside the map column").toBeLessThanOrEqual(map!.x + map!.width);
        }
        // Both controls are comfortable tap targets now that they have room below the map.
        for (const control of [load, link]) expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44);
        // On white the link needs its underline to read as a link, not as a caption.
        await expect(link).toHaveCSS("text-decoration-line", "underline");
      }
      await page.waitForLoadState("networkidle");
      await expect(page.locator(".leaflet-container")).toHaveCount(0);
      expect(external).toEqual([]);
      expect(problems).toEqual([]);
    });

    test("loads only the chosen office's interactive map, with its pin and attribution", async ({ page }) => {
      const { external, problems } = await watchRequests(page);
      await page.goto("/locations");
      const article = page.locator("#australia");
      await article.getByRole("button", { name: "Load interactive map of the Australia office" }).click();

      const map = article.getByRole("region", { name: "Interactive map of the Australia office" });
      await expect(map).toHaveClass(/leaflet-container/);
      await expect(map).toBeFocused();
      await expect(map).toHaveAttribute("aria-busy", "false");
      const box = await map.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(320);
      await expect(map.locator("path.leaflet-interactive")).toHaveCount(1);
      await expect(map.locator(".leaflet-control-attribution")).toContainText("OpenStreetMap");
      await expect(map.locator(".leaflet-control-zoom-in")).toBeVisible();
      await expect(map.locator(".leaflet-tooltip")).toHaveText("New South Wales 2443 (postcode area)");
      await expect(map.locator(".leaflet-tooltip")).toHaveCSS("font-size", "16px");
      const label = await map.locator(".leaflet-tooltip").boundingBox();
      expect(label && box && label.x >= box.x && label.x + label.width <= box.x + box.width).toBe(true);

      // The other offices stay static, and nothing but tiles left the site.
      await expect(page.locator(".leaflet-container")).toHaveCount(1);
      await expect(page.locator("#canada img.office__map")).toBeVisible();
      await page.waitForLoadState("networkidle");
      expect(external.length).toBeGreaterThan(0);
      expect(external.filter(url => !url.startsWith("https://tile.openstreetmap.org/"))).toEqual([]);
      expect(problems).toEqual([]);
    });
  });
}

test("a map that fails to load says so and gives focus back to its button", async ({ page }) => {
  await watchRequests(page);
  await page.goto("/locations");
  const article = page.locator("#canada");
  const load = article.getByRole("button", { name: "Load interactive map of the Canada office" });
  await expect(load).toBeVisible();
  // Leaflet is a lazily loaded chunk; refusing chunks now makes the import fail.
  await page.route("**/_next/static/chunks/**", route => route.abort());
  await load.click();
  await expect(article.getByRole("alert")).toHaveText("The map didn’t load. Try again, or use the OpenStreetMap link.");
  await expect(load).toBeFocused();
  await expect(article.locator("img.office__map")).toBeVisible();
  await expect(page.locator(".leaflet-container")).toHaveCount(0);
});
