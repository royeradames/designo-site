import type { Metadata } from "next";
import { CtaBand } from "@/components/cta-band";
import { OfficeMap } from "@/components/office-map";
import { offices } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Our locations",
  description: "Visit Designo in Toronto, New South Wales or South Wales. Office addresses, phone numbers, email and an opt-in OpenStreetMap map for our Canada, Australia and UK teams.",
};

export default function LocationsPage() {
  return (
    <div className="sections">
      <section className="wrap-tablet" aria-labelledby="locations-title">
        <h1 id="locations-title" className="sr-only">Our locations</h1>
        <div className="offices">
          {offices.map((office, index) => (
            <article key={office.slug} id={office.slug} className={`office${index % 2 === 1 ? " office--reverse" : ""}`} aria-labelledby={`${office.slug}-title`}>
              <OfficeMap office={office} priority={index === 0} />
              <div className="office__card">
                <span className="office__pattern" aria-hidden="true" />
                <h2 id={`${office.slug}-title`} className="title-l">{office.country}</h2>
                <div className="office__details">
                  <address>
                    <strong>{office.office}</strong><br />
                    {office.street}<br />
                    {office.region}
                  </address>
                  <p>
                    <strong>Contact</strong><br />
                    P : {office.phone}<br />
                    M : {office.email}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <CtaBand />
    </div>
  );
}
