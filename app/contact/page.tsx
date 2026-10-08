import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { LocationLinks } from "@/components/location-links";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Tell Designo about your website, app or branding project. Use the demo contact form or find our offices in Canada, Australia and the UK.",
};

export default function ContactPage() {
  return (
    <>
      <span className="leaf leaf--right" style={{ top: 730 }} aria-hidden="true" />
      <div className="sections">
        <section className="wrap-tablet" aria-labelledby="contact-title">
          <div className="page-hero page-hero--contact on-peach">
            <span className="page-hero__pattern page-hero__pattern--contact" aria-hidden="true" />
            <div className="page-hero__copy">
              <h1 id="contact-title" className="title-xl">Contact Us</h1>
              <p>Ready to take it to the next level? Let’s talk about your project or idea and find out how we can help your business grow. If you are looking for unique digital experiences that’s relatable to your users, drop us a line.</p>
            </div>
            <ContactForm />
          </div>
        </section>
        <LocationLinks />
      </div>
    </>
  );
}
