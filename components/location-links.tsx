/* eslint-disable @next/next/no-img-element -- supplied illustrations */
import Link from "next/link";
import { offices } from "@/lib/site-data";

export function LocationLinks() {
  return (
    <section className="wrap" aria-labelledby="our-locations">
      <h2 id="our-locations" className="sr-only">Our locations</h2>
      <ul className="location-links">
        {offices.map(office => (
          <li key={office.slug} className="location-link">
            <img src={office.illustration} width={202} height={202} alt="" loading="lazy" />
            <h3 className="label-l">{office.country}</h3>
            <Link className="btn btn-peach" href={`/locations#${office.slug}`}>
              See location<span className="sr-only"> in {office.country}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
