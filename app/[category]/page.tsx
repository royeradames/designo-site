/* eslint-disable @next/next/no-img-element -- supplied project screenshots and patterns keep their intrinsic sizes */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryCard } from "@/components/category-card";
import { CtaBand } from "@/components/cta-band";
import { categories, categoryBySlug } from "@/lib/site-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map(category => ({ category: category.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[category]">): Promise<Metadata> {
  const category = categoryBySlug((await params).category);
  if (!category) return {};
  return { title: `${category.title} projects`, description: category.metaDescription };
}

const introPattern: Record<string, string> = {
  "web-design": "/assets/web-design/desktop/bg-pattern-intro-web.svg",
  "app-design": "/assets/app-design/desktop/bg-pattern-intro-app.svg",
  "graphic-design": "/assets/graphic-design/desktop/bg-pattern-intro-graphic.svg",
};

export default async function CategoryPage({ params }: PageProps<"/[category]">) {
  const category = categoryBySlug((await params).category);
  if (!category) notFound();
  const others = categories.filter(other => other.slug !== category.slug);

  return (
    <>
      <img className="leaf leaf--left" style={{ top: 126 }} src="/assets/shared/desktop/bg-pattern-leaf.svg" width={1006} height={594} alt="" />
      <div className="sections category-page">
        <section className="wrap-tablet" aria-labelledby="category-title">
          <div className="category-hero on-peach">
            <picture>
              <source media="(min-width: 64rem)" srcSet={introPattern[category.slug]} />
              <source media="(min-width: 48rem)" srcSet="/assets/shared/tablet/bg-pattern-design-pages-intro-tablet.svg" />
              <img className="category-hero__pattern" src="/assets/shared/mobile/bg-pattern-design-pages-intro-mobile.svg" width={876} height={584} alt="" />
            </picture>
            <h1 id="category-title" className="title-xl">{category.title}</h1>
            <p>{category.intro}</p>
          </div>
        </section>

        <section className="wrap projects" aria-label={`${category.title} projects`}>
          {category.projects.map((project, index) => (
            <article key={project.title} className="project-card">
              <img src={project.image} width={350} height={320} alt={project.alt} loading={index < 3 ? "eager" : "lazy"} />
              <div className="project-card__copy">
                <h2 className="label-l">{project.title}</h2>
                <p>{project.description}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="wrap" aria-label="Other design categories">
          <div className="category-grid">
            {others.map(other => <CategoryCard key={other.slug} category={other} />)}
          </div>
        </section>

        <CtaBand />
      </div>
    </>
  );
}
