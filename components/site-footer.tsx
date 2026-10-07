/* eslint-disable @next/next/no-img-element -- supplied challenge assets keep their intrinsic sizes */
import Link from "next/link";
import { centralOffice, navLinks } from "@/lib/site-data";

const socials = [
  { name: "Facebook", href: "https://www.facebook.com/", icon: "icon-facebook" },
  { name: "YouTube", href: "https://www.youtube.com/", icon: "icon-youtube" },
  { name: "Twitter", href: "https://twitter.com/", icon: "icon-twitter" },
  { name: "Pinterest", href: "https://www.pinterest.com/", icon: "icon-pinterest" },
  { name: "Instagram", href: "https://www.instagram.com/", icon: "icon-instagram" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer on-dark">
      <div className="wrap">
        <div className="site-footer__top">
          <Link className="logo" href="/">
            <img src="/assets/shared/desktop/logo-light.png" width={202} height={27} alt="Designo home" />
          </Link>
          <hr className="site-footer__rule" />
          <nav className="footer-nav" aria-label="Footer">
            <ul>
              {navLinks.map(link => (
                <li key={link.href}><Link href={link.href}>{link.label}</Link></li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="site-footer__bottom">
          <address>
            <strong>{centralOffice.office}</strong><br />
            {centralOffice.street}<br />
            {centralOffice.region}
          </address>
          <p className="footer-contact">
            Contact Us (Central Office)<br />
            P : {centralOffice.phone}<br />
            M : {centralOffice.email}
          </p>
          <ul className="socials" aria-label="Social media (sample links to each platform's home page)">
            {socials.map(social => (
              <li key={social.name}>
                <a className="social-link" href={social.href} style={{ "--icon": `url(/assets/shared/desktop/${social.icon}.svg)` } as React.CSSProperties}>
                  <span aria-hidden="true" />
                  <span className="sr-only">{social.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
