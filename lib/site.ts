/** One site name, used by the logo alt text, og:site_name and the WebSite JSON-LD. */
export const SITE_NAME = "Designo";

/** Production home (<project>.royeradames.com); og:url and the JSON-LD url resolve against it. */
export const SITE_URL = "https://designo-site.royeradames.com";

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: `${SITE_URL}/`,
} as const;
