"use client";

/* eslint-disable @next/next/no-img-element -- supplied error icon */
import { useForm } from "@tanstack/react-form";
import { useRef, useState } from "react";
import { contactSchema, emptyContact, type ContactValues } from "@/lib/contact-schema";

type FieldName = keyof ContactValues;

const fields: { name: FieldName; label: string; placeholder: string; type?: string; autoComplete: string; multiline?: boolean; required: boolean }[] = [
  { name: "name", label: "Name", placeholder: "Name", autoComplete: "name", required: true },
  { name: "email", label: "Email address", placeholder: "Email Address", type: "email", autoComplete: "email", required: true },
  { name: "phone", label: "Phone (optional)", placeholder: "Phone", type: "tel", autoComplete: "tel", required: false },
  { name: "message", label: "Your message", placeholder: "Your Message", autoComplete: "off", multiline: true, required: true },
];

/** First Zod message for one field, or undefined when the value is valid. */
function fieldError(name: FieldName, value: string) {
  const result = contactSchema.shape[name].safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

export function ContactForm() {
  const [status, setStatus] = useState("");
  const controls = useRef<Partial<Record<FieldName, HTMLInputElement | HTMLTextAreaElement | null>>>({});

  const form = useForm({
    defaultValues: emptyContact,
    onSubmit: ({ value, formApi }) => {
      const firstName = value.name.trim().split(/\s+/)[0];
      formApi.reset();
      // Clear first so a repeated, identical message is announced again.
      setStatus("");
      window.setTimeout(() => setStatus(`Thanks, ${firstName}. This is a demo, so your message was not sent anywhere.`), 50);
    },
    onSubmitInvalid: ({ formApi }) => {
      setStatus("");
      const firstInvalid = fields.find(field => formApi.getFieldMeta(field.name)?.errors.length);
      if (firstInvalid) controls.current[firstInvalid.name]?.focus();
    },
  });

  return (
    <form
      className="contact-form"
      method="post"
      noValidate
      aria-describedby="contact-demo-note"
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <div className="contact-form__fields">
        {fields.map(config => (
          <form.Field
            key={config.name}
            name={config.name}
            validators={{
              // Quiet until the first submit; after that, re-check as the person types so fixed fields clear.
              onChange: ({ value, fieldApi }) => fieldApi.form.state.submissionAttempts > 0 ? fieldError(config.name, value) : undefined,
            }}
          >
            {field => {
              const error = field.state.meta.errors.find(Boolean);
              const errorId = `${config.name}-error`;
              const common = {
                id: config.name,
                // No name attribute: without JavaScript a native submit would otherwise post the entries.
                placeholder: config.placeholder,
                autoComplete: config.autoComplete,
                value: field.state.value,
                "aria-invalid": error ? true : undefined,
                "aria-describedby": error ? errorId : undefined,
                "aria-required": config.required || undefined,
                onBlur: field.handleBlur,
              } as const;
              return (
                <div className="field" data-invalid={Boolean(error)}>
                  <label className="sr-only" htmlFor={config.name}>{config.label}</label>
                  {config.multiline ? (
                    <textarea {...common} ref={node => { controls.current[config.name] = node; }} onChange={event => { setStatus(""); field.handleChange(event.target.value); }} />
                  ) : (
                    <input {...common} type={config.type ?? "text"} ref={node => { controls.current[config.name] = node; }} onChange={event => { setStatus(""); field.handleChange(event.target.value); }} />
                  )}
                  {error && (
                    <p className="field__error" id={errorId}>
                      {error}
                      <img src="/assets/contact/desktop/icon-error.svg" width={20} height={20} alt="" />
                    </p>
                  )}
                </div>
              );
            }}
          </form.Field>
        ))}
      </div>
      <div className="contact-form__actions">
        <div className="contact-form__submit-row">
          <button className="btn btn-light" type="submit">Submit</button>
          <p id="contact-demo-note" className="form-demo-note">Demo form: nothing you enter is sent anywhere.</p>
        </div>
        <p className="form-status" role="status">{status}</p>
        <p className="form-note nojs-note">Checking your entries needs JavaScript.</p>
      </div>
    </form>
  );
}
