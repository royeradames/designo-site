import { expect, test } from "@playwright/test";

// An empty field must not read as a filled one: placeholder ink stays lighter
// and thinner than typed text, while tests/contrast.spec.ts keeps both at AA.
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
      const typed = getComputedStyle(control);
      const placeholder = getComputedStyle(control, "::placeholder");
      const ratio = (luminance(placeholder.color) + 0.05) / (luminance(typed.color) + 0.05);
      return { name: control.getAttribute("name"), typed: typed.color, placeholder: placeholder.color, ratio,
        typedWeight: Number(typed.fontWeight), placeholderWeight: Number(placeholder.fontWeight) };
    });
  });
  for (const field of colors) {
    expect.soft(field.ratio, JSON.stringify(field)).toBeGreaterThanOrEqual(1.12);
    expect.soft(field.placeholderWeight, JSON.stringify(field)).toBeLessThan(field.typedWeight);
  }
});
