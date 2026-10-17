/* eslint-disable @next/next/no-img-element -- supplied challenge assets keep their intrinsic sizes */
import type { Metadata } from "next";
import Link from "next/link";
import { CategoryCard } from "@/components/category-card";
import { CtaBand } from "@/components/cta-band";
import { categories } from "@/lib/site-data";

export const metadata: Metadata = {
  title: { absolute: "Designo | Award-winning custom design agency" },
  description: "Designo creates award-winning custom websites, apps and graphic design, with more than 10 years of fully responsive brand work for its clients.",
};

const values = [
  {
    title: "Passionate",
    image: "/assets/home/desktop/illustration-passionate.svg",
    text: "Each project starts with an in-depth brand research to ensure we only create products that serve a purpose. We merge art, design, and technology into exciting new solutions.",
  },
  {
    title: "Resourceful",
    image: "/assets/home/desktop/illustration-resourceful.svg",
    text: "Everything that we do has a strategic purpose. We use an agile approach in all of our projects and value customer collaboration. It guarantees superior results that fulfill our clients’ needs.",
  },
  {
    title: "Friendly",
    image: "/assets/home/desktop/illustration-friendly.svg",
    text: "We are a group of enthusiastic folks who know how to put people first. Our success depends on our customers, and we strive to give them the best experience a company can provide.",
  },
];

export default function HomePage() {
  return (
    <>
      <span className="leaf leaf--left" style={{ top: 320 }} aria-hidden="true" />
      <span className="leaf leaf--right" style={{ top: 1724 }} aria-hidden="true" />
      <div className="sections">
        <section className="wrap-tablet" aria-labelledby="home-title">
          <div className="home-hero on-peach">
            <span className="home-hero__pattern" aria-hidden="true" />
            <div className="home-hero__copy">
              <h1 id="home-title" className="title-xl">Award-winning custom designs and digital branding solutions</h1>
              <p>With over 10 years in the industry, we are experienced in creating fully responsive websites, app design, and engaging brand experiences. Find out more about our services.</p>
              <Link className="btn btn-light" href="/about">Learn more<span className="sr-only"> about Designo</span></Link>
            </div>
            <img className="home-hero__phone" src="/assets/home/desktop/image-hero-phone.webp" width={624} height={913} alt="A phone showing the Frame website, with a white vase on a coral wall" fetchPriority="high" />
          </div>
        </section>

        <section className="wrap" aria-label="Design categories">
          <div className="category-grid category-grid--home">
            {categories.map((category, index) => <CategoryCard key={category.slug} category={category} large={index === 0} />)}
          </div>
        </section>

        <section className="wrap home-values" aria-labelledby="values-title">
          <h2 id="values-title" className="sr-only">What makes us different</h2>
          <ul className="values">
            {values.map(value => (
              <li key={value.title} className="value">
                <img src={value.image} width={202} height={202} alt="" loading="lazy" />
                <h3 className="label-l">{value.title}</h3>
                <p>{value.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <CtaBand />
      </div>
    </>
  );
}
