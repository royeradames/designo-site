/* eslint-disable @next/next/no-img-element -- supplied arrow icon */
import Link from "next/link";
import { ArtPicture } from "@/components/picture";
import type { Category } from "@/lib/site-data";

export function CategoryCard({ category, large = false }: { category: Category; large?: boolean }) {
  const desktop = large && category.card.homeDesktop ? category.card.homeDesktop : category.card.desktop;
  return (
    <Link className="category-card" href={`/${category.slug}`}>
      <ArtPicture sources={{ ...category.card, desktop }} alt="" width={327} height={250} />
      <span className="category-card__shade" aria-hidden="true" />
      <div>
        <h2>{category.title}</h2>
        <span className="category-card__cta">
          View projects
          <img src="/assets/shared/desktop/icon-right-arrow.svg" width={7} height={10} alt="" />
        </span>
      </div>
    </Link>
  );
}
