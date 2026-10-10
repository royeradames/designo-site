import { expect, test } from "@playwright/test";

// An empty field must not read as a filled one: placeholder ink stays visibly
// lighter than typed text, while tests/contrast.spec.ts keeps both at AA.
test("contact placeholders are distinct from typed text", async ({ page }) => {
  await page.goto("/contact");
  const fields = page.locator(".field input, .field textarea");
  await expect(fields).toHaveCount(4);
  const colors = await fields.evaluateAll(controls => {
    const luminance = (color: string) => {
      const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
      if (!channels || channels.length !== 3) throw new Error(`Unsupported color ${color}`);
      const linear = channels.map(channel => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    };
    return controls.map(control => {
      const typed = getComputedStyle(control).color;
      const placeholder = getComputedStyle(control, "::placeholder").color;
      const ratio = (luminance(placeholder) + 0.05) / (luminance(typed) + 0.05);
      return { name: control.getAttribute("name"), typed, placeholder, ratio };
    });
  });
  for (const field of colors) expect.soft(field.ratio, JSON.stringify(field)).toBeGreaterThanOrEqual(1.25);
});
