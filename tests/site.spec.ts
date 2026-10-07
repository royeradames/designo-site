import { expect, test, type Page } from "@playwright/test";

const pages = [
  { path: "/", title: "Designo | Award-winning custom design agency", h1: "Award-winning custom designs and digital branding solutions" },
  { path: "/about", title: "About us | Designo", h1: "About Us" },
  { path: "/locations", title: "Our locations | Designo", h1: "Our locations" },
  { path: "/contact", title: "Contact us | Designo", h1: "Contact Us" },
  { path: "/web-design", title: "Web Design projects | Designo", h1: "Web Design" },
  { path: "/app-design", title: "App Design projects | Designo", h1: "App Design" },
  { path: "/graphic-design", title: "Graphic Design projects | Designo", h1: "Graphic Design" },
] as const;

const categories = [
  { path: "/web-design", name: "Web Design", projects: ["Express", "Transfer", "Photon", "Builder", "Blogr", "Camp"] },
  { path: "/app-design", name: "App Design", projects: ["Airfilter", "Eyecam", "Faceit", "Todo", "Loopstudios"] },
  { path: "/graphic-design", name: "Graphic Design", projects: ["Tim Brown", "Boxed Water", "Science!"] },
];

/** Fails the test on any script error, console error or request that leaves the local server. */
function guard(page: Page) {
  const problems: string[] = [];
  const localHost = `127.0.0.1:${process.env.PORT ?? "4412"}`;
  page.on("pageerror", error => problems.push(`pageerror: ${error.message}`));
  page.on("console", message => { if (message.type() === "error") problems.push(`console: ${message.text()}`); });
  page.on("request", request => {
    const url = new URL(request.url());
    if (![localHost, ""].includes(url.host) && url.protocol !== "data:") problems.push(`external request: ${request.url()}`);
  });
  return problems;
}

test.describe("pages and metadata", () => {
  for (const entry of pages) {
    test(`${entry.path} has its own title, description, heading, language and icons`, async ({ page }) => {
      const problems = guard(page);
      await page.goto(entry.path);
      await expect(page).toHaveTitle(entry.title);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(entry.h1);
      await expect(page.locator('link[rel="icon"][href="/icon.svg"]')).toHaveCount(1);
      await expect(page.locator('link[rel="icon"][href="/assets/favicon-32x32.png"]')).toHaveCount(1);
      await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute("href", "/apple-icon.png");
      const description = await page.locator('meta[name="description"]').getAttribute("content");
      expect(description?.length).toBeGreaterThan(80);
      await page.waitForLoadState("networkidle");
      expect(problems).toEqual([]);
    });
  }

  test("titles and descriptions are unique across all seven pages", async ({ page }) => {
    const seen = { titles: new Set<string>(), descriptions: new Set<string>() };
    for (const entry of pages) {
      await page.goto(entry.path);
      seen.titles.add(await page.title());
      seen.descriptions.add((await page.locator('meta[name="description"]').getAttribute("content")) ?? "");
    }
    expect(seen.titles.size).toBe(7);
    expect(seen.descriptions.size).toBe(7);
  });

  test("icons and every referenced image are served", async ({ page, request }) => {
    for (const path of ["/icon.svg", "/assets/favicon-32x32.png", "/apple-icon.png"]) {
      expect((await request.get(path)).status(), path).toBe(200);
    }
    for (const entry of pages) {
      await page.goto(entry.path);
      const sources = await page.evaluate(() => [...document.querySelectorAll("img, source")].map(node => (node as HTMLImageElement).src || (node as HTMLSourceElement).srcset));
      for (const src of new Set(sources)) expect((await request.get(src)).status(), src).toBe(200);
    }
  });

  test("an unknown category returns the not-found page", async ({ page }) => {
    const response = await page.goto("/motion-design");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
  });
});

test.describe("navigation", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("header, footer and logo links reach every page", async ({ page }) => {
    const problems = guard(page);
    await page.goto("/");
    const primary = page.getByRole("navigation", { name: "Primary" });
    for (const [label, path, h1] of [["Our company", "/about", "About Us"], ["Locations", "/locations", "Our locations"], ["Contact", "/contact", "Contact Us"]] as const) {
      await primary.getByRole("link", { name: label }).click();
      await expect(page).toHaveURL(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
      await expect(primary.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
    }
    const footer = page.getByRole("navigation", { name: "Footer" });
    await footer.getByRole("link", { name: "Our company" }).click();
    await expect(page).toHaveURL("/about");
    await page.getByRole("banner").getByRole("link", { name: "Designo home" }).click();
    await expect(page).toHaveURL("/");
    await page.getByRole("contentinfo").getByRole("link", { name: "Designo home" }).click();
    await expect(page).toHaveURL("/");
    expect(problems).toEqual([]);
  });

  test("home calls to action and category cards link to the right pages", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Learn more about Designo" })).toHaveAttribute("href", "/about");
    await expect(page.getByRole("link", { name: "Get in touch" })).toHaveAttribute("href", "/contact");
    for (const category of categories) {
      await page.goto("/");
      await page.getByRole("link", { name: `${category.name} View projects` }).click();
      await expect(page).toHaveURL(category.path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(category.name);
    }
  });

  test("each category page lists its projects and links to the other two categories", async ({ page }) => {
    for (const category of categories) {
      await page.goto(category.path);
      const projects = page.getByRole("region", { name: `${category.name} projects` }).getByRole("heading", { level: 2 });
      await expect(projects).toHaveText(category.projects);
      const others = categories.filter(other => other !== category);
      const cards = page.getByRole("region", { name: "Other design categories" }).getByRole("link");
      await expect(cards).toHaveCount(2);
      for (const [index, other] of others.entries()) await expect(cards.nth(index)).toHaveAttribute("href", other.path);
      for (const image of await page.locator(".project-card img").all()) {
        expect(await image.evaluate(node => (node as HTMLImageElement).alt.length)).toBeGreaterThan(10);
      }
    }
  });

  for (const from of ["/about", "/contact"]) {
    test(`${from} location buttons open the matching office on /locations`, async ({ page }) => {
      for (const [country, slug] of [["Canada", "canada"], ["Australia", "australia"], ["United Kingdom", "united-kingdom"]]) {
        await page.goto(from);
        const link = page.getByRole("link", { name: `See location in ${country}` });
        await expect(link).toHaveAttribute("href", `/locations#${slug}`);
        await link.click();
        await expect(page).toHaveURL(`/locations#${slug}`);
        await expect(page.getByRole("heading", { level: 2, name: country })).toBeInViewport();
      }
    });
  }

  test("locations page shows static map images and the three offices", async ({ page }) => {
    const problems = guard(page);
    await page.goto("/locations");
    for (const [slug, office] of [["canada", "Designo Central Office"], ["australia", "Designo AU Office"], ["united-kingdom", "Designo UK Office"]]) {
      const article = page.locator(`#${slug}`);
      await expect(article.getByText(office)).toBeVisible();
      const map = article.locator("img.office__map");
      expect(await map.evaluate(node => (node as HTMLImageElement).currentSrc)).toMatch(/\/assets\/locations\/.+\.png$/);
    }
    await expect(page.locator("iframe, .leaflet-container")).toHaveCount(0);
    await page.waitForLoadState("networkidle");
    expect(problems).toEqual([]);
  });
});

test.describe("mobile menu", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("opens, closes with Escape, the overlay and a link, and returns focus", async ({ page }) => {
    const problems = guard(page);
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Menu" });
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toHaveAttribute("aria-controls", "primary-nav");
    await expect(nav.getByRole("link", { name: "Locations" })).toBeHidden();

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(nav.getByRole("link", { name: "Locations" })).toBeVisible();
    await expect(page.getByTestId("menu-overlay")).toBeVisible();
    await expect(nav).toHaveCSS("background-color", "rgb(29, 28, 30)");
    await expect(nav.getByRole("link", { name: "Locations" })).toHaveCSS("font-size", "24px");

    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
    await expect(page.getByTestId("menu-overlay")).toHaveCount(0);

    await toggle.click();
    await page.getByTestId("menu-overlay").click({ position: { x: 180, y: 600 } });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    await toggle.click();
    await nav.getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL("/contact");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(nav.getByRole("link", { name: "Contact" })).toBeHidden();
    expect(problems).toEqual([]);
  });

  test("keyboard opens the menu, tabs through its links and closes when focus leaves", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Menu" });
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Our company" }).first()).toBeFocused();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Contact" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("the menu button is hidden from tablet width up", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Menu" })).toBeHidden();
    await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Contact" })).toBeVisible();
  });
});

test.describe("contact form", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  const field = (page: Page, label: string) => page.getByLabel(label, { exact: true });

  test("empty submit marks name, email and message, and focuses the first", async ({ page }) => {
    const problems = guard(page);
    await page.goto("/contact");
    await page.getByRole("button", { name: "Submit" }).click();
    for (const label of ["Name", "Email address", "Your message"]) {
      const control = field(page, label);
      await expect(control).toHaveAttribute("aria-invalid", "true");
      await expect(control).toHaveAccessibleDescription("Can’t be empty");
    }
    await expect(field(page, "Phone (optional)")).not.toHaveAttribute("aria-invalid", "true");
    await expect(field(page, "Name")).toBeFocused();
    const error = page.locator("#name-error");
    await expect(error).toHaveCSS("font-style", "italic");
    await expect(error.locator("img")).toHaveAttribute("src", "/assets/contact/desktop/icon-error.svg");
    expect(problems).toEqual([]);
  });

  test("focus moves to the first invalid field in order", async ({ page }) => {
    await page.goto("/contact");
    await field(page, "Name").fill("Rose Caldwell");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(field(page, "Email address")).toBeFocused();
    await field(page, "Email address").fill("rose@example.com");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(field(page, "Your message")).toBeFocused();
  });

  test("a malformed email shows the email message and clears once fixed", async ({ page }) => {
    await page.goto("/contact");
    await field(page, "Name").fill("Rose Caldwell");
    await field(page, "Email address").fill("rose@example");
    await field(page, "Your message").fill("Hello");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(field(page, "Email address")).toHaveAccessibleDescription("Please use a valid email address");
    await expect(field(page, "Email address")).toBeFocused();
    await field(page, "Email address").fill("rose@example.com");
    await expect(field(page, "Email address")).not.toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#email-error")).toHaveCount(0);
  });

  test("whitespace-only values count as empty and errors clear as the person types", async ({ page }) => {
    await page.goto("/contact");
    await field(page, "Name").fill("   ");
    await field(page, "Email address").fill("  ");
    await field(page, "Your message").fill("\n  ");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Can’t be empty")).toHaveCount(3);
    await field(page, "Name").fill("Rose");
    await expect(page.locator("#name-error")).toHaveCount(0);
    await field(page, "Name").fill("");
    await expect(page.locator("#name-error")).toHaveText("Can’t be empty");
  });

  test("a valid message shows an honest demo success, resets and sends nothing", async ({ page }) => {
    const problems = guard(page);
    await page.goto("/contact");
    await page.waitForLoadState("networkidle");
    const posts: string[] = [];
    page.on("request", request => { if (request.method() !== "GET") posts.push(request.url()); });
    await field(page, "Name").fill("Rose Caldwell");
    await field(page, "Email address").fill("rose@example.com");
    await field(page, "Phone (optional)").fill("555 0100");
    await field(page, "Your message").fill("We need a new brand.");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByRole("status")).toHaveText("Thanks, Rose. This is a demo, so your message was not sent anywhere.");
    for (const label of ["Name", "Email address", "Phone (optional)", "Your message"]) await expect(field(page, label)).toHaveValue("");
    await expect(page.locator(".field__error")).toHaveCount(0);
    await expect(page).toHaveURL("/contact");
    expect(posts).toEqual([]);
    expect(problems).toEqual([]);
  });

  test("the no-script note stays hidden when scripts run", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByText("This demo form checks your entries with JavaScript and never sends them anywhere.")).toBeHidden();
  });

  test("the whole form works from the keyboard", async ({ page }) => {
    await page.goto("/contact");
    await field(page, "Name").focus();
    await page.keyboard.type("Rose Caldwell");
    await page.keyboard.press("Tab");
    await page.keyboard.type("rose@example.com");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(field(page, "Your message")).toBeFocused();
    await page.keyboard.type("Hi there");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Submit" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("status")).toContainText("This is a demo");
  });
});

test.describe("keyboard and hover states", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("skip link, visible focus and keyboard activation", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
    await page.keyboard.press("Tab");
    const learnMore = page.getByRole("link", { name: "Learn more about Designo" });
    await expect(learnMore).toBeFocused();
    expect(await learnMore.evaluate(node => getComputedStyle(node).outlineStyle)).toBe("solid");
    await expect(learnMore).toHaveCSS("background-color", "rgb(255, 173, 155)");
    await page.keyboard.press("Tab");
    const webCard = page.getByRole("link", { name: "Web Design View projects" });
    await expect(webCard).toBeFocused();
    await expect(webCard.locator(".category-card__shade")).toHaveCSS("background-color", "rgba(231, 129, 107, 0.8)");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/web-design");
  });

  test("hover states follow the design", async ({ page }) => {
    await page.goto("/web-design");
    const card = page.getByRole("link", { name: "App Design View projects" });
    await expect(card.locator(".category-card__shade")).toHaveCSS("background-color", "rgba(0, 0, 0, 0.5)");
    await card.hover();
    await expect(card.locator(".category-card__shade")).toHaveCSS("background-color", "rgba(231, 129, 107, 0.8)");
    const project = page.locator(".project-card").first();
    await project.hover();
    await expect(project).toHaveCSS("background-color", "rgb(231, 129, 107)");
    await expect(project.locator("h2")).toHaveCSS("color", "rgb(255, 255, 255)");
    const button = page.getByRole("link", { name: "Get in touch" });
    await button.hover();
    await expect(button).toHaveCSS("background-color", "rgb(255, 173, 155)");
    const navLink = page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Locations" });
    await navLink.hover();
    await expect(navLink).toHaveCSS("text-decoration-line", "underline");
    const social = page.getByRole("link", { name: "Facebook" });
    await social.hover();
    await expect(social.locator("span").first()).toHaveCSS("background-color", "rgb(255, 173, 155)");
  });
});

test.describe("responsive layout", () => {
  for (const width of [375, 400, 768, 1024, 1440]) {
    test(`no overflow or tiny text at ${width}px on any page`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const entry of pages) {
        await page.goto(entry.path);
        const report = await page.evaluate(() => {
          const overflow = document.documentElement.scrollWidth > innerWidth;
          const clipped = (node: Element) => {
            for (let parent = node.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
              const style = getComputedStyle(parent);
              if (style.overflowX !== "visible") return true;
            }
            return false;
          };
          const outside = [...document.body.querySelectorAll("*")]
            .filter(node => node.getClientRects().length && !clipped(node) && !node.closest(".leaf, .sr-only, .skip-link"))
            .filter(node => { const box = node.getBoundingClientRect(); return box.width > 0 && (box.right > innerWidth + 1 || box.left < -1); })
            .map(node => node.outerHTML.slice(0, 80));
          const texts = [...document.body.querySelectorAll("h1, h2, h3, p, a, button, li, address, label, input, textarea, span, strong")]
            .filter(node => node.getClientRects().length && !node.closest(".sr-only") && [...node.childNodes].some(child => child.nodeType === 3 && child.textContent!.trim()));
          const tiny = texts.filter(node => parseFloat(getComputedStyle(node).fontSize) < 14).map(node => node.textContent!.trim().slice(0, 40));
          const smallBody = [...document.querySelectorAll("main p, footer p, footer address")]
            .filter(node => node.getClientRects().length && !node.closest(".sr-only, .field__error"))
            .filter(node => parseFloat(getComputedStyle(node).fontSize) < 16).map(node => node.textContent!.trim().slice(0, 40));
          return { overflow, outside, tiny, smallBody };
        });
        expect(report, `${entry.path} at ${width}`).toEqual({ overflow: false, outside: [], tiny: [], smallBody: [] });
      }
    });
  }
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });

  test("every page renders and links still navigate", async ({ page }) => {
    const problems = guard(page);
    for (const entry of pages) {
      await page.goto(entry.path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(entry.h1);
    }
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Menu" })).toBeHidden();
    const primary = page.getByRole("navigation", { name: "Primary" });
    await expect(primary.getByRole("link", { name: "Locations" })).toBeVisible();
    await primary.getByRole("link", { name: "Locations" }).click();
    await expect(page).toHaveURL("/locations");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(problems).toEqual([]);
  });

  test("the contact form explains it needs JavaScript and never puts entries in the URL", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByText("This demo form checks your entries with JavaScript and never sends them anywhere.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
    await expect(page.locator("form.contact-form")).toHaveAttribute("method", "post");
  });
});
