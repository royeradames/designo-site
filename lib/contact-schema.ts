import { z } from "zod";

// The brief spells it with a straight apostrophe.
export const emptyMessage = "Can't be empty";
export const invalidEmailMessage = "Please use a valid email address";

const required = z.string().trim().min(1, emptyMessage);

export const contactSchema = z.object({
  name: required,
  email: required.pipe(z.email(invalidEmailMessage)),
  phone: z.string().trim(),
  message: required,
});

export type ContactValues = z.input<typeof contactSchema>;

export const emptyContact: ContactValues = { name: "", email: "", phone: "", message: "" };
