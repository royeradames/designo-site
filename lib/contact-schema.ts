import * as z from "zod/mini";
import en from "zod/v4/locales/en.js";

// Zod Mini ships no messages; load the English ones classic Zod uses so built-in issues read the same.
z.config(en());

// The brief spells it with a straight apostrophe.
export const emptyMessage = "Can't be empty";
export const invalidEmailMessage = "Please use a valid email address";

const required = z.string().check(z.trim(), z.minLength(1, emptyMessage));

export const contactSchema = z.object({
  name: required,
  email: z.pipe(required, z.email(invalidEmailMessage)),
  phone: z.string().check(z.trim()),
  message: required,
});

export type ContactValues = z.input<typeof contactSchema>;

export const emptyContact: ContactValues = { name: "", email: "", phone: "", message: "" };
