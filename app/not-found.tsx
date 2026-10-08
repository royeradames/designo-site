import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="sections">
      <section className="wrap-tablet" aria-labelledby="missing-title">
        <div className="category-hero on-peach">
          <h1 id="missing-title" className="title-xl">Page not found</h1>
          <p>That page isn’t part of the Designo site. <Link href="/">Go to the home page</Link>.</p>
        </div>
      </section>
    </div>
  );
}
