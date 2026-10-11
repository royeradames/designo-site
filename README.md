# Designo agency website

My build of the [Frontend Mentor](https://www.frontendmentor.io) Designo agency website challenge: seven pages for a design agency, matched to the design from 375 to 1440 px.

Live site: [designo-site.royeradames.com](https://designo-site.royeradames.com)

## Pages

- Home, About, Locations and Contact.
- Web design, App design and Graphic design. All three come from one `[category]` template.

The contact form checks every field in the browser and then says so: nothing you enter is sent anywhere.

The Locations page has the challenge's bonus office maps. They're Leaflet maps on OpenStreetMap tiles, and nothing loads from OpenStreetMap until you choose to show a map, because the tile server sees your IP address.

## Stack

Next.js 16 App Router, React 19, Tailwind CSS 4, TanStack Form with Zod validation, Leaflet, Jost through `next/font/google`, and Playwright tests.

## Scripts

```sh
npm install
npm run dev        # http://127.0.0.1:4412
npm run lint
npm run typecheck
npm run build
npm test           # needs a build; Playwright starts `next start` on PORT (default 4412)
```
