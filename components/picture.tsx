type Sources = { mobile: string; tablet: string; desktop: string };

/** Serves the challenge's per-breakpoint exports: mobile below 768px, tablet to 1023px, desktop above. */
export function ArtPicture({ sources, alt, className, width, height, priority = false }: {
  sources: Sources;
  alt: string;
  className?: string;
  width: number;
  height: number;
  priority?: boolean;
}) {
  return (
    <picture>
      <source media="(min-width: 64rem)" srcSet={sources.desktop} />
      <source media="(min-width: 48rem)" srcSet={sources.tablet} />
      <img
        className={className}
        src={sources.mobile}
        width={width}
        height={height}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
      />
    </picture>
  );
}
