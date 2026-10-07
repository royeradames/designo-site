/* eslint-disable @next/next/no-img-element -- decorative supplied SVG pattern */
import type { Metadata } from "next";
import { CtaBand } from "@/components/cta-band";
import { ArtPicture } from "@/components/picture";
import { offices } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Our locations",
  description: "Visit Designo in Toronto, New South Wales or South Wales. Office addresses, phone numbers and email for our Canada, Australia and UK teams.",
};

export default function LocationsPage() {
  return (
    <div className="sections">
      <section className="wrap-tablet" aria-labelledby="locations-title">
        <h1 id="locations-title" className="sr-only">Our locations</h1>
        <div className="offices">
          {offices.map((office, index) => (
            <article key={office.slug} id={office.slug} className={`office${index % 2 === 1 ? " office--reverse" : ""}`} aria-labelledby={`${office.slug}-title`}>
              <div className="office__media">
                <ArtPicture className="office__map" sources={office.map} alt={office.map.alt} width={375} height={320} priority={index === 0} />
              </div>
              <div className="office__card">
                <img className="office__pattern" src="/assets/shared/desktop/bg-pattern-three-circles.svg" width={584} height={584} alt="" />
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
