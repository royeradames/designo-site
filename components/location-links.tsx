/* eslint-disable @next/next/no-img-element -- supplied illustrations */
import Link from "next/link";
import { offices } from "@/lib/site-data";

/** One link per office: the visible name is the country plus "See location", so every link reads differently. */
export function LocationLinks() {
  return (
    <section className="wrap" aria-labelledby="our-locations">
      <h2 id="our-locations" className="sr-only">Our locations</h2>
      <ul className="location-links">
        {offices.map(office => (
          <li key={office.slug}>
            <Link className="location-link" href={`/locations#${office.slug}`}>
              <img src={office.illustration} width={202} height={202} alt="" loading="lazy" />
              <h3 className="label-l">{office.country}</h3>
              <span className="btn btn-peach">See location</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
